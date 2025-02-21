import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import { BookOpen, FileText, AlertTriangle, Settings, Home, ChevronLeft, FileBox } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/db"
import { EmployeeDocumentList } from "./employee-document-list"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default async function EmployeeDocumentsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/login')
  }

  const documents = await prisma.document.findMany({
    where: {
      companyId: session.user.companyId
    },
    include: {
      category: true,
      user: {
        select: {
          name: true,
          email: true
        }
      },
      versions: {
        orderBy: {
          version: 'desc'
        },
        take: 1,
        include: {
          uploadedBy: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
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
      href: "/employee/deviations",
      color: "text-orange-600"
    },
    {
      title: "Dokumenter",
      icon: FileBox,
      href: "/employee/documents",
      color: "text-purple-600"
    },
    {
      title: "Innstillinger",
      icon: Settings,
      href: "/employee/settings",
      color: "text-gray-600"
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/employee-dashboard" 
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold">Dokumenter</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søk i dokumenter..."
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <EmployeeDocumentList documents={documents} />
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-2">
        <div className="flex justify-around">
          {modules.map((module) => (
            <Link key={module.title} href={module.href}>
              <div className="flex flex-col items-center">
                <module.icon 
                  className={`w-6 h-6 ${
                    module.href === "/employee/documents"
                      ? module.color
                      : "text-gray-500"
                  }`} 
                />
                <span className={`text-xs mt-1 ${
                  module.href === "/employee/documents"
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