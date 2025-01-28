"use client"

import { DeviationView } from "./deviation-view"
import { useRouter } from "next/navigation"
import { Deviation, DeviationImage, DeviationMeasure } from "@prisma/client"

interface DeviationWithRelations extends Deviation {
  measures: DeviationMeasure[]
  images: (DeviationImage & {
    fullUrl?: string
  })[]
}

export function DeviationClient({ 
  initialData, 
  id 
}: { 
  initialData: DeviationWithRelations
  id: string 
}) {
  const router = useRouter()

  const deviationWithFullUrls = {
    ...initialData,
    images: initialData.images.map(image => ({
      ...image,
      fullUrl: `https://storage.googleapis.com/innutio-prod/${image.url}`
    }))
  }

  const handleUpdate = async () => {
    router.refresh()
    setTimeout(() => {
      router.refresh()
    }, 100)
  }

  return <DeviationView 
    deviation={deviationWithFullUrls} 
    id={id} 
    onUpdate={handleUpdate}
  />
} 