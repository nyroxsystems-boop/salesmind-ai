'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Send,
    Check,
    X,
    AlertTriangle,
    Trophy,
    Target,
    Lightbulb,
    MessageSquare,
    Clock,
    Star,
    Zap,
    Users,
    TrendingUp,
    Award,
    ChevronRight
} from 'lucide-react'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    analysis?: {
        pressureDetected: boolean
        prematurePitch: boolean
        trustIssue: boolean
        goodQuestion: boolean
        suggestion: string | null
    }
}

interface ConversationState {
    customerMood: number
    trustLevel: number
    interestLevel: number
    patienceRemaining: number
    closingOpportunity: boolean
}

// LEGENDARY OPPONENTS - Die Sales Arena
const OPPONENTS = [
    {
        level: 1,
        levelName: 'Einsteiger',
        opponents: [
            {
                id: 'skeptiker',
                name: 'Der Skeptiker',
                desc: 'Hinterfragt alles, aber bleibt höflich',
                trait: 'Viele Fragen, wenig Vertrauen',
                winRate: 78,
                avatar: '🤨',
                customerType: 'SKEPTICAL_CEO'
            },
            {
                id: 'zeitmangel',
                name: 'Die Zeitmangel-Chefin',
                desc: 'Hat nur 2 Minuten, will sofort Fakten',
                trait: 'Ungeduldig, direkt',
                winRate: 82,
                avatar: '⏰',
                customerType: 'ANNOYED_BUYER'
            }
        ]
    },
    {
        level: 2,
        levelName: 'Fortgeschritten',
        opponents: [
            {
                id: 'preisdruecker',
                name: 'Der Preisdrücker',
                desc: 'Alles ist zu teuer, verhandelt jeden Cent',
                trait: 'Budget-fokussiert, skeptisch bei Wert',
                winRate: 61,
                avatar: '💰',
                customerType: 'PRICE_FOCUSED_SMB'
            },
            {
                id: 'konkurrenzfan',
                name: 'Der Konkurrenz-Fan',
                desc: 'Nutzt bereits Wettbewerber, zufrieden damit',
                trait: 'Loyal zum Bestand, schwer zu überzeugen',
                winRate: 58,
                avatar: '🏢',
                customerType: 'CORPORATE_PROCUREMENT'
            }
        ]
    },
    {
        level: 3,
        levelName: 'Profi',
        opponents: [
            {
                id: 'einkaufshai',
                name: 'Der Einkaufs-Hai',
                desc: 'Verhandelt wie ein Konzern-Einkäufer',
                trait: 'Kennt jeden Trick, maximaler Druck',
                winRate: 42,
                avatar: '🦈',
                customerType: 'CORPORATE_PROCUREMENT'
            },
            {
                id: 'ghosterin',
                name: 'Die Unerreichbare',
                desc: 'Ghostet zwischen Gesprächen, vage Antworten',
                trait: 'Passive Aggression, kein Commitment',
                winRate: 38,
                avatar: '👻',
                customerType: 'FRIENDLY_UNDECIDED'
            }
        ]
    },
    {
        level: 4,
        levelName: 'Legende',
        opponents: [
            {
                id: 'dealbreaker',
                name: 'Der Dealbreaker',
                desc: 'Sagt 10x Nein bevor er vielleicht kauft',
                trait: 'Eiserne Einwände, maximale Resistenz',
                winRate: 23,
                avatar: '🚫',
                customerType: 'SKEPTICAL_CEO'
            },
            {
                id: 'wolf',
                name: 'Der Wolf',
                desc: 'Jordan Belfort Level - kennt JEDE Technik',
                trait: 'Manipulation-Detektion auf Maximum',
                winRate: 12,
                avatar: '🐺',
                customerType: 'ANNOYED_BUYER'
            }
        ]
    }
]

const INDUSTRIES = [
    { value: 'REAL_ESTATE', label: 'Immobilien', emoji: '🏠' },
    { value: 'SOLAR_ENERGY', label: 'Solar & Energie', emoji: '☀️' },
    { value: 'AGENCY', label: 'Agenturen', emoji: '🎨' },
    { value: 'SAAS_B2B', label: 'SaaS B2B', emoji: '💻' },
    { value: 'COACHING', label: 'Coaching', emoji: '📚' },
    { value: 'AUTOMOTIVE', label: 'Automobil', emoji: '🚗' },
    { value: 'RECRUITING', label: 'Recruiting', emoji: '👥' }
]

