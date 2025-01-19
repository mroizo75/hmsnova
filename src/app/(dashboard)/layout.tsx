import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    redirect('/login')
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

  return (
    <div>
      <Sidebar modules={modules} />
      <div className="lg:pl-72">
        <Header user={session.user as any} />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 