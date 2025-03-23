import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { redirect } from "next/navigation"
import { DashboardUpdates } from "@/components/dashboard/dashboard-updates"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    redirect('/login')
  }

  // Redirect employee users til employee dashboard
  if (session.user.role === 'EMPLOYEE') {
    redirect('/employee-dashboard')
  }

  const modules = await prisma.module.findMany({
    where: {
      companyId: session.user.companyId
    },
    select: {
      key: true,
      label: true,
      isActive: true
    }
  })

  // Hent brukerens innstillinger
  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: session.user.id
    }
  })

  return (
    <html data-color-mode={userSettings?.colorMode || 'default'}>
      <body>
        <div className="min-h-screen bg-background">
          <Sidebar modules={modules} />
          <div className="lg:pl-72">
            <Header user={session.user as any} />
            <main className="py-10">
              <div className="px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
          {/* Legger til DashboardUpdates for socket.io støtte */}
          <DashboardUpdates />
        </div>
      </body>
    </html>
  )
} 