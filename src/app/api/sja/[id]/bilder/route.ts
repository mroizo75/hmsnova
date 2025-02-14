import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { uploadToStorage } from '@/lib/storage'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    const sja = await prisma.sJA.findUnique({
      where: { 
        id: params.id,
        companyId: session.user.companyId
      }
    })

    if (!sja) {
      return NextResponse.json({ error: "SJA ikke funnet" }, { status: 404 })
    }

    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const uniqueFileName = `${Date.now()}-${file.name}`
        const path = `sja/${sja.id}/bilder/${uniqueFileName}`
        
        try {
          const url = await uploadToStorage(file, path, session.user.companyId)
          
          return prisma.sJABilde.create({
            data: {
              url: path,
              beskrivelse: file.name,
              sjaId: sja.id,
              lastetOppAvId: session.user.id
            }
          })
        } catch (error) {
          console.error('Feil ved opplasting av bilde:', error)
          throw error
        }
      })
    )

    return NextResponse.json({ success: true, images: uploadedImages })
  } catch (error) {
    console.error('Feil ved opplasting av bilder:', error)
    return NextResponse.json(
      { error: "Kunne ikke laste opp bilder" },
      { status: 500 }
    )
  }
} 