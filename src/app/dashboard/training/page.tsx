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
    Play,
    Square,
    User,
    Building,
    Clock,
    Target,
    Lightbulb,
    MessageSquare,
    Shield,
    HelpCircle,
    Mic,
    DollarSign,
    Zap
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

const CUSTOMER_TYPES = [
    { value: 'SKEPTICAL_CEO', label: 'Skeptischer Geschäftsführer', abbr: 'GF', emoji: '😐' },
    { value: 'ANNOYED_BUYER', label: 'Genervter Einkäufer', abbr: 'EK', emoji: '😤' },
    { value: 'FRIENDLY_UNDECIDED', label: 'Unverbindlicher Entscheider', abbr: 'UE', emoji: '🤔' },
    { value: 'PRICE_FOCUSED_SMB', label: 'Preisfixierter Mittelständler', abbr: 'PM', emoji: '💰' },
    { value: 'CORPORATE_PROCUREMENT', label: 'Konzern-Procurement', abbr: 'KP', emoji: '🏢' }
]

const INDUSTRIES = [
    { value: 'REAL_ESTATE', label: 'Immobilien', emoji: '🏠' },
    { value: 'SOLAR_ENERGY', label: 'Solar & Energie', emoji: '☀️' },
    { value: 'AGENCY', label: 'Agenturen', emoji: '🎨' },
    { value: 'SAAS_B2B', label: 'SaaS B2B', emoji: '💻' },
    { value: 'COACHING', label: 'Coaching & Beratung', emoji: '📚' },
    { value: 'AUTOMOTIVE', label: 'Automobil', emoji: '🚗' },
    { value: 'RECRUITING', label: 'Recruiting', emoji: '👥' }
]

const DIFFICULTIES = [
    { value: 'BEGINNER', label: 'Einsteiger', desc: 'Geduldiger Kunde' },
    { value: 'INTERMEDIATE', label: 'Fortgeschritten', desc: 'Realistisch' },
    { value: 'ADVANCED', label: 'Profi', desc: 'Anspruchsvoll' },
    { value: 'EXPERT', label: 'Experte', desc: 'Maximum' }
]

const QUICK_ACTIONS = [
    { id: 'objection', icon: '🛡️', label: 'Einwand', template: 'Das verstehe ich. Darf ich fragen, ' },
    { id: 'question', icon: '❓', label: 'Frage', template: 'Eine kurze Frage: ' },
    { id: 'pitch', icon: '🎙️', label: 'Pitch', template: 'Was uns auszeichnet ist, ' },
    { id: 'close', icon: '💰', label: 'Abschluss', template: 'Basierend auf unserem Gespräch, ' }
]

