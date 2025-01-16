import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { SafetyRoundDetails } from "./safety-round-details"

export default async function SafetyRoundPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const safetyRound = await prisma.safetyRound.findFirst({
    where: {
      id: params.id,
      module: {
        companyId: session.user.companyId
      }
    },
    include: {
      findings: {
        include: {
          measures: true
        }
      }
    }
  })

  if (!safetyRound) redirect('/dashboard/safety-rounds')

  return <SafetyRoundDetails safetyRound={safetyRound} />
} 