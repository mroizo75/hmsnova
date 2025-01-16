import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { HMSTemplatesClient } from "./hms-templates-client"

export default async function HMSTemplatesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
    redirect('/login')
  }

  const templates = await prisma.hMSTemplate.findMany({
    include: {
      sections: {
        orderBy: {
          order: 'asc'
        },
        where: {
          parentId: null // Bare hovedseksjoner
        },
        include: {
          subsections: {
            orderBy: {
              order: 'asc'
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return <HMSTemplatesClient templates={templates} />
} 