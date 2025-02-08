import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
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
        template: true,
        creator: true,
        assignedUser: true,
        checklistItems: true,
        findings: {
          include: {
            measures: true
          }
        },
        approvals: {
          where: {
            status: 'APPROVED'
          },
          take: 1,
          orderBy: {
            approvedAt: 'desc'
          }
        }
      }
    })

    if (!safetyRound) {
      return new NextResponse('Not Found', { status: 404 })
    }

    // Generer rapport-innhold
    const reportContent = {
      metadata: {
        title: safetyRound.title,
        company: safetyRound.company.name,
        date: safetyRound.createdAt,
        status: safetyRound.status,
        completedAt: safetyRound.completedAt,
        approvedAt: safetyRound.approvedAt
      },
      checklistItems: safetyRound.checklistItems.map(item => ({
        category: item.category,
        question: item.question,
        response: item.response,
        comment: item.comment,
        imageUrl: item.imageUrl
      })),
      findings: safetyRound.findings.map(finding => ({
        description: finding.description,
        severity: finding.severity,
        status: finding.status,
        location: finding.location,
        imageUrl: finding.imageUrl,
        measures: finding.measures.map(measure => ({
          description: measure.description,
          status: measure.status,
          priority: measure.priority,
          dueDate: measure.dueDate,
          completedAt: measure.completedAt,
          estimatedCost: measure.estimatedCost
        }))
      }))
    }

    // Lagre rapport
    const report = await prisma.safetyRoundReport.create({
      data: {
        safetyRoundId: params.id,
        content: reportContent,
        generatedAt: new Date()
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error generating report:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 