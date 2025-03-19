import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { addJob } from '@/lib/queue'
import { logger } from '@/lib/utils/logger'

// Definer tillatte filtyper og maksimal filstørrelse
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      logger.warn('Uautorisert tilgang til bildeopplasting', {
        context: 'sja-bilder-route',
        data: {
          userId: session?.user?.id
        }
      })
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 })
    }

    const sja = await prisma.sJA.findUnique({
      where: {
        id: params.id,
        companyId: session.user.companyId
      }
    })

    if (!sja) {
      logger.warn('SJA ikke funnet', {
        context: 'sja-bilder-route',
        data: {
          sjaId: params.id,
          companyId: session.user.companyId
        }
      })
      return NextResponse.json({ error: 'SJA ikke funnet' }, { status: 404 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files.length) {
      logger.warn('Ingen filer mottatt', {
        context: 'sja-bilder-route',
        data: {
          sjaId: params.id
        }
      })
      return NextResponse.json({ error: 'Ingen filer mottatt' }, { status: 400 })
    }

    // Valider filer
    const invalidFiles = files.filter(file => 
      !ALLOWED_FILE_TYPES.includes(file.type) || 
      file.size > MAX_FILE_SIZE
    )

    if (invalidFiles.length > 0) {
      logger.warn('Ugyldige filer oppdaget', {
        context: 'sja-bilder-route',
        data: {
          sjaId: params.id,
          invalidFiles: invalidFiles.map(file => ({
            name: file.name,
            type: file.type,
            size: file.size
          }))
        }
      })
      return NextResponse.json({ 
        error: 'Ugyldige filer oppdaget',
        details: invalidFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          maxSize: MAX_FILE_SIZE,
          allowedTypes: ALLOWED_FILE_TYPES
        }))
      }, { status: 400 })
    }

    // Prosesser hver fil via Redis-køen
    const jobPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileName = `${Date.now()}-${file.name}`

      try {
        const jobId = await addJob('sjaFiles', {
          sjaId: sja.id,
          companyId: session.user.companyId,
          action: 'upload-files',
          additionalData: {
            fileName,
            buffer: buffer.toString('base64'),
            contentType: file.type,
            size: file.size,
            uploadedBy: session.user.id
          }
        }, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        })

        logger.info(`Fil lagt til i kø for prosessering`, {
          context: 'sja-bilder-route',
          data: {
            sjaId: sja.id,
            fileName,
            jobId
          }
        })

        return { fileName, jobId, success: true }
      } catch (error) {
        logger.error(`Feil ved legging til fil i kø`, {
          context: 'sja-bilder-route',
          data: {
            sjaId: sja.id,
            fileName,
            error: error instanceof Error ? error : new Error(String(error))
          }
        })
        return { fileName, success: false, error: 'Kunne ikke legge til fil i kø' }
      }
    })

    const results = await Promise.all(jobPromises)
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    logger.info(`Ferdig med å legge til filer i kø`, {
      context: 'sja-bilder-route',
      data: {
        sjaId: sja.id,
        totalFiles: files.length,
        successful,
        failed
      }
    })
    
    return NextResponse.json({ 
      message: 'Filer lagt til i køen for prosessering',
      results: {
        total: files.length,
        successful,
        failed,
        details: results
      }
    })
  } catch (error) {
    logger.error('Feil ved opplasting av filer', {
      context: 'sja-bilder-route',
      data: {
        error: error instanceof Error ? error : new Error(String(error))
      }
    })
    return NextResponse.json(
      { error: 'Kunne ikke laste opp filer' },
      { status: 500 }
    )
  }
} 