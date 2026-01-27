import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/db/prisma'
import { SalesAIEngine } from '@/lib/ai/engine'
import { calculateScore } from '@/lib/ai/scoring'
import { CustomerType, Industry, Difficulty } from '@prisma/client'

// In-memory storage for active engines
const activeSessions = new Map<string, SalesAIEngine>()

// POST - Send a message in the conversation
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
        }

        const { sessionId, message } = await req.json()

        if (!sessionId || !message) {
            return NextResponse.json(
                { error: 'Session ID und Nachricht sind erforderlich' },
                { status: 400 }
            )
        }

        // Get session from database
        const dbSession = await prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                messages: {
                    orderBy: { timestamp: 'asc' }
                }
            }
        })

        if (!dbSession || dbSession.userId !== session.user.id) {
            return NextResponse.json({ error: 'Session nicht gefunden' }, { status: 404 })
        }

        if (dbSession.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'Session ist bereits beendet' }, { status: 400 })
        }

        // Get or recreate AI engine
        let aiEngine = activeSessions.get(sessionId)

        if (!aiEngine) {
            // Recreate engine from session data
            aiEngine = new SalesAIEngine({
                customerType: dbSession.customerType as CustomerType,
                industry: dbSession.industry as Industry,
                difficulty: dbSession.difficulty as Difficulty,
                scenario: dbSession.scenario || undefined
            })

            // Reinitialize with existing messages
            await aiEngine.initialize()

            // Replay existing messages
            for (const msg of dbSession.messages) {
                if (msg.role === 'USER') {
                    await aiEngine.processMessage(msg.content)
                }
            }

            activeSessions.set(sessionId, aiEngine)
        }

        // Process the new message
        const result = await aiEngine.processMessage(message)

        // Store user message
        await prisma.message.create({
            data: {
                sessionId,
                role: 'USER',
                content: message,
                analysis: result.analysis as object
            }
        })

        // Store AI response
        await prisma.message.create({
            data: {
                sessionId,
                role: 'ASSISTANT',
                content: result.response
            }
        })

        // Update session duration
        const duration = Math.round(
            (new Date().getTime() - dbSession.createdAt.getTime()) / 1000
        )

        await prisma.session.update({
            where: { id: sessionId },
            data: { duration }
        })

        return NextResponse.json({
            response: result.response,
            analysis: result.analysis,
            state: result.state,
            hint: result.analysis.suggestion // Real-time coaching hint
        })
    } catch (error) {
        console.error('Message processing error:', error)
        return NextResponse.json(
            { error: 'Fehler beim Verarbeiten der Nachricht' },
            { status: 500 }
        )
    }
}

// PATCH - End session and get score
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
        }

        const { sessionId } = await req.json()

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID erforderlich' }, { status: 400 })
        }

        // Get session with messages
        const dbSession = await prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                messages: {
                    orderBy: { timestamp: 'asc' }
                }
            }
        })

        if (!dbSession || dbSession.userId !== session.user.id) {
            return NextResponse.json({ error: 'Session nicht gefunden' }, { status: 404 })
        }

        // Get AI engine state
        const aiEngine = activeSessions.get(sessionId)
        const finalState = aiEngine?.getState() || {
            trustLevel: 50,
            interestLevel: 50,
            customerMood: 0
        }

        // Calculate score
        const messages = dbSession.messages.map(msg => ({
            role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
            content: msg.content,
            analysis: msg.analysis as any
        }))

        const scoreCard = calculateScore(messages, finalState)

        // Save score to database
        const score = await prisma.score.create({
            data: {
                sessionId,
                userId: session.user.id,
                overallScore: scoreCard.overallScore,
                conversationLeading: scoreCard.categories.conversationLeading.score,
                needsAnalysis: scoreCard.categories.needsAnalysis.score,
                objectionHandling: scoreCard.categories.objectionHandling.score,
                closing: scoreCard.categories.closing.score,
                trustBuilding: scoreCard.categories.trustBuilding.score,
                xpEarned: scoreCard.xpEarned,
                feedback: scoreCard.feedback,
                criticalMoments: scoreCard.criticalMoments as object,
                strengths: scoreCard.strengths,
                weaknesses: scoreCard.weaknesses
            }
        })

        // Update session status
        await prisma.session.update({
            where: { id: sessionId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date()
            }
        })

        // Update user XP and stats
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (user) {
            const newTotalXP = user.totalXP + scoreCard.xpEarned
            const newLevel = Math.floor(newTotalXP / 500) + 1 // Level up every 500 XP

            // Update skill averages (simple moving average)
            const weight = 0.3 // Weight for new score

            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    totalXP: newTotalXP,
                    level: newLevel,
                    lastActive: new Date(),
                    conversationLeadingScore:
                        user.conversationLeadingScore * (1 - weight) +
                        scoreCard.categories.conversationLeading.score * weight,
                    needsAnalysisScore:
                        user.needsAnalysisScore * (1 - weight) +
                        scoreCard.categories.needsAnalysis.score * weight,
                    objectionHandlingScore:
                        user.objectionHandlingScore * (1 - weight) +
                        scoreCard.categories.objectionHandling.score * weight,
                    closingScore:
                        user.closingScore * (1 - weight) +
                        scoreCard.categories.closing.score * weight,
                    trustBuildingScore:
                        user.trustBuildingScore * (1 - weight) +
                        scoreCard.categories.trustBuilding.score * weight
                }
            })
        }

        // Clean up
        activeSessions.delete(sessionId)

        return NextResponse.json({
            score: scoreCard,
            xpEarned: scoreCard.xpEarned,
            newLevel: user ? Math.floor((user.totalXP + scoreCard.xpEarned) / 500) + 1 : 1
        })
    } catch (error) {
        console.error('Session end error:', error)
        return NextResponse.json(
            { error: 'Fehler beim Beenden der Session' },
            { status: 500 }
        )
    }
}
