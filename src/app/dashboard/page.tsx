'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Brain,
    Home,
    MessageSquare,
    BarChart3,
    Users,
    Settings,
    LogOut,
    TrendingUp,
    Target,
    Award,
    Zap,
    ArrowRight,
    Play,
    Clock,
    ChevronRight
} from 'lucide-react'
import { signOut } from 'next-auth/react'

interface DashboardData {
    user: {
        name: string
        email: string
        level: number
        totalXP: number
        xpForNextLevel: number
        currentStreak: number
    }
    stats: {
        totalSessions: number
        avgScore: number
        trend: number
        topWeaknesses: string[]
    }
    skillProfile: {
        conversationLeading: number
        needsAnalysis: number
        objectionHandling: number
        closing: number
        trustBuilding: number
    }
    recentSessions: Array<{
        id: string
        customerType: string
        industry: string
        score: number
        duration: number
        completedAt: string
    }>
}

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    useEffect(() => {
        if (status === 'authenticated') {
            fetchDashboardData()
        }
    }, [status])

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/dashboard')
            if (res.ok) {
                const data = await res.json()
                setData(data)
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
        )
    }

    const customerTypeLabels: Record<string, string> = {
        SKEPTICAL_CEO: 'Skeptischer GF',
        ANNOYED_BUYER: 'Genervter Einkäufer',
        FRIENDLY_UNDECIDED: 'Freundlich Unverbindlich',
        PRICE_FOCUSED_SMB: 'Preisfixierter Mittelständler',
        CORPORATE_PROCUREMENT: 'Konzern-Procurement'
    }

    const industryLabels: Record<string, string> = {
        REAL_ESTATE: 'Immobilien',
        SOLAR_ENERGY: 'Solar & Energie',
        AGENCY: 'Agentur',
        SAAS_B2B: 'SaaS B2B',
        COACHING: 'Coaching',
        AUTOMOTIVE: 'Automobil',
        RECRUITING: 'Recruiting'
    }

    return (
        <div className="min-h-screen bg-bg-primary flex">
            {/* Sidebar */}
            <aside className="w-64 bg-bg-secondary border-r border-glass-border p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg font-bold">SalesMind AI</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { icon: Home, label: 'Dashboard', href: '/dashboard', active: true },
                        { icon: MessageSquare, label: 'Training starten', href: '/dashboard/training' },
                        { icon: BarChart3, label: 'Mein Fortschritt', href: '/dashboard/progress' },
                        { icon: Users, label: 'Team', href: '/dashboard/team' },
                        { icon: Settings, label: 'Einstellungen', href: '/dashboard/settings' }
                    ].map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${item.active
                                    ? 'bg-primary-500/10 text-primary-400'
                                    : 'text-neutral-400 hover:text-white hover:bg-glass-bg'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-glass-bg transition"
                >
                    <LogOut className="w-5 h-5" />
                    Abmelden
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">
                            Willkommen zurück, {data?.user.name?.split(' ')[0] || 'Verkäufer'}!
                        </h1>
                        <p className="text-neutral-400">
                            Bereit für dein nächstes Training?
                        </p>
                    </div>
                    <Link
                        href="/dashboard/training"
                        className="btn-primary flex items-center gap-2"
                    >
                        <Play className="w-4 h-4" />
                        Training starten
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    {[
                        {
                            label: 'Level',
                            value: data?.user.level || 1,
                            icon: Award,
                            color: 'text-primary-400',
                            bg: 'bg-primary-500/10'
                        },
                        {
                            label: 'Gesamte XP',
                            value: data?.user.totalXP || 0,
                            icon: Zap,
                            color: 'text-accent-amber',
                            bg: 'bg-accent-amber/10'
                        },
                        {
                            label: 'Sessions',
                            value: data?.stats.totalSessions || 0,
                            icon: MessageSquare,
                            color: 'text-accent-cyan',
                            bg: 'bg-accent-cyan/10'
                        },
                        {
                            label: 'Ø Score',
                            value: `${data?.stats.avgScore || 0}%`,
                            icon: Target,
                            color: 'text-accent-emerald',
                            bg: 'bg-accent-emerald/10',
                            trend: data?.stats.trend
                        }
                    ].map((stat, i) => (
                        <div key={i} className="stat-card">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                {stat.trend !== undefined && stat.trend !== 0 && (
                                    <div className={`flex items-center gap-1 text-sm ${stat.trend > 0 ? 'text-success' : 'text-error'}`}>
                                        <TrendingUp className={`w-4 h-4 ${stat.trend < 0 ? 'rotate-180' : ''}`} />
                                        {Math.abs(stat.trend)}%
                                    </div>
                                )}
                            </div>
                            <div className="text-2xl font-bold mb-1">{stat.value}</div>
                            <div className="text-sm text-neutral-500">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Skill Profile */}
                    <div className="col-span-2 glass-card p-6">
                        <h2 className="text-lg font-semibold mb-6">Dein Skill-Profil</h2>
                        <div className="space-y-4">
                            {data?.skillProfile && Object.entries({
                                'Gesprächsführung': data.skillProfile.conversationLeading,
                                'Bedarfsermittlung': data.skillProfile.needsAnalysis,
                                'Einwandbehandlung': data.skillProfile.objectionHandling,
                                'Abschlussführung': data.skillProfile.closing,
                                'Vertrauensaufbau': data.skillProfile.trustBuilding
                            }).map(([skill, value]) => (
                                <div key={skill}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-neutral-300">{skill}</span>
                                        <span className="text-sm font-medium">{value}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {data?.stats.topWeaknesses && data.stats.topWeaknesses.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-glass-border">
                                <h3 className="text-sm font-medium mb-3 text-neutral-400">Fokus-Bereiche:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {data.stats.topWeaknesses.map((weakness, i) => (
                                        <span key={i} className="badge badge-warning">{weakness}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Start */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold mb-6">Schnellstart</h2>
                        <div className="space-y-3">
                            {[
                                { type: 'SKEPTICAL_CEO', industry: 'SAAS_B2B', label: 'Skeptischer CEO - SaaS' },
                                { type: 'ANNOYED_BUYER', industry: 'AGENCY', label: 'Genervter Einkäufer - Agentur' },
                                { type: 'PRICE_FOCUSED_SMB', industry: 'SOLAR_ENERGY', label: 'Preisfixiert - Solar' }
                            ].map((scenario, i) => (
                                <Link
                                    key={i}
                                    href={`/dashboard/training?customer=${scenario.type}&industry=${scenario.industry}`}
                                    className="flex items-center justify-between p-4 rounded-xl bg-bg-tertiary hover:bg-bg-elevated border border-glass-border hover:border-primary-500/50 transition group"
                                >
                                    <span className="text-sm">{scenario.label}</span>
                                    <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-primary-400 transition" />
                                </Link>
                            ))}
                        </div>

                        <Link
                            href="/dashboard/training"
                            className="block mt-4 text-center text-sm text-primary-400 hover:text-primary-300"
                        >
                            Alle Szenarien anzeigen →
                        </Link>
                    </div>
                </div>

                {/* Recent Sessions */}
                {data?.recentSessions && data.recentSessions.length > 0 && (
                    <div className="mt-8 glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Letzte Sessions</h2>
                            <Link href="/dashboard/progress" className="text-sm text-primary-400 hover:text-primary-300">
                                Alle anzeigen
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {data.recentSessions.slice(0, 5).map((session) => (
                                <Link
                                    key={session.id}
                                    href={`/dashboard/session/${session.id}`}
                                    className="flex items-center justify-between p-4 rounded-xl bg-bg-tertiary hover:bg-bg-elevated transition group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${session.score >= 70 ? 'bg-success/10 text-success' :
                                                session.score >= 50 ? 'bg-warning/10 text-warning' :
                                                    'bg-error/10 text-error'
                                            }`}>
                                            <span className="font-bold">{session.score}</span>
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {customerTypeLabels[session.customerType] || session.customerType}
                                            </div>
                                            <div className="text-sm text-neutral-500">
                                                {industryLabels[session.industry] || session.industry}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm text-neutral-500 flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {Math.round(session.duration / 60)} Min
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-primary-400 transition" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
