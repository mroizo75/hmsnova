import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { FindingSeverity, DeviationType, Severity, Status } from "@prisma/client"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { description, severity, location, dueDate, checklistItemId } = body

    // Opprett funn og avvik i samme transaksjon
    const result = await prisma.$transaction(async (tx) => {
      // 1. Opprett avviket først
      const deviation = await tx.deviation.create({
        data: {
          title: `Funn fra vernerunde: ${description.substring(0, 50)}...`,
          description: description,
          type: DeviationType.OBSERVATION,
          category: "VERNERUNDE",
          severity: mapFindingSeverityToDeviationSeverity(severity) as Severity,
          status: Status.OPEN,
          dueDate: dueDate,
          location: location,
          reportedBy: session.user.id,
          companyId: session.user.companyId!,
          source: "SAFETY_ROUND",
          sourceId: params.id
        }
      })

      // 2. Opprett funnet med kobling til avviket
      const finding = await tx.safetyRoundFinding.create({
        data: {
          description,
          severity,
          location,
          dueDate,
          status: Status.OPEN,
          safetyRoundId: params.id,
          checklistItemId,
          createdBy: session.user.id,
          deviationId: deviation.id
        },
        include: {
          images: true,
          deviation: {
            select: {
              id: true,
              status: true,
              createdAt: true,
              closedAt: true,
              source: true,
              sourceId: true
            }
          }
        }
      })

      return finding
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating finding:', error)
    return new NextResponse("Error creating finding", { status: 500 })
  }
}

// Hjelpefunksjon for å mappe alvorlighetsgrad
function mapFindingSeverityToDeviationSeverity(severity: FindingSeverity): Severity {
  const mapping: Record<FindingSeverity, Severity> = {
    LOW: Severity.LOW,
    MEDIUM: Severity.MEDIUM,
    HIGH: Severity.HIGH,
    CRITICAL: Severity.CRITICAL
  }
  return mapping[severity] || Severity.MEDIUM
} 