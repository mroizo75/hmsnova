import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { id } = await params

    // Generer et unikt rapportnummer (f.eks. VR-2024-001)
    const year = new Date().getFullYear()
    const count = await prisma.safetyRoundReport.count({
      where: {
        reportNumber: {
          startsWith: `VR-${year}-`
        }
      }
    })
    const reportNumber = `VR-${year}-${(count + 1).toString().padStart(3, '0')}`

    const report = await prisma.safetyRoundReport.create({
      data: {
        safetyRoundId: id,
        reportNumber,
        generatedBy: session.user.id,
        status: "PENDING"
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error generating safety round report:", error)
    return new Response("Could not generate report", { status: 500 })
  }
} 