import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { notFound } from "next/navigation"
import prisma from "@/lib/db"
import { CompareClient } from "./compare-client"

export default async function ComparePage() {
  const session = await getServerSession(authOptions)
  if (!session) return notFound()

  // Hent fra HMSRelease tabellen
  const versions = await prisma.hMSRelease.findMany({
    where: {
      handbook: {
        company: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      }
    },
    orderBy: {
      version: 'desc'
    },
    select: {
      id: true,
      version: true,
      createdAt: true,
      content: true,
      changelog: true,
      approvedBy: true
    }
  })

  return <CompareClient versions={versions as any} />
} 