import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Section {
  id: string
  title: string
  content: string
  order: number
  version: number
  lastEditedBy: string
  lastEditedAt: string
  subsections: Section[]
}

interface Template {
  id: string
  name: string
  description: string | null
  industry: string | null
  isDefault: boolean
  sections: Section[]
}

export function useTemplate(templateId: string) {
  return useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/hms-templates/${templateId}`)
      if (!response.ok) throw new Error('Kunne ikke hente mal')
      return response.json()
    }
  })
}

export function useUpdateSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      templateId, 
      sectionId, 
      content, 
      version 
    }: { 
      templateId: string
      sectionId: string
      content: string
      version: number
    }) => {
      const response = await fetch(
        `/api/admin/hms-templates/${templateId}/sections/${sectionId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, version })
        }
      )

      if (response.status === 409) {
        throw new Error('CONFLICT')
      }

      if (!response.ok) throw new Error('Kunne ikke oppdatere seksjonen')
      return response.json()
    },
    onMutate: async ({ templateId, sectionId, content }) => {
      // Avbryt utestående queries
      await queryClient.cancelQueries(['template', templateId])

      // Ta vare på tidligere data for rollback
      const previousTemplate = queryClient.getQueryData(['template', templateId])

      // Optimistisk oppdatering
      queryClient.setQueryData(['template', templateId], (old: any) => ({
        ...old,
        sections: old.sections.map((s: Section) =>
          s.id === sectionId ? { ...s, content } : s
        )
      }))

      return { previousTemplate }
    },
    onError: (err, variables, context) => {
      // Rollback ved feil
      if (context?.previousTemplate) {
        queryClient.setQueryData(
          ['template', variables.templateId],
          context.previousTemplate
        )
      }

      if (err.message === 'CONFLICT') {
        toast.error('En annen bruker har oppdatert denne seksjonen')
      } else {
        toast.error('Kunne ikke lagre endringene')
      }
    },
    onSuccess: () => {
      toast.success('Endringer lagret')
    }
  })
} 