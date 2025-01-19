import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DocumentPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }

  const { id } = await params
  const searchParamsResolved = await searchParams

  const document = await prisma.document.findUnique({
    where: {
      id,
      OR: [
        { companyId: session.user.companyId },
        { userId: session.user.id }
      ]
    },
    include: {
      company: true,
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  if (!document) {
    redirect('/dashboard/documents')
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Dokument</h1>
      {/* Implementer dokumentvisning her */}
    </div>
  )
} 