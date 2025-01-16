'use client'

import { Sidebar } from './sidebar'
import { Header } from './header'

interface DashboardShellProps {
  children: React.ReactNode
  modules: {
    key: string
    label: string
    isActive: boolean
  }[]
  user: any
}

export function DashboardShell({ children, modules, user }: DashboardShellProps) {
  return (
    <div className="relative min-h-screen">
      <Header user={user} className="fixed top-0 right-0 left-0 z-50" />
      <div className="flex pt-5 bg-gray-50">
        <Sidebar modules={modules} />
        <div className="flex-1 lg:pl-72">
          <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
            <div className="container mx-auto p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
} 