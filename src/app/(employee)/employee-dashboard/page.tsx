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
  
  console.log("Server-side: EmployeeDashboardPage - Brukerrolle:", session?.user?.role);
  
  if (!session?.user) {
    console.log("Server-side: Ingen sesjon funnet, omdirigerer til login");
    redirect('/login')
  }

  // FJERN OMDIRIGERING FOR COMPANY_ADMIN BRUKERE FOR Å UNNGÅ LØKKER
  // Vis en melding istedenfor å omdirigere
  if (session.user.role !== 'EMPLOYEE') {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Feil dashboard for din rolle</h2>
        <p className="mb-4">Du er logget inn som {session.user.role}, og bør bruke hoved-dashboardet.</p>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Gå til hoved-dashboard
        </Link>
      </div>
    );
  }

  console.log("Server-side: Employee Dashboard - Viser for EMPLOYEE bruker");

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