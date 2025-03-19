"use client"

import { Input } from "@/components/ui/input"
import { LucideUpload } from "lucide-react"
import { useState } from "react"

export default function FileUploader() {
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileName(file?.name || null)
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <label className="border rounded-md p-4 text-center cursor-pointer hover:bg-gray-50">
        <div className="flex flex-col items-center">
          <LucideUpload className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="cursor-pointer font-medium text-sm text-blue-600 hover:text-blue-800">
            Klikk for å laste opp fil
          </span>
          <Input 
            id="fileUpload" 
            name="documentFile" 
            type="file" 
            className="hidden" 
            accept="image/*,.pdf"
            onChange={handleFileChange}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Godkjente formater: JPG, PNG, PDF (maks 10MB)
          </p>
          {fileName && (
            <p className="mt-2 text-sm font-medium text-green-600">{fileName}</p>
          )}
        </div>
      </label>
    </div>
  )
} 