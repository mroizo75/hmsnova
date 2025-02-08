"use client"

import { DeviationView } from "./deviation-view"
import { useRouter } from "next/navigation"
import type { Deviation, DeviationImage, DeviationMeasure } from "@prisma/client"

type DeviationWithRelations = Deviation & {
  measures: DeviationMeasure[]
  images: DeviationImage[]
}

export function DeviationClient({ 
  initialData, 
  id 
}: { 
  initialData: DeviationWithRelations
  id: string 
}) {
  const router = useRouter()

  console.log('Initial data images:', initialData.images)

  const deviationWithFullUrls = {
    ...initialData,
    images: initialData.images.map(image => {
      console.log('Processing image:', image)
      const fullUrl = image.url.startsWith('http') 
        ? image.url 
        : `/api/images/${image.url}`
      console.log('Generated fullUrl:', fullUrl)
      return {
        ...image,
        fullUrl
      }
    })
  }

  console.log('Final deviation with URLs:', deviationWithFullUrls)

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