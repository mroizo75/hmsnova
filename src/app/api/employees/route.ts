import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import { generatePassword, hashPassword, normalizeEmail } from "@/lib/utils/auth"
import { sendEmail } from "@/lib/email/config"
import { Prisma } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const db = await prisma
    
    // Normaliser e-postadressen
    const normalizedEmail = normalizeEmail(body.email)

    // Sjekk om e-postadressen allerede er i bruk
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "E-postadressen er allerede i bruk" },
        { status: 400 }
      )
    }

    // Finn bedriften til den innloggede brukeren
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!currentUser?.company) {
      return NextResponse.json(
        { message: "Bedrift ikke funnet" },
        { status: 404 }
      )
    }

    // Generer et tilfeldig passord
    const password = generatePassword()
    const hashedPassword = await hashPassword(password)

    try {
      // Opprett ny bruker
      const newUser = await db.user.create({
        data: {
          name: body.name,
          email: normalizedEmail,
          role: body.role,
          password: hashedPassword,
          companyId: currentUser.company.id
        }
      })

      console.log('User created successfully:', newUser.id)

      try {
        // Send velkomst-e-post med Postmark
        await sendEmail({
          to: normalizedEmail,
          subject: `Velkommen til ${currentUser.company.name}`,
          html: `
            <h1>Velkommen som bruker!</h1>
            <p>Hei ${body.name},</p>
            <p>Din brukerkonto hos ${currentUser.company.name} er nå opprettet med følgende detaljer:</p>
            <p><strong>E-post:</strong> ${normalizedEmail}<br>
            <strong>Passord:</strong> ${password}</p>
            <p>Du kan logge inn her: <a href="${process.env.NEXTAUTH_URL}/login">Logg inn</a></p>
            <p>Vi anbefaler at du endrer passordet ditt ved første innlogging.</p>
            <br>
            <p>Vennlig hilsen<br>${currentUser.company.name}</p>
          `
        })
        console.log('Welcome email sent successfully to:', normalizedEmail)
      } catch (error) {
        console.error('Failed to send welcome email:', error)
        // Fortsett selv om e-post feiler - brukeren er allerede opprettet
      }

      return NextResponse.json(
        { 
          message: "Ansatt lagt til", 
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
          }
        },
        { status: 201 }
      )
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json(
            { message: "E-postadressen er allerede i bruk" },
            { status: 400 }
          )
        }
      }
      throw error // La den ytre catch-blokken håndtere andre feil
    }
  } catch (error) {
    console.error("Error creating employee:", error)
    return NextResponse.json(
      { message: "Kunne ikke opprette ansatt" },
      { status: 500 }
    )
  }
} 