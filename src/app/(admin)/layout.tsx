import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import { AdminNav } from "@/components/admin/admin-nav"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "System administrasjon for innut.io",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-64 border-r p-6">
        <div className="mb-6">
          <Image src="/HMSNova-logo.svg" alt="HMS Nova" width={200} height={200} />
          <p className="text-sm text-muted-foreground text-center">
            Systemadministrasjon
          </p>
        </div>
        <AdminNav />
      </div>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
} 