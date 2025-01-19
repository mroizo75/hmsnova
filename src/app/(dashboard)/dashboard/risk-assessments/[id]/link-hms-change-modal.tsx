interface LinkHMSChangeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hazards?: Array<{
    id: string
    description: string
    riskLevel: number
  }>
}

export function LinkHMSChangeModal({ open, onOpenChange, hazards = [] }: LinkHMSChangeModalProps) {
  // ... resten av komponenten
} 