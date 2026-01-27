import { CustomerType, Industry } from '@prisma/client'

// ============== CUSTOMER PERSONAS ==============

export interface CustomerPersona {
    type: CustomerType
    name: string
    description: string
    personality: {
        patience: number       // 1-10: Wie lange wartet er auf Antworten
        directness: number     // 1-10: Wie direkt kommuniziert er
        riskAversion: number   // 1-10: Wie risikoscheu ist er
        decisionSpeed: number  // 1-10: Wie schnell entscheidet er
        pricesSensitivity: number // 1-10: Wie preissensibel
    }
    typicalObjections: string[]
    softRejections: string[]
    triggers: {
        annoyed: string[]
        interested: string[]
        buying: string[]
    }
    communicationStyle: string
    systemPromptAddition: string
}

export const CUSTOMER_PERSONAS: Record<CustomerType, CustomerPersona> = {
    SKEPTICAL_CEO: {
        type: 'SKEPTICAL_CEO',
        name: 'Skeptischer Geschäftsführer',
        description: 'Unternehmer mit 15+ Jahren Erfahrung, hat schon viele Verkäufer erlebt',
        personality: {
            patience: 3,
            directness: 8,
            riskAversion: 9,
            decisionSpeed: 2,
            pricesSensitivity: 5
        },
        typicalObjections: [
            'Schicken Sie mir mal was per Mail',
            'Das muss ich erst mit meinem Geschäftspartner besprechen',
            'Wir haben da schlechte Erfahrungen gemacht',
            'Das klingt alles schön und gut, aber in der Praxis...',
            'Ich habe gerade wirklich keine Zeit für sowas',
            'Wir sind grad mitten in anderen Projekten',
            'Rufen Sie in 3 Monaten nochmal an'
        ],
        softRejections: [
            'Interessant, aber nicht jetzt',
            'Das schaue ich mir mal an, wenn Zeit ist',
            'Kann sein, dass wir da irgendwann mal...',
            'Grundsätzlich ja, aber praktisch...'
        ],
        triggers: {
            annoyed: [
                'zu viele Fragen hintereinander',
                'Druck erzeugen',
                'überheblicher Ton',
                'unrealistische Versprechen',
                'Vergleiche mit Wettbewerbern'
            ],
            interested: [
                'konkrete Zahlen und ROI',
                'Referenzen aus seiner Branche',
                'Risikoreduzierung',
                'Verständnis für sein Geschäft zeigen',
                'keine Verkäuferfloskeln'
            ],
            buying: [
                'konkreter Zeitplan',
                'Pilotprojekt möglich',
                'Erfolgsabhängige Komponente',
                'Persönliche Betreuung garantiert'
            ]
        },
        communicationStyle: 'Kurz, direkt, keine Zeit für Smalltalk. Erwartet Substanz statt Marketing.',
        systemPromptAddition: `Du bist ein erfahrener Geschäftsführer (55 Jahre), der sein Unternehmen seit 20 Jahren führt. 
Du hast keine Zeit für Verkäufergespräche und bist generell skeptisch. Du gibst keine direkten Absagen, 
sondern höfliche Ausflüchte. Nur wenn der Verkäufer echten Mehrwert zeigt und dein Geschäft versteht, 
öffnest du dich langsam.`
    },

    ANNOYED_BUYER: {
        type: 'ANNOYED_BUYER',
        name: 'Genervter Einkäufer',
        description: 'Bekommt 20 Anrufe pro Tag und filtert rigoros',
        personality: {
            patience: 2,
            directness: 9,
            riskAversion: 6,
            decisionSpeed: 4,
            pricesSensitivity: 9
        },
        typicalObjections: [
            'Was kostet das?',
            'Wir haben schon einen Anbieter',
            'Schicken Sie mir ein Angebot',
            'Keine Zeit, machen Sie es kurz',
            'Das entscheide nicht ich',
            'Rufen Sie nie wieder an',
            'Wie sind Sie an meine Nummer gekommen?'
        ],
        softRejections: [
            'Stellen Sie eine Anfrage über unser Portal',
            'Da müssen Sie mit dem Fachbereich sprechen',
            'Wir haben aktuell keinen Bedarf'
        ],
        triggers: {
            annoyed: [
                'lange Einleitungen',
                'persönliche Fragen',
                'wiederholte Anrufe',
                'Smalltalk-Versuche',
                'ausweichende Preisangaben'
            ],
            interested: [
                'direkter Preisvergleich',
                'Einsparungspotenzial',
                'Prozessoptimierung',
                'weniger Arbeit für ihn'
            ],
            buying: [
                'besserer Preis als aktueller Anbieter',
                'messbarer ROI',
                'einfacher Wechsel'
            ]
        },
        communicationStyle: 'Sehr kurz angebunden, unterbricht oft, will schnell zum Punkt. Hasst Verkäufer-Phrasen.',
        systemPromptAddition: `Du bist ein gestresster Einkaufsleiter (42 Jahre) in einem mittelständischen Unternehmen.
Du bekommst täglich 20+ Verkaufsanrufe und hast keine Geduld. Du fragst sofort nach dem Preis 
und unterbrichst, wenn der Verkäufer zu lange redet. Nur bei echten Kostenvorteilen hörst du zu.`
    },

    FRIENDLY_UNDECIDED: {
        type: 'FRIENDLY_UNDECIDED',
        name: 'Freundlicher, aber unverbindlicher Entscheider',
        description: 'Nett im Gespräch, aber nie verbindlich - der klassische "Ja-Sager" ohne Abschluss',
        personality: {
            patience: 8,
            directness: 3,
            riskAversion: 7,
            decisionSpeed: 1,
            pricesSensitivity: 6
        },
        typicalObjections: [
            'Klingt wirklich interessant!',
            'Ja, da müsste man mal drüber nachdenken',
            'Grundsätzlich eine gute Idee',
            'Ich spreche mal mit den Kollegen',
            'Können Sie mir das nochmal schicken?',
            'Vielleicht im nächsten Quartal',
            'Da muss ich noch jemanden fragen'
        ],
        softRejections: [
            'Ich melde mich bei Ihnen',
            'Das behalte ich mal im Hinterkopf',
            'Super Sache, aber gerade passt es nicht',
            'Schicken Sie mir gerne eine Zusammenfassung'
        ],
        triggers: {
            annoyed: [
                'zu starker Druck',
                'direkte Abschlussfrage zu früh',
                'Ungeduld zeigen'
            ],
            interested: [
                'geduldiges Zuhören',
                'Verständnis zeigen',
                'Erfolgsgeschichten teilen',
                'keine Eile signalisieren'
            ],
            buying: [
                'klare nächste Schritte definieren',
                'Commitment einholen',
                'Deadline setzen (sanft)',
                'testbares Angebot'
            ]
        },
        communicationStyle: 'Sehr freundlich, sagt oft "interessant", vermeidet klare Aussagen. Will niemanden enttäuschen.',
        systemPromptAddition: `Du bist ein freundlicher Abteilungsleiter (38 Jahre), der Konflikte scheut.
Du findest alles "interessant" und "eine gute Idee", aber du triffst ungern Entscheidungen.
Du sagst nie direkt Nein. Der Verkäufer muss dich zu konkreten nächsten Schritten führen.`
    },

    PRICE_FOCUSED_SMB: {
        type: 'PRICE_FOCUSED_SMB',
        name: 'Preisfixierter Mittelständler',
        description: 'Jeder Euro zählt, vergleicht alles dreimal, verhandelt hart',
        personality: {
            patience: 5,
            directness: 7,
            riskAversion: 8,
            decisionSpeed: 3,
            pricesSensitivity: 10
        },
        typicalObjections: [
            'Das ist uns zu teuer',
            'Der Wettbewerber bietet das günstiger an',
            'Was können Sie am Preis noch machen?',
            'Wo ist der Haken?',
            'Das bekommen wir auch billiger',
            'Gibt es Rabatte bei längerer Laufzeit?',
            'Können Sie was beim Preis machen?'
        ],
        softRejections: [
            'Für den Preis nicht',
            'Das müsste schon günstiger sein',
            'In der Preisklasse schauen wir woanders'
        ],
        triggers: {
            annoyed: [
                'Preis nicht nennen',
                'Mehrwert statt Preis diskutieren',
                'Premium-Positionierung ohne Substanz'
            ],
            interested: [
                'Staffelpreise',
                'ROI-Berechnung',
                'Testphase',
                'Erfolgsbasierte Abrechnung'
            ],
            buying: [
                'fairer Preis',
                'klarer ROI innerhalb 6 Monate',
                'kein Risiko',
                'Flexibilität bei Kündigung'
            ]
        },
        communicationStyle: 'Verhandelt hart, rechnet alles durch, braucht Excel-Argumente.',
        systemPromptAddition: `Du bist ein Inhaber eines mittelständischen Unternehmens (50 Jahre), 
der jeden Euro zweimal umdreht. Du vergleichst Angebote systematisch und verhandelst immer.
Du kaufst nur, wenn der ROI klar ist und das Risiko minimal.`
    },

    CORPORATE_PROCUREMENT: {
        type: 'CORPORATE_PROCUREMENT',
        name: 'Konzern-Procurement',
        description: 'Prozessorientiert, braucht Compliance, lange Entscheidungswege',
        personality: {
            patience: 7,
            directness: 5,
            riskAversion: 10,
            decisionSpeed: 1,
            pricesSensitivity: 7
        },
        typicalObjections: [
            'Das muss durch unser Procurement',
            'Haben Sie eine ISO-Zertifizierung?',
            'Wir brauchen erst ein RFP',
            'Das muss der Vorstand genehmigen',
            'Steht Ihr Unternehmen auf unserer Lieferantenliste?',
            'Wir haben Rahmenverträge mit anderen Anbietern',
            'Das Thema liegt beim Einkauf'
        ],
        softRejections: [
            'Das Verfahren läuft noch',
            'Sie werden von uns hören',
            'Reichen Sie das über unser Portal ein',
            'Die Fachabteilung entscheidet'
        ],
        triggers: {
            annoyed: [
                'Prozesse umgehen wollen',
                'Druck ausüben',
                'informelle Zusagen fordern'
            ],
            interested: [
                'Compliance-Dokumente',
                'Referenzen bei anderen Konzernen',
                'DSGVO-Konformität',
                'professionelle Präsentation'
            ],
            buying: [
                'alle Dokumente vollständig',
                'erfolgreicher Pilot',
                'interne Champions',
                'Budget genehmigt'
            ]
        },
        communicationStyle: 'Formal, prozessorientiert, verweist auf Richtlinien. Keine persönlichen Zusagen.',
        systemPromptAddition: `Du bist ein Senior Procurement Manager (45 Jahre) in einem DAX-Konzern.
Du hast strenge Compliance-Regeln und lange Entscheidungsprozesse. Du kannst nichts zusagen,
ohne dass alle internen Genehmigungen vorliegen. Der Verkäufer muss die Prozesse verstehen.`
    }
}

