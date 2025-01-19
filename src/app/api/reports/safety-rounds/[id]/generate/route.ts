import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"
import { generatePDF } from "@/lib/pdf"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await requireAuth()
    const { id } = await context.params

    // Hent vernerunden med alle relaterte data
    const safetyRound = await prisma.safetyRound.findUnique({
      where: {
        id,
        companyId: session.user.companyId
      },
      include: {
        findings: true,
        creator: {
          select: {
            name: true,
            email: true
          }
        },
        assignedUser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!safetyRound) {
      return NextResponse.json({ error: "Vernerunde ikke funnet" }, { status: 404 })
    }

    // Generer PDF
    const pdfBuffer = await generatePDF(safetyRound)

    // Lagre rapporten
    const report = await prisma.safetyRoundReport.create({
      data: {
        safetyRoundId: id,
        generatedBy: session.user.id,
        status: 'PENDING',
        reportNumber: '123456',
        metadata: {
          pdfUrl: pdfBuffer
        }
      }
    })

    // Logg genereringen
    await prisma.auditLog.create({
      data: {
        action: "GENERATE_SAFETY_ROUND_REPORT",
        entityType: "SAFETY_ROUND",
        entityId: id,
        userId: session.user.id,
        companyId: session.user.companyId,
        details: {
          reportId: report.id,
          findingsCount: safetyRound.findings.length
        }
      }
    })

    return NextResponse.json({
      success: true,
      reportId: report.id
    })
  } catch (error) {
    console.error("Error generating safety round report:", error)
    return NextResponse.json(
      { error: "Kunne ikke generere rapport" },
      { status: 500 }
    )
  }
} 