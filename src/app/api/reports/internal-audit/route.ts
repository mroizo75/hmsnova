import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

interface Section {
  title: string;
  updatedAt: Date;
}

interface HandbookData {
  version: number;
  updatedAt: Date;
  sections: Section[];
}

interface DeviationCount {
  severity: string;
  _count: number;
}

interface RiskAssessment {
  status: string;
  hazards: { riskLevel: string }[];
}

interface SafetyRound {
  findings: { measures: { status: string }[] }[];
}

// Sikker feilhåndteringsfunksjon
const safeLog = (message: string, error: unknown) => {
  if (error instanceof Error) {
    console.error(message, error.message)
  } else {
    console.error(message, 'Unknown error')
  }
}

export async function GET(req: Request) {
  try {
    console.log('Starting internal audit report generation...')
    
    const session = await getServerSession(authOptions)
    console.log('Session:', {
      hasUser: !!session?.user,
      hasCompanyId: !!session?.user?.companyId,
      companyId: session?.user?.companyId
    })

    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companyId = session.user.companyId
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(Date.UTC(currentYear, 0, 1))
    const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59))

    console.log('Query parameters:', { 
      companyId, 
      currentYear, 
      startOfYear: startOfYear.toISOString(), 
      endOfYear: endOfYear.toISOString() 
    })

    // Initialiser data med standardverdier
    const data: {
      handbook: HandbookData;
      deviations: DeviationCount[];
      measures: number;
      riskAssessments: RiskAssessment[];
      safetyRounds: SafetyRound[];
    } = {
      handbook: { version: 1, updatedAt: new Date(), sections: [] },
      deviations: [],
      measures: 0,
      riskAssessments: [],
      safetyRounds: []
    }

    // HMS-håndbok
    try {
      const handbook = await prisma.hMSHandbook.findFirst({
        where: { companyId },
        select: {
          version: true,
          updatedAt: true,
          sections: {
            select: {
              title: true,
              updatedAt: true
            }
          }
        }
      })
      if (handbook) {
        data.handbook = handbook as any
        console.log('Handbook found')
      }
    } catch (error) {
      safeLog('Error fetching handbook:', error)
    }

    // Avvik
    try {
      const deviations = await prisma.deviation.groupBy({
        by: ['severity'],
        where: {
          companyId,
          createdAt: {
            gte: startOfYear,
            lte: endOfYear
          }
        },
        _count: true
      })
      if (deviations) {
        data.deviations = deviations as any
        console.log('Deviations count:', deviations.length)
      }
    } catch (error) {
      safeLog('Error fetching deviations:', error)
    }

    // Tiltak
    try {
      const measures = await prisma.deviationMeasure.count({
        where: {
          deviation: {
            companyId
          },
          status: 'COMPLETED',
          createdAt: {
            gte: startOfYear,
            lte: endOfYear
          }
        }
      })
      data.measures = measures as any
      console.log('Measures count:', measures)
    } catch (error) {
      safeLog('Error fetching measures:', error)
    }

    // Risikovurderinger
    try {
      const riskAssessments = await prisma.riskAssessment.findMany({
        where: {
          companyId,
          createdAt: {
            gte: startOfYear,
            lte: endOfYear
          }
        },
        select: {
          id: true,
          status: true,
          hazards: {
            select: {
              riskLevel: true
            }
          }
        }
      })
      if (riskAssessments) {
        data.riskAssessments = riskAssessments as any
        console.log('Risk assessments count:', riskAssessments.length)
      }
    } catch (error) {
      safeLog('Error fetching risk assessments:', error)
    }

    // Vernerunder
    try {
      const safetyRounds = await prisma.safetyRound.findMany({
        where: {
          companyId,
          createdAt: {
            gte: startOfYear,
            lte: endOfYear
          }
        },
        select: {
          id: true,
          findings: {
            select: {
              id: true,
              measures: {
                select: {
                  status: true
                }
              }
            }
          }
        }
      })
      if (safetyRounds) {
        data.safetyRounds = safetyRounds as any
        console.log('Safety rounds count:', safetyRounds.length)
      }
    } catch (error) {
      safeLog('Error fetching safety rounds:', error)
    }

    // Formater data
    console.log('Formatting data...')
    const formattedData = {
      handbook: {
        version: data.handbook.version,
        lastUpdated: data.handbook.updatedAt,
        changes: data.handbook.sections.map(section => ({
          date: section.updatedAt,
          description: `Oppdatert seksjon: ${section.title}`
        }))
      },
      deviations: {
        total: data.deviations.reduce((sum, d) => sum + d._count, 0),
        bySeverity: data.deviations.map(d => ({
          severity: d.severity,
          count: d._count
        })),
        implementedMeasures: data.measures
      },
      riskAssessments: {
        total: data.riskAssessments.length,
        completed: data.riskAssessments.filter(r => r.status === 'COMPLETED').length,
        highRiskCount: data.riskAssessments.reduce(
          (sum, r) => sum + r.hazards.filter(h => h.riskLevel === 'HIGH').length,
          0
        ),
        implementedMeasures: 0
      },
      safetyRounds: {
        total: data.safetyRounds.length,
        findings: data.safetyRounds.reduce((sum, r) => sum + r.findings.length, 0),
        completedMeasures: data.safetyRounds.reduce(
          (sum, r) => sum + r.findings.reduce(
            (fSum, f) => fSum + f.measures.filter(m => m.status === 'COMPLETED').length,
            0
          ),
          0
        )
      },
      activities: {
        training: [],
        inspections: data.safetyRounds.length
      },
      goals: {
        achieved: 0,
        total: 0,
        nextYearGoals: []
      }
    }

    console.log('Successfully formatted data')
    return NextResponse.json(formattedData)
  } catch (error) {
    safeLog('Final error:', error )
    return NextResponse.json({ 
      error: "Kunne ikke generere rapport",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 