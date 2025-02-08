import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { EquipmentClient } from "./equipment-client"
import { notFound } from "next/navigation"

export default async function EquipmentPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const equipment = await prisma.equipment.findMany({
    where: {
      companyId: session.user.companyId
    },
    include: {
      deviations: {
        where: {
          status: {
            in: ['OPEN', 'IN_PROGRESS']
          }
        }
      },
      inspections: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return (
    <div className="container py-6">
      <EquipmentClient initialEquipment={equipment} />
    </div>
  )
} 