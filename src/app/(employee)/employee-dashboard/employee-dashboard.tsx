'use client'

import { Card } from "@/components/ui/card"
import { 
  BookOpen, 
  FileText, 
  AlertTriangle,
  Settings,
  ChevronRight,
  LogOut,
  TestTube,
  ClipboardCheck,
  FileBox
} from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { usePathname } from "next/navigation"

interface Company {
  name: string
  orgNumber: string
}

export function EmployeeDashboard() {
  const { data: session } = useSession()
  const [company, setCompany] = useState<Company | null>(null)
  const pathname = usePathname()

  const modules = [
    {
      title: "HMS Håndbok",
      description: "Se og søk i HMS dokumentasjon",
      icon: BookOpen,
      href: "/employee/hms-handbook",
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "SJA",
      description: "Sikker jobb analyse",
      icon: FileText,
      href: "/employee/sja",
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Avvik",
      description: "Rapporter og følg opp avvik",
      icon: AlertTriangle,
      href: "/employee/deviations/new",
      color: "bg-orange-100 text-orange-600"
    },
    {
      title: "Dokumenter",
      description: "Se og last ned dokumenter",
      icon: FileBox,
      href: "/employee/documents",
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      title: "Stoffkartotek",
      description: "Oversikt over kjemikalier og farlige stoffer",
      icon: TestTube,
      href: "/employee/stoffkartotek",
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Vernerunder",
      description: "Delta og gjennomfør vernerunder",
      icon: ClipboardCheck,
      href: "/employee/safety-rounds",
      color: "bg-teal-100 text-teal-600"
    }
  ]

  useEffect(() => {
    const fetchCompany = async () => {
      if (session?.user?.companyId) {
        try {
          const response = await fetch(`/api/companies/${session.user.companyId}`)
          if (!response.ok) throw new Error('Kunne ikke hente bedriftsinformasjon')
          const data = await response.json()
          setCompany(data)
        } catch (error) {
          console.error('Error fetching company:', error)
        }
      }
    }

    fetchCompany()
  }, [session?.user?.companyId])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Hei, {session?.user?.name}</h1>
            <p className="text-sm text-muted-foreground">
              {company ? company.name : 'Laster bedriftsinformasjon...'}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/employee/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Innstillinger
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logg ut
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/employee/deviations/new">
            <Card className="p-4 bg-orange-50 border-orange-100">
              <AlertTriangle className="w-6 h-6 text-orange-500 mb-2" />
              <p className="text-sm font-medium">Nytt avvik</p>
            </Card>
          </Link>
          <Link href="/employee/documents">
            <Card className="p-4 bg-indigo-50 border-indigo-100">
              <FileBox className="w-6 h-6 text-indigo-500 mb-2" />
              <p className="text-sm font-medium">Dokumenter</p>
            </Card>
          </Link>
          <Link href="/employee/safety-rounds">
            <Card className="p-4 bg-teal-50 border-teal-100">
              <ClipboardCheck className="w-6 h-6 text-teal-500 mb-2" />
              <p className="text-sm font-medium">Vernerunder</p>
            </Card>
          </Link>
        </div>

        {/* Module List */}
        <div className="space-y-3">
          {modules.map((module) => (
            <Link key={module.title} href={module.href}>
              <Card className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${module.color}`}>
                    <module.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{module.title}</h3>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-2">
        <div className="flex justify-around">
          {[
            { icon: BookOpen, title: "HMS Håndbok", href: "/employee/hms-handbook", color: "text-blue-600" },
            { icon: FileText, title: "SJA", href: "/employee/sja", color: "text-green-600" },
            { icon: AlertTriangle, title: "Avvik", href: "/employee/deviations", color: "text-orange-600" },
            { icon: FileBox, title: "Dokumenter", href: "/employee/documents", color: "text-indigo-600" },
            { icon: TestTube, title: "Stoffkartotek", href: "/employee/stoffkartotek", color: "text-purple-600" },
            { icon: ClipboardCheck, title: "Vernerunder", href: "/employee/safety-rounds", color: "text-teal-600" }
          ].map((item) => (
            <TooltipProvider key={item.href}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <div className="p-2">
                      <item.icon 
                        className={`w-6 h-6 ${
                          pathname.startsWith(item.href) ? item.color : "text-gray-500"
                        }`} 
                      />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </div>
  )
} 