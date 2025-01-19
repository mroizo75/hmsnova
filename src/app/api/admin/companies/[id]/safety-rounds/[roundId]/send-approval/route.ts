import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { generateApprovalToken } from "@/lib/utils/tokens"
import nodemailer from "nodemailer"

// Sett opp nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL er ikke konfigurert i miljøvariablene')
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; roundId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await params før vi bruker dem
    const { id: companyId, roundId } = await params

    // Hent vernerunde med bedriftsinformasjon
    const safetyRound = await prisma.safetyRound.findFirst({
      where: {
        id: roundId,
        module: {
          companyId
        }
      },
      include: {
        module: {
          include: {
            company: {
              include: {
                users: {
                  where: {
                    role: 'COMPANY_ADMIN'
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!safetyRound) {
      return NextResponse.json(
        { error: "Vernerunde ikke funnet" },
        { status: 404 }
      )
    }

    // Generer godkjenningstoken
    const approvalToken = await generateApprovalToken(roundId)

    // Lagre token i databasen
    await prisma.safetyRoundApproval.create({
      data: {
        token: approvalToken,
        safetyRoundId: roundId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dager
        status: 'PENDING'
      }
    })

    // Send e-post til bedriftsadministrator
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL as string).replace(/\/$/, '') // Fjerner trailing slash hvis det finnes
    const approvalUrl = `${baseUrl}/safety-rounds/approve/${approvalToken}`
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: safetyRound.module.company.users[0].email,
      subject: `Godkjenning av vernerunderapport - ${safetyRound.title}`,
      html: `
        <h2>Godkjenning av vernerunderapport</h2>
        <p>En ny vernerunderapport er klar for godkjenning.</p>
        <p><strong>Vernerunde:</strong> ${safetyRound.title}</p>
        <p><strong>Dato:</strong> ${new Date().toLocaleDateString('nb-NO')}</p>
        <p>Klikk på lenken under for å se rapporten og godkjenne den:</p>
        <p><a href="${approvalUrl}">Godkjenn rapport</a></p>
        <p>Lenken er gyldig i 7 dager.</p>
      `
    })

    return NextResponse.json({ message: "Godkjenningsforespørsel sendt" })
  } catch (error) {
    console.error('Error sending approval request:', error)
    return NextResponse.json(
      { error: "Kunne ikke sende godkjenningsforespørsel" },
      { status: 500 }
    )
  }
} 