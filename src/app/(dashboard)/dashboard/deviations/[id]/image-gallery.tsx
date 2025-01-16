"use client"

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import Image from "next/image"
import { formatDate } from "@/lib/utils/date"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeviationImage {
  id: string
  url: string
  caption: string | null
  createdAt: Date
  deviationId: string
}

interface Props {
  images: DeviationImage[]
  onDeleteClick?: (image: DeviationImage) => void
}

function getImagePath(url: string): string {
  // Hvis URL-en er en full Google Storage URL, hent ut bare stien
  if (url.startsWith('https://storage.googleapis.com/')) {
    return url.replace(`https://storage.googleapis.com/${process.env.NEXT_PUBLIC_GOOGLE_CLOUD_BUCKET_NAME}/`, '')
  }
  // Ellers er det allerede en relativ sti
  return url
}

export function ImageGallery({ images, onDeleteClick }: Props) {
  const [selectedImage, setSelectedImage] = useState<DeviationImage | null>(null)
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [imageToDelete, setImageToDelete] = useState<DeviationImage | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchImageUrls = async () => {
      const urls: Record<string, string> = {}
      for (const image of images) {
        try {
          const imagePath = getImagePath(image.url)
          console.log('Fetching image path:', imagePath)
          const response = await fetch(`/api/images/${encodeURIComponent(imagePath)}`)
          if (response.ok) {
            urls[image.id] = response.url
          }
        } catch (error) {
          console.error('Error fetching image URL:', error)
        }
      }
      setImageUrls(urls)
    }

    fetchImageUrls()
  }, [images])

  const handleDelete = async (image: DeviationImage) => {
    if (onDeleteClick) {
      // Hvis vi har en ekstern håndtering, bruk den
      onDeleteClick(image)
      return
    }

    // Ellers bruk intern håndtering
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/deviations/${image.deviationId}/images/${image.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Kunne ikke slette bilde')
      }

      toast.success('Bilde slettet')
      setImageUrls(prev => {
        const newUrls = { ...prev }
        delete newUrls[image.id]
        return newUrls
      })
      
      setImageToDelete(null)
      setSelectedImage(null)

    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Kunne ikke slette bilde')
    } finally {
      setIsDeleting(false)
    }
  }

  if (images.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Ingen bilder er lastet opp ennå
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <Dialog key={image.id} onOpenChange={() => setSelectedImage(null)}>
            <DialogTrigger asChild>
              <div className="relative aspect-square group">
                <button
                  className="relative w-full h-full overflow-hidden rounded-lg border"
                  onClick={() => setSelectedImage(image)}
                >
                  {imageUrls[image.id] && (
                    <>
                      <Image
                        src={imageUrls[image.id]}
                        alt={image.caption || "Bilde"}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteClick ? onDeleteClick(image) : setImageToDelete(image)
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </DialogTrigger>
            {selectedImage?.id === image.id && imageUrls[image.id] && (
              <DialogContent className="max-w-3xl">
                <div className="relative aspect-video">
                  <Image
                    src={imageUrls[image.id]}
                    alt={image.caption || "Bilde"}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="mt-2 flex justify-between items-start">
                  <div>
                    {image.caption && (
                      <p className="text-sm">{image.caption}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Lastet opp {formatDate(image.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setImageToDelete(image)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Slett bilde
                  </Button>
                </div>
              </DialogContent>
            )}
          </Dialog>
        ))}
      </div>

      {!onDeleteClick && (
        <AlertDialog open={!!imageToDelete} onOpenChange={() => setImageToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
              <AlertDialogDescription>
                Dette vil permanent slette bildet. Denne handlingen kan ikke angres.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Avbryt</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => imageToDelete && handleDelete(imageToDelete)}
                disabled={isDeleting}
              >
                {isDeleting ? "Sletter..." : "Slett bilde"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
} 