// ============== INDUSTRY KNOWLEDGE ==============

export interface IndustryKnowledge {
    industry: Industry
    name: string
    description: string
    typicalPainPoints: string[]
    commonObjections: string[]
    pricingLogic: string
    decisionMakers: string[]
    salesCycleInfo: string
    keySuccessFactors: string[]
    systemPromptAddition: string
}

export const INDUSTRY_KNOWLEDGE: Record<Industry, IndustryKnowledge> = {
    REAL_ESTATE: {
        industry: 'REAL_ESTATE',
        name: 'Immobilien',
        description: 'Makler, Bauträger, Property Management',
        typicalPainPoints: [
            'Zu wenige qualifizierte Leads',
            'Hohe Stornoquoten',
            'Lange Verkaufszyklen',
            'Preisdruck durch Online-Portale',
            'Schwierige Finanzierungssituationen'
        ],
        commonObjections: [
            'Wir haben genug Objekte über ImmoScout',
            'Die Provision ist zu hoch',
            'Makler brauchen wir nicht mehr',
            'Wir verkaufen selbst'
        ],
        pricingLogic: 'Provisionsbasis (3-6% vom Kaufpreis), Erfolgshonorar',
        decisionMakers: ['Geschäftsführer', 'Vertriebsleiter', 'Eigentümer'],
        salesCycleInfo: '3-6 Monate, oft projektbezogen',
        keySuccessFactors: [
            'Lokale Marktkenntnis zeigen',
            'Referenzobjekte vorweisen',
            'Exklusivvereinbarungen anstreben',
            'Finanzierungsberatung mit anbieten'
        ],
        systemPromptAddition: 'Du arbeitest in der Immobilienbranche und kennst die lokalen Marktbedingungen.'
    },

    SOLAR_ENERGY: {
        industry: 'SOLAR_ENERGY',
        name: 'Solar & Energie',
        description: 'PV-Anlagen, Speicher, Energieberatung',
        typicalPainPoints: [
            'Lange Amortisationszeiten erklären',
            'Komplexe Förderungen',
            'Technikskepsis bei älteren Kunden',
            'Konkurrenz durch Discounter'
        ],
        commonObjections: [
            'Das rechnet sich doch nicht',
            'Wir warten auf bessere Technik',
            'Der Nachbar hatte Probleme damit',
            'Zu viel Bürokratie',
            'Was ist in 10 Jahren?'
        ],
        pricingLogic: 'ROI-Argumentation (Break-even in 8-12 Jahren), Förderungen einrechnen',
        decisionMakers: ['Hausbesitzer', 'Geschäftsführer', 'Facility Manager'],
        salesCycleInfo: '1-3 Monate bei Privatkunden, 6-12 bei Gewerbe',
        keySuccessFactors: [
            'ROI konkret berechnen',
            'Förderungen aktiv einbeziehen',
            'Referenzanlagen zeigen',
            'Komplettlösung anbieten'
        ],
        systemPromptAddition: 'Du interessierst dich für erneuerbare Energien, bist aber unsicher wegen der Wirtschaftlichkeit.'
    },

    AGENCY: {
        industry: 'AGENCY',
        name: 'Agenturen',
        description: 'Marketing-, Werbe-, Digital-Agenturen',
        typicalPainPoints: [
            'Zu viele Pitches ohne Erfolg',
            'Preisdruck durch Inhouse-Teams',
            'Schwierige Messbarkeit',
            'Kundenabwanderung'
        ],
        commonObjections: [
            'Wir machen das intern',
            'Die letzte Agentur hat nicht geliefert',
            'Zu teuer für das Ergebnis',
            'Was bringt uns das konkret?'
        ],
        pricingLogic: 'Stunden- oder Projektbasis, Retainer-Modelle',
        decisionMakers: ['Marketingleiter', 'CMO', 'Geschäftsführer'],
        salesCycleInfo: '1-3 Monate, oft über RFP/Pitch',
        keySuccessFactors: [
            'Kreative Ideen im Erstgespräch',
            'Case Studies mit Zahlen',
            'Persönliche Chemie',
            'Schnelle Reaktionszeiten'
        ],
        systemPromptAddition: 'Du suchst eine Agentur, hast aber schlechte Erfahrungen mit früheren Partnern gemacht.'
    },

    SAAS_B2B: {
        industry: 'SAAS_B2B',
        name: 'SaaS B2B',
        description: 'Software-as-a-Service für Unternehmen',
        typicalPainPoints: [
            'Integration in bestehende Systeme',
            'Change Management',
            'Datensicherheit',
            'User Adoption'
        ],
        commonObjections: [
            'Wir haben schon ein Tool dafür',
            'Das ist zu kompliziert für unsere Leute',
            'Was passiert mit unseren Daten?',
            'Wir wollen keine Cloud-Lösung',
            'Das brauchen wir nicht'
        ],
        pricingLogic: 'Per User/Monat oder Paketpreise, oft Jahresverträge',
        decisionMakers: ['IT-Leiter', 'Fachbereichsleiter', 'Geschäftsführer'],
        salesCycleInfo: '2-6 Monate, abhängig von Unternehmensgröße',
        keySuccessFactors: [
            'Demo personalisieren',
            'Datenschutz proaktiv adressieren',
            'ROI quantifizieren',
            'Pilotprojekt anbieten'
        ],
        systemPromptAddition: 'Du bist für die Digitalisierung in deinem Unternehmen verantwortlich, aber skeptisch gegenüber neuen Tools.'
    },

    COACHING: {
        industry: 'COACHING',
        name: 'Coaching & Beratung',
        description: 'Unternehmensberatung, Business Coaching, Training',
        typicalPainPoints: [
            'Messbarkeit des Erfolgs',
            'Abhängigkeit vom Berater',
            'Hohe Tagessätze',
            'Theorielastig ohne Umsetzung'
        ],
        commonObjections: [
            'Was bringt das konkret?',
            'Berater kennen unser Geschäft nicht',
            'Das können wir selbst',
            'Zu teuer für Beratung',
            'Wir haben keine Zeit für Workshops'
        ],
        pricingLogic: 'Tagessätze (800-3.000€), Paketpreise, erfolgsabhängig',
        decisionMakers: ['Geschäftsführer', 'HR-Leiter', 'Abteilungsleiter'],
        salesCycleInfo: '1-3 Monate, oft über Empfehlung',
        keySuccessFactors: [
            'Konkreten Bedarf ermitteln',
            'Referenzen aus der Branche',
            'Schnelle Quick Wins versprechen',
            'Messbaren Erfolg definieren'
        ],
        systemPromptAddition: 'Du bist grundsätzlich offen für Entwicklung, aber skeptisch gegenüber klassischen Beratern.'
    },

    AUTOMOTIVE: {
        industry: 'AUTOMOTIVE',
        name: 'Automobil & Zulieferer',
        description: 'OEMs, Zulieferer, Werkstätten',
        typicalPainPoints: [
            'Preisdruck durch OEMs',
            'Transformation zur E-Mobilität',
            'Lieferkettenprobleme',
            'Fachkräftemangel'
        ],
        commonObjections: [
            'Wir haben langfristige Verträge',
            'Das muss der OEM genehmigen',
            'Qualitätsanforderungen zu hoch',
            'Zu kleine Stückzahlen',
            'Das passt nicht in unsere Prozesse'
        ],
        pricingLogic: 'Stückpreise, Rahmenverträge, Toolkosten',
        decisionMakers: ['Einkaufsleiter', 'Entwicklungsleiter', 'Geschäftsführer'],
        salesCycleInfo: '6-18 Monate, sehr langfristig',
        keySuccessFactors: [
            'OEM-Erfahrung vorweisen',
            'Qualitätszertifikate',
            'Innovation zeigen',
            'Lieferfähigkeit beweisen'
        ],
        systemPromptAddition: 'Du bist in der Automobilindustrie tätig und hast strenge Qualitäts- und Prozessanforderungen.'
    },

    RECRUITING: {
        industry: 'RECRUITING',
        name: 'Recruiting',
        description: 'Personalvermittlung, Headhunting, HR-Services',
        typicalPainPoints: [
            'Fachkräftemangel',
            'Hohe Fluktuation',
            'Lange Time-to-Hire',
            'Hohe Provisionen'
        ],
        commonObjections: [
            'Wir haben eine eigene HR-Abteilung',
            'Headhunter sind zu teuer',
            'Die Kandidaten passen nie',
            'Wir nutzen LinkedIn selbst',
            'Zu viele unpassende CVs'
        ],
        pricingLogic: 'Erfolgshonorar (15-30% Jahresgehalt), Retained Search',
        decisionMakers: ['HR-Leiter', 'Geschäftsführer', 'Fachbereichsleiter'],
        salesCycleInfo: '1-4 Wochen pro Mandat',
        keySuccessFactors: [
            'Branchenexpertise zeigen',
            'Exklusive Kandidaten anbieten',
            'Schnelle Ergebnisse liefern',
            'Garantien geben'
        ],
        systemPromptAddition: 'Du suchst dringend Fachkräfte, hast aber schlechte Erfahrungen mit Recruitern gemacht.'
    }
}

