import { ConversationMessage, MessageAnalysis } from './engine'

// ============== TYPES ==============

export interface ScoreCard {
    overallScore: number
    categories: {
        conversationLeading: CategoryScore
        needsAnalysis: CategoryScore
        objectionHandling: CategoryScore
        closing: CategoryScore
        trustBuilding: CategoryScore
    }
    feedback: string
    criticalMoments: CriticalMoment[]
    strengths: string[]
    weaknesses: string[]
    xpEarned: number
}

export interface CategoryScore {
    score: number
    feedback: string
    examples: string[]
}

export interface CriticalMoment {
    messageIndex: number
    userMessage: string
    issue: string
    recommendation: string
    impact: 'positive' | 'negative' | 'neutral'
}

// ============== SCORING LOGIC ==============

export function calculateScore(
    messages: ConversationMessage[],
    finalState: { trustLevel: number; interestLevel: number; customerMood: number }
): ScoreCard {
    const userMessages = messages.filter(m => m.role === 'user')

    // Analyze patterns
    const patterns = analyzePatterns(userMessages)
    const criticalMoments = findCriticalMoments(userMessages)

    // Calculate category scores
    const conversationLeading = scoreConversationLeading(userMessages, patterns)
    const needsAnalysis = scoreNeedsAnalysis(userMessages, patterns)
    const objectionHandling = scoreObjectionHandling(userMessages, patterns)
    const closing = scoreClosing(userMessages, finalState)
    const trustBuilding = scoreTrustBuilding(userMessages, patterns, finalState)

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
        conversationLeading.score * 0.2 +
        needsAnalysis.score * 0.25 +
        objectionHandling.score * 0.2 +
        closing.score * 0.15 +
        trustBuilding.score * 0.2
    )

    // Identify strengths and weaknesses
    const strengths: string[] = []
    const weaknesses: string[] = []

    if (conversationLeading.score >= 70) strengths.push('Gute Gesprächsführung')
    else if (conversationLeading.score < 50) weaknesses.push('Gesprächsführung verbessern')

    if (needsAnalysis.score >= 70) strengths.push('Effektive Bedarfsermittlung')
    else if (needsAnalysis.score < 50) weaknesses.push('Mehr Fragen stellen')

    if (objectionHandling.score >= 70) strengths.push('Souveräne Einwandbehandlung')
    else if (objectionHandling.score < 50) weaknesses.push('Einwände besser behandeln')

    if (trustBuilding.score >= 70) strengths.push('Starker Vertrauensaufbau')
    else if (trustBuilding.score < 50) weaknesses.push('Mehr Vertrauen aufbauen')

    // Generate feedback
    const feedback = generateFeedback(overallScore, patterns, criticalMoments, finalState)

    // Calculate XP
    const xpEarned = calculateXP(overallScore, userMessages.length)

    return {
        overallScore,
        categories: {
            conversationLeading,
            needsAnalysis,
            objectionHandling,
            closing,
            trustBuilding
        },
        feedback,
        criticalMoments,
        strengths,
        weaknesses,
        xpEarned
    }
}

// ============== PATTERN ANALYSIS ==============

interface PatternAnalysis {
    questionCount: number
    openQuestions: number
    closedQuestions: number
    pressureCount: number
    pitchBeforeNeed: boolean
    trustBuilders: number
    trustDestroyers: number
    activeListening: number
    interruptions: number
}

