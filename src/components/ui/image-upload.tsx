"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { Button } from "./button"
import { ImageIcon, UploadIcon } from "lucide-react"

interface ImageUploadProps {
  value?: string
  onChange: (file?: File) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onChange(acceptedFiles[0])
    }
  }, [onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1
  })

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={value} />
          <AvatarFallback>
            <ImageIcon className="h-10 w-10" />
          </AvatarFallback>
        </Avatar>
        {value && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onChange(undefined)}
          >
            Fjern bilde
          </Button>
        )}
      </div>
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition"
      >
        <input {...getInputProps()} />
        <UploadIcon className="h-6 w-6 mx-auto mb-2" />
        {isDragActive ? (
          <p>Slipp bildet her ...</p>
        ) : (
          <p>Dra og slipp et bilde her, eller klikk for å velge</p>
        )}
      </div>
    </div>
  )
} 