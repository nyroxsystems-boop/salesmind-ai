import OpenAI from 'openai'
import { CustomerType, Industry, Difficulty } from '@prisma/client'
import {
    CUSTOMER_PERSONAS,
    INDUSTRY_KNOWLEDGE,
    DIFFICULTY_SETTINGS,
    CustomerPersona,
    IndustryKnowledge
} from './personas'

// ============== TYPES ==============

export interface ConversationMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp?: Date
    analysis?: MessageAnalysis
}

export interface MessageAnalysis {
    pressureDetected: boolean
    prematurePitch: boolean
    trustIssue: boolean
    goodQuestion: boolean
    strongPoint: string | null
    weakness: string | null
    suggestion: string | null
}

export interface SessionConfig {
    customerType: CustomerType
    industry: Industry
    difficulty: Difficulty
    scenario?: string
}

export interface ConversationState {
    customerMood: number       // -10 to 10
    trustLevel: number         // 0 to 100
    interestLevel: number      // 0 to 100
    patienceRemaining: number  // 0 to 100
    objectionCount: number
    closingOpportunity: boolean
}

// ============== GERMAN SALES PSYCHOLOGY RULES ==============

const DACH_PSYCHOLOGY_PATTERNS = {
    pressureTactics: [
        'nur heute', 'letzte chance', 'schnell entscheiden', 'exklusiv',
        'andere kunden warten', 'morgen ist es zu spät', 'einmalig',
        'jetzt oder nie', 'limitiert', 'nur noch wenige', 'dringend'
    ],
    prematurePitching: [
        'unser produkt', 'wir bieten', 'unsere lösung', 'ich möchte ihnen',
        'lassen sie mich erklären', 'das beste daran ist'
    ],
    goodQuestions: [
        'was', 'wie', 'warum', 'welche', 'wann', 'wer',
        'erzählen sie', 'können sie beschreiben', 'was meinen sie mit'
    ],
    trustBuilders: [
        'verstehe', 'nachvollziehbar', 'das klingt', 'interessant',
        'das höre ich oft', 'verständlich', 'guter punkt'
    ],
    trustDestroyers: [
        'sie müssen', 'sie sollten unbedingt', 'falsch', 'nein aber',
        'das stimmt nicht', 'garantiert'
    ]
}

// ============== SYSTEM PROMPT BUILDER ==============

function buildSystemPrompt(
    persona: CustomerPersona,
    industry: IndustryKnowledge,
    difficulty: Difficulty,
    scenario?: string
): string {
    const diffSettings = DIFFICULTY_SETTINGS[difficulty]

    return `Du bist ein KI-Trainer für ein deutsches Sales-Training. Du spielst einen realistischen deutschen Kunden.

=== DEINE ROLLE ===
${persona.name} - ${persona.description}
${persona.systemPromptAddition}

=== BRANCHE ===
${industry.name}: ${industry.description}
${industry.systemPromptAddition}

=== PERSÖNLICHKEIT ===
- Geduld: ${persona.personality.patience}/10
- Direktheit: ${persona.personality.directness}/10
- Risikoscheu: ${persona.personality.riskAversion}/10
- Entscheidungstempo: ${persona.personality.decisionSpeed}/10
- Preissensibilität: ${persona.personality.pricesSensitivity}/10

=== KOMMUNIKATIONSSTIL ===
${persona.communicationStyle}

=== TYPISCHE EINWÄNDE ===
Nutze diese authentisch, wenn passend:
${persona.typicalObjections.map(o => `- "${o}"`).join('\n')}

=== SANFTE ABSAGEN ===
${persona.softRejections.map(r => `- "${r}"`).join('\n')}

=== VERHALTEN ===
Du wirst GENERVT bei: ${persona.triggers.annoyed.join(', ')}
Du wirst INTERESSIERT bei: ${persona.triggers.interested.join(', ')}
Du bist KAUFBEREIT bei: ${persona.triggers.buying.join(', ')}

=== BRANCHEN-EINWÄNDE ===
${industry.commonObjections.map(o => `- "${o}"`).join('\n')}

=== SCHWIERIGKEITSGRAD ===
${diffSettings.description}
- Einwand-Häufigkeit: ${Math.round(diffSettings.objectionFrequency * 100)}%
- Gedulds-Faktor: ${diffSettings.customerPatience}x

=== WICHTIGE REGELN ===
1. Antworte IMMER auf Deutsch
2. Sei authentisch und realistisch - wie ein echter deutscher Geschäftskunde
3. Gib NIEMALS zu schnell nach. Deutsche Kunden sind skeptisch.
4. Wenn der Verkäufer Druck macht, wehre dich höflich aber bestimmt ab
5. Wenn der Verkäufer gute Fragen stellt und Verständnis zeigt, öffne dich langsam
6. Bleib in deiner Rolle - du bist KEIN Verkaufstrainer, du bist der Kunde
7. Keine Metakommentare wie "Gute Frage" oder Coaching-Tipps
8. Reagiere auf Verkäufer-Phrasen genervt

${scenario ? `=== SZENARIO ===\n${scenario}` : ''}

Beginne das Gespräch, als ob der Verkäufer dich gerade angerufen hat oder du einen Termin mit ihm hast.`
}

