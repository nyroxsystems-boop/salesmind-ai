'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Send,
    AlertTriangle,
    Check,
    X,
    Play,
    Square,
    User,
    Building
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
    { value: 'SKEPTICAL_CEO', label: 'Skeptischer Geschäftsführer', abbr: 'GF' },
    { value: 'ANNOYED_BUYER', label: 'Genervter Einkäufer', abbr: 'EK' },
    { value: 'FRIENDLY_UNDECIDED', label: 'Unverbindlicher Entscheider', abbr: 'UE' },
    { value: 'PRICE_FOCUSED_SMB', label: 'Preisfixierter Mittelständler', abbr: 'PM' },
    { value: 'CORPORATE_PROCUREMENT', label: 'Konzern-Procurement', abbr: 'KP' }
]

const INDUSTRIES = [
    { value: 'REAL_ESTATE', label: 'Immobilien' },
    { value: 'SOLAR_ENERGY', label: 'Solar & Energie' },
    { value: 'AGENCY', label: 'Agenturen' },
    { value: 'SAAS_B2B', label: 'SaaS B2B' },
    { value: 'COACHING', label: 'Coaching & Beratung' },
    { value: 'AUTOMOTIVE', label: 'Automobil' },
    { value: 'RECRUITING', label: 'Recruiting' }
]

const DIFFICULTIES = [
    { value: 'BEGINNER', label: 'Einsteiger', desc: 'Geduldiger Kunde' },
    { value: 'INTERMEDIATE', label: 'Fortgeschritten', desc: 'Realistisch' },
    { value: 'ADVANCED', label: 'Profi', desc: 'Anspruchsvoll' },
    { value: 'EXPERT', label: 'Experte', desc: 'Maximum' }
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

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

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

    const getCustomerAbbr = () => {
        return CUSTOMER_TYPES.find(c => c.value === customerType)?.abbr || 'KD'
    }

    // Setup Mode
    if (setupMode) {
        return (
            <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
                <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px' }}>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 mb-8"
                        style={{ color: 'var(--text-secondary)', fontSize: '14px' }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Zurück
                    </Link>

                    <h1 className="heading-page mb-2">Simulation konfigurieren</h1>
                    <p className="text-caption mb-10">
                        Wählen Sie Kundentyp, Branche und Schwierigkeitsgrad.
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
                                        <div
                                            className="customer-avatar"
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                background: customerType === type.value ? 'var(--accent)' : 'var(--graphite-700)',
                                                color: customerType === type.value ? 'var(--black)' : 'var(--text-secondary)',
                                                fontSize: '11px'
                                            }}
                                        >
                                            {type.abbr}
                                        </div>
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
                                    <span className="select-card-title" style={{ fontSize: '13px' }}>{ind.label}</span>
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
                        style={{ padding: '14px 24px', fontSize: '15px' }}
                    >
                        {loading ? (
                            <div
                                className="w-5 h-5 border-2 rounded-full animate-spin"
                                style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: 'var(--black)' }}
                            />
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                Simulation starten
                            </>
                        )}
                    </button>
                </div>
            </div>
        )
    }

    // Chat Mode - Full Focus
    return (
        <div className="chat-container">
            {/* Header */}
            <div className="chat-header">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" style={{ color: 'var(--text-muted)' }}>
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {CUSTOMER_TYPES.find(c => c.value === customerType)?.label}
                        </h1>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {INDUSTRIES.find(i => i.value === industry)?.label} · {DIFFICULTIES.find(d => d.value === difficulty)?.label}
                        </p>
                    </div>
                </div>

                {/* Status Indicators */}
                {state && (
                    <div className="sim-status-bar">
                        <div className="sim-status-item">
                            <span className="sim-status-label">Vertrauen</span>
                            <span className="sim-status-value">{state.trustLevel}%</span>
                        </div>
                        <div className="sim-status-item">
                            <span className="sim-status-label">Interesse</span>
                            <span className="sim-status-value">{state.interestLevel}%</span>
                        </div>
                        <div className="sim-status-item">
                            <span className="sim-status-label">Geduld</span>
                            <span className="sim-status-value">{state.patienceRemaining}%</span>
                        </div>
                        <button
                            onClick={endSession}
                            disabled={ending}
                            className="btn btn-secondary"
                            style={{ padding: '8px 16px', fontSize: '13px' }}
                        >
                            {ending ? (
                                <div
                                    className="w-4 h-4 border-2 rounded-full animate-spin"
                                    style={{ borderColor: 'var(--graphite-600)', borderTopColor: 'var(--text-primary)' }}
                                />
                            ) : (
                                <>
                                    <Square className="w-3 h-3" />
                                    Beenden
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="chat-messages">
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    {messages.map((message, i) => (
                        <div key={i} className="mb-4 animate-fade-in">
                            {message.role === 'assistant' ? (
                                <div className="flex gap-3">
                                    <div className="customer-avatar" style={{ flexShrink: 0 }}>
                                        {getCustomerAbbr()}
                                    </div>
                                    <div className="chat-bubble chat-bubble-ai">
                                        {message.content}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-end gap-2">
                                    <div className="chat-bubble chat-bubble-user">
                                        {message.content}
                                    </div>
                                    {message.analysis && (
                                        <div className="flex items-center gap-3 text-xs">
                                            {message.analysis.goodQuestion && (
                                                <span className="flex items-center gap-1" style={{ color: 'var(--positive)' }}>
                                                    <Check className="w-3 h-3" />
                                                    Gute Frage
                                                </span>
                                            )}
                                            {message.analysis.pressureDetected && (
                                                <span className="flex items-center gap-1" style={{ color: 'var(--negative)' }}>
                                                    <X className="w-3 h-3" />
                                                    Druck
                                                </span>
                                            )}
                                            {message.analysis.prematurePitch && (
                                                <span className="flex items-center gap-1" style={{ color: 'var(--caution)' }}>
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Früher Pitch
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {typing && (
                        <div className="flex gap-3 mb-4">
                            <div className="customer-avatar" style={{ flexShrink: 0 }}>
                                {getCustomerAbbr()}
                            </div>
                            <div className="chat-bubble chat-bubble-ai">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Hint Banner */}
            {hint && (
                <div style={{ padding: '0 24px' }}>
                    <div
                        className="flex items-center gap-3 p-3 rounded mb-4"
                        style={{
                            maxWidth: '700px',
                            margin: '0 auto',
                            background: 'rgba(251, 191, 36, 0.1)',
                            border: '1px solid rgba(251, 191, 36, 0.2)'
                        }}
                    >
                        <AlertTriangle className="w-4 h-4" style={{ color: 'var(--caution)', flexShrink: 0 }} />
                        <p className="text-sm" style={{ color: 'var(--caution)' }}>{hint}</p>
                        <button
                            onClick={() => setHint(null)}
                            className="ml-auto"
                            style={{ color: 'var(--caution)', opacity: 0.6 }}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="chat-input-area">
                <div className="flex items-end gap-3" style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ihre Antwort..."
                        rows={1}
                        className="input-field flex-1"
                        style={{ resize: 'none', minHeight: '44px', maxHeight: '120px' }}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!inputValue.trim() || typing}
                        className="btn btn-primary"
                        style={{ padding: '10px 14px' }}
                    >
                        <Send className="w-4 h-4" />
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
