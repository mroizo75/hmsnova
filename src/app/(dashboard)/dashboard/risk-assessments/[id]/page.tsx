import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { notFound } from "next/navigation"
import { RiskAssessmentClient } from "./risk-assessment-client"
import { Suspense } from "react"
import { HMSChangesSection } from "./hms-changes-section"
import type { Hazard, RiskAssessment } from "@prisma/client"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Type for RiskAssessmentClient
type RiskAssessmentWithHazards = RiskAssessment & {
  hazards: Array<Hazard & {
    measures: Array<{
      id: string
      description: string
      type: string
      status: string
      priority: string
      dueDate: Date | null
      completedAt: Date | null
      assignedTo: string | null
    }>
    riskMeasures: Array<{
      id: string
      description: string
      status: string
      type: string
      priority: string
      hazardId: string
    }>
    hmsChanges: Array<{
      hmsChange: {
        id: string
        title: string
        description: string
        status: string
        implementedAt: Date | null
      }
    }>
  }>
}

// Type for HMSChangesSection
type RiskAssessmentWithHMSChanges = RiskAssessment & {
  hazards?: Array<{
    id: string
    description: string
    riskLevel: number
    riskMeasures: Array<{
      id: string
      description: string
      status: string
      type: string
      priority: string
      hazardId: string
      riskAssessmentId: string
      hmsChanges: Array<{
        hmsChange: {
          id: string
          title: string
          description: string
          status: string
          implementedAt: Date | null
        }
      }>
    }>
  }>
  hmsChanges?: Array<{
    hmsChange: {
      id: string
      title: string
      description: string
      status: string
      implementedAt: Date | null
    }
  }>
}

export default async function RiskAssessmentPage(props: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  // Await både params og searchParams
  const { id } = await props.params
  const searchParamsResolved = await props.searchParams
  const db = await prisma

  try {
    const assessment = await db.riskAssessment.findFirst({
      where: {
        id,
        company: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      },
      include: {
        hazards: {
          include: {
            riskMeasures: true,
            hmsChanges: {
              include: {
                hmsChange: true
              }
            }
          },
          orderBy: {
            riskLevel: 'desc'
          }
        },
        hmsChanges: {
          include: {
            hmsChange: {
              select: {
                id: true,
                title: true,
                description: true,
                status: true,
                implementedAt: true
              }
            }
          }
        }
      }
    })

    if (!assessment) {
      return notFound()
    }

    return (
      <div className="space-y-6">
        <Suspense fallback={<div>Laster...</div>}>
          <RiskAssessmentClient assessment={assessment as unknown as RiskAssessmentWithHazards} />
        </Suspense>
        
        <HMSChangesSection riskAssessment={assessment as unknown as RiskAssessmentWithHMSChanges} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching risk assessment:", error)
    return notFound()
  }
}

// Metadata må også awaite params
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  
  return {
    title: `Risikovurdering ${id}`,
    description: 'Detaljert visning av risikovurdering'
  }
} 