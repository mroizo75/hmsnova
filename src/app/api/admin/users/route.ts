import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { generatePassword } from "@/lib/utils/password"
import { sendWelcomeEmail } from "@/lib/email/templates/welcome-email"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    // Debug session
    const session = await getServerSession(authOptions)
    console.log('Session:', JSON.stringify(session, null, 2))
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const data = await request.json()
    console.log('Received data:', JSON.stringify(data, null, 2))
    
    // Valider at vi har all nødvendig data
    if (!data.name || !data.email || !data.role) {
      console.log('Missing required fields:', {
        hasName: !!data.name,
        hasEmail: !!data.email,
        hasRole: !!data.role
      })
      return NextResponse.json({ 
        error: "Mangler påkrevde felt",
        required: ["name", "email", "role"],
        received: data
      }, { status: 400 })
    }
    
    // Valider at rollen er enten ADMIN eller SUPPORT
    if (!['ADMIN', 'SUPPORT'].includes(data.role)) {
      console.log('Invalid role:', data.role)
      return NextResponse.json({ 
        error: "Ugyldig rolle. Må være ADMIN eller SUPPORT",
        received: data.role
      }, { status: 400 })
    }

    try {
      // Sjekk om e-posten allerede er i bruk
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      })
      console.log('Existing user check:', existingUser ? 'Found' : 'Not found')

      if (existingUser) {
        return NextResponse.json({ 
          error: "E-postadressen er allerede i bruk" 
        }, { status: 400 })
      }
      
      // Generer et tilfeldig passord og hash det
      const password = generatePassword()
      const hashedPassword = await bcrypt.hash(password, 12)

      // Opprett system-bruker
      console.log('Creating user with data:', {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: true
      })

      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          role: data.role,
          password: hashedPassword,
          isActive: true,
          company: {
            connect: {
              id: session.user.companyId // Koble til samme company som admin-brukeren
            }
          },
          notificationSettings: {
            create: {
              emailNotifications: true,
              pushNotifications: true
            }
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      })
      console.log('User created:', user.id)

      // Send velkomst-epost
      try {
        await sendWelcomeEmail({
          to: user.email,
          name: user.name || user.email,
          password,
          role: data.role as "ADMIN" | "SUPPORT"
        })
        console.log('Welcome email sent')
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
      }

      return NextResponse.json(user, { status: 201 })
    } catch (innerError) {
      console.error('Inner error details:', {
        message: innerError.message,
        code: innerError.code,
        meta: innerError.meta
      })
      throw innerError
    }
  } catch (error) {
    console.error('Outer error full details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    
    return NextResponse.json({ 
      error: "Kunne ikke opprette bruker",
      details: error instanceof Error ? error.message : "Ukjent feil",
      code: error.code,
      meta: error.meta
    }, { status: 500 })
  }
} 