"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SafetyRoundStatus } from "@prisma/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  safetyRound: {
    id: string
    status: SafetyRoundStatus
  }
}

const statusLabels: Record<SafetyRoundStatus, string> = {
  DRAFT: 'Kladd',
  IN_PROGRESS: 'Under arbeid',
  COMPLETED: 'Fullført',
  CANCELLED: 'Kansellert',
  SCHEDULED: 'Planlagt'
}

export function UpdateStatusDialog({ open, onOpenChange, safetyRound }: Props) {
  const router = useRouter()

  async function updateStatus(status: SafetyRoundStatus) {
    try {
      const res = await fetch(`/api/safety-rounds/${safetyRound.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!res.ok) throw new Error()

      onOpenChange(false)
      toast.success('Status oppdatert')
      router.refresh()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Kunne ikke oppdatere status')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Oppdater status</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(statusLabels).map(([value, label]) => (
            <Button
              key={value}
              variant={value === safetyRound.status ? 'default' : 'outline'}
              onClick={() => updateStatus(value as SafetyRoundStatus)}
              className="w-full"
            >
              {label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
} 