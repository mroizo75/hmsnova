import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { DeviationClient } from "./deviation-client"

interface PageProps {
  params: {
    id: string
  }
}

export default async function DeviationPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const { id } = params

  const deviation = await prisma.deviation.findFirst({
    where: {
      id,
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
      images: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!deviation) {
    return notFound()
  }

  return (
    <Suspense fallback={<div>Laster...</div>}>
      <DeviationClient initialData={deviation} id={id} />
    </Suspense>
  )
} 