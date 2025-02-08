"use client"

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { formatDate } from "@/lib/utils/date"
import { Button } from "@/components/ui/button"
import { Trash2, Maximize2, Minimize2 } from "lucide-react"
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

interface ImageGalleryProps {
  images: Array<{
    id: string
    url: string
    fullUrl?: string
    caption?: string | null
    createdAt: Date
  }>
  onDeleteClick?: (image: any) => void
}

export function ImageGallery({ images, onDeleteClick }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<DeviationImage | null>(null)
  const [imageToDelete, setImageToDelete] = useState<DeviationImage | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [fallbackUrls, setFallbackUrls] = useState<Record<string, string>>({})
  const [isFullscreen, setIsFullscreen] = useState(false)

  const getImageUrl = (image: { url: string, id: string }) => {
    // Hvis vi allerede har en fallback URL for dette bildet, bruk den
    if (fallbackUrls[image.id]) {
      return fallbackUrls[image.id]
    }
    
    // Hvis URL-en allerede er en full URL, bruk den
    if (image.url.startsWith('http')) {
      return image.url
    }
    
    // Ellers, bruk vår proxy
    return `/api/images/${image.url}`
  }

  const handleImageError = (image: { url: string, id: string }) => {
    // Generer direkte URL som fallback
    const directUrl = `https://storage.googleapis.com/innutio-hms/${image.url}`
    console.log('Trying direct URL:', directUrl)
    
    // Lagre fallback URL-en for dette bildet
    setFallbackUrls(prev => ({
      ...prev,
      [image.id]: directUrl
    }))
  }

  const handleDelete = async (image: DeviationImage) => {
    if (onDeleteClick) {
      onDeleteClick(image)
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/deviations/${image.deviationId}/images/${image.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Kunne ikke slette bilde')
      }

      toast.success('Bilde slettet')
      setImageToDelete(null)
      setSelectedImage(null)

    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Kunne ikke slette bilde')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (!images?.length) {
    return <p className="text-muted-foreground">Ingen bilder lastet opp</p>
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <Dialog key={image.id} onOpenChange={(open) => {
            if (!open) {
              setSelectedImage(null)
              setIsFullscreen(false)
            }
          }}>
            <DialogTrigger asChild>
              <div className="relative aspect-square group">
                <button
                  className="relative w-full h-full overflow-hidden rounded-lg border"
                  onClick={() => setSelectedImage(image as unknown as DeviationImage)}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={image.caption || "Bilde"}
                    className={`
                      object-cover w-full h-full
                      ${isFullscreen ? 'cursor-zoom-out' : 'cursor-zoom-in'}
                    `}
                    onClick={toggleFullscreen}
                    onError={() => handleImageError(image)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
                {onDeleteClick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteClick(image)
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </DialogTrigger>
            {selectedImage?.id === image.id && (
              <DialogContent className={`${isFullscreen ? 'w-screen h-screen max-w-none !p-0' : 'max-w-4xl'}`}>
                <div className={`relative ${isFullscreen ? 'h-full' : 'aspect-video'}`}>
                  <img
                    src={getImageUrl(image)}
                    alt={image.caption || "Bilde"}
                    className={`
                      object-contain w-full h-full
                      ${isFullscreen ? 'cursor-zoom-out' : 'cursor-zoom-in'}
                    `}
                    onClick={toggleFullscreen}
                    onError={() => handleImageError(image)}
                  />
                  <button
                    onClick={toggleFullscreen}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-5 w-5" />
                    ) : (
                      <Maximize2 className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {!isFullscreen && (
                  <div className="mt-2 flex justify-between items-start">
                    <div>
                      {image.caption && (
                        <p className="text-sm">{image.caption}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Lastet opp {formatDate(image.createdAt)}
                      </p>
                    </div>
                    {onDeleteClick && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setImageToDelete(image as unknown as DeviationImage)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Slett bilde
                      </Button>
                    )}
                  </div>
                )}
              </DialogContent>
            )}
          </Dialog>
        ))}
      </div>

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
    </>
  )
} 