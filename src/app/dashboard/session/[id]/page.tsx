'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    TrendingUp,
    Target,
    MessageSquare,
    Shield,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Clock,
    RefreshCw,
    Award
} from 'lucide-react'

interface SessionData {
    id: string
    customerType: string
    industry: string
    difficulty: string
    duration: number
    completedAt: string
    messages: Array<{
        id: string
        role: string
        content: string
        timestamp: string
        analysis?: {
            pressureDetected: boolean
            prematurePitch: boolean
            trustIssue: boolean
            goodQuestion: boolean
        }
    }>
    score: {
        overallScore: number
        conversationLeading: number
        needsAnalysis: number
        objectionHandling: number
        closing: number
        trustBuilding: number
        xpEarned: number
        feedback: string
        criticalMoments: Array<{
            messageIndex: number
            userMessage: string
            issue: string
            recommendation: string
            impact: 'positive' | 'negative' | 'neutral'
        }>
        strengths: string[]
        weaknesses: string[]
    }
}

const CUSTOMER_LABELS: Record<string, string> = {
    SKEPTICAL_CEO: 'Skeptischer Geschäftsführer',
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

const SKILL_ITEMS = [
    { key: 'conversationLeading', label: 'Gesprächsführung', icon: MessageSquare },
    { key: 'needsAnalysis', label: 'Bedarfsermittlung', icon: Target },
    { key: 'objectionHandling', label: 'Einwandbehandlung', icon: Shield },
    { key: 'closing', label: 'Abschlussführung', icon: TrendingUp },
    { key: 'trustBuilding', label: 'Vertrauensaufbau', icon: Award }
]

export default function SessionResultPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const params = useParams()
    const sessionId = params.id as string

    const [data, setData] = useState<SessionData | null>(null)
    const [loading, setLoading] = useState(true)
    const [expandedMoments, setExpandedMoments] = useState(true)
    const [showTranscript, setShowTranscript] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    useEffect(() => {
        if (sessionId && status === 'authenticated') {
            fetchSessionData()
        }
    }, [sessionId, status])

    const fetchSessionData = async () => {
        try {
            const res = await fetch(`/api/session?sessionId=${sessionId}`)
            if (res.ok) {
                const data = await res.json()
                setData(data)
            }
        } catch (error) {
            console.error('Failed to fetch session:', error)
        } finally {
            setLoading(false)
        }
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

    if (!data || !data.score) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
                <div className="text-center">
                    <h1 className="heading-page mb-4">Session nicht gefunden</h1>
                    <Link href="/dashboard" className="btn btn-primary">
                        Zurück zum Dashboard
                    </Link>
                </div>
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
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
                {/* Header */}
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 mb-8"
                    style={{ color: 'var(--text-secondary)', fontSize: '14px' }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Zurück zum Dashboard
                </Link>

                {/* Title Section */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="heading-page mb-2">Analyse-Report</h1>
                        <p className="text-caption">
                            {CUSTOMER_LABELS[data.customerType]} · {INDUSTRY_LABELS[data.industry]} · {data.difficulty}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs" style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Dauer</div>
                            <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <Clock className="w-4 h-4" />
                                {Math.round(data.duration / 60)} Min
                            </div>
                        </div>
                        <Link
                            href={`/dashboard/training?customer=${data.customerType}&industry=${data.industry}`}
                            className="btn btn-primary"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Wiederholen
                        </Link>
                    </div>
                </div>

                {/* Main Score */}
                <div className="command-card mb-6">
                    <div className="flex items-start gap-8">
                        <div className="metric-display text-center" style={{ minWidth: '140px' }}>
                            <div className={`metric-value large ${getScoreClass(data.score.overallScore)}`}>
                                {data.score.overallScore}
                            </div>
                            <div className="metric-label">Gesamtbewertung</div>
                        </div>
                        <div className="flex-1">
                            <p className="text-body" style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                                {data.score.feedback}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Category Scores */}
                <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                    {SKILL_ITEMS.map((skill) => {
                        const score = data.score[skill.key as keyof typeof data.score] as number
                        return (
                            <div key={skill.key} className="command-card text-center" style={{ padding: '16px' }}>
                                <skill.icon
                                    className="w-5 h-5 mx-auto mb-2"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <div className={`text-xl font-semibold mb-1 ${getScoreClass(score)}`}>
                                    {score}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {skill.label}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="command-card">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="w-4 h-4" style={{ color: 'var(--positive)' }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Stärken</span>
                        </div>
                        {data.score.strengths.length > 0 ? (
                            <ul className="space-y-2">
                                {data.score.strengths.map((s, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        <div className="status-indicator positive" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Keine spezifischen Stärken identifiziert
                            </p>
                        )}
                    </div>

                    <div className="command-card">
                        <div className="flex items-center gap-2 mb-4">
                            <XCircle className="w-4 h-4" style={{ color: 'var(--negative)' }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Verbesserungspotenzial</span>
                        </div>
                        {data.score.weaknesses.length > 0 ? (
                            <ul className="space-y-2">
                                {data.score.weaknesses.map((w, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        <div className="status-indicator negative" />
                                        {w}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Keine spezifischen Schwächen identifiziert
                            </p>
                        )}
                    </div>
                </div>

                {/* Critical Moments */}
                {data.score.criticalMoments.length > 0 && (
                    <div className="command-card mb-6">
                        <button
                            onClick={() => setExpandedMoments(!expandedMoments)}
                            className="w-full flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" style={{ color: 'var(--caution)' }} />
                                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                    Kritische Momente ({data.score.criticalMoments.length})
                                </span>
                            </div>
                            {expandedMoments ?
                                <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> :
                                <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            }
                        </button>

                        {expandedMoments && (
                            <div className="mt-4 space-y-3">
                                {data.score.criticalMoments.map((moment, i) => (
                                    <div
                                        key={i}
                                        className="p-4 rounded"
                                        style={{
                                            background: moment.impact === 'positive'
                                                ? 'rgba(52, 211, 153, 0.05)'
                                                : moment.impact === 'negative'
                                                    ? 'rgba(248, 113, 113, 0.05)'
                                                    : 'var(--bg-surface)',
                                            border: `1px solid ${moment.impact === 'positive'
                                                    ? 'rgba(52, 211, 153, 0.2)'
                                                    : moment.impact === 'negative'
                                                        ? 'rgba(248, 113, 113, 0.2)'
                                                        : 'var(--border-subtle)'
                                                }`
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div style={{
                                                color: moment.impact === 'positive'
                                                    ? 'var(--positive)'
                                                    : moment.impact === 'negative'
                                                        ? 'var(--negative)'
                                                        : 'var(--text-muted)',
                                                marginTop: '2px'
                                            }}>
                                                {moment.impact === 'positive' ? <CheckCircle className="w-4 h-4" /> :
                                                    moment.impact === 'negative' ? <XCircle className="w-4 h-4" /> :
                                                        <AlertTriangle className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                                    {moment.issue}
                                                </p>
                                                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                                                    "{moment.userMessage}"
                                                </p>
                                                <p className="text-sm" style={{ color: 'var(--accent)' }}>
                                                    → {moment.recommendation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Transcript */}
                <div className="command-card">
                    <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        className="w-full flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                Gesprächsverlauf ({data.messages.filter(m => m.role !== 'SYSTEM').length} Nachrichten)
                            </span>
                        </div>
                        {showTranscript ?
                            <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> :
                            <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        }
                    </button>

                    {showTranscript && (
                        <div className="mt-4 space-y-3">
                            {data.messages
                                .filter(m => m.role !== 'SYSTEM')
                                .map((message, i) => (
                                    <div
                                        key={i}
                                        className={`flex ${message.role === 'USER' ? 'justify-end' : ''}`}
                                    >
                                        <div
                                            className="p-3 rounded text-sm"
                                            style={{
                                                maxWidth: '80%',
                                                background: message.role === 'USER' ? 'var(--graphite-700)' : 'var(--bg-surface)',
                                                border: message.role === 'USER' ? 'none' : '1px solid var(--border-subtle)',
                                                color: 'var(--text-primary)'
                                            }}
                                        >
                                            {message.content}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
