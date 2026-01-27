import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
    try {
        const { email, password, name, companyName } = await req.json()

        // Validate input
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Email, Passwort und Name sind erforderlich' },
                { status: 400 }
            )
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Diese E-Mail ist bereits registriert' },
                { status: 400 }
            )
        }

        // Hash password
        const passwordHash = await hash(password, 12)

        // Create company if name provided (for first user)
        let companyId: string | undefined
        let teamId: string | undefined

        if (companyName) {
            const company = await prisma.company.create({
                data: {
                    name: companyName,
                    teams: {
                        create: {
                            name: 'Vertriebsteam'
                        }
                    }
                },
                include: {
                    teams: true
                }
            })
            companyId = company.id
            teamId = company.teams[0]?.id
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
                role: companyName ? 'ADMIN' : 'SALES_REP',
                teamId
            }
        })

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        })
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Registrierung fehlgeschlagen' },
            { status: 500 }
        )
    }
}
