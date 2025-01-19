import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    await prisma.hMSTemplate.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: "Kunne ikke slette malen" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { name, description, industry, isDefault } = body

    if (isDefault) {
      await prisma.hMSTemplate.updateMany({
        where: { 
          id: { not: id },
          isDefault: true 
        },
        data: { isDefault: false }
      })
    }

    const template = await prisma.hMSTemplate.update({
      where: { id },
      data: {
        name,
        description,
        industry,
        isDefault
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error updating HMS template:', error)
    return NextResponse.json(
      { error: "Kunne ikke oppdatere malen" },
      { status: 500 }
    )
  }
} 