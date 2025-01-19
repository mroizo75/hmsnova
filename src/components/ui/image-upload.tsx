"use client"

import { ChangeEvent } from "react"

export interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    throw new Error("Function not implemented.")
  }

  return (
    <div>
      <input 
        type="file" 
        onChange={handleFileChange} 
        disabled={disabled} 
        className={disabled ? "opacity-50 cursor-not-allowed" : ""} 
      />
      {value && <img src={value} alt="Uploaded" />}
      {disabled && <p className="text-muted-foreground">Kan ikke endre bilde</p>}
    </div>
  )
} 