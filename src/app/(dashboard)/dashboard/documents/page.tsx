import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"

interface PageProps {
  params: Promise<{}>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DocumentsPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }

  const documents = await prisma.document.findMany({
    where: {
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
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Dokumenter</h1>
      <div className="grid gap-4">
        {documents.map(doc => (
          <div key={doc.id} className="border p-4 rounded-lg">
            <h2 className="font-semibold">{doc.name}</h2>
            <p className="text-sm text-muted-foreground">
              Lastet opp av: {doc.user.name || doc.user.email}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
} 