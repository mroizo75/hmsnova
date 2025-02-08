"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils/date"
import { FindingStatus } from "@prisma/client"

interface Props {
  findingId: string
  isOpen: boolean
  onClose: () => void
  currentStatus: FindingStatus
  lastUpdatedBy?: {
    name: string | null
    email: string
  } | null
  lastUpdatedAt?: Date | null
  currentComment?: string | null
}

const FINDING_STATUSES = {
  OPEN: 'Åpen',
  IN_PROGRESS: 'Under arbeid',
  RESOLVED: 'Lukket',
  CLOSED: 'Avsluttet'
} as const

export function UpdateFindingStatusDialog({ 
  findingId, 
  isOpen, 
  onClose, 
  currentStatus,
  lastUpdatedBy,
  lastUpdatedAt,
  currentComment 
}: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [comment, setComment] = useState(currentComment || '')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function onSubmit() {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/safety-rounds/findings/${findingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, comment }),
      })

      if (!response.ok) throw new Error('Kunne ikke oppdatere status')

      toast.success('Status oppdatert')
      router.refresh()
      onClose()
    } catch (error) {
      toast.error('Noe gikk galt')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Oppdater status på funn</DialogTitle>
          <DialogDescription>
            Velg ny status og legg til en kommentar om nødvendig.
            {lastUpdatedBy && lastUpdatedAt && (
              <p className="mt-2 text-sm text-muted-foreground">
                Sist oppdatert av {lastUpdatedBy.name || lastUpdatedBy.email} den {formatDate(lastUpdatedAt)}
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Velg status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FINDING_STATUSES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Legg til kommentar (valgfritt)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Avbryt</Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? 'Oppdaterer...' : 'Oppdater status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 