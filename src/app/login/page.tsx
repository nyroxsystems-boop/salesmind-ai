'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

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
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: 'var(--accent)' }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--black)' }}>
                                <path d="M12 2a8 8 0 1 0 8 8" />
                                <path d="M12 2v4" />
                                <path d="M12 10v4" />
                                <circle cx="12" cy="18" r="2" />
                            </svg>
                        </div>
                        <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                            SalesMind
                        </span>
                    </Link>
                </div>

                {/* Form Card */}
                <div className="command-card">
                    <h1
                        className="text-xl font-semibold text-center mb-1"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Anmelden
                    </h1>
                    <p
                        className="text-center text-sm mb-8"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Willkommen zurück
                    </p>

                    {error && (
                        <div
                            className="flex items-center gap-2 p-3 mb-6 rounded text-sm"
                            style={{
                                background: 'rgba(248, 113, 113, 0.1)',
                                border: '1px solid rgba(248, 113, 113, 0.2)',
                                color: 'var(--negative)'
                            }}
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="input-label">E-Mail</label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="name@firma.de"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Passwort</label>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full"
                            style={{ marginTop: '24px' }}
                        >
                            {loading ? (
                                <div
                                    className="w-4 h-4 border-2 rounded-full animate-spin"
                                    style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: 'var(--black)' }}
                                />
                            ) : (
                                <>
                                    Anmelden
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div
                        className="mt-6 pt-6 text-center text-sm"
                        style={{ borderTop: '1px solid var(--border-subtle)' }}
                    >
                        <span style={{ color: 'var(--text-muted)' }}>Noch kein Konto? </span>
                        <Link
                            href="/register"
                            style={{ color: 'var(--accent)' }}
                            className="hover:underline"
                        >
                            Registrieren
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
