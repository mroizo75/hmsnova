import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import { BookOpen, FileText, AlertTriangle, Settings, Home, ChevronLeft, TestTube } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/db"
import { StoffkartotekViewer } from "./stoffkartotek-viewer"
import { Suspense } from "react"

export default async function EmployeeStoffkartotekPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  // Hent bedriftens stoffkartotek
  const produkter = await prisma.stoffkartotek.findMany({
    where: {
      companyId: session.user.companyId
    },
    include: {
      fareSymboler: true,
      ppeSymboler: true,
      company: true
    },
    orderBy: {
      produktnavn: 'asc'
    }
  })

  

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
          <h1 className="text-lg font-semibold">Stoffkartotek</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Oversikt over kjemikalier og farlige stoffer
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <Suspense fallback={<div>Laster stoffkartotek...</div>}>
          <StoffkartotekViewer produkter={produkter} />
        </Suspense>
      </div>

    </div>
  )
} 