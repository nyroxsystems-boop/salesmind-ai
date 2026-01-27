import Link from 'next/link'
import {
  Brain,
  Target,
  TrendingUp,
  Shield,
  Users,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Zap,
  MessageSquare,
  Award,
  Building
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen relative">
      {/* Background gradient */}
      <div className="hero-gradient" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">SalesMind AI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="#features" className="text-neutral-400 hover:text-white transition">
            Features
          </Link>
          <Link href="#pricing" className="text-neutral-400 hover:text-white transition">
            Preise
          </Link>
          <Link href="/login" className="btn-ghost">
            Login
          </Link>
          <Link href="/register" className="btn-primary">
            Kostenlos starten
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8">
            <Zap className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-primary-300">Die #1 KI-Sales-Trainingsplattform im DACH-Raum</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Trainiere <span className="gradient-text">Verkaufen</span>
            <br />wie ein Profi
          </h1>

          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-10">
            Die erste KI-Vertriebsakademie, die deutsch denkt. Übe mit realistischen
            KI-Kunden, erhalte echtes Feedback und werde zum Top-Verkäufer.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
              Jetzt kostenlos testen
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#demo" className="btn-secondary text-lg px-8 py-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Demo ansehen
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              DSGVO-konform
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              Keine Kreditkarte
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              Deutsche Server
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="relative z-10 bg-bg-secondary py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Das Problem mit klassischem Sales-Training
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Amerikanische KI-Tools verstehen den deutschen Markt nicht.
              Rollenspiele mit Kollegen sind unrealistisch. Das Ergebnis: Verlorene Deals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Zu amerikanisch',
                desc: 'US-Tools kommunizieren aggressiv und verstehen deutsche Zurückhaltung nicht.',
                icon: '🇺🇸'
              },
              {
                title: 'Unrealistische Übungen',
                desc: 'Kollegen spielen nette Kunden - echte deutsche Entscheider sind skeptisch.',
                icon: '🎭'
              },
              {
                title: 'Kein echtes Feedback',
                desc: '"Gut gemacht!" ist kein Feedback. Du brauchst konkrete Verbesserungen.',
                icon: '❌'
              }
            ].map((item, i) => (
              <div key={i} className="glass-card p-8">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-neutral-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Die Lösung: <span className="gradient-text">SalesMind AI</span>
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              7 einzigartige Features, die dich zum besten Verkäufer in deinem Team machen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'Realistische KI-Kunden',
                desc: '5 deutsche Kundentypen: vom skeptischen GF bis zum genervten Einkäufer.',
                gradient: 'from-primary-500 to-primary-600'
              },
              {
                icon: Target,
                title: 'DACH-Psychologie',
                desc: 'Erkennt deutsche Einwände, indirekte Absagen und Höflichkeits-Abwehr.',
                gradient: 'from-accent-cyan to-accent-emerald'
              },
              {
                icon: MessageSquare,
                title: 'Echtes KI-Coaching',
                desc: 'Knallhartes Feedback: "Hier hast du den Kunden verloren, weil..."',
                gradient: 'from-accent-amber to-accent-rose'
              },
              {
                icon: Building,
                title: '7 Branchen-Module',
                desc: 'Von Immobilien über SaaS bis Recruiting - branchenspezifisches Training.',
                gradient: 'from-primary-600 to-accent-cyan'
              },
              {
                icon: Shield,
                title: 'DSGVO-First',
                desc: 'EU-Server, keine Kundendaten im Training, volle Datenkontrolle.',
                gradient: 'from-success to-accent-emerald'
              },
              {
                icon: TrendingUp,
                title: 'Performance-Tracking',
                desc: 'Level-System, Skill-Profile und Vergleich mit Top-Performern.',
                gradient: 'from-accent-amber to-primary-500'
              }
            ].map((feature, i) => (
              <div key={i} className="glass-card-elevated p-8 group hover:scale-[1.02] transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-neutral-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Types Preview */}
      <section className="relative z-10 bg-bg-secondary py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              5 Kundentypen, die du meistern wirst
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Jeder KI-Kunde hat eigene Persönlichkeit, Einwände und Kauflogik.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {[
              { emoji: '😤', name: 'Skeptischer GF', trait: 'Braucht Substanz' },
              { emoji: '😒', name: 'Genervter Einkäufer', trait: 'Will Preise' },
              { emoji: '😊', name: 'Freundlich Unverbindlich', trait: 'Sagt nie Nein' },
              { emoji: '🧮', name: 'Preisfixierter Mittelständler', trait: 'Verhandelt hart' },
              { emoji: '📋', name: 'Konzern-Procurement', trait: 'Prozesse first' }
            ].map((type, i) => (
              <div key={i} className="glass-card p-6 text-center hover:border-primary-500/50 transition">
                <div className="text-4xl mb-3">{type.emoji}</div>
                <h4 className="font-semibold mb-1 text-sm">{type.name}</h4>
                <p className="text-xs text-neutral-500">{type.trait}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Einfache, faire Preise
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Keine versteckten Kosten. Jederzeit kündbar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '49',
                desc: 'Für einzelne Vertriebsmitarbeiter',
                features: [
                  '20 Training-Sessions/Monat',
                  '2 Branchen-Module',
                  'Basic Scorecard',
                  'E-Mail Support'
                ],
                cta: 'Jetzt starten',
                popular: false
              },
              {
                name: 'Professional',
                price: '99',
                desc: 'Für ambitionierte Sales-Profis',
                features: [
                  'Unlimited Sessions',
                  'Alle 7 Branchen',
                  'Detailliertes KI-Coaching',
                  'Skill-Tracking & Analytics',
                  'Priority Support'
                ],
                cta: 'Jetzt starten',
                popular: true
              },
              {
                name: 'Enterprise',
                price: 'Auf Anfrage',
                desc: 'Für Vertriebsteams',
                features: [
                  'Alles aus Professional',
                  'Team-Dashboard',
                  'Manager-Analytics',
                  'SSO & API-Zugang',
                  'Dedicated Success Manager'
                ],
                cta: 'Kontakt',
                popular: false
              }
            ].map((plan, i) => (
              <div
                key={i}
                className={`glass-card-elevated p-8 relative ${plan.popular ? 'ring-2 ring-primary-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge badge-primary">
                    Beliebteste Wahl
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-neutral-500 text-sm mb-6">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {plan.price === 'Auf Anfrage' ? '' : '€'}
                    {plan.price}
                  </span>
                  {plan.price !== 'Auf Anfrage' && (
                    <span className="text-neutral-500">/Monat pro User</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-3 rounded-xl font-semibold transition ${plan.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-bg-tertiary text-white hover:bg-bg-elevated border border-glass-border'
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 bg-bg-secondary">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <div className="glass-card-elevated p-12">
            <Award className="w-16 h-16 mx-auto mb-6 text-primary-400" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bereit, der beste Verkäufer zu werden?
            </h2>
            <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
              Starte jetzt kostenlos und trainiere mit der einzigen KI,
              die deutsche Verkaufspsychologie versteht.
            </p>
            <Link href="/register" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
              Kostenlos loslegen
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-glass-border">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">SalesMind AI</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-neutral-500">
              <Link href="/datenschutz" className="hover:text-white transition">Datenschutz</Link>
              <Link href="/impressum" className="hover:text-white transition">Impressum</Link>
              <Link href="/agb" className="hover:text-white transition">AGB</Link>
            </div>
            <p className="text-sm text-neutral-500">
              © 2026 SalesMind AI. Made in Germany 🇩🇪
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
