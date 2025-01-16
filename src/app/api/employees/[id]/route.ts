import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import { normalizeEmail } from "@/lib/utils/auth"

// PATCH /api/employees/[id]
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const db = await prisma

    // Sjekk om brukeren har tilgang til å redigere denne ansatte
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    const targetUser = await db.user.findUnique({
      where: { id },
      include: { company: true }
    })

    if (!currentUser?.company || !targetUser?.company || currentUser.company.id !== targetUser.company.id) {
      return NextResponse.json(
        { message: "Ikke tilgang" },
        { status: 403 }
      )
    }

    // Normaliser e-postadressen
    const normalizedEmail = normalizeEmail(body.email)

    // Sjekk om e-postadressen allerede er i bruk av en annen bruker
    const existingUser = await db.user.findFirst({
      where: {
        email: normalizedEmail,
        NOT: {
          id: id
        }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "E-postadressen er allerede i bruk" },
        { status: 400 }
      )
    }

    // Oppdater brukeren
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        name: body.name,
        email: normalizedEmail,
        role: body.role,
      }
    })

    return NextResponse.json(
      { message: "Bruker oppdatert", user: updatedUser },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating employee:", error)
    return NextResponse.json(
      { message: "Kunne ikke oppdatere bruker" },
      { status: 500 }
    )
  }
}

// DELETE /api/employees/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const { id } = await params
    const db = await prisma

    // Sjekk om brukeren har tilgang til å slette denne ansatte
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    const targetUser = await db.user.findUnique({
      where: { id },
      include: {
        company: true,
        trainings: true,
        createdSafetyRounds: true,
        assignedSafetyRounds: true,
        Stoffkartotek: true,
        SJAKommentar: true,
        SJABilde: true,
        SJARevisjon: true,
        SJAGodkjenning: true,
        SJA: true,
        SJAMal: true,
        SJAVedlegg: true,
        documents: true,
        notifications: true,
        emailQueue: true
      }
    })

    if (!targetUser) {
      return NextResponse.json(
        { message: "Bruker ikke funnet" },
        { status: 404 }
      )
    }

    if (!currentUser?.company || currentUser.company.id !== targetUser.company.id) {
      return NextResponse.json(
        { message: "Ikke tilgang" },
        { status: 403 }
      )
    }

    // Ikke tillat sletting av egen bruker
    if (id === session.user.id) {
      return NextResponse.json(
        { message: "Du kan ikke slette din egen bruker" },
        { status: 400 }
      )
    }

    // Slett bruker og alle relasjoner i en transaksjon
    await db.$transaction(async (tx) => {
      // Fjern mange-til-mange relasjoner først
      await tx.user.update({
        where: { id },
        data: {
          trainings: { set: [] },
          createdSafetyRounds: { set: [] },
          assignedSafetyRounds: { set: [] },
          Stoffkartotek: { set: [] },
          SJA: { set: [] },
          SJAMal: { set: [] },
          documents: { set: [] }
        }
      })

      // Slett en-til-mange relasjoner
      if (targetUser.notifications.length > 0) {
        await tx.notification.deleteMany({ where: { userId: id } })
      }
      if (targetUser.emailQueue.length > 0) {
        await tx.emailQueue.deleteMany({ where: { userId: id } })
      }
      if (targetUser.SJAKommentar.length > 0) {
        await tx.sJAKommentar.deleteMany({ where: { userId: id } })
      }
      if (targetUser.SJABilde.length > 0) {
        await tx.sJABilde.deleteMany({ where: { userId: id } })
      }
      if (targetUser.SJARevisjon.length > 0) {
        await tx.sJARevisjon.deleteMany({ where: { userId: id } })
      }
      if (targetUser.SJAGodkjenning.length > 0) {
        await tx.sJAGodkjenning.deleteMany({ where: { userId: id } })
      }
      if (targetUser.SJAVedlegg.length > 0) {
        await tx.sJAVedlegg.deleteMany({ where: { userId: id } })
      }

      // Til slutt, slett brukeren
      await tx.user.delete({ where: { id } })
    })

    return NextResponse.json({ success: true, message: "Bruker slettet" })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json({
      success: false,
      message: "Kunne ikke slette bruker",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 