import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { SJAClient } from "./sja-client"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Providers } from "@/components/providers"
import { SJAWithRelations } from "./types"

export default async function SJAPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const db = await prisma

  const sjaList = await db.sJA.findMany({
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
      risikoer: {
        select: {
          id: true,
          aktivitet: true,
          fare: true,
          alvorlighet: true,
          sannsynlighet: true,
          risikoVerdi: true
        }
      },
      tiltak: {
        select: {
          id: true,
          beskrivelse: true,
          ansvarlig: true,
          status: true,
          frist: true
        }
      },
      produkter: {
        include: {
          produkt: true
        }
      },
      opprettetAv: {
        select: {
          name: true,
          email: true
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
    },
    orderBy: {
      opprettetDato: 'desc'
    }
  })

  return (
    <Providers>
      <Suspense fallback={<div>Laster...</div>}>
        <SJAClient initialData={sjaList as unknown as SJAWithRelations[]} />
      </Suspense>
    </Providers>
  )
}

export const metadata = {
  title: 'Sikker Jobb Analyse',
  description: 'Oversikt og behandling av SJA'
} 