import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { Inspection, InspectionsClient } from "./inspections-client"
import { notFound } from "next/navigation"

export default async function InspectionsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const inspections = await prisma.equipmentInspection.findMany({
    where: {
      companyId: session.user.companyId,
    },
    include: {
      equipment: true,
      inspector: true,
      company: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="container py-6">
      <InspectionsClient initialInspections={inspections as (Inspection & { equipment: { name: string } })[]} />
    </div>
  )
} 