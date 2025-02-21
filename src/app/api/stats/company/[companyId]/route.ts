import { prisma } from "@/lib/db"
import { Status } from "@prisma/client"

export async function GET(
  req: Request,
  { params }: { params: { companyId: string } }
) {
  const stats = await prisma.company.findUnique({
    where: { id: params.companyId },
    select: {
      _count: {
        select: {
          users: true,
          deviations: true,
          riskAssessments: true,
          SJA: true
        }
      }
    }
  })

  return Response.json(stats)
} 