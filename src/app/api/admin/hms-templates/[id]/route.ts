import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.hMSTemplate.delete({
      where: { id }
    })

    return NextResponse.json({ message: "HMS-mal slettet" })
  } catch (error) {
    console.error('Error deleting HMS template:', error)
    return NextResponse.json(
      { error: "Kunne ikke slette HMS-mal" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
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