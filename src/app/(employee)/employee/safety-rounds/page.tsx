import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import { BookOpen, FileText, AlertTriangle, Home, ChevronLeft, TestTube, ClipboardCheck } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/db"
import { EmployeeSafetyRoundsClient } from "./employee-safety-rounds-client"

export default async function EmployeeSafetyRoundsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/login')
  }

  console.log("User session:", {
    userId: session.user.id,
    companyId: session.user.companyId
  })

  // Hent vernerunder basert på bedriftsadmin-implementasjonen
  const safetyRounds = await prisma.safetyRound.findMany({
    where: {
      companyId: session.user.companyId,
    },
    include: {
      template: true,
      assignedUser: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      },
      findings: {
        include: {
          images: true,
          measures: true
        }
      },
      checklistItems: {
        orderBy: {
          order: 'asc'
        }
      },
      images: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log("Safety rounds before filtering:", {
    total: safetyRounds.length,
    statuses: safetyRounds.map(r => r.status)
  })

  console.log("Fetched safety rounds:", {
    count: safetyRounds.length,
    rounds: safetyRounds.map(r => ({
      id: r.id,
      title: r.title,
      status: r.status,
      assignedTo: r.assignedTo,
      participantsCount: r.participants.length
    }))
  })

  // Sjekk direkte i databasen for å verifisere data
  const allCompanyRounds = await prisma.safetyRound.findMany({
    where: {
      companyId: session.user.companyId
    },
    select: {
      id: true,
      title: true,
      status: true
    }
  })

  console.log("All company safety rounds:", allCompanyRounds)



  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Link 
            href="/employee-dashboard" 
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">Vernerunder</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Oversikt over dine vernerunder
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <EmployeeSafetyRoundsClient 
          initialSafetyRounds={safetyRounds}
          userId={session.user.id}
        />
      </div>

    </div>
  )
}

export const metadata = {
  title: 'Vernerunder',
  description: 'Oversikt over dine vernerunder'
} 