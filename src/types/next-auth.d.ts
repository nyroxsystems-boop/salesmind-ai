import 'next-auth'

declare module 'next-auth' {
    interface User {
        id: string
        email: string
        name: string
        role: string
        teamId: string | null
        level: number
        totalXP: number
    }

    interface Session {
        user: User
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: string
        teamId: string | null
        level: number
        totalXP: number
    }
}
