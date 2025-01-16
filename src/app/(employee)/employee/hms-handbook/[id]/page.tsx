import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import { HMSDocumentViewer } from "./hms-document-viewer"
import prisma from "@/lib/db"
import { notFound } from "next/navigation"

export default async function HMSDocumentPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  const document = await prisma.hMSHandbook.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId,
      published: true
    },
    include: {
      sections: {
        orderBy: {
          order: 'asc'
        }
      },
      attachments: true
    }
  })

  if (!document) {
    notFound()
  }

  return <HMSDocumentViewer document={document} />
} 