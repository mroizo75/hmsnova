import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import ExcelJS from 'exceljs'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const { type, format: exportFormat, dateRange } = await req.json()
    const db = await prisma

    // Beregn datointervall
    const now = new Date()
    const startDate = dateRange === '7d' ? new Date(now.setDate(now.getDate() - 7)) :
                     dateRange === '30d' ? new Date(now.setDate(now.getDate() - 30)) :
                     dateRange === '90d' ? new Date(now.setDate(now.getDate() - 90)) :
                     dateRange === '365d' ? new Date(now.setDate(now.getDate() - 365)) :
                     undefined

    // Hent data basert på type
    let reportData = []
    if (type === 'deviations' || type === 'all') {
      const deviations = await db.deviation.findMany({
        where: {
          companyId: session.user.companyId,
          createdAt: startDate ? { gte: startDate } : undefined
        },
        include: {
          measures: true
        }
      })
      reportData.push(...deviations.map(d => ({
        dato: format(d.createdAt, 'dd.MM.yyyy'),
        type: 'Avvik',
        status: d.status,
        beskrivelse: d.description,
        tiltak: d.measures.length,
        ansvarlig: d.assignedTo || 'Ikke tildelt'
      })))
    }

    if (type === 'risks' || type === 'all') {
      const risks = await db.riskAssessment.findMany({
        where: {
          companyId: session.user.companyId,
          createdAt: startDate ? { gte: startDate } : undefined
        },
        include: {
          hazards: true
        }
      })
      reportData.push(...risks.map(r => ({
        dato: format(r.createdAt, 'dd.MM.yyyy'),
        type: 'Risikovurdering',
        status: r.status,
        beskrivelse: r.title,
        farer: r.hazards.length,
        ansvarlig: r.createdBy || 'Ikke tildelt'
      })))
    }

    // Generer Excel-rapport
    if (exportFormat === 'excel') {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('HMS Rapport')

      // Definer kolonner
      worksheet.columns = [
        { header: 'Dato', key: 'dato', width: 12 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Beskrivelse', key: 'beskrivelse', width: 40 },
        { header: 'Tiltak/Farer', key: 'tiltak', width: 12 },
        { header: 'Ansvarlig', key: 'ansvarlig', width: 20 }
      ]

      // Style header
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C435F' }
      }
      worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true }

      // Legg til data
      worksheet.addRows(reportData)

      // Autofilter
      worksheet.autoFilter = {
        from: 'A1',
        to: `F${reportData.length + 1}`
      }

      // Generer buffer
      const buffer = await workbook.xlsx.writeBuffer()

      // Opprett filnavn
      const filename = `hms-rapport-${format(new Date(), 'yyyy-MM-dd', { locale: nb })}.xlsx`

      // Bruk NextResponse.json med headers-parameteren for å unngå dynamisk server-bruk
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    }

    return NextResponse.json(
      { message: "Ugyldig eksportformat" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error exporting report:", error)
    return NextResponse.json(
      { message: "Kunne ikke eksportere rapport" },
      { status: 500 }
    )
  }
} 