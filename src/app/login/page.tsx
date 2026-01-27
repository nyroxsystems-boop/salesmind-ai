'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false
            })

            if (result?.error) {
                setError('Ungültige E-Mail oder Passwort')
            } else {
                router.push('/dashboard')
            }
        } catch (err) {
            setError('Anmeldung fehlgeschlagen')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative">
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
                    <h1 className="text-2xl font-bold text-center mb-2">Willkommen zurück</h1>
                    <p className="text-neutral-400 text-center mb-8">
                        Melde dich an, um mit dem Training fortzufahren
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
                                E-Mail
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-12"
                                    placeholder="deine@email.de"
                                    required
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-12"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-neutral-600 bg-bg-tertiary" />
                                <span className="text-neutral-400">Angemeldet bleiben</span>
                            </label>
                            <Link href="/forgot-password" className="text-primary-400 hover:text-primary-300">
                                Passwort vergessen?
                            </Link>
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
                                    Anmelden
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-glass-border text-center">
                        <p className="text-neutral-400 text-sm">
                            Noch kein Konto?{' '}
                            <Link href="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                                Jetzt registrieren
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-neutral-500 text-xs mt-6">
                    Mit der Anmeldung akzeptierst du unsere{' '}
                    <Link href="/agb" className="underline hover:text-white">AGB</Link>{' '}
                    und{' '}
                    <Link href="/datenschutz" className="underline hover:text-white">Datenschutzerklärung</Link>
                </p>
            </div>
        </div>
    )
}
