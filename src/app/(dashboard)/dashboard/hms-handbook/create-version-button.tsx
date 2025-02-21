"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Props {
  version: number
  companyId: string
}

export function CreateVersionButton({ version, companyId }: Props) {
  const router = useRouter()

  async function createNewDraft() {
    console.log('Creating new draft based on version:', version)
    try {
      const response = await fetch('/api/hms-handbook/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fromVersion: version,
          companyId,
          // Ikke øk versjonsnummeret her - det skjer ved publisering
          isDraft: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Server error:', errorData)
        throw new Error(errorData.message || 'Kunne ikke opprette nytt utkast')
      }

      const data = await response.json()
      console.log('New draft created:', data)
      router.push(`/dashboard/hms-handbook/draft/${data.id}`)
    } catch (error) {
      console.error('Error creating new draft:', error)
      toast.error('Kunne ikke opprette nytt utkast')
    }
  }

  return (
    <Button onClick={createNewDraft}>
      Opprett nytt utkast
    </Button>
  )
} 