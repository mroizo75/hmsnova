"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface UploadDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (file: File) => Promise<void>
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  onUpload
}: UploadDocumentDialogProps) {
  // ... resten av komponenten
}

// Flytt denne funksjonen til en separat fil, f.eks. src/lib/documents.ts
export async function uploadDocument({ file, type, metadata }: {
  file: File
  type: string
  metadata: Record<string, any>
}) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  formData.append('metadata', JSON.stringify(metadata))

  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('Kunne ikke laste opp fil')
  }

  return response.json()
} 