function analyzePatterns(messages: Array<{ content: string; analysis?: MessageAnalysis }>): PatternAnalysis {
    let questionCount = 0
    let openQuestions = 0
    let closedQuestions = 0
    let pressureCount = 0
    let trustBuilders = 0
    let trustDestroyers = 0
    let activeListening = 0
    let pitchBeforeNeed = false
    let hadNeedQuestion = false

    const openQuestionStarts = ['was', 'wie', 'warum', 'welche', 'wann', 'wer', 'erzählen']
    const activeListeningPhrases = ['verstehe', 'interessant', 'das höre ich', 'nachvollziehbar']
    const pitchPhrases = ['unser produkt', 'wir bieten', 'unsere lösung']

    messages.forEach((msg, index) => {
        const lower = msg.content.toLowerCase()

        // Count questions
        if (msg.content.includes('?')) {
            questionCount++
            if (openQuestionStarts.some(q => lower.includes(q))) {
                openQuestions++
                hadNeedQuestion = true
            } else {
                closedQuestions++
            }
        }

        // Check for pitch before need
        if (!hadNeedQuestion && pitchPhrases.some(p => lower.includes(p))) {
            pitchBeforeNeed = true
        }

        // Check analysis
        if (msg.analysis) {
            if (msg.analysis.pressureDetected) pressureCount++
            if (msg.analysis.trustIssue) trustDestroyers++
            if (msg.analysis.goodQuestion) trustBuilders++
        }

        // Active listening
        if (activeListeningPhrases.some(p => lower.includes(p))) {
            activeListening++
        }
    })

    return {
        questionCount,
        openQuestions,
        closedQuestions,
        pressureCount,
        pitchBeforeNeed,
        trustBuilders,
        trustDestroyers,
        activeListening,
        interruptions: 0 // Would need audio for this
    }
}

// ============== CATEGORY SCORING ==============

function scoreConversationLeading(
    messages: Array<{ content: string }>,
    patterns: PatternAnalysis
): CategoryScore {
    let score = 50 // Start at average

    // Reward open questions
    score += patterns.openQuestions * 5

    // Penalize too many closed questions
    if (patterns.closedQuestions > patterns.openQuestions * 2) {
        score -= 15
    }

    // Reward active listening
    score += patterns.activeListening * 8

    // Penalize too short responses
    const avgLength = messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length
    if (avgLength < 50) score -= 10
    if (avgLength > 150 && avgLength < 300) score += 10

    score = Math.max(0, Math.min(100, score))

    const examples: string[] = []
    if (patterns.openQuestions > 3) examples.push('Gute offene Fragen gestellt')
    if (patterns.activeListening > 2) examples.push('Aktives Zuhören gezeigt')
    if (patterns.closedQuestions > patterns.openQuestions * 2) {
        examples.push('Zu viele geschlossene Fragen')
    }

    return {
        score,
        feedback: score >= 70
            ? 'Du hast das Gespräch gut geführt und den Kunden sprechen lassen.'
            : score >= 50
                ? 'Versuche mehr offene Fragen zu stellen und aktiver zuzuhören.'
                : 'Du hast zu wenig gefragt und zu viel selbst geredet.',
        examples
    }
}

function scoreNeedsAnalysis(
    messages: Array<{ content: string }>,
    patterns: PatternAnalysis
): CategoryScore {
    let score = 40

    // Open questions are key
    score += patterns.openQuestions * 8

    // Penalize pitching before understanding needs
    if (patterns.pitchBeforeNeed) score -= 30

    // Reward follow-up questions
    if (patterns.questionCount > 5) score += 15

    score = Math.max(0, Math.min(100, score))

    const examples: string[] = []
    if (patterns.pitchBeforeNeed) {
        examples.push('Pitch vor Bedarfsklärung - klassischer Fehler')
    }
    if (patterns.openQuestions >= 3) {
        examples.push('Gute Bedarfsfragen gestellt')
    }

    return {
        score,
        feedback: patterns.pitchBeforeNeed
            ? 'Du hast gepitched, bevor du den Bedarf verstanden hast. Das ist in Deutschland der häufigste Fehler.'
            : score >= 70
                ? 'Du hast den Bedarf gut ermittelt, bevor du Lösungen angeboten hast.'
                : 'Stelle mehr Fragen, um den konkreten Bedarf des Kunden zu verstehen.',
        examples
    }
}

