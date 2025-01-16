import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { RiskAssessmentsClient } from "./risk-assessments-client"
import { notFound } from "next/navigation"
import { Suspense } from "react"

interface PageProps {
  params: Promise<{}>
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function RiskAssessmentsPage(props: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const db = await prisma

  const assessments = await db.riskAssessment.findMany({
    where: {
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
          measures: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return (
    <Suspense fallback={<div>Laster...</div>}>
      <RiskAssessmentsClient assessments={assessments} />
    </Suspense>
  )
}

export const metadata = {
  title: 'Risikovurderinger',
  description: 'Oversikt og behandling av risikovurderinger'
} 