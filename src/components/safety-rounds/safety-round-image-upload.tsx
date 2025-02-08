"use client"

import { ChangeEvent } from "react"

interface SafetyRoundImageUploadProps {
  onUpload: (file: File) => Promise<void>
  maxSize?: number
  accept?: string
}

export function SafetyRoundImageUpload({ 
  onUpload, 
  maxSize = 5, 
  accept = "image/*" 
}: SafetyRoundImageUploadProps) {
  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > maxSize * 1024 * 1024) {
      alert(`Filen er for stor. Maksimal størrelse er ${maxSize}MB`)
      return
    }

    await onUpload(file)
    event.target.value = '' // Reset input
  }

  return (
    <div>
      <input 
        type="file" 
        onChange={handleFileChange}
        accept={accept}
        className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100"
      />
    </div>
  )
} 