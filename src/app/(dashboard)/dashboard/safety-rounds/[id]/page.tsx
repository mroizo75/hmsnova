import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { SafetyRoundDetails } from "./safety-round-details"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SafetyRoundPage(props: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const { id } = await props.params
  const searchParamsResolved = await props.searchParams

  const safetyRound = await prisma.safetyRound.findFirst({
    where: {
      id,
      module: {
        company: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      }
    },
    include: {
      findings: {
        include: {
          measures: true
        }
      }
    }
  })

  if (!safetyRound) {
    return notFound()
  }

  return <SafetyRoundDetails safetyRound={safetyRound} />
} 