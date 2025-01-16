import { NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"

const approveSchema = z.object({
  comment: z.string().min(10),
})

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    
    const validatedData = approveSchema.parse(body)
    const changeId = params.id

    const change = await prisma.hMSChange.update({
      where: {
        id: changeId,
        companyId: session.user.companyId,
      },
      data: {
        status: "APPROVED",
        approvedBy: session.user.id,
        approvedAt: new Date(),
      }
    })

    // Logg godkjenningen
    await prisma.auditLog.create({
      data: {
        action: "APPROVE_HMS_CHANGE",
        entityType: "HMS_CHANGE",
        entityId: changeId,
        userId: session.user.id,
        companyId: session.user.companyId,
        details: {
          comment: validatedData.comment
        }
      }
    })

    return NextResponse.json(change)
  } catch (error) {
    console.error("Error approving HMS change:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 