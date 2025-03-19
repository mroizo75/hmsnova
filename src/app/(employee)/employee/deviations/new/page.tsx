import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import { BookOpen, FileText, AlertTriangle, Settings, Home, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { NewDeviationForm } from "./new-deviation-form"

export default async function NewDeviationPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  
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
          <h1 className="text-lg font-semibold">Meld avvik</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Fyll ut skjema for å melde nytt avvik
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <NewDeviationForm />
      </div>

    </div>
  )
} 