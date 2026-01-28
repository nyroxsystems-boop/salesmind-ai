'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard,
    MessageSquare,
    BarChart3,
    Users,
    Settings,
    LogOut,
    Play,
    ChevronRight,
    Clock,
    Target,
    TrendingUp,
    Shield,
    Briefcase
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

const CUSTOMER_LABELS: Record<string, string> = {
    SKEPTICAL_CEO: 'Skeptischer GF',
    ANNOYED_BUYER: 'Genervter Einkäufer',
    FRIENDLY_UNDECIDED: 'Unverbindlicher Entscheider',
    PRICE_FOCUSED_SMB: 'Preisfixierter Mittelständler',
    CORPORATE_PROCUREMENT: 'Konzern-Procurement'
}

const INDUSTRY_LABELS: Record<string, string> = {
    REAL_ESTATE: 'Immobilien',
    SOLAR_ENERGY: 'Solar & Energie',
    AGENCY: 'Agentur',
    SAAS_B2B: 'SaaS B2B',
    COACHING: 'Coaching',
    AUTOMOTIVE: 'Automobil',
    RECRUITING: 'Recruiting'
}

const SKILL_LABELS: Record<string, string> = {
    conversationLeading: 'Gesprächsführung',
    needsAnalysis: 'Bedarfsermittlung',
    objectionHandling: 'Einwandbehandlung',
    closing: 'Abschlussführung',
    trustBuilding: 'Vertrauensaufbau'
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
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
                <div
                    className="w-8 h-8 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'var(--graphite-700)', borderTopColor: 'var(--accent)' }}
                />
            </div>
        )
    }

    const getScoreClass = (score: number) => {
        if (score >= 70) return 'score-high'
        if (score >= 50) return 'score-mid'
        return 'score-low'
    }

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
            {/* Fixed Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--black)' }}>
                            <path d="M12 2a8 8 0 1 0 8 8" />
                            <path d="M12 2v4" />
                            <path d="M12 10v4" />
                            <circle cx="12" cy="18" r="2" />
                        </svg>
                    </div>
                    <span className="sidebar-brand-text">SalesMind</span>
                </div>

                <nav className="sidebar-nav">
                    <Link href="/dashboard" className="sidebar-item active">
                        <LayoutDashboard />
                        Dashboard
                    </Link>
                    <Link href="/dashboard/training" className="sidebar-item">
                        <MessageSquare />
                        Simulationen
                    </Link>
                    <Link href="/dashboard/analyse" className="sidebar-item">
                        <BarChart3 />
                        Analyse
                    </Link>
                    <Link href="/dashboard/team" className="sidebar-item">
                        <Users />
                        Team
                    </Link>
                    <Link href="/dashboard/settings" className="sidebar-item">
                        <Settings />
                        Einstellungen
                    </Link>
                </nav>

                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="sidebar-item"
                    style={{ marginTop: 'auto' }}
                >
                    <LogOut />
                    Abmelden
                </button>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="heading-page mb-1">
                            {data?.user.name?.split(' ')[0] || 'Dashboard'}
                        </h1>
                        <p className="text-caption">
                            Übersicht Ihrer Vertriebsleistung
                        </p>
                    </div>
                    <Link
                        href="/dashboard/training"
                        className="btn btn-primary"
                    >
                        <Play className="w-4 h-4" />
                        Neue Simulation
                    </Link>
                </div>

                {/* Main Score Card */}
                <div className="command-card mb-6">
                    <div className="flex items-center gap-8">
                        {/* Performance Score */}
                        <div className="metric-display" style={{ minWidth: '160px', textAlign: 'center' }}>
                            <div className={`metric-value large ${getScoreClass(data?.stats.avgScore || 0)}`}>
                                {data?.stats.avgScore || 0}
                            </div>
                            <div className="metric-label">Performance Score</div>
                        </div>

                        {/* Stats Grid */}
                        <div className="flex-1 grid grid-cols-3 gap-6">
                            <div>
                                <div className="metric-value">{data?.stats.totalSessions || 0}</div>
                                <div className="metric-label">Absolvierte Simulationen</div>
                            </div>
                            <div>
                                <div className="metric-value flex items-center gap-2">
                                    {data?.stats.trend !== undefined && data.stats.trend !== 0 && (
                                        <TrendingUp
                                            className={`w-5 h-5 ${data.stats.trend > 0 ? 'score-high' : 'score-low'}`}
                                            style={{ transform: data.stats.trend < 0 ? 'rotate(180deg)' : 'none' }}
                                        />
                                    )}
                                    {data?.stats.trend !== undefined ? `${data.stats.trend > 0 ? '+' : ''}${data.stats.trend}%` : '—'}
                                </div>
                                <div className="metric-label">Trend (letzte 7 Tage)</div>
                            </div>
                            <div>
                                <div className="metric-value">{data?.user.currentStreak || 0}</div>
                                <div className="metric-label">Tage am Stück</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 320px' }}>
                    {/* Left Column */}
                    <div className="flex flex-col gap-6">
                        {/* Skill Assessment */}
                        <div className="command-card">
                            <div className="command-card-header">Skill-Bewertung</div>
                            <div className="space-y-5">
                                {data?.skillProfile && Object.entries(SKILL_LABELS).map(([key, label]) => {
                                    const value = data.skillProfile[key as keyof typeof data.skillProfile] || 0
                                    return (
                                        <div key={key}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                                                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}%</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div
                                                    className={`progress-bar-fill ${value < 50 ? 'subtle' : ''}`}
                                                    style={{ width: `${value}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Identified Weaknesses */}
                            {data?.stats.topWeaknesses && data.stats.topWeaknesses.length > 0 && (
                                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
                                    <div className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Identifizierte Schwächen
                                    </div>
                                    <ul className="space-y-2">
                                        {data.stats.topWeaknesses.map((weakness, i) => (
                                            <li
                                                key={i}
                                                className="flex items-center gap-2 text-sm"
                                                style={{ color: 'var(--text-secondary)' }}
                                            >
                                                <div className="status-indicator caution" />
                                                {weakness}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Recent Sessions */}
                        {data?.recentSessions && data.recentSessions.length > 0 && (
                            <div className="command-card">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="command-card-header" style={{ marginBottom: 0 }}>Letzte Simulationen</div>
                                    <Link
                                        href="/dashboard/analyse"
                                        className="text-xs hover:underline"
                                        style={{ color: 'var(--accent)' }}
                                    >
                                        Alle anzeigen
                                    </Link>
                                </div>
                                <div className="space-y-2">
                                    {data.recentSessions.slice(0, 5).map((session) => (
                                        <Link
                                            key={session.id}
                                            href={`/dashboard/session/${session.id}`}
                                            className="flex items-center justify-between p-3 rounded transition"
                                            style={{
                                                background: 'var(--bg-surface)',
                                                border: '1px solid var(--border-subtle)'
                                            }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`text-lg font-semibold ${getScoreClass(session.score)}`}
                                                    style={{ width: '40px' }}
                                                >
                                                    {session.score}
                                                </div>
                                                <div>
                                                    <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                                        {CUSTOMER_LABELS[session.customerType] || session.customerType}
                                                    </div>
                                                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                        {INDUSTRY_LABELS[session.industry] || session.industry}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    {Math.round(session.duration / 60)} Min
                                                </span>
                                                <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-6">
                        {/* Recommended Next Action */}
                        <div className="command-card">
                            <div className="command-card-header">Empfohlene Aktion</div>
                            <div
                                className="p-4 rounded"
                                style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)' }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <Target className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                        Einwandbehandlung üben
                                    </span>
                                </div>
                                <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                                    Ihre Einwandbehandlung zeigt Verbesserungspotenzial. Trainieren Sie mit einem skeptischen Kunden.
                                </p>
                                <Link
                                    href="/dashboard/training?customer=SKEPTICAL_CEO&industry=SAAS_B2B"
                                    className="btn btn-secondary w-full text-sm"
                                >
                                    Simulation starten
                                </Link>
                            </div>
                        </div>

                        {/* Quick Access */}
                        <div className="command-card">
                            <div className="command-card-header">Schnellzugriff</div>
                            <div className="space-y-2">
                                {[
                                    { customer: 'SKEPTICAL_CEO', industry: 'SAAS_B2B', label: 'Skeptischer GF · SaaS', icon: Briefcase },
                                    { customer: 'ANNOYED_BUYER', industry: 'AGENCY', label: 'Genervter Einkäufer · Agentur', icon: Shield },
                                    { customer: 'PRICE_FOCUSED_SMB', industry: 'SOLAR_ENERGY', label: 'Preisfixiert · Solar', icon: Target }
                                ].map((scenario, i) => (
                                    <Link
                                        key={i}
                                        href={`/dashboard/training?customer=${scenario.customer}&industry=${scenario.industry}`}
                                        className="select-card flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <scenario.icon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                                {scenario.label}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
