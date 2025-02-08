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

  async function createNewVersion() {
    console.log('Creating new version with:', { version, companyId })
    try {
      const response = await fetch('/api/hms-handbook/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fromVersion: version,
          companyId 
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Server error:', errorData)
        throw new Error(errorData.message || 'Kunne ikke opprette ny versjon')
      }

      const data = await response.json()
      console.log('New version created:', data)
      router.push(`/dashboard/hms-handbook/draft/${data.id}`)
    } catch (error) {
      console.error('Error creating new version:', error)
      toast.error('Kunne ikke opprette ny versjon')
    }
  }

  return (
    <Button onClick={createNewVersion}>
      Opprett ny versjon
    </Button>
  )
} 