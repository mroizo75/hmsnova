import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import { BookOpen, FileText, AlertTriangle, Settings, Home } from "lucide-react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import prisma from "@/lib/db"

export default async function EmployeeDeviationsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  // Hent avvik for innlogget bruker
  const deviations = await prisma.deviation.findMany({
    where: {
      companyId: session.user.companyId,
      reportedBy: session.user.id // Vis bare avvik rapportert av brukeren
    },
    orderBy: {
      createdAt: 'desc'
    }
  })


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Link 
              href="/employee-dashboard" 
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold">Mine avvik</h1>
          </div>
          <Button asChild>
            <Link href="/employee/deviations/new">
              Meld avvik
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Oversikt over dine innmeldte avvik
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {/* <EmployeeDeviationsList initialDeviations={deviations} /> */}
      </div>
    </div>
  )
} 