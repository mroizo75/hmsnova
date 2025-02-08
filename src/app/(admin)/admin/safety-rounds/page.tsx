import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { SafetyRoundsClient } from "./safety-rounds-client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Vernerunder | Admin",
  description: "Administrer vernerunder for alle bedrifter",
}

export default async function SafetyRoundsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
    redirect('/login')
  }

  const safetyRounds = await prisma.safetyRound.findMany({
    include: {
      company: {
        select: {
          id: true,
          name: true
        }
      },
      template: {
        select: {
          id: true,
          name: true,
          isActive: true
        }
      },
      creator: {
        select: {
          id: true,
          name: true
        }
      },
      assignedUser: {
        select: {
          id: true,
          name: true
        }
      },
      module: {
        select: {
          id: true,
          key: true,
          label: true
        }
      },
      checklistItems: {
        select: {
          id: true,
          category: true,
          isRequired: true,
          completedAt: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return <SafetyRoundsClient safetyRounds={safetyRounds} />
} 