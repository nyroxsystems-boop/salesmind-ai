import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db/prisma'
import { SalesAIEngine } from '@/lib/ai/engine'
import { CustomerType, Industry, Difficulty } from '@prisma/client'

// Store active sessions in memory (in production, use Redis)
const activeSessions = new Map<string, SalesAIEngine>()

// POST - Start a new training session
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
        }

        const { customerType, industry, difficulty, scenario } = await req.json()

        // Validate input
        if (!customerType || !industry) {
            return NextResponse.json(
                { error: 'Kundentyp und Branche sind erforderlich' },
                { status: 400 }
            )
        }

        // Create session in database
        const dbSession = await prisma.session.create({
            data: {
                userId: session.user.id,
                customerType: customerType as CustomerType,
                industry: industry as Industry,
                difficulty: (difficulty as Difficulty) || 'INTERMEDIATE',
                scenario,
                status: 'ACTIVE'
            }
        })

        // Initialize AI engine
        const aiEngine = new SalesAIEngine({
            customerType: customerType as CustomerType,
            industry: industry as Industry,
            difficulty: (difficulty as Difficulty) || 'INTERMEDIATE',
            scenario
        })

        // Get initial customer message
        const initialMessage = await aiEngine.initialize()

        // Store engine in memory
        activeSessions.set(dbSession.id, aiEngine)

        // Store initial message
        await prisma.message.create({
            data: {
                sessionId: dbSession.id,
                role: 'ASSISTANT',
                content: initialMessage
            }
        })

        return NextResponse.json({
            sessionId: dbSession.id,
            initialMessage,
            customerType,
            industry,
            difficulty: difficulty || 'INTERMEDIATE',
            persona: aiEngine.getPersonaInfo(),
            industryInfo: aiEngine.getIndustryInfo()
        })
    } catch (error) {
        console.error('Session creation error:', error)
        return NextResponse.json(
            { error: 'Fehler beim Erstellen der Session' },
            { status: 500 }
        )
    }
}

// GET - Get session history and status
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const sessionId = searchParams.get('sessionId')

        if (sessionId) {
            // Get specific session
            const dbSession = await prisma.session.findUnique({
                where: { id: sessionId },
                include: {
                    messages: {
                        orderBy: { timestamp: 'asc' }
                    },
                    score: true
                }
            })

            if (!dbSession || dbSession.userId !== session.user.id) {
                return NextResponse.json({ error: 'Session nicht gefunden' }, { status: 404 })
            }

            return NextResponse.json(dbSession)
        } else {
            // Get all user sessions
            const sessions = await prisma.session.findMany({
                where: { userId: session.user.id },
                include: {
                    score: true
                },
                orderBy: { createdAt: 'desc' },
                take: 20
            })

            return NextResponse.json(sessions)
        }
    } catch (error) {
        console.error('Session fetch error:', error)
        return NextResponse.json(
            { error: 'Fehler beim Laden der Sessions' },
            { status: 500 }
        )
    }
}
