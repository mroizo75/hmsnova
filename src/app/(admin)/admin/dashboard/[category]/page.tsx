import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { DetailedAnalysis } from "./detailed-analysis"
import { CompanySelect } from "./company-select"

export default async function DetailedAnalysisPage({ 
  params,
  searchParams 
}: { 
  params: { category: string }
  searchParams: { companyId?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  // Hent params og searchParams asynkront
  const { category } = await params
  const { companyId } = await searchParams

  // Hent alle bedrifter for dropdown
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  // Hent avvik for kategorien og evt. valgt bedrift
  const deviations = await prisma.deviation.findMany({
    where: {
      category: decodeURIComponent(category),
      ...(companyId && {
        companyId: companyId
      })
    },
    include: {
      company: {
        select: {
          name: true
        }
      },
      measures: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-6">
      <CompanySelect 
        companies={companies}
        selectedCompanyId={companyId}
        category={category}
      />
      <DetailedAnalysis 
        category={category} 
        deviations={deviations}
        selectedCompanyId={companyId}
      />
    </div>
  )
} 