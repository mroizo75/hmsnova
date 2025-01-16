import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { category } = await params
    const { searchParams } = new URL(request.url)
    const deviationsData = searchParams.get('deviations')
    const companyId = await searchParams.get('companyId')
    
    if (!deviationsData) {
      return NextResponse.json({ error: "Ingen avviksdata tilgjengelig" }, { status: 400 })
    }

    const deviations = JSON.parse(deviationsData)

    const prompt = `
      Du er en norsk HMS-ekspert. 
      Svar kun på norsk.
      
      Analyser følgende HMS-avvik i kategorien "${category}" ${
        companyId ? 'for den spesifikke bedriften' : 'på tvers av alle bedrifter'
      }:

      ${JSON.stringify(deviations, null, 2)}

      Lag en strukturert handlingsplan som inkluderer:
      1. Hovedutfordringer og mønstre ${companyId ? 'spesifikke for denne bedriften' : 'på tvers av bedrifter'}
      2. Kortsiktige tiltak (0-3 måneder)
      3. Langsiktige tiltak (3-12 måneder)
      4. Foreslåtte KPIer for måling av fremgang
      5. Estimert ressursbehov
      6. Prioriterte fokusområder
      7. Risikovurdering av implementering

      ${companyId ? 'Ta spesielt hensyn til bedriftens spesifikke kontekst og utfordringer.' : 'Fokuser på bransjemessige trender og felles utfordringer.'}

      Svar i JSON format med følgende struktur. Bruk norske verdier for priority/impact (HØY/MIDDELS/LAV):
      {
        "summary": "kort oppsummering av situasjonen",
        "mainChallenges": ["liste med hovedutfordringer"],
        "shortTermActions": [
          {
            "action": "beskrivelse av tiltak",
            "priority": "HØY/MIDDELS/LAV",
            "timeframe": "estimert tidsramme",
            "resources": "nødvendige ressurser"
          }
        ],
        "longTermActions": [samme struktur som shortTermActions],
        "kpis": ["liste med foreslåtte KPIer"],
        "resourceNeeds": {
          "personnel": "beskrivelse av personellbehov",
          "training": "opplæringsbehov",
          "equipment": "utstyrsbehov",
          "estimated_cost": "estimert kostnad"
        },
        "priorityAreas": ["liste med prioriterte områder"],
        "implementationRisks": [
          {
            "risk": "beskrivelse av risiko",
            "impact": "HØY/MIDDELS/LAV",
            "mitigation": "tiltak for å redusere risiko"
          }
        ]
      }
    `

    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "Du er en norsk HMS-ekspert. Svar alltid på norsk."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      model: "gpt-4-1106-preview",
      response_format: { type: "json_object" }
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('Ingen respons fra OpenAI')
    }

    return NextResponse.json(JSON.parse(content))
  } catch (error) {
    console.error('Error generating action plan:', error)
    return NextResponse.json({ 
      error: "Kunne ikke generere handlingsplan",
      details: error instanceof Error ? error.message : "Ukjent feil"
    }, { status: 500 })
  }
} 