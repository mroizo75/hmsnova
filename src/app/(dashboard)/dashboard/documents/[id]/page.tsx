import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { DocumentDetails } from "./document-details"

interface PageProps {
  params: { id: string }
}

export default async function DocumentPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    notFound()
  }

  const document = await prisma.document.findUnique({
    where: {
      id: params.id,
      companyId: session.user.companyId
    },
    include: {
      category: true,
      user: {
        select: {
          name: true,
          email: true
        }
      },
      versions: {
        orderBy: {
          version: 'desc'
        },
        include: {
          uploadedBy: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }
    }
  })

  if (!document) {
    notFound()
  }

  return <DocumentDetails document={document} />
} 