import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import { EmployeeDashboard } from "./employee-dashboard"

export default async function EmployeeDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  // Redirect admin/company_admin til admin dashboard
  if (session.user.role === 'ADMIN' || session.user.role === 'COMPANY_ADMIN') {
    redirect('/dashboard')
  }

  return <EmployeeDashboard />
} 