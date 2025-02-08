import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { randomUUID } from "crypto"
import { addDays } from "date-fns"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await req.json()
    const { approverEmail } = data

    // Opprett godkjenningstoken som utløper om 7 dager
    const approval = await prisma.safetyRoundApproval.create({
      data: {
        safetyRoundId: params.id,
        status: 'PENDING',
        token: randomUUID(),
        expiresAt: addDays(new Date(), 7)
      }
    })

    // TODO: Send e-post til godkjenner med lenke til godkjenning

    return NextResponse.json(approval)
  } catch (error) {
    console.error('Error creating approval:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 