import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { notFound } from "next/navigation"
import { HMSGoalsClient } from "./hms-goals-client"
import prisma from "@/lib/db"

export default async function HMSGoalsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const goals = await prisma.hMSGoal.findMany({
    where: {
      companyId: session.user.companyId
    },
    orderBy: {
      year: 'desc'
    }
  })

  return <HMSGoalsClient initialGoals={goals} />
} 