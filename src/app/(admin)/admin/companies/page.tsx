import { CompaniesClient } from "./companies-client"
import prisma from "@/lib/db"
import { Company } from "./columns"

export default async function AdminCompaniesPage() {
  const companies = await prisma.company.findMany({
    include: {
      users: {
        select: {
          name: true,
          email: true
        }
      },
      modules: {
        select: {
          key: true,
          isActive: true
        }
      },
      _count: {
        select: {
          users: true,
          deviations: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Map Prisma data til Company interface
  const mappedCompanies = companies.map(company => ({
    id: company.id,
    name: company.name,
    orgNumber: company.orgNumber,
    organizationType: company.organizationType,
    isVerified: company.isVerified,
    isActive: company.isActive,
    paymentStatus: company.paymentStatus,
    createdAt: company.createdAt.toISOString(),
    lastPaymentDate: company.lastPaymentDate?.toISOString() || null,
    modules: company.modules.map(m => ({
      key: m.key,
      isActive: m.isActive
    }))
  }))

  return <CompaniesClient companies={mappedCompanies as Company[]} />
} 