'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Send,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Lightbulb,
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
    { value: 'SKEPTICAL_CEO', label: 'Skeptischer Geschäftsführer', emoji: '😤' },
    { value: 'ANNOYED_BUYER', label: 'Genervter Einkäufer', emoji: '😒' },
    { value: 'FRIENDLY_UNDECIDED', label: 'Freundlich Unverbindlich', emoji: '😊' },
    { value: 'PRICE_FOCUSED_SMB', label: 'Preisfixierter Mittelständler', emoji: '🧮' },
    { value: 'CORPORATE_PROCUREMENT', label: 'Konzern-Procurement', emoji: '📋' }
]

const INDUSTRIES = [
    { value: 'REAL_ESTATE', label: 'Immobilien', icon: '🏠' },
    { value: 'SOLAR_ENERGY', label: 'Solar & Energie', icon: '☀️' },
    { value: 'AGENCY', label: 'Agenturen', icon: '🎨' },
    { value: 'SAAS_B2B', label: 'SaaS B2B', icon: '💻' },
    { value: 'COACHING', label: 'Coaching & Beratung', icon: '🎯' },
    { value: 'AUTOMOTIVE', label: 'Automobil', icon: '🚗' },
    { value: 'RECRUITING', label: 'Recruiting', icon: '👥' }
]

