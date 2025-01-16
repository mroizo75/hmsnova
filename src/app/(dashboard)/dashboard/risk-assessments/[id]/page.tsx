import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { notFound } from "next/navigation"
import { RiskAssessmentClient } from "./risk-assessment-client"
import { Suspense } from "react"
import { HMSChangesSection } from "./hms-changes-section"

interface PageProps {
  params: Promise<{
    id: string
  }>
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function RiskAssessmentPage(props: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  // Await params for å få tilgang til id
  const { id } = await props.params
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
          <RiskAssessmentClient assessment={assessment} />
        </Suspense>
        
        <HMSChangesSection riskAssessment={assessment} />
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