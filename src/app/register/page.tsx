'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, Mail, Lock, User, Building, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Passwörter stimmen nicht überein')
            return
        }

        if (formData.password.length < 8) {
            setError('Passwort muss mindestens 8 Zeichen lang sein')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    companyName: formData.companyName || undefined
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Registrierung fehlgeschlagen')
            }

            router.push('/login?registered=true')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const passwordStrength = () => {
        const pwd = formData.password
        if (pwd.length === 0) return { strength: 0, text: '' }
        if (pwd.length < 8) return { strength: 1, text: 'Zu kurz', color: 'bg-error' }
        if (pwd.length < 10) return { strength: 2, text: 'Okay', color: 'bg-warning' }
        if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)) {
            return { strength: 3, text: 'Stark', color: 'bg-success' }
        }
        return { strength: 2, text: 'Mittel', color: 'bg-accent-amber' }
    }

    const pwdStrength = passwordStrength()

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
            <div className="hero-gradient" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
                            <Brain className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold">SalesMind AI</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="glass-card-elevated p-8">
                    <h1 className="text-2xl font-bold text-center mb-2">Konto erstellen</h1>
                    <p className="text-neutral-400 text-center mb-8">
                        Starte kostenlos und trainiere mit der besten Sales-KI
                    </p>

                    {error && (
                        <div className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-300">
                                Dein Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="Max Mustermann"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-300">
                                E-Mail
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="max@unternehmen.de"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-300">
                                Unternehmen (optional)
                            </label>
                            <div className="relative">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="Dein Unternehmen GmbH"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-300">
                                Passwort
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="Mindestens 8 Zeichen"
                                    required
                                />
                            </div>
                            {formData.password && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 h-1 rounded bg-bg-tertiary overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${pwdStrength.color}`}
                                            style={{ width: `${(pwdStrength.strength / 3) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-neutral-400">{pwdStrength.text}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-300">
                                Passwort bestätigen
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="Passwort wiederholen"
                                    required
                                />
                                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Kostenlos registrieren
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Benefits */}
                    <div className="mt-6 pt-6 border-t border-glass-border">
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                '14 Tage kostenlos',
                                'Keine Kreditkarte',
                                'DSGVO-konform',
                                'Sofort loslegen'
                            ].map((benefit, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-neutral-400">
                                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                                    {benefit}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-glass-border text-center">
                        <p className="text-neutral-400 text-sm">
                            Bereits registriert?{' '}
                            <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                                Jetzt anmelden
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-neutral-500 text-xs mt-6">
                    Mit der Registrierung akzeptierst du unsere{' '}
                    <Link href="/agb" className="underline hover:text-white">AGB</Link>{' '}
                    und{' '}
                    <Link href="/datenschutz" className="underline hover:text-white">Datenschutzerklärung</Link>
                </p>
            </div>
        </div>
    )
}
