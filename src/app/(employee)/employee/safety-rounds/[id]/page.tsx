import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { EmployeeSafetyRoundForm } from "./employee-safety-round-form"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface PageProps {
  params: {
    id: string
  }
}

export default async function SafetyRoundPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/login')
  }

  console.log('Fetching safety round:', params.id)

  const safetyRound = await prisma.safetyRound.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId,
      // Fjerner OR-betingelsen midlertidig for debugging
      // OR: [
      //   { assignedTo: session.user.id },
      //   { participants: { some: { userId: session.user.id } } }
      // ]
    },
    include: {
      checklistItems: {
        include: {
          findings: {
            include: { 
              images: true,
              measures: true
            }
          },
          images: true
        },
        orderBy: {
          order: 'asc'
        }
      },
      template: {
        include: {
          sections: {
            include: {
              checkpoints: true
            }
          }
        }
      },
      assignedUser: true,
      participants: {
        include: {
          user: true
        }
      },
      findings: {
        include: {
          images: true
        }
      }
    }
  })

  console.log('Found safety round:', safetyRound ? 'yes' : 'no')

  if (!safetyRound) {
    return notFound()
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Link 
            href="/employee/safety-rounds" 
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">{safetyRound.title}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {safetyRound.description}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <EmployeeSafetyRoundForm safetyRound={safetyRound} userId={session.user.id} />
      </div>
    </div>
  )
} 