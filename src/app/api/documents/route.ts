import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { uploadToStorage } from "@/lib/storage"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where = {
      companyId: session.user.companyId,
      ...(category && { categoryId: category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        category: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        versions: {
          orderBy: {
            version: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string

    if (!file || !name || !category) {
      return new NextResponse("Mangler påkrevde felt", { status: 400 })
    }

    // Opprett eller finn kategori først
    const documentCategory = await prisma.category.upsert({
      where: {
        name_companyId: {
          name: category,
          companyId: session.user.companyId
        }
      },
      create: {
        name: category,
        companyId: session.user.companyId
      },
      update: {}
    })

    // Opprett dokument med categoryId
    const document = await prisma.document.create({
      data: {
        name,
        description,
        type: file.type,
        userId: session.user.id,
        companyId: session.user.companyId,
        categoryId: documentCategory.id  // Bruk categoryId direkte
      }
    })

    // Last opp fil med riktig struktur
    const timestamp = Date.now()
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const path = `documents/${document.id}/${timestamp}-${safeFileName}`
    
    const fileUrl = await uploadToStorage(file, path, session.user.companyId)

    // Oppdater dokument med versjon
    const updatedDocument = await prisma.document.update({
      where: { id: document.id },
      data: {
        versions: {
          create: {
            version: 1,
            fileName: file.name,
            fileSize: file.size,
            fileUrl,
            uploadedById: session.user.id
          }
        }
      },
      include: {
        category: true,
        versions: {
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    })

    return NextResponse.json(updatedDocument)
  } catch (error) {
    console.error('Error creating document:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 