import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { EmployeeDocumentDetails } from "./employee-document-details"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface PageProps {
  params: { id: string }
}

export default async function DocumentPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/login')
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Link 
            href="/employee/documents" 
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">Dokument</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <EmployeeDocumentDetails document={document} />
      </div>
    </div>
  )
} 