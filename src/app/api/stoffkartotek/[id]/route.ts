import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(
  req: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { id } = await context.params

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
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { id } = await context.params

    const product = await prisma.stoffkartotek.findUnique({
      where: {
        id: id
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
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { id } = await context.params
    const data = await req.json()

    const updated = await prisma.stoffkartotek.update({
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
            symbol
          }))
        },
        ppeSymboler: {
          deleteMany: {},
          create: data.ppeSymboler.map((symbol: string) => ({
            symbol
          }))
        }
      },
      include: {
        fareSymboler: true,
        ppeSymboler: true
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating product:", error)
    return new Response("Could not update product", { status: 500 })
  }
} 