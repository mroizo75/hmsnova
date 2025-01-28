"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { AddMeasureDialog } from "./add-measure-dialog"
import { ImageUpload } from "./image-upload"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MeasureList } from "./measure-list"
import { ImageGallery } from "./image-gallery"
import { UpdateStatusDialog } from "./update-status-dialog"
import { typeLabels, severityLabels, statusLabels, severityColors, statusColors } from "@/lib/constants/deviations"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
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
import { HMSChanges } from "@/components/hms/hms-changes"
import { CloseDeviationDialog } from "./close-deviation-dialog"

interface DeviationImage {
  id: string
  url: string
  caption: string | null
  createdAt: Date
  deviationId: string
}

interface Deviation {
  id: string
  title: string
  description: string
  status: string
  severity: string
  type: string
  category: string
  location?: string
  dueDate?: Date
  createdAt: Date
  closedAt?: Date
  measures: any[]
  images: DeviationImage[]
}

interface DeviationDetailsProps {
  deviation: Deviation
  onUpdate: () => Promise<void>
}

export function DeviationDetails({ deviation, onUpdate }: DeviationDetailsProps) {
  const router = useRouter()
  const [measureDialogOpen, setMeasureDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<DeviationImage | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [canClose, setCanClose] = useState(true)
  const [isClosing, setIsClosing] = useState(false)
  const [hasHMSChanges, setHasHMSChanges] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)

  const handleDeleteImage = async (image: DeviationImage) => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/deviations/${deviation.id}/images/${image.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Kunne ikke slette bilde')
      }

      toast.success('Bilde slettet')
      setImageToDelete(null)
      
      // Oppdater siden for å vise endringene
      router.refresh()

    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Kunne ikke slette bilde')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!deviation) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/deviations">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tilbake
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              {deviation?.title}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {deviation?.category} • {typeLabels[deviation?.type]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UpdateStatusDialog
            deviation={deviation}
            open={statusDialogOpen}
            onOpenChange={setStatusDialogOpen}
            onUpdate={onUpdate}
          />
          <AddMeasureDialog
            deviationId={deviation.id}
            open={measureDialogOpen}
            onOpenChange={setMeasureDialogOpen}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Beskrivelse</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {deviation?.description}
                </p>
              </div>
              {deviation?.location && (
                <div>
                  <h3 className="font-semibold mb-1">Sted</h3>
                  <p className="text-muted-foreground">{deviation?.location}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tiltak</h2>
              <Button onClick={() => setMeasureDialogOpen(true)}>
                Legg til tiltak
              </Button>
            </div>
            <MeasureList 
              deviationId={deviation.id}
              measures={deviation.measures}
            />
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Bilder</h2>
              <ImageUpload deviationId={deviation.id} />
            </div>
            <ImageGallery 
              images={deviation.images} 
              onDeleteClick={setImageToDelete}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge className={statusColors[deviation.status]}>
                  {statusLabels[deviation.status]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Alvorlighetsgrad
                </p>
                <Badge className={severityColors[deviation.severity]}>
                  {severityLabels[deviation.severity]}
                </Badge>
              </div>
              {deviation.dueDate && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Frist</p>
                  <p>{formatDate(deviation.dueDate)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Opprettet</p>
                <p>{formatDate(deviation.createdAt)}</p>
              </div>
              {deviation.closedAt && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Lukket</p>
                  <p>{formatDate(deviation.closedAt)}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Fremdrift</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fullførte tiltak</span>
                <span className="font-medium">
                  {deviation.measures.filter(m => m.status === 'COMPLETED').length}/
                  {deviation.measures.length}
                </span>
              </div>
              {/* Legg til flere statistikker her */}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>HMS-endringer</CardTitle>
          <CardDescription>
            Endringer i HMS-systemet som følge av dette avviket (valgfritt)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HMSChanges 
            deviationId={deviation.id} 
            onHasChanges={(hasChanges) => {
              setHasHMSChanges(hasChanges)
            }}
          />
        </CardContent>
      </Card>

      <Button 
        onClick={() => setCloseDialogOpen(true)}
        disabled={isClosing || (hasHMSChanges && !canClose)}
      >
        Lukk avvik
      </Button>

      <CloseDeviationDialog
        deviationId={deviation.id}
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        onSuccess={onUpdate}
        isClosing={isClosing}
      />

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
              onClick={() => imageToDelete && handleDeleteImage(imageToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? "Sletter..." : "Slett bilde"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 