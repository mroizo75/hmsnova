import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { EquipmentDetails } from "./equipment-details"

export default async function EquipmentPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const equipment = await prisma.equipment.findUnique({
    where: {
      id: params.id,
      companyId: session.user.companyId
    },
    include: {
      inspections: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      documents: true,
      deviations: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })

  if (!equipment) return notFound()

  return (
    <div className="container py-6">
      <EquipmentDetails equipment={equipment as any} />
    </div>
  )
} 