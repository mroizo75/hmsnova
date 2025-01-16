import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { HMSConsultingClient } from "./hms-consulting-client"
import { redirect } from "next/navigation"

export default async function HMSConsultingPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const consultations = await prisma.hMSConsultation.findMany({
    where: {
      module: {
        companyId: session.user.companyId,
        key: 'HMS_CONSULTING'
      }
    },
    include: {
      actions: true
    },
    orderBy: {
      scheduledAt: 'desc'
    }
  })

  return <HMSConsultingClient consultations={consultations} />
} 