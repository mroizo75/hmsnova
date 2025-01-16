import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { TemplateEditor } from "./template-editor"

interface Props {
  params: {
    id: string
  }
}

export default async function EditTemplatePage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
    redirect('/login')
  }

  const { id } = await params

  console.log('Fetching template:', id)
  
  const template = await prisma.hMSTemplate.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          subsections: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  })

  if (!template) redirect('/admin/hms-templates')

  console.log('Template sections:', template.sections.map(s => ({
    id: s.id,
    title: s.title,
    contentLength: s.content?.length
  })))

  return <TemplateEditor template={template} />
} 