import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import { BookOpen, FileText, AlertTriangle, Settings, Home, ChevronLeft, TestTube } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/db"
import { StoffkartotekViewer } from "./stoffkartotek-viewer"

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
      company: true
    },
    orderBy: {
      produktnavn: 'asc'
    }
  })

  const modules = [
    {
      title: "Hjem",
      icon: Home,
      href: "/employee-dashboard",
      color: "text-gray-600"
    },
    {
      title: "HMS Håndbok",
      icon: BookOpen,
      href: "/employee/hms-handbook",
      color: "text-blue-600"
    },
    {
      title: "SJA",
      icon: FileText,
      href: "/employee/sja",
      color: "text-green-600"
    },
    {
      title: "Avvik",
      icon: AlertTriangle,
      href: "/employee/deviations/new",
      color: "text-orange-600"
    },
    {
      title: "Stoffkartotek",
      icon: TestTube,
      href: "/employee/stoffkartotek",
      color: "text-purple-600"
    }
  ]

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
        <StoffkartotekViewer produkter={produkter} />
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-2">
        <div className="flex justify-around">
          {modules.map((module) => (
            <Link key={module.title} href={module.href}>
              <div className="flex flex-col items-center">
                <module.icon 
                  className={`w-6 h-6 ${
                    module.href === "/employee/stoffkartotek"
                      ? module.color
                      : "text-gray-500"
                  }`} 
                />
                <span className={`text-xs mt-1 ${
                  module.href === "/employee/stoffkartotek"
                    ? module.color
                    : "text-gray-600"
                }`}>
                  {module.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 