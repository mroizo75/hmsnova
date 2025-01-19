import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { notFound } from "next/navigation"
import { SJADetails } from "./sja-details"
import { Suspense } from "react"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SJADetailsPage(props: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const db = await prisma
  const { id } = await props.params
  const searchParamsResolved = await props.searchParams

  const sja = await db.sJA.findFirst({
    where: {
      id,
      company: {
        users: {
          some: {
            id: session.user.id
          }
        }
      }
    },
    include: {
      risikoer: true,
      tiltak: true,
      produkter: {
        include: {
          produkt: {
            select: {
              id: true,
              produktnavn: true,
              produsent: true,
              databladUrl: true,
              fareSymboler: true
            }
          }
        }
      },
      opprettetAv: {
        select: {
          name: true,
          email: true,
          role: true
        }
      },
      godkjenninger: {
        include: {
          godkjentAv: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      kundeGodkjenning: true,
      vedlegg: true,
      company: {
        select: {
          name: true,
          orgNumber: true
        }
      }
    }
  })

  if (!sja) return notFound()

  return (
    <Suspense fallback={<div>Laster...</div>}>
      <SJADetails sja={sja} userRole={session.user.role} />
    </Suspense>
  )
} 