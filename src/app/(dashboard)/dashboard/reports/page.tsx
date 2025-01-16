import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { ReportsClient } from "./reports-client"
import { notFound } from "next/navigation"
import { headers } from "next/headers"

export default async function ReportsPage() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return notFound()

    const [stats, auditResponse] = await Promise.all([
      // Eksisterende statistikk
      prisma.$transaction([
        // Avvik statistikk
        prisma.deviation.groupBy({
          by: ['status'],
          _count: true,
          where: {
            companyId: session.user.companyId
          }
        }),
        
        // Risikovurdering statistikk
        prisma.riskAssessment.groupBy({
          by: ['status'],
          _count: true,
          where: {
            companyId: session.user.companyId
          }
        }),
        
        // HMS-hendelser per måned
        prisma.deviation.groupBy({
          by: ['createdAt'],
          _count: true,
          where: {
            companyId: session.user.companyId,
            createdAt: {
              gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]),
      
      // Hent internrevisjonsdata
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/reports/internal-audit`, {
        headers: {
          Cookie: (await headers()).get('cookie') || ''
        }
      }).then(async res => {
        if (!res.ok) {
          console.error('Failed to fetch audit data:', await res.text())
          return null
        }
        return res.json()
      })
    ])

    return <ReportsClient stats={stats} auditData={auditResponse} />
  } catch (error) {
    console.error('Error in ReportsPage:', error)
    return (
      <div className="p-4">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Kunne ikke laste rapportdata</h2>
          <p>Vennligst prøv igjen senere eller kontakt support hvis problemet vedvarer.</p>
        </div>
      </div>
    )
  }
} 