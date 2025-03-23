import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import { EmployeeDashboard } from "./employee-dashboard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import prisma from "@/lib/db"

export default async function EmployeeDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  // Redirect admin/company_admin til admin dashboard
  if (session.user.role === 'ADMIN' || session.user.role === 'COMPANY_ADMIN') {
    redirect('/dashboard')
  }

  // Hent bedriftsinformasjon
  const company = session.user.companyId ? 
    await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { name: true, orgNumber: true }
    }) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
      </div>
      <EmployeeDashboard initialSession={session} initialCompany={company} />
    </div>
  )
} 