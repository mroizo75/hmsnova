import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import PDFDocument from "pdfkit"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data } = await req.json()
    
    // Opprett ny PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `HMS Årsrapport ${new Date().getFullYear()}`,
        Author: 'Generert av Innutio',
      }
    })

    // Buffer for å samle PDF-dataene
    const chunks: Buffer[] = []
    doc.on('data', chunk => chunks.push(chunk))
    
    // Promise for å vente på at PDF er ferdig generert
    const pdfComplete = new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)
    })

    // Tittel og header
    doc
      .font('Helvetica-Bold')
      .fontSize(24)
      .text(`HMS Årsrapport ${new Date().getFullYear()}`, { align: 'center' })
      .moveDown(2)

    // Introduksjon
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('Introduksjon')
      .moveDown(0.5)
      .font('Helvetica')
      .fontSize(12)
      .text('Denne rapporten gir en omfattende oversikt over bedriftens HMS-arbeid for året. Formålet er å evaluere effektiviteten av våre HMS-tiltak og identifisere områder for forbedring.')
      .moveDown(2)

    // HMS-håndbok Status
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('HMS-håndbok Status')
      .moveDown(0.5)
      .font('Helvetica')
      .fontSize(12)
      .text(`Gjeldende versjon: ${data.handbook.version}`)
      .text(`Sist oppdatert: ${new Date(data.handbook.lastUpdated).toLocaleDateString('nb-NO')}`)
      .moveDown(1)

    // Avviksoppsummering
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('Avviksoppsummering')
      .moveDown(0.5)
      .font('Helvetica')
      .fontSize(12)
      .text(`Totalt antall avvik: ${data.deviations.total}`)
      .text(`Gjennomførte tiltak: ${data.deviations.implementedMeasures}`)
      .text(`Tiltak effektivitet: ${Math.round((data.deviations.implementedMeasures / data.deviations.total) * 100)}%`)
      .moveDown(1)

    // Risikovurderinger
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('Risikovurderinger')
      .moveDown(0.5)
      .font('Helvetica')
      .fontSize(12)
      .text(`Totalt gjennomført: ${data.riskAssessments.total}`)
      .text(`Høyrisiko funn: ${data.riskAssessments.highRiskCount}`)
      .text(`Implementerte tiltak: ${data.riskAssessments.implementedMeasures}`)
      .moveDown(1)

    // Vernerunder og HMS-aktiviteter
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('Vernerunder og HMS-aktiviteter')
      .moveDown(0.5)
      .font('Helvetica')
      .fontSize(12)
      .text(`Gjennomførte vernerunder: ${data.safetyRounds.total}`)
      .text(`Registrerte funn: ${data.safetyRounds.findings}`)
      .text(`Lukkede funn: ${data.safetyRounds.completedMeasures}`)
      .moveDown(1)

    // HMS-opplæring
    if (data.activities.training && data.activities.training.length > 0) {
      doc
        .font('Helvetica-Bold')
        .text('HMS-opplæring og kurs')
        .moveDown(0.5)
        .font('Helvetica')
      
      data.activities.training.forEach(activity => {
        doc.text(`${activity.name}: ${activity.participants} deltakere (${new Date(activity.date).toLocaleDateString('nb-NO')})`)
      })
      doc.moveDown(1)
    }

    // Måloppnåelse
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('Måloppnåelse')
      .moveDown(0.5)
      .font('Helvetica')
      .fontSize(12)
      .text(`Oppnådde mål: ${data.goals.achieved} av ${data.goals.total}`)
      .moveDown(0.5)

    if (data.goals.nextYearGoals.length > 0) {
      doc
        .font('Helvetica-Bold')
        .text('Mål for neste år:')
        .moveDown(0.5)
        .font('Helvetica')
      
      data.goals.nextYearGoals.forEach(goal => {
        doc.text(`• ${goal}`)
      })
    }

    // Avslutt dokumentet
    doc.end()

    // Vent på at PDF er ferdig generert
    const pdfBuffer = await pdfComplete

    // Returner PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="hms-arsrapport-${new Date().getFullYear()}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ 
      error: "Kunne ikke generere PDF" 
    }, { status: 500 })
  }
} 