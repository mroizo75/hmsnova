import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { DocumentList } from "./document-list"
import { UploadDocumentDialog } from "./upload-document-dialog"

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }

  const documents = await prisma.document.findMany({
    where: {
      companyId: session.user.companyId
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      category: true,
      versions: {
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dokumenter</h1>
        <UploadDocumentDialog />
      </div>
      <DocumentList documents={documents} />
    </div>
  )
} 