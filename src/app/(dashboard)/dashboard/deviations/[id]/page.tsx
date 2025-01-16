import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { DeviationView } from "./deviation-view"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DeviationPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const { id } = await params
  const db = await prisma

  const deviation = await db.deviation.findFirst({
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
      images: true,
    }
  })

  if (!deviation) {
    return notFound()
  }

  return (
    <Suspense fallback={<div>Laster...</div>}>
      <DeviationView deviation={deviation} id={id} />
    </Suspense>
  )
} 