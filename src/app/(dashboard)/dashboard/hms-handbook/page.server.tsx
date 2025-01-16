import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import HMSHandbookPage from "./page"

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

  return <HMSHandbookPage handbook={handbook || null} />
} 