import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { TemplatesClient } from "./templates-client"
import { SafetyRoundTemplate } from "@/types/safety-rounds"

export default async function SafetyRoundTemplatesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
    redirect('/login')
  }

  const templates = await prisma.safetyRoundTemplate.findMany({
    include: {
      sections: {
        include: {
          checkpoints: true
        },
        orderBy: {
          order: 'asc'
        }
      },
      companies: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return <TemplatesClient templates={templates as SafetyRoundTemplate[]} />
} 