function TrainingContent() {
    const { status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Setup state
    const [setupMode, setSetupMode] = useState(true)
    const [selectedOpponent, setSelectedOpponent] = useState<typeof OPPONENTS[0]['opponents'][0] | null>(null)
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
    const [industry, setIndustry] = useState(searchParams.get('industry') || '')

    // Session state
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [state, setState] = useState<ConversationState | null>(null)
    const [inputValue, setInputValue] = useState('')
    const [loading, setLoading] = useState(false)
    const [typing, setTyping] = useState(false)
    const [hint, setHint] = useState<string | null>(null)
    const [ending, setEnding] = useState(false)
    const [sessionTime, setSessionTime] = useState(0)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (!setupMode && sessionId) {
            timerRef.current = setInterval(() => {
                setSessionTime(prev => prev + 1)
            }, 1000)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [setupMode, sessionId])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getDifficultyFromLevel = (level: number) => {
        switch (level) {
            case 1: return 'BEGINNER'
            case 2: return 'INTERMEDIATE'
            case 3: return 'ADVANCED'
            case 4: return 'EXPERT'
            default: return 'INTERMEDIATE'
        }
    }

    const startSession = async () => {
        if (!selectedOpponent || !industry || selectedLevel === null) return

        setLoading(true)
        try {
            const res = await fetch('/api/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerType: selectedOpponent.customerType,
                    industry,
                    difficulty: getDifficultyFromLevel(selectedLevel)
                })
            })

            const data = await res.json()

            if (res.ok) {
                setSessionId(data.sessionId)
                setMessages([{
                    role: 'assistant',
                    content: data.initialMessage,
                    timestamp: new Date()
                }])
                setSetupMode(false)
            }
        } catch (error) {
            console.error('Failed to start session:', error)
        } finally {
            setLoading(false)
        }
    }

    const sendMessage = async () => {
        if (!inputValue.trim() || !sessionId) return

        const userMessage = inputValue.trim()
        setInputValue('')
        setHint(null)

        setMessages(prev => [...prev, {
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        }])

        setTyping(true)

        try {
            const res = await fetch('/api/session/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, message: userMessage })
            })

            const data = await res.json()

            if (res.ok) {
                setMessages(prev => {
                    const updated = [...prev]
                    const lastUserIdx = updated.findLastIndex(m => m.role === 'user')
                    if (lastUserIdx >= 0) {
                        updated[lastUserIdx].analysis = data.analysis
                    }
                    return updated
                })

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date()
                }])

                setState(data.state)

                if (data.hint) {
                    setHint(data.hint)
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error)
        } finally {
            setTyping(false)
        }
    }

    const endSession = async () => {
        if (!sessionId) return

        setEnding(true)

        try {
            const res = await fetch('/api/session/message', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            })

            if (res.ok) {
                router.push(`/dashboard/session/${sessionId}`)
            }
        } catch (error) {
            console.error('Failed to end session:', error)
        } finally {
            setEnding(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    // Setup Mode - Arena Selection
    if (setupMode) {
        return (
            <div className="sim-split-container setup-mode">
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

                    {/* Arena Header */}
                    <div className="text-center mb-12">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏟️</div>
                        <h1 style={{
                            fontSize: '32px',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                            marginBottom: '8px'
                        }}>
                            Die Sales Arena
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                            Wähle deinen Gegner. Beweise deine Sales-Skills.
                        </p>
                    </div>

                    {/* Opponent Levels */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-6">
                            <Trophy className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>Wähle deinen Gegner</span>
                        </div>

                        <div className="flex flex-col gap-6">
                            {OPPONENTS.map((levelGroup) => (
                                <div key={levelGroup.level}>
                                    {/* Level Header */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div style={{
                                            background: levelGroup.level === 4 ? 'linear-gradient(135deg, var(--gold), var(--orange))' : 'var(--navy-200)',
                                            color: levelGroup.level === 4 ? 'var(--navy-900)' : 'var(--navy-600)',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            Level {levelGroup.level}
                                        </div>
                                        <span style={{
                                            fontSize: '13px',
                                            color: 'var(--text-muted)',
                                            fontWeight: '500'
                                        }}>
                                            {levelGroup.levelName}
                                        </span>
                                        {levelGroup.level === 4 && (
                                            <span style={{ fontSize: '12px' }}>🔥</span>
                                        )}
                                    </div>

                                    {/* Opponent Cards */}
                                    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                        {levelGroup.opponents.map((opponent) => (
                                            <button
                                                key={opponent.id}
                                                onClick={() => {
                                                    setSelectedOpponent(opponent)
                                                    setSelectedLevel(levelGroup.level)
                                                }}
                                                className={`select-card text-left ${selectedOpponent?.id === opponent.id ? 'selected' : ''}`}
                                                style={{ padding: '20px' }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div style={{
                                                        fontSize: '32px',
                                                        width: '56px',
                                                        height: '56px',
                                                        background: 'var(--navy-100)',
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        {opponent.avatar}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{
                                                            fontSize: '15px',
                                                            fontWeight: '600',
                                                            color: 'var(--text-primary)',
                                                            marginBottom: '4px'
                                                        }}>
                                                            {opponent.name}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            color: 'var(--text-secondary)',
                                                            marginBottom: '8px'
                                                        }}>
                                                            {opponent.desc}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span style={{
                                                                fontSize: '11px',
                                                                color: 'var(--text-muted)',
                                                                background: 'var(--navy-100)',
                                                                padding: '2px 8px',
                                                                borderRadius: '4px'
                                                            }}>
                                                                {opponent.trait}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{
                                                            fontSize: '18px',
                                                            fontWeight: '700',
                                                            color: opponent.winRate > 60 ? 'var(--positive)' :
                                                                opponent.winRate > 35 ? 'var(--caution)' : 'var(--negative)'
                                                        }}>
                                                            {opponent.winRate}%
                                                        </div>
                                                        <div style={{
                                                            fontSize: '10px',
                                                            color: 'var(--text-muted)',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            Win-Rate
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Industry Selection */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>Deine Branche</span>
                        </div>
                        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                            {INDUSTRIES.map((ind) => (
                                <button
                                    key={ind.value}
                                    onClick={() => setIndustry(ind.value)}
                                    className={`select-card ${industry === ind.value ? 'selected' : ''}`}
                                    style={{ padding: '12px', textAlign: 'center' }}
                                >
                                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{ind.emoji}</div>
                                    <div style={{ fontSize: '12px', fontWeight: '500' }}>{ind.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={startSession}
                        disabled={!selectedOpponent || !industry || loading}
                        className="btn btn-primary w-full"
                        style={{
                            padding: '18px 24px',
                            fontSize: '16px',
                            borderRadius: '12px'
                        }}
                    >
                        {loading ? (
                            <div
                                className="w-5 h-5 border-2 rounded-full animate-spin"
                                style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: 'var(--navy-900)' }}
                            />
                        ) : (
                            <>
                                <Zap className="w-5 h-5" />
                                Arena betreten
                                {selectedOpponent && (
                                    <span style={{ opacity: 0.7 }}>
                                        → vs. {selectedOpponent.name}
                                    </span>
                                )}
                            </>
                        )}
                    </button>
                </div>
            </div>
        )
    }

    // Chat Mode - Simulation
    const ind = INDUSTRIES.find(i => i.value === industry)

    return (
        <div className="sim-split-container">
            {/* Header */}
            <div className="sim-header" style={{ background: 'var(--white)' }}>
                <div className="sim-header-left">
                    <Link href="/dashboard" style={{ color: 'var(--text-muted)' }}>
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="sim-header-info">
                        <h1>
                            {selectedOpponent?.avatar} vs. {selectedOpponent?.name}
                            <span style={{
                                background: 'var(--gold-muted)',
                                color: 'var(--gold-hover)',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: '600',
                                marginLeft: '12px'
                            }}>
                                Level {selectedLevel}
                            </span>
                        </h1>
                        <p>{ind?.emoji} {ind?.label}</p>
                    </div>
                </div>

                {/* Metrics */}
                {state && (
                    <div className="sim-metrics-bar">
                        <div className="sim-metric">
                            <div className="sim-metric-header">
                                <span className="sim-metric-label">Vertrauen</span>
                                <span className="sim-metric-value">{state.trustLevel}%</span>
                            </div>
                            <div className="sim-metric-bar">
                                <div
                                    className="sim-metric-bar-fill"
                                    style={{
                                        width: `${state.trustLevel}%`,
                                        background: 'linear-gradient(90deg, var(--gold), var(--orange))'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="sim-metric">
                            <div className="sim-metric-header">
                                <span className="sim-metric-label">Interesse</span>
                                <span className="sim-metric-value">{state.interestLevel}%</span>
                            </div>
                            <div className="sim-metric-bar">
                                <div
                                    className="sim-metric-bar-fill"
                                    style={{
                                        width: `${state.interestLevel}%`,
                                        background: 'var(--positive)'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="sim-metric">
                            <div className="sim-metric-header">
                                <span className="sim-metric-label">Geduld</span>
                                <span className="sim-metric-value">{state.patienceRemaining}%</span>
                            </div>
                            <div className="sim-metric-bar">
                                <div
                                    className="sim-metric-bar-fill"
                                    style={{
                                        width: `${state.patienceRemaining}%`,
                                        background: state.patienceRemaining < 30 ? 'var(--negative)' : 'var(--navy-400)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="sim-timer">
                    <Clock className="w-4 h-4" />
                    {formatTime(sessionTime)}
                </div>
            </div>

            {/* Transcript */}
            <div className="sim-transcript" style={{ borderRight: '1px solid var(--border-subtle)' }}>
                <div className="sim-transcript-messages">
                    {messages.map((message, i) => (
                        <div key={i} className={`sim-message ${message.role === 'user' ? 'user' : ''}`}>
                            <div
                                className="sim-avatar"
                                style={{
                                    background: message.role === 'user' ? 'var(--gold)' : 'var(--navy-200)',
                                    color: message.role === 'user' ? 'var(--navy-900)' : 'var(--navy-700)'
                                }}
                            >
                                {message.role === 'user' ? 'Du' : selectedOpponent?.avatar}
                            </div>
                            <div className="sim-bubble-container">
                                <div
                                    className="sim-bubble"
                                    style={{
                                        background: message.role === 'user' ? 'var(--gold)' : 'var(--navy-100)',
                                        color: message.role === 'user' ? 'var(--navy-900)' : 'var(--text-primary)'
                                    }}
                                >
                                    {message.content}
                                </div>
                                <div className="sim-bubble-meta">
                                    <span className="sim-bubble-time">
                                        {message.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {message.analysis && (
                                        <>
                                            {message.analysis.goodQuestion && (
                                                <span className="sim-bubble-feedback positive">
                                                    <Check className="w-3 h-3" /> Stark
                                                </span>
                                            )}
                                            {message.analysis.pressureDetected && (
                                                <span className="sim-bubble-feedback negative">
                                                    <X className="w-3 h-3" /> Druck
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {typing && (
                        <div className="sim-message">
                            <div className="sim-avatar" style={{ background: 'var(--navy-200)', color: 'var(--navy-700)' }}>
                                {selectedOpponent?.avatar}
                            </div>
                            <div className="sim-bubble-container">
                                <div className="sim-bubble" style={{ background: 'var(--navy-100)' }}>
                                    <div className="sim-typing">
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Hint */}
                {hint && (
                    <div style={{ padding: '0 24px 16px' }}>
                        <div
                            className="flex items-center gap-3 p-3 rounded"
                            style={{
                                background: 'var(--gold-subtle)',
                                border: '1px solid var(--gold-muted)'
                            }}
                        >
                            <Lightbulb className="w-4 h-4" style={{ color: 'var(--gold)', flexShrink: 0 }} />
                            <p className="text-sm" style={{ color: 'var(--gold-hover)', flex: 1 }}>{hint}</p>
                            <button onClick={() => setHint(null)} style={{ color: 'var(--gold)', opacity: 0.6 }}>×</button>
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="sim-input-area">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Deine Antwort..."
                        rows={1}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!inputValue.trim() || typing}
                        className="sim-send-btn"
                        style={{ background: 'var(--gold)', color: 'var(--navy-900)' }}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Coach Panel */}
            <div className="sim-coach-panel">
                <div className="sim-coach-header">
                    <Award className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                    <span className="sim-coach-title" style={{ color: 'var(--gold)' }}>Sales Coach</span>
                </div>

                <div className="sim-coach-content">
                    {/* Opponent Info */}
                    <div className="coach-card">
                        <div className="coach-card-header">
                            <div className="coach-card-icon" style={{ background: 'var(--gold-subtle)', fontSize: '18px' }}>
                                {selectedOpponent?.avatar}
                            </div>
                            <span className="coach-card-label">Gegner</span>
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
                            {selectedOpponent?.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {selectedOpponent?.trait}
                        </div>
                    </div>

                    {/* Win Condition */}
                    {state?.closingOpportunity && (
                        <div style={{
                            background: 'linear-gradient(135deg, var(--gold-subtle), rgba(234, 88, 12, 0.1))',
                            border: '1px solid var(--gold)',
                            borderRadius: '12px',
                            padding: '16px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gold-hover)' }}>
                                Abschlusschance!
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                Jetzt den Deal holen
                            </div>
                        </div>
                    )}

                    {/* End Button */}
                    <button
                        onClick={endSession}
                        disabled={ending}
                        className="sim-end-btn"
                        style={{ marginTop: 'auto' }}
                    >
                        {ending ? 'Wird beendet...' : 'Simulation beenden'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function TrainingLoadingFallback() {
    return (
        <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
            <div
                className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{ borderColor: 'var(--navy-200)', borderTopColor: 'var(--gold)' }}
            />
        </div>
    )
}

export default function TrainingPage() {
    return (
        <Suspense fallback={<TrainingLoadingFallback />}>
            <TrainingContent />
        </Suspense>
    )
}