// ============== MAIN AI ENGINE CLASS ==============

export class SalesAIEngine {
    private openai: OpenAI
    private conversationHistory: ConversationMessage[] = []
    private config: SessionConfig
    private state: ConversationState
    private persona: CustomerPersona
    private industry: IndustryKnowledge

    constructor(config: SessionConfig) {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        })
        this.config = config
        this.persona = CUSTOMER_PERSONAS[config.customerType]
        this.industry = INDUSTRY_KNOWLEDGE[config.industry]
        this.state = {
            customerMood: 0,
            trustLevel: 30,
            interestLevel: 20,
            patienceRemaining: 100,
            objectionCount: 0,
            closingOpportunity: false
        }
    }

    // Initialize conversation with system prompt
    async initialize(): Promise<string> {
        const systemPrompt = buildSystemPrompt(
            this.persona,
            this.industry,
            this.config.difficulty,
            this.config.scenario
        )

        this.conversationHistory = [{
            role: 'system',
            content: systemPrompt,
            timestamp: new Date()
        }]

        // Get initial customer greeting
        const initialResponse = await this.getAIResponse(
            'Der Verkäufer ruft jetzt an oder kommt zum Termin. Beginne das Gespräch als Kunde.'
        )

        return initialResponse.content
    }

    // Process user message and get AI response
    async processMessage(userMessage: string): Promise<{
        response: string
        analysis: MessageAnalysis
        state: ConversationState
    }> {
        // Analyze user message for sales psychology
        const analysis = this.analyzeMessage(userMessage)

        // Update state based on analysis
        this.updateState(analysis)

        // Add user message to history
        this.conversationHistory.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date(),
            analysis
        })

        // Get AI response
        const aiResponse = await this.getAIResponse(userMessage)

        // Add AI response to history
        this.conversationHistory.push({
            role: 'assistant',
            content: aiResponse.content,
            timestamp: new Date()
        })

        return {
            response: aiResponse.content,
            analysis,
            state: { ...this.state }
        }
    }

    // Analyze message for sales psychology patterns
    private analyzeMessage(message: string): MessageAnalysis {
        const lowerMessage = message.toLowerCase()

        // Check for pressure tactics
        const pressureDetected = DACH_PSYCHOLOGY_PATTERNS.pressureTactics.some(
            pattern => lowerMessage.includes(pattern)
        )

        // Check for premature pitching (if trust is still low)
        const containsPitch = DACH_PSYCHOLOGY_PATTERNS.prematurePitching.some(
            pattern => lowerMessage.includes(pattern)
        )
        const prematurePitch = containsPitch && this.state.trustLevel < 50

        // Check for trust issues
        const trustIssue = DACH_PSYCHOLOGY_PATTERNS.trustDestroyers.some(
            pattern => lowerMessage.includes(pattern)
        )

        // Check for good questions
        const goodQuestion = DACH_PSYCHOLOGY_PATTERNS.goodQuestions.some(
            pattern => lowerMessage.includes(pattern)
        ) && message.includes('?')

        // Determine suggestion
        let suggestion: string | null = null
        let weakness: string | null = null
        let strongPoint: string | null = null

        if (pressureDetected) {
            weakness = 'Druckaufbau erkannt'
            suggestion = 'Deutsche Kunden reagieren auf Druck mit Ablehnung. Versuche stattdessen Vertrauen aufzubauen.'
        } else if (prematurePitch) {
            weakness = 'Zu früher Produktpitch'
            suggestion = 'Du hast gepitched, bevor der Bedarf klar war. Stelle erst mehr Fragen.'
        } else if (trustIssue) {
            weakness = 'Vertrauenszerstörendes Muster'
            suggestion = 'Vermeide absolute Aussagen und Widerspruch. Zeige stattdessen Verständnis.'
        } else if (goodQuestion) {
            strongPoint = 'Gute Frage gestellt'
        }

        return {
            pressureDetected,
            prematurePitch,
            trustIssue,
            goodQuestion,
            strongPoint,
            weakness,
            suggestion
        }
    }

    // Update conversation state based on analysis
    private updateState(analysis: MessageAnalysis): void {
        const diffSettings = DIFFICULTY_SETTINGS[this.config.difficulty]

        if (analysis.pressureDetected) {
            this.state.trustLevel = Math.max(0, this.state.trustLevel - 15)
            this.state.customerMood = Math.max(-10, this.state.customerMood - 3)
            this.state.patienceRemaining = Math.max(0, this.state.patienceRemaining - 20)
        }

        if (analysis.prematurePitch) {
            this.state.trustLevel = Math.max(0, this.state.trustLevel - 10)
            this.state.interestLevel = Math.max(0, this.state.interestLevel - 5)
        }

        if (analysis.trustIssue) {
            this.state.trustLevel = Math.max(0, this.state.trustLevel - 20)
            this.state.customerMood = Math.max(-10, this.state.customerMood - 2)
        }

        if (analysis.goodQuestion) {
            this.state.trustLevel = Math.min(100, this.state.trustLevel + 5)
            this.state.interestLevel = Math.min(100, this.state.interestLevel + 3)
            this.state.customerMood = Math.min(10, this.state.customerMood + 1)
        }

        // Apply difficulty multiplier to patience
        this.state.patienceRemaining = Math.max(0,
            this.state.patienceRemaining - (2 / diffSettings.customerPatience)
        )

        // Check for closing opportunity
        this.state.closingOpportunity =
            this.state.trustLevel >= 70 &&
            this.state.interestLevel >= 60 &&
            this.state.customerMood >= 3
    }

    // Get AI response from OpenAI
    private async getAIResponse(contextMessage: string): Promise<{ content: string }> {
        const messages = this.conversationHistory.map(msg => ({
            role: msg.role as 'system' | 'user' | 'assistant',
            content: msg.content
        }))

        // Add state context for AI
        const stateContext = `
[INTERNER ZUSTAND - nicht erwähnen:]
- Stimmung: ${this.state.customerMood}/10
- Vertrauen: ${this.state.trustLevel}%
- Interesse: ${this.state.interestLevel}%
- Geduld: ${this.state.patienceRemaining}%
${this.state.closingOpportunity ? '- ACHTUNG: Kunde ist kaufbereit!' : ''}
${this.state.patienceRemaining < 30 ? '- ACHTUNG: Kunde verliert Geduld!' : ''}
`

        if (messages.length > 1) {
            messages[messages.length - 1].content += stateContext
        }

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
            temperature: 0.8,
            max_tokens: 500
        })

        return {
            content: response.choices[0]?.message?.content || 'Entschuldigung, da ist etwas schiefgelaufen.'
        }
    }

    // Get conversation history
    getHistory(): ConversationMessage[] {
        return this.conversationHistory.filter(msg => msg.role !== 'system')
    }

    // Get current state
    getState(): ConversationState {
        return { ...this.state }
    }

    // Get persona info
    getPersonaInfo(): CustomerPersona {
        return this.persona
    }

    // Get industry info
    getIndustryInfo(): IndustryKnowledge {
        return this.industry
    }
}

export default SalesAIEngine
