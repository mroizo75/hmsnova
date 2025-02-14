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

  const { id } = await props.params
  if (!id) return notFound()

  try {
    const sja = await prisma.sJA.findUnique({
      where: { 
        id,
        companyId: session.user.companyId
      },
      include: {
        company: {
          include: {
            address: true
          }
        },
        risikoer: true,
        tiltak: true,
        produkter: {
          include: {
            produkt: true
          }
        },
        bilder: true,
        vedlegg: true,
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
        }
      }
    })

    if (!sja) return notFound()

    const safeData = {
      ...sja,
      risikoer: sja.risikoer ?? [],
      tiltak: sja.tiltak ?? [],
      produkter: sja.produkter ?? [],
      vedlegg: sja.vedlegg ?? [],
      godkjenninger: sja.godkjenninger ?? []
    }

    return (
      <Suspense fallback={<div>Laster...</div>}>
        <SJADetails sja={safeData} userRole={session.user.role} />
      </Suspense>
    )
  } catch (error) {
    console.error('Error fetching SJA:', error)
    return notFound()
  }
} 