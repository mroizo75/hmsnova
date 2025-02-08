"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface CreateVersionButtonProps {
  companyId: string
  userId: string
}

export function CreateVersionButton({ companyId, userId }: CreateVersionButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async () => {
    try {
      console.log("CreateVersionButton Props:", { companyId, userId })
      console.log("Starting handbook creation...")

      const response = await fetch("/api/hms-handbook/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          companyId,
          userId 
        })
      })

      console.log("Response status:", response.status)
      const responseData = await response.json()
      console.log("Response data:", responseData)

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create handbook")
      }

      router.refresh()
    } catch (error) {
      console.error("Detailed error in CreateVersionButton:", error)
    }
  }

  return (
    <Button 
      onClick={handleCreate} 
      disabled={isLoading}
    >
      {isLoading ? "Oppretter..." : "Opprett ny versjon"}
    </Button>
  )
} 