import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("1. Starting GET request")
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log("2. No session found")
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }
    
    console.log("3. Session found:", { userId: session.user.id, companyId: session.user.companyId })

    const changes = await prisma.hMSChange.findMany({
      where: {
        companyId: session.user.companyId,
        OR: [
          { deviations: { some: {} } },
          { riskAssessments: { some: {} } }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        changeType: true,
        status: true,
        sectionId: true,
        createdAt: true,
        measures: true,
        deviations: {
          select: {
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
          select: {
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
    })

    console.log("4. Raw changes:", changes)

    if (!changes) {
      console.log("5. No changes found")
      return NextResponse.json([])
    }

    try {
      const transformedChanges = changes.map(change => {
        console.log("6. Processing change:", change)
        
        if (!change) {
          console.log("7. Found null change")
          return null
        }

        const transformed = {
          id: change.id || 'unknown',
          title: change.title || "",
          description: change.description || "",
          changeType: change.changeType || "UNKNOWN",
          status: change.status || "UNKNOWN",
          sectionId: change.sectionId || null,
          createdAt: change.createdAt ? change.createdAt.toISOString() : new Date().toISOString(),
          measures: Array.isArray(change.measures) ? change.measures : [],
          deviations: Array.isArray(change.deviations) 
            ? change.deviations
                .filter(d => d && d.deviation)
                .map(d => ({
                  id: d.deviation.id || 'unknown',
                  title: d.deviation.title || "",
                  description: d.deviation.description || ""
                }))
            : [],
          riskAssessments: Array.isArray(change.riskAssessments)
            ? change.riskAssessments
                .filter(r => r && r.riskAssessment)
                .map(r => ({
                  id: r.riskAssessment.id || 'unknown',
                  title: r.riskAssessment.title || "",
                  description: r.riskAssessment.description || ""
                }))
            : []
        }
        
        console.log("8. Transformed change:", transformed)
        return transformed
      }).filter(Boolean) // Fjern eventuelle null-verdier

      console.log("9. Final transformed data:", transformedChanges)

      return NextResponse.json(transformedChanges || [])
    } catch (transformError) {
      console.error("10. Transform error:", transformError)
      return NextResponse.json([])
    }
  } catch (error) {
    console.error("11. Main error:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente HMS-endringer", details: error instanceof Error ? error.message : "Ukjent feil" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    console.log('1. Starting POST request')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    console.log('3. Received data:', data)

    // Hvis det er fra risikovurdering
    if (data.riskAssessmentId) {
      const riskAssessment = await prisma.riskAssessment.findUnique({
        where: { id: data.riskAssessmentId },
        select: { 
          companyId: true,
          measures: {
            where: {
              id: {
                in: data.measures || []
              }
            }
          }
        }
      })

      if (!riskAssessment?.companyId) {
        return NextResponse.json(
          { error: "Kunne ikke finne tilhørende risikovurdering" },
          { status: 400 }
        )
      }

      // Opprett HMS-endring for risikovurdering
      const hmsChange = await prisma.hMSChange.create({
        data: {
          title: data.title,
          description: data.description,
          changeType: data.changeType,
          status: data.status || "PLANNED",
          priority: "MEDIUM",
          createdBy: session.user.id,
          companyId: riskAssessment.companyId,
          riskAssessments: {
            create: {
              riskAssessmentId: data.riskAssessmentId
            }
          }
        }
      })

      console.log('4. Created HMS change:', hmsChange)
      return NextResponse.json(hmsChange)
    }
    
    // Hvis det er fra avvik
    if (data.deviationId) {
      const hmsChange = await prisma.hMSChange.create({
        data: {
          title: data.title,
          description: data.description,
          changeType: data.changeType,
          status: "PLANNED",
          priority: "MEDIUM",
          createdBy: session.user.id,
          companyId: session.user.companyId,
          deviations: {
            create: {
              deviationId: data.deviationId
            }
          }  
        }
      })
      return NextResponse.json(hmsChange)
    }

  } catch (error) {
    console.error('Error details:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { error: "Kunne ikke opprette HMS-endring" },
      { status: 500 }
    )
  }
} 
