'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Building, ArrowRight, AlertCircle, Check } from 'lucide-react'

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

    const passwordsMatch = formData.confirmPassword && formData.password === formData.confirmPassword

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--bg-base)' }}>
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
                        Konto erstellen
                    </h1>
                    <p
                        className="text-center text-sm mb-8"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Starten Sie mit dem Vertriebstraining
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
                            <label className="input-label">Name</label>
                            <div className="relative">
                                <User
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-field"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="Ihr Name"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">E-Mail</label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input-field"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="name@firma.de"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Unternehmen (optional)</label>
                            <div className="relative">
                                <Building
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="input-field"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="Firma GmbH"
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
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-field"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="Mindestens 8 Zeichen"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Passwort bestätigen</label>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="input-field"
                                    style={{ paddingLeft: '40px', paddingRight: passwordsMatch ? '40px' : '16px' }}
                                    placeholder="Passwort wiederholen"
                                    required
                                />
                                {passwordsMatch && (
                                    <Check
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                        style={{ color: 'var(--positive)' }}
                                    />
                                )}
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
                                    Konto erstellen
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div
                        className="mt-6 pt-6 text-center text-sm"
                        style={{ borderTop: '1px solid var(--border-subtle)' }}
                    >
                        <span style={{ color: 'var(--text-muted)' }}>Bereits registriert? </span>
                        <Link
                            href="/login"
                            style={{ color: 'var(--accent)' }}
                            className="hover:underline"
                        >
                            Anmelden
                        </Link>
                    </div>
                </div>

                <p
                    className="text-center text-xs mt-6"
                    style={{ color: 'var(--text-muted)' }}
                >
                    Mit der Registrierung akzeptieren Sie unsere AGB und Datenschutzerklärung
                </p>
            </div>
        </div>
    )
}
