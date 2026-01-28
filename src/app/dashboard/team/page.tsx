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
    Plus,
    TrendingUp,
    TrendingDown
} from 'lucide-react'
import { signOut } from 'next-auth/react'

interface TeamMember {
    id: string
    name: string
    email: string
    role: string
    avgScore: number
    sessionsCount: number
    trend: number
    topSkill: string
    weakestSkill: string
}

const SKILL_LABELS: Record<string, string> = {
    conversationLeading: 'Gesprächsführung',
    needsAnalysis: 'Bedarfsermittlung',
    objectionHandling: 'Einwandbehandlung',
    closing: 'Abschlussführung',
    trustBuilding: 'Vertrauensaufbau'
}

export default function TeamPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    // Demo team data for visualization
    const teamMembers: TeamMember[] = [
        { id: '1', name: 'Max Mustermann', email: 'max@firma.de', role: 'Sales Rep', avgScore: 72, sessionsCount: 24, trend: 8, topSkill: 'trustBuilding', weakestSkill: 'objectionHandling' },
        { id: '2', name: 'Anna Schmidt', email: 'anna@firma.de', role: 'Senior Sales', avgScore: 81, sessionsCount: 45, trend: 12, topSkill: 'closing', weakestSkill: 'needsAnalysis' },
        { id: '3', name: 'Thomas Weber', email: 'thomas@firma.de', role: 'Sales Rep', avgScore: 58, sessionsCount: 12, trend: -3, topSkill: 'conversationLeading', weakestSkill: 'closing' }
    ]

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    useEffect(() => {
        if (status === 'authenticated') {
            // Simulate loading
            setTimeout(() => setLoading(false), 500)
        }
    }, [status])

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
                    <Link href="/dashboard/analyse" className="sidebar-item">
                        <BarChart3 />
                        Analyse
                    </Link>
                    <Link href="/dashboard/team" className="sidebar-item active">
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
                        <h1 className="heading-page mb-1">Team</h1>
                        <p className="text-caption">Leistungsübersicht und Entwicklung</p>
                    </div>
                    <button className="btn btn-primary">
                        <Plus className="w-4 h-4" />
                        Mitglied einladen
                    </button>
                </div>

                {/* Team Overview */}
                <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="metric-display">
                        <div className="metric-value">{teamMembers.length}</div>
                        <div className="metric-label">Team-Mitglieder</div>
                    </div>
                    <div className="metric-display">
                        <div className={`metric-value ${getScoreClass(Math.round(teamMembers.reduce((a, m) => a + m.avgScore, 0) / teamMembers.length))}`}>
                            {Math.round(teamMembers.reduce((a, m) => a + m.avgScore, 0) / teamMembers.length)}
                        </div>
                        <div className="metric-label">Team-Durchschnitt</div>
                    </div>
                    <div className="metric-display">
                        <div className="metric-value">
                            {teamMembers.reduce((a, m) => a + m.sessionsCount, 0)}
                        </div>
                        <div className="metric-label">Gesamt Simulationen</div>
                    </div>
                </div>

                {/* Team Table */}
                <div className="command-card mb-6">
                    <div className="command-card-header">Mitglieder-Performance</div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Rolle</th>
                                <th>Simulationen</th>
                                <th>Ø Score</th>
                                <th>Trend</th>
                                <th>Stärke</th>
                                <th>Fokusbereich</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamMembers.map((member) => (
                                <tr key={member.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="customer-avatar"
                                                style={{ width: '32px', height: '32px', fontSize: '12px' }}
                                            >
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div style={{ color: 'var(--text-primary)' }}>{member.name}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{member.role}</td>
                                    <td>{member.sessionsCount}</td>
                                    <td>
                                        <span className={`font-semibold ${getScoreClass(member.avgScore)}`}>
                                            {member.avgScore}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className="flex items-center gap-1"
                                            style={{ color: member.trend >= 0 ? 'var(--positive)' : 'var(--negative)' }}
                                        >
                                            {member.trend >= 0 ?
                                                <TrendingUp className="w-3 h-3" /> :
                                                <TrendingDown className="w-3 h-3" />
                                            }
                                            {member.trend > 0 ? '+' : ''}{member.trend}%
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--positive)' }}>
                                        {SKILL_LABELS[member.topSkill]}
                                    </td>
                                    <td style={{ color: 'var(--caution)' }}>
                                        {SKILL_LABELS[member.weakestSkill]}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Skill Heatmap Preview */}
                <div className="command-card">
                    <div className="command-card-header">Skill-Verteilung</div>
                    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                        {Object.entries(SKILL_LABELS).map(([key, label]) => {
                            const avgSkill = 45 + Math.random() * 35 // Simulated data
                            return (
                                <div
                                    key={key}
                                    className="p-4 rounded text-center"
                                    style={{
                                        background: `rgba(0, 212, 255, ${avgSkill / 100 * 0.3})`,
                                        border: '1px solid var(--border-subtle)'
                                    }}
                                >
                                    <div className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                        {Math.round(avgSkill)}
                                    </div>
                                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        {label}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </main>
        </div>
    )
}
