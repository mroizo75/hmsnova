import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { TemplateEditor } from "./template-editor"
import type { Template } from "./template-editor"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HMSTemplatePage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const { id } = await params
  const searchParamsResolved = await searchParams

  const template = await prisma.hMSTemplate.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          subsections: true
        }
      }
    }
  })

  if (!template) {
    redirect('/admin/hms-templates')
  }

  console.log('Fetching template:', id)
  
  console.log('Template sections:', template.sections.map(s => ({
    id: s.id,
    title: s.title,
    contentLength: s.content?.length
  })))

  return <TemplateEditor template={template as unknown as Template} />
} 