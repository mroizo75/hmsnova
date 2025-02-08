import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: { version: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Hent release
    const release = await prisma.hMSRelease.findFirst({
      where: {
        version: parseInt(params.version)
      },
      include: {
        handbook: true
      }
    })

    if (!release) {
      return new NextResponse("Version not found", { status: 404 })
    }

    // Opprett ny kladd basert på release
    const draft = await prisma.hMSHandbook.create({
      data: {
        title: `${release.handbook.title} (Gjenopprettet fra v${release.version})`,
        description: release.handbook.description,
        companyId: release.handbook.companyId,
        status: 'DRAFT',
        version: release.version + 1,
        sections: {
          create: (release.content as any[]).map((section: any) => ({
            title: section.title,
            content: section.content,
            order: section.order
          }))
        }
      }
    })

    return NextResponse.json(draft)
  } catch (error) {
    console.error("[RESTORE_VERSION]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 