function scoreObjectionHandling(
    messages: Array<{ content: string; analysis?: MessageAnalysis }>,
    patterns: PatternAnalysis
): CategoryScore {
    let score = 60

    // Penalize pressure tactics heavily
    score -= patterns.pressureCount * 20

    // Look for good objection handling patterns
    const goodHandling = ['verstehe', 'nachvollziehbar', 'darf ich fragen', 'was genau']
    const badHandling = ['aber', 'nein', 'trotzdem', 'sie müssen']

    let goodCount = 0
    let badCount = 0

    messages.forEach(msg => {
        const lower = msg.content.toLowerCase()
        goodHandling.forEach(g => { if (lower.includes(g)) goodCount++ })
        badHandling.forEach(b => { if (lower.includes(b)) badCount++ })
    })

    score += goodCount * 10
    score -= badCount * 8

    score = Math.max(0, Math.min(100, score))

    const examples: string[] = []
    if (patterns.pressureCount > 0) {
        examples.push(`${patterns.pressureCount}x Druck aufgebaut - schlecht bei deutschen Kunden`)
    }
    if (goodCount > 2) {
        examples.push('Einwände empathisch aufgenommen')
    }

    return {
        score,
        feedback: patterns.pressureCount > 0
            ? 'Du hast Druck gemacht. Deutsche Kunden reagieren darauf mit Ablehnung.'
            : score >= 70
                ? 'Du hast Einwände gut aufgenommen und nicht argumentiert.'
                : 'Bei Einwänden solltest du erst verstehen, dann antworten.',
        examples
    }
}

function scoreClosing(
    messages: Array<{ content: string }>,
    finalState: { trustLevel: number; interestLevel: number }
): CategoryScore {
    let score = 50

    // Closing success based on final state
    if (finalState.trustLevel >= 70 && finalState.interestLevel >= 60) {
        score += 30
    } else if (finalState.trustLevel >= 50 && finalState.interestLevel >= 40) {
        score += 10
    } else if (finalState.trustLevel < 30) {
        score -= 20
    }

    // Check for next steps
    const closingPhrases = ['nächster schritt', 'termin', 'wann können wir', 'wie geht es weiter']
    const hasClosingAttempt = messages.some(m =>
        closingPhrases.some(p => m.content.toLowerCase().includes(p))
    )

    if (hasClosingAttempt && finalState.trustLevel >= 50) score += 15
    if (!hasClosingAttempt) score -= 10

    score = Math.max(0, Math.min(100, score))

    return {
        score,
        feedback: score >= 70
            ? 'Du hast das Gespräch gut zu einem nächsten Schritt geführt.'
            : score >= 50
                ? 'Du hättest stärker auf einen konkreten nächsten Schritt hinarbeiten können.'
                : 'Kein klarer Abschluss - was ist der nächste Schritt?',
        examples: hasClosingAttempt
            ? ['Nächste Schritte angesprochen']
            : ['Kein Abschlussversuch erkennbar']
    }
}

function scoreTrustBuilding(
    messages: Array<{ content: string }>,
    patterns: PatternAnalysis,
    finalState: { trustLevel: number; customerMood: number }
): CategoryScore {
    let score = 50

    // Based on final trust level
    score += (finalState.trustLevel - 30) * 0.5

    // Based on mood
    score += finalState.customerMood * 3

    // Penalize trust destroyers
    score -= patterns.trustDestroyers * 15

    // Reward trust builders
    score += patterns.trustBuilders * 8

    score = Math.max(0, Math.min(100, score))

    return {
        score,
        feedback: score >= 70
            ? 'Du hast erfolgreich Vertrauen aufgebaut.'
            : score >= 50
                ? 'Mehr auf Verständnis und weniger auf Überzeugung setzen.'
                : 'Der Kunde vertraut dir nicht. Zu viel Verkäufer-Modus.',
        examples: patterns.trustDestroyers > 0
            ? ['Vertrauenszerstörende Muster erkannt']
            : patterns.trustBuilders > 2
                ? ['Vertrauen durch Verständnis aufgebaut']
                : []
    }
}

