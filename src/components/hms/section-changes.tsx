"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SelectHMSChangesDialog } from "@/app/(dashboard)/dashboard/hms-handbook/select-hms-changes-dialog"

interface Props {
  sectionId: string
  isEditing?: boolean
}

export function SectionChanges({ sectionId, isEditing }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="space-y-4">
      {isEditing && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(true)}
          >
            Tilknytt HMS-endringer
          </Button>
        </div>
      )}

      <SelectHMSChangesDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        sectionId={sectionId}
      />
    </div>
  )
} 