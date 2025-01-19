'use client'

import { Card } from "@/components/ui/card"
import { 
  BookOpen, 
  FileText, 
  AlertTriangle,
  Settings,
  ChevronRight,
  LogOut,
  TestTube
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

export function EmployeeDashboard() {
  const { data: session } = useSession()
  
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
      title: "Stoffkartotek",
      description: "Oversikt over kjemikalier og farlige stoffer",
      icon: TestTube,
      href: "/employee/stoffkartotek",
      color: "bg-purple-100 text-purple-600"
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Hei, {session?.user?.name}</h1>
            <p className="text-sm text-muted-foreground">{session?.user?.companyId}</p>
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
        <div className="grid grid-cols-2 gap-3">
          <Link href="/employee/deviations/new">
            <Card className="p-4 bg-orange-50 border-orange-100">
              <AlertTriangle className="w-6 h-6 text-orange-500 mb-2" />
              <p className="text-sm font-medium">Nytt avvik</p>
            </Card>
          </Link>
          <Link href="/employee/sja">
            <Card className="p-4 bg-green-50 border-green-100">
              <FileText className="w-6 h-6 text-green-500 mb-2" />
              <p className="text-sm font-medium">Ny SJA</p>
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
          {modules.map((module) => (
            <Link key={module.title} href={module.href}>
              <div className="flex flex-col items-center">
                <module.icon className="w-6 h-6 text-gray-500" />
                <span className="text-xs text-gray-600 mt-1">{module.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 