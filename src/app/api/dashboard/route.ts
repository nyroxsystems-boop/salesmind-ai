import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/db/prisma'

// GET - Get user dashboard data
export async function GET() {
    try {
        const session = await getServerSession()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
        }

        // Get user with stats
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                team: {
                    include: {
                        company: true
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User nicht gefunden' }, { status: 404 })
        }

        // Get session statistics
        const totalSessions = await prisma.session.count({
            where: { userId: session.user.id, status: 'COMPLETED' }
        })

        const recentSessions = await prisma.session.findMany({
            where: { userId: session.user.id, status: 'COMPLETED' },
            include: { score: true },
            orderBy: { completedAt: 'desc' },
            take: 10
        })

        // Calculate averages
        const scores = recentSessions
            .filter(s => s.score)
            .map(s => s.score!)

        const avgScore = scores.length > 0
            ? Math.round(scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length)
            : 0

        // Get improvement trend (compare last 5 vs previous 5)
        const last5Avg = scores.slice(0, 5).length > 0
            ? scores.slice(0, 5).reduce((sum, s) => sum + s.overallScore, 0) / scores.slice(0, 5).length
            : 0
        const prev5Avg = scores.slice(5, 10).length > 0
            ? scores.slice(5, 10).reduce((sum, s) => sum + s.overallScore, 0) / scores.slice(5, 10).length
            : 0
        const trend = last5Avg - prev5Avg

        // Most common weaknesses
        const allWeaknesses = scores.flatMap(s => s.weaknesses)
        const weaknessCount: Record<string, number> = {}
        allWeaknesses.forEach(w => {
            weaknessCount[w] = (weaknessCount[w] || 0) + 1
        })
        const topWeaknesses = Object.entries(weaknessCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([w]) => w)

        // Skill profile
        const skillProfile = {
            conversationLeading: Math.round(user.conversationLeadingScore),
            needsAnalysis: Math.round(user.needsAnalysisScore),
            objectionHandling: Math.round(user.objectionHandlingScore),
            closing: Math.round(user.closingScore),
            trustBuilding: Math.round(user.trustBuildingScore)
        }

        // XP to next level
        const xpForNextLevel = (user.level * 500) - user.totalXP

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                level: user.level,
                totalXP: user.totalXP,
                xpForNextLevel,
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak
            },
            stats: {
                totalSessions,
                avgScore,
                trend: Math.round(trend),
                topWeaknesses
            },
            skillProfile,
            recentSessions: recentSessions.map(s => ({
                id: s.id,
                customerType: s.customerType,
                industry: s.industry,
                difficulty: s.difficulty,
                score: s.score?.overallScore || 0,
                duration: s.duration,
                completedAt: s.completedAt
            })),
            team: user.team ? {
                id: user.team.id,
                name: user.team.name,
                company: user.team.company.name
            } : null
        })
    } catch (error) {
        console.error('Dashboard data error:', error)
        return NextResponse.json(
            { error: 'Fehler beim Laden der Dashboard-Daten' },
            { status: 500 }
        )
    }
}

// PATCH - Update user profile
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
        }

        const { name, avatar } = await req.json()

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                ...(name && { name }),
                ...(avatar && { avatar })
            }
        })

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        })
    } catch (error) {
        console.error('Profile update error:', error)
        return NextResponse.json(
            { error: 'Profil-Update fehlgeschlagen' },
            { status: 500 }
        )
    }
}
