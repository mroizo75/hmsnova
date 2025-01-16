import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { formatDate } from "@/lib/utils/date"

// Fargekoder for status og alvorlighetsgrad
const SEVERITY_COLORS = {
  LOW: [252, 211, 77],    // #FCD34D
  MEDIUM: [251, 146, 60], // #FB923C
  HIGH: [239, 68, 68],    // #EF4444
  CRITICAL: [153, 27, 27] // #991B1B
}

const STATUS_COLORS = {
  OPEN: [239, 68, 68],    // #EF4444
  IN_PROGRESS: [59, 130, 246], // #3B82F6
  RESOLVED: [34, 197, 94]  // #22C55E
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; roundId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, roundId } = await params

    // Hent vernerunde med alle relasjoner
    const safetyRound = await prisma.safetyRound.findFirst({
      where: {
        id: roundId,
        module: {
          companyId: id
        }
      },
      include: {
        checklistItems: true,
        findings: {
          include: {
            checklistItem: true,
            measures: true
          }
        },
        assignedUser: {
          select: {
            name: true,
            email: true
          }
        },
        module: {
          include: {
            company: true
          }
        }
      }
    })

    if (!safetyRound) {
      return NextResponse.json(
        { error: "Vernerunde ikke funnet" },
        { status: 404 }
      )
    }

    // Opprett PDF
    const doc = new jsPDF()
    const company = safetyRound.module.company

    // Header med grå bakgrunn
    doc.setFillColor(66, 66, 66)
    doc.rect(0, 0, doc.internal.pageSize.width, 50, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.text("Rapport fra vernerunde", 14, 30)

    // Reset text color
    doc.setTextColor(0, 0, 0)

    // Bedriftsinformasjon
    doc.setFontSize(12)
    doc.text(`Bedrift: ${company.name}`, 14, 70)
    doc.text(`Org.nr: ${company.orgNumber}`, 14, 80)

    // Tegn statistikk-sirkler
    const drawPieChart = (data: Array<{ value: number, color: number[] }>, x: number, y: number, radius: number) => {
      let total = data.reduce((sum, item) => sum + item.value, 0)
      let currentAngle = 0

      data.forEach(item => {
        const sliceAngle = (item.value / total) * 2 * Math.PI
        
        doc.setFillColor(item.color[0], item.color[1], item.color[2])
        doc.circle(x, y, radius, 'F')
        
        // Tegn sektorene
        doc.setFillColor(item.color[0], item.color[1], item.color[2])
        doc.path([
          ['M', x, y],
          ['L', x + radius * Math.cos(currentAngle), y + radius * Math.sin(currentAngle)],
          ['A', radius, radius, 0, sliceAngle > Math.PI ? 1 : 0, 1, 
           x + radius * Math.cos(currentAngle + sliceAngle), 
           y + radius * Math.sin(currentAngle + sliceAngle)],
          ['Z']
        ]).fill()

        currentAngle += sliceAngle
      })
    }

    // Lag data for diagrammene
    const severityData = Object.entries(
      safetyRound.findings.reduce((acc, finding) => {
        acc[finding.severity] = (acc[finding.severity] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).map(([severity, value]) => ({
      value,
      color: SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS]
    }))

    const statusData = Object.entries(
      safetyRound.findings.reduce((acc, finding) => {
        acc[finding.status] = (acc[finding.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).map(([status, value]) => ({
      value,
      color: STATUS_COLORS[status as keyof typeof STATUS_COLORS]
    }))

    // Tegn diagrammene
    if (severityData.length > 0) {
      drawPieChart(severityData, 70, 140, 30)
      doc.text("Fordeling av alvorlighetsgrad", 40, 190)
    }

    if (statusData.length > 0) {
      drawPieChart(statusData, 160, 140, 30)
      doc.text("Status på funn", 140, 190)
    }

    // Legg til sjekkpunkter med fargekodet status
    doc.addPage()
    doc.setFontSize(16)
    doc.text("Gjennomgåtte sjekkpunkter:", 14, 20)

    // Grupper sjekkpunkter etter kategori
    const groupedItems = safetyRound.checklistItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {} as Record<string, typeof safetyRound.checklistItems>)

    let yPosition = 40
    
    // Gå gjennom hver kategori
    Object.entries(groupedItems).forEach(([category, items]) => {
      // Legg til ny side hvis det ikke er nok plass
      if (yPosition > doc.internal.pageSize.height - 40) {
        doc.addPage()
        yPosition = 20
      }

      // Kategori overskrift
      doc.setFontSize(14)
      doc.setTextColor(66, 66, 66)
      doc.text(category, 14, yPosition)
      yPosition += 10

      // Sjekkpunkter i kategorien
      items.forEach(item => {
        // Sjekk om vi trenger ny side
        if (yPosition > doc.internal.pageSize.height - 40) {
          doc.addPage()
          yPosition = 20
        }

        // Fargekoding for svar
        const responseColor = item.response === 'YES' ? [34, 197, 94] : // Grønn
                            item.response === 'NO' ? [239, 68, 68] :    // Rød
                            [148, 163, 184]                             // Grå

        // Tegn farget boks først
        doc.setFillColor(responseColor[0], responseColor[1], responseColor[2])
        doc.rect(14, yPosition - 4, 8, 8, 'F')

        // Spørsmål med innrykk etter boksen
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(item.question, 28, yPosition)
        yPosition += 8

        // Kommentar hvis det finnes
        if (item.comment) {
          doc.setFontSize(10)
          doc.setTextColor(107, 114, 128) // Grå tekst
          doc.text(`Kommentar: ${item.comment}`, 28, yPosition)
          yPosition += 8
        }

        // Legg til litt mellomrom mellom sjekkpunkter
        yPosition += 4
      })

      // Legg til mellomrom mellom kategorier
      yPosition += 10
    })

    // Funn
    if (safetyRound.findings.length > 0) {
      doc.addPage()
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text("Registrerte funn:", 14, 20)
      const findings = safetyRound.findings.map(finding => [
        finding.checklistItem.category,
        finding.description,
        finding.severity,
        finding.status,
        finding.measures.length > 0 
          ? finding.measures.map(m => `- ${m.description} (${m.status})`).join('\n')
          : 'Ingen tiltak registrert'
      ])
      autoTable(doc, {
        startY: 25,
        head: [['Kategori', 'Beskrivelse', 'Alvorlighet', 'Status', 'Tiltak']],
        body: findings,
        styles: { cellPadding: 2 },
        headStyles: { fillColor: [66, 66, 66] }
      })
    }

    // Footer på hver side
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(
        `Generert: ${formatDate(new Date())} - Side ${i} av ${pageCount}`,
        14,
        doc.internal.pageSize.height - 10
      )
    }

    // Legg til signaturfelt på siste side
    doc.addPage()
    doc.text("Godkjenning av rapport", 14, 20)
    
    // Verneombud signatur
    doc.line(14, 50, 100, 50)
    doc.text("Verneombud", 14, 60)
    doc.text("Dato: _____________", 14, 70)

    // Leder signatur
    doc.line(120, 50, 196, 50)
    doc.text("Daglig leder", 120, 60)
    doc.text("Dato: _____________", 120, 70)

    return new Response(doc.output('arraybuffer'), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Vernerunde-${safetyRound.title}-${formatDate(new Date())}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: "Kunne ikke generere rapport" },
      { status: 500 }
    )
  }
} 