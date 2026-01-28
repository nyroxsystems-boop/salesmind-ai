import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import prisma from '@/lib/db/prisma'

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: {
                        team: {
                            include: {
                                company: true
                            }
                        }
                    }
                })

                if (!user) {
                    return null
                }

                const isPasswordValid = await compare(credentials.password, user.passwordHash)

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    teamId: user.teamId,
                    level: user.level,
                    totalXP: user.totalXP
                }
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.teamId = user.teamId
                token.level = user.level
                token.totalXP = user.totalXP
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.teamId = token.teamId as string | null
                session.user.level = token.level as number
                session.user.totalXP = token.totalXP as number
            }
            return session
        }
    },
    pages: {
        signIn: '/login',
        error: '/login'
    }
}