const DIFFICULTIES = [
    { value: 'BEGINNER', label: 'Einsteiger', desc: 'Geduldiger Kunde, viele Hinweise' },
    { value: 'INTERMEDIATE', label: 'Fortgeschritten', desc: 'Realistisches Gespräch' },
    { value: 'ADVANCED', label: 'Profi', desc: 'Schwieriger Kunde, kaum Hinweise' },
    { value: 'EXPERT', label: 'Experte', desc: 'Maximale Herausforderung' }
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

        // Add user message immediately
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
                // Update last user message with analysis
                setMessages(prev => {
                    const updated = [...prev]
                    const lastUserIdx = updated.findLastIndex(m => m.role === 'user')
                    if (lastUserIdx >= 0) {
                        updated[lastUserIdx].analysis = data.analysis
                    }
                    return updated
                })

                // Add AI response
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

    // Setup Mode
    if (setupMode) {
        return (
            <div className="min-h-screen bg-bg-primary">
                <div className="max-w-4xl mx-auto px-8 py-12">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-8">
                        <ArrowLeft className="w-4 h-4" />
                        Zurück zum Dashboard
                    </Link>

                    <h1 className="text-3xl font-bold mb-2">Training konfigurieren</h1>
                    <p className="text-neutral-400 mb-10">
                        Wähle deinen Kundentyp, die Branche und den Schwierigkeitsgrad.
                    </p>

                    {/* Customer Type Selection */}
                    <div className="mb-10">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary-400" />
                            Kundentyp
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {CUSTOMER_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setCustomerType(type.value)}
                                    className={`p-4 rounded-xl border text-left transition ${customerType === type.value
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : 'border-glass-border bg-bg-tertiary hover:border-neutral-600'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">{type.emoji}</div>
                                    <div className="font-medium text-sm">{type.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Industry Selection */}
                    <div className="mb-10">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Building className="w-5 h-5 text-accent-cyan" />
                            Branche
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {INDUSTRIES.map((ind) => (
                                <button
                                    key={ind.value}
                                    onClick={() => setIndustry(ind.value)}
                                    className={`p-4 rounded-xl border text-left transition ${industry === ind.value
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : 'border-glass-border bg-bg-tertiary hover:border-neutral-600'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">{ind.icon}</div>
                                    <div className="font-medium text-sm">{ind.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty Selection */}
                    <div className="mb-10">
                        <h2 className="text-lg font-semibold mb-4">Schwierigkeitsgrad</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {DIFFICULTIES.map((diff) => (
                                <button
                                    key={diff.value}
                                    onClick={() => setDifficulty(diff.value)}
                                    className={`p-4 rounded-xl border text-left transition ${difficulty === diff.value
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : 'border-glass-border bg-bg-tertiary hover:border-neutral-600'
                                        }`}
                                >
                                    <div className="font-medium text-sm mb-1">{diff.label}</div>
                                    <div className="text-xs text-neutral-500">{diff.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={startSession}
                        disabled={!customerType || !industry || loading}
                        className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Play className="w-5 h-5" />
                                Training starten
                            </>
                        )}
                    </button>
                </div>
            </div>
        )
    }

    // Chat Mode
    return (
        <div className="min-h-screen bg-bg-primary flex flex-col">
            {/* Header */}
            <header className="bg-bg-secondary border-b border-glass-border px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-neutral-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-semibold">
                                {CUSTOMER_TYPES.find(c => c.value === customerType)?.label}
                            </h1>
                            <p className="text-sm text-neutral-500">
                                {INDUSTRIES.find(i => i.value === industry)?.label} • {DIFFICULTIES.find(d => d.value === difficulty)?.label}
                            </p>
                        </div>
                    </div>

                    {/* State Indicators */}
                    {state && (
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-xs text-neutral-500 mb-1">Vertrauen</div>
                                <div className="w-24 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-error via-warning to-success transition-all"
                                        style={{ width: `${state.trustLevel}%` }}
                                    />
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-neutral-500 mb-1">Interesse</div>
                                <div className="w-24 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-neutral-600 to-primary-500 transition-all"
                                        style={{ width: `${state.interestLevel}%` }}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={endSession}
                                disabled={ending}
                                className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                            >
                                {ending ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Square className="w-4 h-4" />
                                        Beenden
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-auto px-6 py-6">
                <div className="max-w-3xl mx-auto space-y-4">
                    {messages.map((message, i) => (
                        <div key={i} className="animate-fade-in">
                            {message.role === 'assistant' ? (
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center flex-shrink-0">
                                        <span className="text-lg">
                                            {CUSTOMER_TYPES.find(c => c.value === customerType)?.emoji}
                                        </span>
                                    </div>
                                    <div className="chat-bubble-ai">
                                        {message.content}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-end gap-2">
                                    <div className="chat-bubble-user">
                                        {message.content}
                                    </div>
                                    {message.analysis && (
                                        <div className="flex items-center gap-2 text-xs">
                                            {message.analysis.goodQuestion && (
                                                <span className="flex items-center gap-1 text-success">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Gute Frage
                                                </span>
                                            )}
                                            {message.analysis.pressureDetected && (
                                                <span className="flex items-center gap-1 text-error">
                                                    <XCircle className="w-3 h-3" />
                                                    Druck erkannt
                                                </span>
                                            )}
                                            {message.analysis.prematurePitch && (
                                                <span className="flex items-center gap-1 text-warning">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Zu früh gepitched
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {typing && (
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center">
                                <span className="text-lg">
                                    {CUSTOMER_TYPES.find(c => c.value === customerType)?.emoji}
                                </span>
                            </div>
                            <div className="chat-bubble-ai">
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
                <div className="px-6">
                    <div className="max-w-3xl mx-auto mb-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
                            <Lightbulb className="w-5 h-5 text-warning flex-shrink-0" />
                            <p className="text-sm text-warning">{hint}</p>
                            <button
                                onClick={() => setHint(null)}
                                className="ml-auto text-warning/60 hover:text-warning"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="bg-bg-secondary border-t border-glass-border px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-end gap-3">
                    <div className="flex-1 relative">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Deine Antwort..."
                            rows={1}
                            className="w-full input-field resize-none pr-12"
                            style={{ minHeight: '48px', maxHeight: '120px' }}
                        />
                    </div>
                    <button
                        onClick={sendMessage}
                        disabled={!inputValue.trim() || typing}
                        className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}

function TrainingLoadingFallback() {
    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-neutral-400">Training wird geladen...</p>
            </div>
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
