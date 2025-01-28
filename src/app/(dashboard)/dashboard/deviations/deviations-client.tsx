"use client"

import { useState } from "react"
import { DeviationList } from "./deviation-list"
import { CreateDeviationDialog } from "./create-deviation-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Deviation } from "@/lib/types/deviation"

interface Props {
  deviations: Deviation[]
}

export function DeviationsClient({ deviations }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Avviksbehandling</h1>
          <p className="text-muted-foreground">
            Registrering og oppfølging av avvik og hendelser
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nytt avvik
        </Button>
      </div>

      <DeviationList deviations={deviations} />

      <CreateDeviationDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </div>
  )
} 