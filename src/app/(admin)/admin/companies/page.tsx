import { CompaniesClient } from "./companies-client"
import prisma from "@/lib/db"

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    include: {
      _count: {
        select: {
          users: true,
          deviations: true,
        }
      },
      users: {
        where: {
          role: 'COMPANY_ADMIN'
        },
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return <CompaniesClient companies={companies} />
} 