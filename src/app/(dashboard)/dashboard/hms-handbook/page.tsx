import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { HMSHandbook, HMSHandbookClient } from "./hms-handbook-client"
import { HMSChangesOverview } from "./hms-changes-overview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GenerateHandbookDialog } from "./generate-handbook-dialog"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { CreateVersionButton } from "./create-version-button"

async function getHandbook(companyId: string) {
  const [published, draft] = await Promise.all([
    prisma.hMSHandbook.findFirst({
      where: { 
        companyId,
        status: 'ACTIVE'
      },

      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            subsections: {
              orderBy: { order: 'asc' },
              include: {
                subsections: true,
                changes: true
              }
            },
            changes: true
          }
        }
      }
    }),
    prisma.hMSHandbook.findFirst({
      where: {
        companyId,
        status: 'DRAFT'
      }
    })
  ])


  console.log('Raw published handbook:', JSON.stringify(published, null, 2))

  if (!published) {
    return null
  }

  // Konverter innholdet riktig
  function processSection(section: any) {
    console.log('Processing section:', section.title)
    console.log('Section content before processing:', section.content)

    const content = section.content ? (
      typeof section.content === 'object' 
        ? section.content.html || JSON.stringify(section.content)
        : section.content
    ) : ''

    console.log('Section content after processing:', content)

    return {
      ...section,
      content,
      subsections: section.subsections?.map(processSection) || []
    }
  }

  const processedHandbook = {
    ...published,
    sections: published.sections.map(processSection),
    hasDraft: !!draft,
    draftId: draft?.id
  }

  console.log('Processed handbook:', JSON.stringify(processedHandbook, null, 2))

  return processedHandbook
}

export default async function HMSHandbookPage() {
  const session = await getServerSession(authOptions)
  if (!session) return notFound()

  // Hent både ACTIVE og DRAFT håndbøker
  const handbook = await prisma.hMSHandbook.findFirst({
    where: {
      companyId: session.user.companyId,
      OR: [
        { status: 'ACTIVE' },
        { status: 'DRAFT' }
      ]
    },
    orderBy: {
      createdAt: 'desc'  // Hent den nyeste først
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
              subsections: true,
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
              },
              relatedRiskAssessments: true
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
          },
          relatedRiskAssessments: true
        }
      }
    }
  })

  console.log('Found handbook:', handbook) // Debug

  const templates = await prisma.hMSTemplate.findMany({
    where: {
      OR: [
        { isDefault: true },
        { industry: null }
      ]
    }
  })

  return (
    <Tabs defaultValue="handbook" className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <TabsList>
          <TabsTrigger value="handbook">HMS-håndbok</TabsTrigger>
          <TabsTrigger value="changes">HMS-endringer</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="handbook">
        {handbook ? (
          <>
            <HMSHandbookClient handbook={handbook as unknown as HMSHandbook} />
            {handbook.status === 'ACTIVE' && (
              <CreateVersionButton 
                version={handbook.version} 
                companyId={handbook.companyId}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <GenerateHandbookDialog templates={templates} />
            <p className="text-muted-foreground mt-4">
              Du har ikke generert en HMS-håndbok ennå.
              Bruk knappen over for å komme i gang.
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="changes">
        <HMSChangesOverview />
      </TabsContent>
    </Tabs>
  )
} 