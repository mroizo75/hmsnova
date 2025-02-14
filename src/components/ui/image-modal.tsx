import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"
import Image from "next/image"
import { Button } from "./button"

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
}

export function ImageModal({ isOpen, onClose, imageUrl }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0">
        <div className="relative">
          <DialogTitle className="sr-only">
            Forstørret bilde visning
          </DialogTitle>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-50 bg-black/20 hover:bg-black/40 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4 text-white" />
            <span className="sr-only">Lukk</span>
          </Button>

          <div className="relative w-full aspect-video">
            <Image
              src={imageUrl}
              alt="Forstørret bilde"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 