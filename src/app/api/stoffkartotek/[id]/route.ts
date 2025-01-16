import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { id } = await params

    await prisma.stoffkartotek.delete({
      where: {
        id: id
      }
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting product:", error)
    return new Response("Could not delete product", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const product = await prisma.stoffkartotek.findUnique({
      where: {
        id: params.id
      },
      include: {
        fareSymboler: true
      }
    })

    if (!product) {
      return new Response("Product not found", { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return new Response("Could not fetch product", { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { id } = await params
    const data = await req.json()

    const product = await prisma.stoffkartotek.update({
      where: {
        id: id
      },
      data: {
        produktnavn: data.produktnavn,
        produsent: data.produsent,
        databladUrl: data.databladUrl,
        beskrivelse: data.beskrivelse,
        bruksomrade: data.bruksomrade,
        fareSymboler: {
          deleteMany: {},
          create: data.fareSymboler.map((symbol: string) => ({
            symbol: symbol
          }))
        }
      },
      include: {
        fareSymboler: true
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product:", error)
    return new Response("Could not update product", { status: 500 })
  }
} 