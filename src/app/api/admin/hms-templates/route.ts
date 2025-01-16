import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, industry, isDefault } = body

    // Hvis denne skal være standard, fjern standard fra andre maler
    if (isDefault) {
      await prisma.hMSTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      })
    }

    const template = await prisma.hMSTemplate.create({
      data: {
        name,
        description,
        industry,
        isDefault
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error creating HMS template:', error)
    return NextResponse.json(
      { error: "Kunne ikke opprette HMS-mal" },
      { status: 500 }
    )
  }
} 