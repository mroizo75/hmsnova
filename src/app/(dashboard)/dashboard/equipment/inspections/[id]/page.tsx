import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { InspectionDetails } from "./inspection-details"

export default async function InspectionPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const inspection = await prisma.equipmentInspection.findUnique({
    where: {
      id: params.id,
      companyId: session.user.companyId
    },
    include: {
      equipment: true,
      inspector: true,
      company: true
    }
  })

  if (!inspection) return notFound()

  return (
    <div className="container py-6">
      <InspectionDetails inspection={inspection} />
    </div>
  )
} 