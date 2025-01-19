import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { HMSDocumentViewer } from "./hms-document-viewer"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HMSDocumentPage(props: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const { id } = await props.params
  const searchParamsResolved = await props.searchParams

  const document = await prisma.hMSHandbook.findFirst({
    where: {
      id,
      companyId: session.user.companyId,
      published: true
    },
    include: {
      sections: {
        orderBy: {
          order: 'asc'
        }
      },
    }
  })

  if (!document) {
    notFound()
  }

  return <HMSDocumentViewer document={document as any} />
}

export const metadata = {
  title: 'HMS Håndbok',
  description: 'HMS Håndbok for din bedrift'
} 