import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { genSalt, hash } from 'bcryptjs'
import { randomBytes } from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email/postmark'

// Dummy e-post-funksjon – bytt ut med din egen e-postsender
async function sendEmail(email: string, resetToken: string) {
  console.log('Sender e-post til:', email, 'med token:', resetToken)
}

async function lagreResetTokenIDatabase(userId: string, token: string) {
  // Her kan du lagre token i en tabell
  await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30) // gyldig i 30 minutter
    }
  })
}

function generateRandomPassword(length = 12): string {
  // Generer et tilfeldig passord
  // Du kan bytte til en sikrere metode om ønskelig
  return randomBytes(length).toString('base64').slice(0, length)
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    // Finn brukeren
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Bruker ikke funnet' },
        { status: 404 }
      )
    }

    // 1. Generer nytt passord
    const newPlainPassword = generateRandomPassword()

    // 2. Hash passordet
    const salt = await genSalt(10)
    const hashedPassword = await hash(newPlainPassword, salt)

    // 3. Oppdater brukerens passord i databasen
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword
      }
    })

    // 4. Send e-post med det nye (midlertidige) passordet
    await sendPasswordResetEmail(user.email, newPlainPassword)

    return NextResponse.json({ message: 'Nytt passord er opprettet og sendt.' }, { status: 200 })
  } catch (error) {
    console.error('Feil ved glemt passord:', error)
    return NextResponse.json({ error: 'En feil oppstod' }, { status: 500 })
  }
} 