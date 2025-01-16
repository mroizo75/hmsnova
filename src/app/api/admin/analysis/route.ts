import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { OpenAI } from "openai"

// Initialiser OpenAI med type-sjekk
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY er ikke satt i miljøvariablene')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface AIAnalysis {
  description: string
  severity: "low" | "medium" | "high"
  trend: "increasing" | "decreasing" | "stable"
  recommendation: string
  confidence: number
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    // Hent alle avvik med relevant data
    const deviations = await prisma.deviation.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        severity: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Grupper avvik etter kategori og bedrift
    const categorizedDeviations = deviations.reduce((acc, dev) => {
      const category = dev.category || 'Ukategorisert'
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          companies: new Set(),
          descriptions: []
        }
      }
      acc[category].count++
      acc[category].companies.add(dev.company?.id)
      acc[category].descriptions.push(dev.description)
      return acc
    }, {} as Record<string, { count: number; companies: Set<string>; descriptions: string[] }>)

    // Analyser hver kategori med AI
    const analysisPromises = Object.entries(categorizedDeviations).map(async ([category, data]) => {
      const prompt = `
        Analyser følgende informasjon om HMS-avvik:
        Kategori: ${category}
        Antall avvik: ${data.count}
        Antall berørte bedrifter: ${data.companies.size}
        
        Beskrivelser av avvikene:
        ${data.descriptions.join('\n')}
        
        Gi en kort analyse som inkluderer:
        1. Hovedutfordringen
        2. Mulige årsaker
        3. Konkret anbefaling for forbedring
        4. Vurder alvorlighetsgrad (lav/medium/høy)
        5. Vurder trend (økende/synkende/stabil)
        
        Svar i JSON format med følgende struktur:
        {
          "description": "kort beskrivelse av hovedutfordringen",
          "severity": "low/medium/high",
          "trend": "increasing/decreasing/stable",
          "recommendation": "konkret anbefaling",
          "confidence": 0.0-1.0
        }
      `

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4-1106-preview",
        response_format: { type: "json_object" }
      })

      // Legg til null-sjekk for message.content
      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('Ingen respons fra OpenAI')
      }

      const analysis = JSON.parse(content) as AIAnalysis
      return {
        id: Math.random().toString(36).substr(2, 9),
        category,
        affectedCompanies: data.companies.size,
        ...analysis
      }
    })

    const insights = await Promise.all(analysisPromises)

    return NextResponse.json({
      insights,
      totalDeviations: deviations.length
    })
  } catch (error) {
    console.error('Error analyzing deviations:', error)
    return NextResponse.json({ 
      error: "Kunne ikke analysere avvik",
      details: error instanceof Error ? error.message : "Ukjent feil"
    }, { status: 500 })
  }
} 