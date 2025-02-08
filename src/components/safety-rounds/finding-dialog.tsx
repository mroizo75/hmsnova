"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  safetyRoundId: string
  checklistItemId: string
}

export function FindingDialog({ open, onOpenChange, safetyRoundId, checklistItemId }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrer funn</DialogTitle>
        </DialogHeader>
        {/* Implementer resten av innholdet senere */}
      </DialogContent>
    </Dialog>
  )
} 