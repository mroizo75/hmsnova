import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const version = await prisma.hMSRelease.findFirst({
    where: {
      id: params.id,
      handbook: {
        company: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      }
    },
    include: {
      handbook: true
    }
  })

  if (!version) {
    return new NextResponse("Not found", { status: 404 })
  }

  return NextResponse.json(version)
} 