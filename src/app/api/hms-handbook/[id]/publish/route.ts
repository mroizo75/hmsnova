import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()

    // Hent kladden
    const draft = await prisma.hMSHandbook.findFirst({
      where: { 
        id: params.id,
        status: 'DRAFT'
      },
      include: { 
        sections: {
          include: {
            subsections: true,
            changes: true
          }
        }
      }
    })

    if (!draft) {
      throw new Error("Draft not found")
    }

    // Hent aktiv håndbok
    const activeHandbook = await prisma.hMSHandbook.findFirst({
      where: { 
        companyId: draft.companyId,
        status: 'ACTIVE'
      },
      include: { 
        sections: {
          include: {
            subsections: true
          }
        }
      }
    })

    // Generer endringslogg
    const changelog = generateChangelog(activeHandbook?.sections || [], draft.sections)

    // Utfør transaksjonen
    const result = await prisma.$transaction(async (tx) => {
      // 1. Arkiver den aktive håndboken
      if (activeHandbook) {
        await tx.hMSHandbook.update({
          where: { id: activeHandbook.id },
          data: { 
            status: 'ARCHIVED',
          }
        })
      }

      // 2. Publiser kladden som ny aktiv håndbok
      const published = await tx.hMSHandbook.update({
        where: { id: draft.id },
        data: {
          status: 'ACTIVE',
          publishedAt: new Date(),
          publishedBy: session.user.id,
          version: draft.version // Behold versjonsnummeret fra kladden
        }
      })

      // 3. Opprett release for historikk
      await tx.hMSRelease.create({
        data: {
          version: published.version,
          handbookId: published.id,
          changes: body.changes,
          reason: body.reason,
          approvedBy: session.user.id,
          content: draft.sections,
          changelog: JSON.stringify(changelog)
        }
      })

      return published
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[PUBLISH_HANDBOOK]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

interface Change {
  type: 'ADD' | 'MODIFY' | 'DELETE'
  sectionId: string
  title: string
  content?: string
  oldContent?: string
  newContent?: string
}

// Hjelpefunksjon for å generere endringslogg
function generateChangelog(oldSections: any[], newSections: any[]): Change[] {
  const changes: Change[] = []

  for (const newSection of newSections) {
    const oldSection = oldSections.find(s => s.id === newSection.id)
    
    if (!oldSection) {
      changes.push({
        type: 'ADD',
        sectionId: newSection.id,
        title: newSection.title,
        content: newSection.content
      })
      continue
    }

    if (oldSection.content !== newSection.content) {
      changes.push({
        type: 'MODIFY',
        sectionId: newSection.id,
        title: newSection.title,
        oldContent: oldSection.content,
        newContent: newSection.content
      })
    }

    // Sjekk underseksjoner rekursivt
    if (newSection.subsections?.length > 0) {
      const subChanges = generateChangelog(
        oldSection.subsections || [],
        newSection.subsections
      )
      changes.push(...subChanges)
    }
  }

  // Finn slettede seksjoner
  for (const oldSection of oldSections) {
    if (!newSections.find(s => s.id === oldSection.id)) {
      changes.push({
        type: 'DELETE',
        sectionId: oldSection.id,
        title: oldSection.title
      })
    }
  }

  return changes
} 