import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { StoffkartotekClient } from "./stoffkartotek-client"
import { notFound } from "next/navigation"

export default async function StoffkartotekPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const db = prisma
  
  const products = await db.stoffkartotek.findMany({
    where: {
      company: {
        users: {
          some: {
            id: session.user.id
          }
        }
      }
    },
    include: {
      fareSymboler: true
    },
    orderBy: {
      produktnavn: 'asc'
    }
  })

  return <StoffkartotekClient products={products} />
}

export const metadata = {
  title: 'Stoffkartotek',
  description: 'Oversikt over kjemikalier og sikkerhetsdatablader'
} 