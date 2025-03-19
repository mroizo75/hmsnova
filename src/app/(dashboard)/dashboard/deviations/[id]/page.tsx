import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { DeviationClient } from "./deviation-client"
import type { Deviation, DeviationImage, DeviationMeasure, Severity, DeviationType, Status } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { DeviationDetails } from "./deviation-details"

type DeviationWithRelations = {
  id: string
  title: string
  description: string
  type: string
  category: string
  severity: string
  status: string
  dueDate?: Date
  location?: string
  reportedBy: string
  assignedTo?: string
  companyId: string
  measures: DeviationMeasure[]
  images: DeviationImage[]
  createdAt: Date
  updatedAt: Date
  closedAt?: Date
  closedBy?: string
  closeComment?: string
  source?: string
  sourceId?: string
  equipmentId?: string
  objectType?: string
  objectId?: string
  partAffected?: string
  maintenanceRequired: boolean
}


interface PageProps {
  params: {
    id: string
  }
}

export default async function DeviationPage({ params }: PageProps) {
  // Await params for å sikre at det er lastet før vi bruker egenskapene
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const deviation = await prisma.deviation.findFirst({
    where: {
      id: id,
      company: {
        users: {
          some: {
            id: session.user.id
          }
        }
      }
    },
    include: {
      measures: true,
      images: true
    }
  }) as DeviationWithRelations | null

  if (!deviation) return notFound()

  return (
    <DeviationDetails 
      deviation={deviation as DeviationWithRelations} 
      onUpdate={async () => {
        'use server'
        revalidatePath(`/dashboard/deviations/${id}`)
      }} 
    />
  )
} 