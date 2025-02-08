import { ReleaseDialog } from "../../release-dialog"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { HMSContent } from "../../hms-content"
import { HMSNavigation } from "../../hms-navigation"
import { Card } from "@/components/ui/card"
import { AddSectionDialog } from "../../add-section-dialog"
import type { Section } from "../../hms-handbook-client"
import { HMSHandbookDraftClient } from "./hms-handbook-draft-client"
import { notFound } from "next/navigation"

export default async function HMSHandbookDraftPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return notFound()

  const draft = await prisma.hMSHandbook.findFirst({
    where: {
      id: params.id,
      company: {
        users: {
          some: {
            id: session.user.id
          }
        }
      }
    },
    include: {
      sections: {
        orderBy: {
          order: 'asc'
        },
        include: {
          subsections: {
            orderBy: {
              order: 'asc'
            },
            include: {
              subsections: true,  // For dypere nesting
              changes: {
                include: {
                  deviations: {
                    include: {
                      deviation: {
                        select: {
                          id: true,
                          title: true,
                          description: true
                        }
                      }
                    }
                  },
                  riskAssessments: {
                    include: {
                      riskAssessment: {
                        select: {
                          id: true,
                          title: true,
                          description: true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          changes: {
            include: {
              deviations: {
                include: {
                  deviation: {
                    select: {
                      id: true,
                      title: true,
                      description: true
                    }
                  }
                }
              },
              riskAssessments: {
                include: {
                  riskAssessment: {
                    select: {
                      id: true,
                      title: true,
                      description: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  if (!draft) return notFound()

  // Konverter innholdet riktig
  function processSection(section: any) {
    console.log('Processing draft section:', section.title)
    console.log('Draft section content before processing:', section.content)

    const content = section.content ? (
      typeof section.content === 'object' 
        ? section.content.html || JSON.stringify(section.content)
        : section.content
    ) : ''

    console.log('Draft section content after processing:', content)

    return {
      ...section,
      content,
      subsections: section.subsections?.map(processSection) || []
    }
  }

  const processedDraft = {
    ...draft,
    sections: draft.sections.map(processSection)
  }

  console.log('Processed draft:', JSON.stringify(processedDraft, null, 2))

  return <HMSHandbookDraftClient draft={processedDraft} />
} 