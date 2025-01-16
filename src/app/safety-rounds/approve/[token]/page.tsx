import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { ApprovalPage } from "./approval-page"

interface Props {
  params: Promise<{ token: string }>
}

export default async function SafetyRoundApprovalPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const { token } = await params

  const approval = await prisma.safetyRoundApproval.findUnique({
    where: { token },
    include: {
      safetyRound: {
        include: {
          findings: {
            include: {
              measures: true
            }
          },
          checklistItems: {
            orderBy: {
              category: 'asc'
            }
          }
        }
      }
    }
  })

  if (!approval) redirect('/404')

  return <ApprovalPage approval={approval} />
} 