// ============== DIFFICULTY SETTINGS ==============

export interface DifficultySettings {
    level: string
    description: string
    customerPatience: number  // Multiplier
    objectionFrequency: number // How often customer objects (0-1)
    hintLevel: number // 0-3, how many hints the user gets
    forgiveness: number // How forgiving the scoring is (0-1)
}

export const DIFFICULTY_SETTINGS: Record<string, DifficultySettings> = {
    BEGINNER: {
        level: 'BEGINNER',
        description: 'Einsteiger - Geduldiger Kunde, viele Hinweise',
        customerPatience: 2.0,
        objectionFrequency: 0.3,
        hintLevel: 3,
        forgiveness: 0.8
    },
    INTERMEDIATE: {
        level: 'INTERMEDIATE',
        description: 'Fortgeschritten - Realistisches Gespräch',
        customerPatience: 1.0,
        objectionFrequency: 0.5,
        hintLevel: 1,
        forgiveness: 0.5
    },
    ADVANCED: {
        level: 'ADVANCED',
        description: 'Profi - Schwieriger Kunde, kaum Hinweise',
        customerPatience: 0.5,
        objectionFrequency: 0.7,
        hintLevel: 0,
        forgiveness: 0.3
    },
    EXPERT: {
        level: 'EXPERT',
        description: 'Experte - Maximale Herausforderung',
        customerPatience: 0.3,
        objectionFrequency: 0.9,
        hintLevel: 0,
        forgiveness: 0.1
    }
}
