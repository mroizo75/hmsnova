import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { SafetyRoundReportDetails as SafetyRoundReportDetailsType } from "@/types/safety-rounds"
import { Priority, MeasureStatus, FindingSeverity, SafetyRound } from "@prisma/client"
import { SafetyRoundReportDetails } from "./safety-round-report-details"

interface PageProps {
  params: {
    id: string
  }
}

interface SafetyRoundWithRelations extends SafetyRound {
  findings: Array<{
    id: string
    severity: FindingSeverity
    description: string
    location: string | null
    status: string
    images: Array<{ id: string; url: string }>
    measures: Array<{
      id: string
      description: string
      dueDate: Date | null
      completedAt: Date | null
      status: MeasureStatus
      priority: Priority
      assignedTo: string | null
    }>
  }>
  checklistItems: Array<{
    id: string
    category: string
    question: string
    response: string | null
    comment: string | null
    findings: Array<any>
    images: Array<{ id: string; url: string }>
  }>
  assignedUser: { name: string | null; email: string } | null
  participants: Array<{
    user: { name: string | null; email: string }
  }>
}

export default async function SafetyRoundReportPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) notFound()

  const report = await prisma.safetyRound.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId,
      status: 'COMPLETED'
    },
    include: {
      findings: {
        include: {
          images: true,
          measures: true,
          checklistItem: true
        }
      },
      checklistItems: {
        include: {
          findings: true,
          images: true
        }
      },
      assignedUser: true,
      participants: {
        include: {
          user: true
        }
      }
    }
  })

  if (!report) notFound()

  const reportWithAssignedUsers = {
    ...report,
    findings: report.findings.map(finding => ({
      ...finding,
      measures: finding.measures.map(measure => ({
        ...measure,
        assignedTo: measure.assignedTo ? {
          name: null, // We don't have this data from the DB query
          email: measure.assignedTo
        } : null
      }))
    }))
  }

  return <SafetyRoundReportDetails report={reportWithAssignedUsers} />
}