// ============== CRITICAL MOMENTS ==============

function findCriticalMoments(
    messages: Array<{ content: string; analysis?: MessageAnalysis }>
): CriticalMoment[] {
    const moments: CriticalMoment[] = []

    messages.forEach((msg, index) => {
        if (msg.analysis) {
            if (msg.analysis.pressureDetected) {
                moments.push({
                    messageIndex: index,
                    userMessage: msg.content.substring(0, 100),
                    issue: 'Druckaufbau erkannt',
                    recommendation: 'Vermeide zeitlichen Druck. Deutsche Kunden brauchen Zeit zum Entscheiden.',
                    impact: 'negative'
                })
            }
            if (msg.analysis.prematurePitch) {
                moments.push({
                    messageIndex: index,
                    userMessage: msg.content.substring(0, 100),
                    issue: 'Zu früher Pitch',
                    recommendation: 'Erst fragen, dann pitchen. Der Bedarf war noch nicht klar.',
                    impact: 'negative'
                })
            }
            if (msg.analysis.goodQuestion) {
                moments.push({
                    messageIndex: index,
                    userMessage: msg.content.substring(0, 100),
                    issue: 'Gute Frage',
                    recommendation: 'Weiter so! Offene Fragen öffnen den Kunden.',
                    impact: 'positive'
                })
            }
        }
    })

    return moments
}

// ============== FEEDBACK GENERATION ==============

function generateFeedback(
    overallScore: number,
    patterns: PatternAnalysis,
    moments: CriticalMoment[],
    finalState: { trustLevel: number; interestLevel: number; customerMood: number }
): string {
    const parts: string[] = []

    // Overall assessment
    if (overallScore >= 80) {
        parts.push('Ausgezeichnetes Gespräch! Du hast die wichtigsten Verkaufsprinzipien beherrscht.')
    } else if (overallScore >= 65) {
        parts.push('Gutes Gespräch mit Verbesserungspotenzial.')
    } else if (overallScore >= 50) {
        parts.push('Durchschnittliches Gespräch. Es gibt klare Bereiche zur Verbesserung.')
    } else {
        parts.push('Dieses Gespräch zeigt grundlegende Schwächen im Verkaufsansatz.')
    }

    // Critical feedback
    if (patterns.pitchBeforeNeed) {
        parts.push('\n\nHauptproblem: Du hast zu früh gepitched. Im deutschen B2B-Vertrieb ist das der häufigste Fehler. Erst Bedarf klären, dann Lösung anbieten.')
    }

    if (patterns.pressureCount > 0) {
        parts.push('\n\nDruck funktioniert nicht: Du hast versucht, Druck aufzubauen. Deutsche Geschäftskunden reagieren darauf mit Ablehnung. Vertrauen ist wichtiger als Dringlichkeit.')
    }

    // Positive feedback
    if (patterns.openQuestions >= 4) {
        parts.push('\n\nStärke: Gute Fragetechnik. Du hast offene Fragen genutzt, um den Kunden zu verstehen.')
    }

    // Final state feedback
    if (finalState.trustLevel < 40) {
        parts.push('\n\nErgebnis: Der Kunde vertraut dir nicht. Ohne Vertrauen kein Geschäft.')
    } else if (finalState.trustLevel >= 70 && finalState.interestLevel >= 60) {
        parts.push('\n\nErgebnis: Der Kunde ist interessiert und offen für nächste Schritte.')
    }

    return parts.join('')
}

// ============== XP CALCULATION ==============

function calculateXP(score: number, messageCount: number): number {
    // Base XP from score
    let xp = Math.round(score * 1.5)

    // Bonus for longer conversations
    if (messageCount >= 10) xp += 25
    if (messageCount >= 20) xp += 25

    // Bonus for excellent performance
    if (score >= 90) xp += 50
    if (score >= 80) xp += 25

    return xp
}
