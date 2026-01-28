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
    TrendingUp,
    Clock,
    ChevronRight
} from 'lucide-react'
import { signOut } from 'next-auth/react'

interface AnalyseData {
    sessions: Array<{
        id: string
        customerType: string
        industry: string
        score: number
        duration: number
        completedAt: string
    }>
    weeklyProgress: Array<{
        week: string
        avgScore: number
        sessions: number
    }>
    skillTrends: Record<string, number[]>
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

export default function AnalysePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [sessions, setSessions] = useState<any[]>([])

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData()
        }
    }, [status])

    const fetchData = async () => {
        try {
            const res = await fetch('/api/dashboard')
            if (res.ok) {
                const data = await res.json()
                setSessions(data.recentSessions || [])
            }
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getScoreClass = (score: number) => {
        if (score >= 70) return 'score-high'
        if (score >= 50) return 'score-mid'
        return 'score-low'
    }

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
                <div
                    className="w-8 h-8 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'var(--graphite-700)', borderTopColor: 'var(--accent)' }}
                />
            </div>
        )
    }

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
            {/* Sidebar */}
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
                    <Link href="/dashboard" className="sidebar-item">
                        <LayoutDashboard />
                        Dashboard
                    </Link>
                    <Link href="/dashboard/training" className="sidebar-item">
                        <MessageSquare />
                        Simulationen
                    </Link>
                    <Link href="/dashboard/analyse" className="sidebar-item active">
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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="heading-page mb-1">Analyse</h1>
                        <p className="text-caption">Performance-Entwicklung und Trainingshistorie</p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <div className="metric-display">
                        <div className="metric-value">{sessions.length}</div>
                        <div className="metric-label">Gesamt Simulationen</div>
                    </div>
                    <div className="metric-display">
                        <div className={`metric-value ${getScoreClass(sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length) : 0)}`}>
                            {sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length) : 0}
                        </div>
                        <div className="metric-label">Durchschnitt Score</div>
                    </div>
                    <div className="metric-display">
                        <div className="metric-value">
                            {sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + s.duration, 0) / 60) : 0}
                        </div>
                        <div className="metric-label">Trainingsminuten</div>
                    </div>
                    <div className="metric-display">
                        <div className="metric-value flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" style={{ color: 'var(--positive)' }} />
                            +12%
                        </div>
                        <div className="metric-label">Trend (30 Tage)</div>
                    </div>
                </div>

                {/* Sessions Table */}
                <div className="command-card">
                    <div className="command-card-header">Trainingshistorie</div>

                    {sessions.length === 0 ? (
                        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                            <p className="mb-4">Noch keine Simulationen abgeschlossen</p>
                            <Link href="/dashboard/training" className="btn btn-primary">
                                Erste Simulation starten
                            </Link>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Datum</th>
                                    <th>Kundentyp</th>
                                    <th>Branche</th>
                                    <th>Dauer</th>
                                    <th>Score</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session) => (
                                    <tr key={session.id}>
                                        <td style={{ color: 'var(--text-muted)' }}>
                                            {new Date(session.completedAt).toLocaleDateString('de-DE')}
                                        </td>
                                        <td>{CUSTOMER_LABELS[session.customerType] || session.customerType}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>
                                            {INDUSTRY_LABELS[session.industry] || session.industry}
                                        </td>
                                        <td>
                                            <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                                <Clock className="w-3 h-3" />
                                                {Math.round(session.duration / 60)} Min
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`font-semibold ${getScoreClass(session.score)}`}>
                                                {session.score}
                                            </span>
                                        </td>
                                        <td>
                                            <Link
                                                href={`/dashboard/session/${session.id}`}
                                                style={{ color: 'var(--accent)' }}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    )
}
