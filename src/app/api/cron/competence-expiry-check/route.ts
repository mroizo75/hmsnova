import { NextRequest, NextResponse } from "next/server"
import { checkExpiringCompetencies } from "@/lib/jobs/competence-expiry-check"

// Denne API-ruten bør beskyttes med en API-nøkkel eller lignende i produksjon
export async function GET(request: NextRequest) {
  try {
    // Sjekk om forespørselen har riktig API-nøkkel
    const apiKey = request.headers.get('x-api-key')
    const configuredApiKey = process.env.CRON_API_KEY
    
    if (!configuredApiKey || apiKey !== configuredApiKey) {
      return NextResponse.json({ error: "Uautorisert" }, { status: 401 })
    }
    
    // Kjør jobben for å sjekke utløpende kompetansebevis
    const result = await checkExpiringCompetencies()
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Feil ved kjøring av kompetanse-utløpsjobb:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
} 