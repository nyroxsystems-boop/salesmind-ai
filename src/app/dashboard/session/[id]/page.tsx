'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Award,
    TrendingUp,
    Target,
    MessageSquare,
    Shield,
    Zap,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Clock,
    RefreshCw
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

const customerTypeLabels: Record<string, string> = {
    SKEPTICAL_CEO: 'Skeptischer Geschäftsführer',
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
        )
    }

    if (!data || !data.score) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Session nicht gefunden</h1>
                    <Link href="/dashboard" className="btn-primary">
                        Zurück zum Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-success'
        if (score >= 65) return 'text-accent-emerald'
        if (score >= 50) return 'text-warning'
        return 'text-error'
    }

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-success/10'
        if (score >= 65) return 'bg-accent-emerald/10'
        if (score >= 50) return 'bg-warning/10'
        return 'bg-error/10'
    }

    const categories = [
        { key: 'conversationLeading', label: 'Gesprächsführung', icon: MessageSquare },
        { key: 'needsAnalysis', label: 'Bedarfsermittlung', icon: Target },
        { key: 'objectionHandling', label: 'Einwandbehandlung', icon: Shield },
        { key: 'closing', label: 'Abschlussführung', icon: TrendingUp },
        { key: 'trustBuilding', label: 'Vertrauensaufbau', icon: Award }
    ]

    return (
        <div className="min-h-screen bg-bg-primary">
            <div className="max-w-5xl mx-auto px-8 py-12">
                {/* Header */}
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Zurück zum Dashboard
                </Link>

                {/* Session Info */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Session-Auswertung</h1>
                        <p className="text-neutral-400">
                            {customerTypeLabels[data.customerType]} • {industryLabels[data.industry]} • {data.difficulty}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-sm text-neutral-500 mb-1">Dauer</div>
                            <div className="flex items-center gap-1 text-neutral-300">
                                <Clock className="w-4 h-4" />
                                {Math.round(data.duration / 60)} Min
                            </div>
                        </div>
                        <Link
                            href={`/dashboard/training?customer=${data.customerType}&industry=${data.industry}`}
                            className="btn-primary flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Nochmal trainieren
                        </Link>
                    </div>
                </div>

                {/* Main Score Card */}
                <div className="glass-card-elevated p-8 mb-8">
                    <div className="flex items-center gap-8">
                        {/* Overall Score */}
                        <div className={`w-32 h-32 rounded-3xl ${getScoreBg(data.score.overallScore)} flex flex-col items-center justify-center`}>
                            <div className={`text-5xl font-bold ${getScoreColor(data.score.overallScore)}`}>
                                {data.score.overallScore}
                            </div>
                            <div className="text-sm text-neutral-500">Gesamt</div>
                        </div>

                        {/* Feedback */}
                        <div className="flex-1">
                            <p className="text-lg leading-relaxed text-neutral-200">
                                {data.score.feedback}
                            </p>

                            {/* XP Badge */}
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-amber/10 text-accent-amber">
                                <Zap className="w-4 h-4" />
                                <span className="font-semibold">+{data.score.xpEarned} XP verdient</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Scores */}
                <div className="grid grid-cols-5 gap-4 mb-8">
                    {categories.map((cat) => {
                        const score = data.score[cat.key as keyof typeof data.score] as number
                        return (
                            <div key={cat.key} className="glass-card p-4 text-center">
                                <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center ${getScoreBg(score)}`}>
                                    <cat.icon className={`w-5 h-5 ${getScoreColor(score)}`} />
                                </div>
                                <div className={`text-2xl font-bold mb-1 ${getScoreColor(score)}`}>
                                    {score}
                                </div>
                                <div className="text-xs text-neutral-500">{cat.label}</div>
                            </div>
                        )
                    })}
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2 text-success">
                            <CheckCircle className="w-5 h-5" />
                            Stärken
                        </h3>
                        {data.score.strengths.length > 0 ? (
                            <ul className="space-y-2">
                                {data.score.strengths.map((s, i) => (
                                    <li key={i} className="flex items-center gap-2 text-neutral-300">
                                        <div className="w-2 h-2 rounded-full bg-success" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-neutral-500">Keine spezifischen Stärken identifiziert</p>
                        )}
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2 text-error">
                            <XCircle className="w-5 h-5" />
                            Verbesserungspotenzial
                        </h3>
                        {data.score.weaknesses.length > 0 ? (
                            <ul className="space-y-2">
                                {data.score.weaknesses.map((w, i) => (
                                    <li key={i} className="flex items-center gap-2 text-neutral-300">
                                        <div className="w-2 h-2 rounded-full bg-error" />
                                        {w}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-neutral-500">Keine spezifischen Schwächen identifiziert</p>
                        )}
                    </div>
                </div>

                {/* Critical Moments */}
                {data.score.criticalMoments.length > 0 && (
                    <div className="glass-card p-6 mb-8">
                        <button
                            onClick={() => setExpandedMoments(!expandedMoments)}
                            className="w-full flex items-center justify-between mb-4"
                        >
                            <h3 className="font-semibold flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-warning" />
                                Kritische Momente ({data.score.criticalMoments.length})
                            </h3>
                            {expandedMoments ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>

                        {expandedMoments && (
                            <div className="space-y-4">
                                {data.score.criticalMoments.map((moment, i) => (
                                    <div
                                        key={i}
                                        className={`p-4 rounded-xl border ${moment.impact === 'positive'
                                                ? 'border-success/30 bg-success/5'
                                                : moment.impact === 'negative'
                                                    ? 'border-error/30 bg-error/5'
                                                    : 'border-neutral-700 bg-bg-tertiary'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 ${moment.impact === 'positive' ? 'text-success' :
                                                    moment.impact === 'negative' ? 'text-error' : 'text-neutral-400'
                                                }`}>
                                                {moment.impact === 'positive' ? <CheckCircle className="w-5 h-5" /> :
                                                    moment.impact === 'negative' ? <XCircle className="w-5 h-5" /> :
                                                        <AlertTriangle className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm mb-1">{moment.issue}</p>
                                                <p className="text-sm text-neutral-400 mb-3">
                                                    "{moment.userMessage}"
                                                </p>
                                                <p className="text-sm text-primary-300">
                                                    💡 {moment.recommendation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Transcript Toggle */}
                <div className="glass-card p-6">
                    <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        className="w-full flex items-center justify-between"
                    >
                        <h3 className="font-semibold flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-primary-400" />
                            Gesprächsverlauf ({data.messages.filter(m => m.role !== 'SYSTEM').length} Nachrichten)
                        </h3>
                        {showTranscript ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {showTranscript && (
                        <div className="mt-6 space-y-4">
                            {data.messages
                                .filter(m => m.role !== 'SYSTEM')
                                .map((message, i) => (
                                    <div key={i} className={`flex ${message.role === 'USER' ? 'justify-end' : ''}`}>
                                        <div className={`max-w-[80%] p-4 rounded-xl ${message.role === 'USER'
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-bg-tertiary border border-glass-border'
                                            }`}>
                                            <p className="text-sm">{message.content}</p>
                                            {message.analysis && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {message.analysis.goodQuestion && (
                                                        <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">
                                                            Gute Frage
                                                        </span>
                                                    )}
                                                    {message.analysis.pressureDetected && (
                                                        <span className="text-xs bg-error/20 text-error px-2 py-1 rounded">
                                                            Druck
                                                        </span>
                                                    )}
                                                    {message.analysis.prematurePitch && (
                                                        <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded">
                                                            Früher Pitch
                                                        </span>
                                                    )}
                                                </div>
                                            )}
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
