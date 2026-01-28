import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      {/* Subtle gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0, 212, 255, 0.03), transparent)'
        }}
      />

      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
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
        </div>

        {/* Tagline */}
        <h1
          className="text-2xl font-semibold mb-3"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
        >
          Vertriebstraining mit KI
        </h1>
        <p
          className="text-sm mb-10"
          style={{ color: 'var(--text-secondary)' }}
        >
          Trainiere Verkaufsgespräche mit realistischen KI-Kunden.
          <br />
          Entwickelt für den DACH-Markt.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="btn btn-primary w-full"
          >
            Anmelden
          </Link>
          <Link
            href="/register"
            className="btn btn-secondary w-full"
          >
            Konto erstellen
          </Link>
        </div>

        {/* Footer note */}
        <p
          className="mt-12 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          DSGVO-konform · Deutsche Server · Enterprise-ready
        </p>
      </div>
    </div>
  )
}
