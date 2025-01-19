import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { HMSHandbookClient } from "./hms-handbook-client"
import type { HMSHandbook as PrismaHandbook } from "@prisma/client"
import type { HMSHandbook } from "./hms-handbook-client"
import { HMSChangesOverview } from "./hms-changes-overview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GenerateHandbookDialog } from "./generate-handbook-dialog"

export default async function HMSHandbookPage() {
  const session = await getServerSession(authOptions)
  const db = await prisma
  
  const [handbook, templates] = await Promise.all([
    db.hMSHandbook.findFirst({
      where: {
        company: {
          users: {
            some: {
              id: session?.user?.id
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
                },
                hazards: {
                  include: {
                    hazard: {
                      select: {
                        id: true,
                        description: true,
                        riskLevel: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }),
    // Hent tilgjengelige maler
    db.hMSTemplate.findMany({
      where: {
        OR: [
          { isDefault: true },
          { industry: null }
        ]
      }
    })
  ])

  return (
    <Tabs defaultValue="handbook" className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <TabsList>
          <TabsTrigger value="handbook">HMS-håndbok</TabsTrigger>
          <TabsTrigger value="changes">HMS-endringer</TabsTrigger>
        </TabsList>
        
        {!handbook && <GenerateHandbookDialog templates={templates} />}
      </div>

      <TabsContent value="handbook">
        {handbook ? (
          <HMSHandbookClient 
            handbook={handbook as unknown as HMSHandbook} 
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
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