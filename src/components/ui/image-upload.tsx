"use client"

import { UploadCloud, X } from "lucide-react"
import { Button } from "./button"
import { useState } from "react"
import Image from "next/image"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  apiEndpoint: string
}

export function ImageUpload({ value, onChange, apiEndpoint }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Kunne ikke laste opp bilde')
      }

      const data = await response.json()
      onChange(data.path)
      
      // Hent signert URL for preview
      const previewResponse = await fetch(`/api/storage/${encodeURIComponent(data.path)}`)
      if (previewResponse.ok) {
        const { url } = await previewResponse.json()
        setPreviewUrl(url)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    if (value) {
      try {
        await fetch(`/api/storage/${encodeURIComponent(value)}`, {
          method: 'DELETE'
        })
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    }
    onChange("")
    setPreviewUrl(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="imageUpload"
          onChange={handleUpload}
          disabled={isUploading}
        />
        <label
          htmlFor="imageUpload"
          className="cursor-pointer"
        >
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
          >
            <UploadCloud className="h-4 w-4 mr-2" />
            {isUploading ? "Laster opp..." : "Last opp bilde"}
          </Button>
        </label>
        {(value || previewUrl) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {(value || previewUrl) && (
        <div className="relative aspect-square w-32 overflow-hidden rounded-lg border">
          <Image
            src={previewUrl || value}
            alt="Opplastet bilde"
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  )
} 