function TrainingContent() {
    const { status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Setup state
    const [setupMode, setSetupMode] = useState(true)
    const [customerType, setCustomerType] = useState(searchParams.get('customer') || '')
    const [industry, setIndustry] = useState(searchParams.get('industry') || '')
    const [difficulty, setDifficulty] = useState('INTERMEDIATE')

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
    const [situation, setSituation] = useState('Warte auf Gesprächsbeginn...')

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

    // Session timer
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

    const getMoodEmoji = () => {
        if (!state) return { emoji: '😐', text: 'Neutral', subtext: 'Gesprächsbeginn' }
        if (state.customerMood >= 30) return { emoji: '😊', text: 'Positiv', subtext: 'Gute Stimmung' }
        if (state.customerMood >= 0) return { emoji: '😐', text: 'Neutral', subtext: 'Abwartend' }
        if (state.customerMood >= -30) return { emoji: '😕', text: 'Skeptisch', subtext: 'Vorsicht geboten' }
        return { emoji: '😤', text: 'Genervt', subtext: 'Kritische Lage' }
    }

    const getSituationText = () => {
        if (!state) return 'Warte auf Gesprächsbeginn...'
        if (state.closingOpportunity) return '🎯 Abschlusschance erkannt!'
        if (state.patienceRemaining < 30) return '⚠️ Geduld schwindet...'
        if (state.trustLevel > 60) return '✨ Vertrauen aufgebaut'
        if (state.interestLevel > 60) return '💡 Interesse geweckt'
        return '🗣️ Gespräch läuft...'
    }

    const getTalkRatio = () => {
        const userMessages = messages.filter(m => m.role === 'user').length
        const total = messages.length
        if (total === 0) return { you: 50, customer: 50 }
        const youPercent = Math.round((userMessages / total) * 100)
        return { you: youPercent, customer: 100 - youPercent }
    }

    const startSession = async () => {
        if (!customerType || !industry) return

        setLoading(true)
        try {
            const res = await fetch('/api/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerType, industry, difficulty })
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
                setSituation('Gespräch gestartet')
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
                setSituation(getSituationText())

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

    const handleQuickAction = (template: string) => {
        setInputValue(template)
    }

    const getCustomerInfo = () => {
        const customer = CUSTOMER_TYPES.find(c => c.value === customerType)
        const ind = INDUSTRIES.find(i => i.value === industry)
        return { customer, industry: ind }
    }

    // Setup Mode - Configuration Screen
    if (setupMode) {
        return (
            <div className="sim-split-container setup-mode">
                <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px' }}>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 mb-8"
                        style={{ color: 'var(--text-secondary)', fontSize: '14px' }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Zurück
                    </Link>

                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="heading-page">Simulation konfigurieren</h1>
                        <span style={{ fontSize: '24px' }}>🎯</span>
                    </div>
                    <p className="text-caption mb-10">
                        Wählen Sie Kundentyp, Branche und Schwierigkeitsgrad für Ihr Training.
                    </p>

                    {/* Customer Type */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Kundentyp</span>
                        </div>
                        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            {CUSTOMER_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setCustomerType(type.value)}
                                    className={`select-card text-left ${customerType === type.value ? 'selected' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span style={{ fontSize: '24px' }}>{type.emoji}</span>
                                        <span className="select-card-title" style={{ fontSize: '13px' }}>{type.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Industry */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Building className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Branche</span>
                        </div>
                        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            {INDUSTRIES.map((ind) => (
                                <button
                                    key={ind.value}
                                    onClick={() => setIndustry(ind.value)}
                                    className={`select-card ${industry === ind.value ? 'selected' : ''}`}
                                >
                                    <div className="flex items-center gap-2 justify-center">
                                        <span>{ind.emoji}</span>
                                        <span className="select-card-title" style={{ fontSize: '13px' }}>{ind.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="mb-10">
                        <div className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Schwierigkeitsgrad</div>
                        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                            {DIFFICULTIES.map((diff) => (
                                <button
                                    key={diff.value}
                                    onClick={() => setDifficulty(diff.value)}
                                    className={`select-card text-center ${difficulty === diff.value ? 'selected' : ''}`}
                                >
                                    <div className="select-card-title" style={{ fontSize: '13px' }}>{diff.label}</div>
                                    <div className="select-card-desc" style={{ fontSize: '11px' }}>{diff.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={startSession}
                        disabled={!customerType || !industry || loading}
                        className="btn btn-primary w-full"
                        style={{ padding: '16px 24px', fontSize: '15px' }}
                    >
                        {loading ? (
                            <div
                                className="w-5 h-5 border-2 rounded-full animate-spin"
                                style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: 'var(--black)' }}
                            />
                        ) : (
                            <>
                                <Zap className="w-5 h-5" />
                                Simulation starten
                            </>
                        )}
                    </button>
                </div>
            </div>
        )
    }

    // Chat Mode - Split View
    const { customer, industry: ind } = getCustomerInfo()
    const mood = getMoodEmoji()
    const talkRatio = getTalkRatio()

    return (
        <div className="sim-split-container">
            {/* Header */}
            <div className="sim-header">
                <div className="sim-header-left">
                    <Link href="/dashboard" style={{ color: 'var(--text-muted)' }}>
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="sim-header-info">
                        <h1>
                            {customer?.emoji} {customer?.label}
                            <span className="sim-live-badge">
                                <span className="sim-live-dot" />
                                LIVE
                            </span>
                        </h1>
                        <p>{ind?.emoji} {ind?.label} · {DIFFICULTIES.find(d => d.value === difficulty)?.label}</p>
                    </div>
                </div>

                {/* Live Metrics */}
                {state && (
                    <div className="sim-metrics-bar">
                        <div className="sim-metric">
                            <div className="sim-metric-header">
                                <span className="sim-metric-label">Vertrauen</span>
                                <span className="sim-metric-value">{state.trustLevel}%</span>
                            </div>
                            <div className="sim-metric-bar">
                                <div
                                    className="sim-metric-bar-fill trust"
                                    style={{ width: `${state.trustLevel}%` }}
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
                                    className="sim-metric-bar-fill interest"
                                    style={{ width: `${state.interestLevel}%` }}
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
                                    className={`sim-metric-bar-fill patience ${state.patienceRemaining < 30 ? 'critical' : ''}`}
                                    style={{ width: `${state.patienceRemaining}%` }}
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

            {/* Left: Transcript */}
            <div className="sim-transcript">
                <div className="sim-transcript-header">
                    <MessageSquare className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <span className="sim-transcript-title">Live-Transkript</span>
                </div>

                <div className="sim-transcript-messages">
                    {messages.map((message, i) => (
                        <div key={i} className={`sim-message ${message.role === 'user' ? 'user' : ''}`}>
                            <div className={`sim-avatar ${message.role === 'user' ? 'user' : 'customer'}`}>
                                {message.role === 'user' ? 'Du' : customer?.abbr}
                            </div>
                            <div className="sim-bubble-container">
                                <div className={`sim-bubble ${message.role === 'user' ? 'user' : 'customer'}`}>
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
                                                    <Check className="w-3 h-3" /> Gut
                                                </span>
                                            )}
                                            {message.analysis.pressureDetected && (
                                                <span className="sim-bubble-feedback negative">
                                                    <X className="w-3 h-3" /> Druck
                                                </span>
                                            )}
                                            {message.analysis.prematurePitch && (
                                                <span className="sim-bubble-feedback warning">
                                                    <AlertTriangle className="w-3 h-3" /> Zu früh
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
                            <div className="sim-avatar customer">{customer?.abbr}</div>
                            <div className="sim-bubble-container">
                                <div className="sim-bubble customer">
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

                {/* Hint Banner */}
                {hint && (
                    <div style={{ padding: '0 24px 16px' }}>
                        <div
                            className="flex items-center gap-3 p-3 rounded"
                            style={{
                                background: 'rgba(251, 191, 36, 0.1)',
                                border: '1px solid rgba(251, 191, 36, 0.2)'
                            }}
                        >
                            <Lightbulb className="w-4 h-4" style={{ color: 'var(--caution)', flexShrink: 0 }} />
                            <p className="text-sm" style={{ color: 'var(--caution)', flex: 1 }}>{hint}</p>
                            <button onClick={() => setHint(null)} style={{ color: 'var(--caution)', opacity: 0.6 }}>×</button>
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="sim-input-area">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ihre Antwort eingeben..."
                        rows={1}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!inputValue.trim() || typing}
                        className="sim-send-btn"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Right: Coach Panel */}
            <div className="sim-coach-panel">
                <div className="sim-coach-header">
                    <Target className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    <span className="sim-coach-title">KI Verkaufs-Coach</span>
                </div>

                <div className="sim-coach-content">
                    {/* Situation Card */}
                    <div className="coach-card">
                        <div className="coach-card-header">
                            <div className="coach-card-icon situation">🎯</div>
                            <span className="coach-card-label">Aktuelle Situation</span>
                        </div>
                        <div className="coach-card-content highlight">
                            {getSituationText()}
                        </div>
                    </div>

                    {/* Mood Card */}
                    <div className="coach-card">
                        <div className="coach-card-header">
                            <div className="coach-card-icon mood">😊</div>
                            <span className="coach-card-label">Kundenstimmung</span>
                        </div>
                        <div className="mood-indicator">
                            <span className="mood-emoji">{mood.emoji}</span>
                            <div>
                                <div className="mood-text">{mood.text}</div>
                                <div className="mood-subtext">{mood.subtext}</div>
                            </div>
                        </div>
                    </div>

                    {/* Tip Card */}
                    {hint && (
                        <div className="coach-card">
                            <div className="coach-card-header">
                                <div className="coach-card-icon tip">💡</div>
                                <span className="coach-card-label">Tipp</span>
                            </div>
                            <div className="coach-card-content">
                                {hint}
                            </div>
                        </div>
                    )}

                    {/* Talk Ratio */}
                    <div className="coach-card">
                        <div className="coach-card-header">
                            <div className="coach-card-icon situation">📊</div>
                            <span className="coach-card-label">Gesprächsanteil</span>
                        </div>
                        <div className="talk-ratio-container">
                            <div className="talk-ratio-bar">
                                <div className="talk-ratio-you" style={{ width: `${talkRatio.you}%` }} />
                                <div className="talk-ratio-customer" style={{ width: `${talkRatio.customer}%` }} />
                            </div>
                            <div className="talk-ratio-legend">
                                <span>Du: {talkRatio.you}%</span>
                                <span>Kunde: {talkRatio.customer}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Closing Opportunity Alert */}
                    {state?.closingOpportunity && (
                        <div className="sim-closing-alert">
                            <span className="sim-closing-alert-icon">🎯</span>
                            <span className="sim-closing-alert-text">
                                Abschlusschance erkannt! Jetzt handeln.
                            </span>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="sim-quick-actions">
                        <div className="sim-quick-actions-title">Schnellaktionen</div>
                        <div className="sim-quick-actions-grid">
                            {QUICK_ACTIONS.map((action) => (
                                <button
                                    key={action.id}
                                    onClick={() => handleQuickAction(action.template)}
                                    className="quick-action-btn"
                                >
                                    <span>{action.icon}</span>
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* End Session */}
                    <button
                        onClick={endSession}
                        disabled={ending}
                        className="sim-end-btn"
                    >
                        {ending ? (
                            <div
                                className="w-4 h-4 border-2 rounded-full animate-spin"
                                style={{ borderColor: 'var(--graphite-600)', borderTopColor: 'var(--text-primary)' }}
                            />
                        ) : (
                            <>
                                <Square className="w-4 h-4" />
                                Simulation beenden
                            </>
                        )}
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
                style={{ borderColor: 'var(--graphite-700)', borderTopColor: 'var(--accent)' }}
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
