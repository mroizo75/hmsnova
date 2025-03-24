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

  // Spesifikk sjekk for ADMIN/SUPPORT - disse skal til admin/dashboard
  if (session.user.role === 'ADMIN' || session.user.role === 'SUPPORT') {
    console.log(`Dashboard Layout: ADMIN/SUPPORT bruker, omdirigerer til admin/dashboard`);
    // Dette vil sikre at ADMIN/SUPPORT alltid havner i admin-dashboard
    redirect('/admin/dashboard');
  }

  // Sjekk brukerrolle - sett logisk betingelse for hva som er tillatt her
  const allowedRoles = ['COMPANY_ADMIN', 'ADMIN', 'SUPPORT'];
  
  if (!allowedRoles.includes(session.user.role)) {
    console.log(`Dashboard Layout: Uautorisert rolle (${session.user.role}), omdirigerer til riktig dashboard`);
    
    // Bruk absolutt URL med cache-busting for å sikre riktig omdirigering
    redirect(`/employee-dashboard?from=layout&role=${session.user.role}&t=${Date.now()}`);
  }
  
  console.log(`Dashboard Layout: Autorisert rolle (${session.user.role}), viser dashboard`);

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