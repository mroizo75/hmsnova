import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import ExcelJS from "exceljs"
import { DocumentProps, renderToBuffer } from "@react-pdf/renderer"
import { SafetyRoundPDF } from "@/components/pdf/safety-round-pdf"
import { ReactElement } from "react"
import { SafetyRound } from "@/types/safety-rounds"

export async function GET(
  req: Request,
  { params }: { params: { id: string; format: "excel" | "pdf" } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const safetyRound = await prisma.safetyRound.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        checklistItems: true,
        findings: {
          include: {
            measures: true
          }
        },
        module: true,
        creator: true,
        approvals: true
      }
    })

    if (!safetyRound) {
      return new NextResponse('Not Found', { status: 404 })
    }

    if (params.format === "excel") {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Vernerunde")

      // Legg til data i Excel
      worksheet.columns = [
        { header: "Tittel", key: "title", width: 30 },
        { header: "Status", key: "status", width: 15 },
        { header: "Bedrift", key: "company", width: 20 },
        // ... flere kolonner
      ]

      // Generer Excel-fil
      const buffer = await workbook.xlsx.writeBuffer()
      
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="vernerunde-${params.id}.xlsx"`
        }
      })
    } else {
      // Generer PDF med react-pdf
      const buffer = await renderToBuffer(SafetyRoundPDF({ data: safetyRound as unknown as SafetyRound }) as ReactElement<DocumentProps>)

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="vernerunde-${params.id}.pdf"`
        }
      })
    }
  } catch (error) {
    console.error('Error exporting safety round:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 