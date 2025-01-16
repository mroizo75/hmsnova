"use client"

import { ChevronLeft } from "lucide-react"
import Link from "next/link"

interface EmployeePageLayoutProps {
  children: React.ReactNode
  heading: string
  description?: string
  backHref?: string
}

export function EmployeePageLayout({
  children,
  heading,
  description,
  backHref = "/employee-dashboard"
}: EmployeePageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Link 
            href={backHref}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">{heading}</h1>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
} 