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
      { error: "Kunne ikke hente HMS-endringer", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("1. Starting POST request")
    
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Ikke autorisert" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await request.json()
    console.log("2. Received data:", JSON.stringify(data, null, 2))

    const createData = {
      title: data.title,
      description: data.description,
      changeType: data.changeType,
      status: "PLANNED",
      priority: "MEDIUM" as const,
      createdBy: session.user.id,
      companyId: session.user.companyId,
      deviations: data.deviationId ? {
        create: [{
          deviationId: data.deviationId
        }]
      } : undefined
    }

    console.log("3. Creating HMS change with:", JSON.stringify(createData, null, 2))

    const change = await prisma.hMSChange.create({
      data: createData,
      include: {
        deviations: true
      }
    })

    console.log("4. HMS change created:", JSON.stringify(change, null, 2))

    return new Response(JSON.stringify({ 
      success: true, 
      data: change 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error("Error in POST handler:", error)
    
    return new Response(JSON.stringify({
      success: false,
      error: "Kunne ikke opprette HMS-endring",
      details: error instanceof Error ? error.message : "Ukjent feil"
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 
