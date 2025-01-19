import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { HMSHandbook, HMSHandbookClient } from "./hms-handbook-client"

interface HandbookPageProps {
  handbook: {
    sections: Array<{
      id: string
      title: string
      content: any // eller JsonValue hvis du importerer typen
      order: number
      parentId: string | null
      handbookId: string
      subsections: Array<{
        id: string
        title: string
        content: any
        order: number
        parentId: string | null
        handbookId: string
      }>
    }>
  } | null
}

export default async function HMSHandbookPageServer() {
  const session = await getServerSession(authOptions)
  const db = await prisma
  
  const handbook = await db.hMSHandbook.findFirst({
    where: {
      company: {
        users: {
          some: {
            id: session?.user?.id
          }
        }
      }
    },
    include: {
      sections: {
        orderBy: {
          order: 'asc'
        },
        include: {
          subsections: {
            orderBy: {
              order: 'asc'
            }
          }
        }
      }
    }
  })

  console.log("Fetched handbook:", handbook) // Debug logging

  return (
    <HMSHandbookClient handbook={handbook as unknown as HMSHandbook} />
  )
} 