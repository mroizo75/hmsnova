import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { SJAEditForm } from "./sja-edit-form"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SJAEditPage(props: PageProps) {
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

    // Sjekk om brukeren har tilgang til å redigere (admin eller opprettet selv)
    const canEdit = session.user.role === "COMPANY_ADMIN" || session.user.id === sja.opprettetAvId

    if (!canEdit) {
      // Redirect til visningssiden hvis brukeren ikke har tilgang
      redirect(`/dashboard/sja/${id}`)
    }

    return (
      <Suspense fallback={<div>Laster...</div>}>
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Rediger SJA</h1>
            <p className="text-gray-500">Oppdater SJA-detaljer og status</p>
          </div>
          <SJAEditForm sja={safeData} userRole={session.user.role} />
        </div>
      </Suspense>
    )
  } catch (error) {
    console.error('Error fetching SJA:', error)
    return notFound()
  }
} 