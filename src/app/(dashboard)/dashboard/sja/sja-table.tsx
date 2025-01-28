"use client"

import { useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { SJAWithRelations } from "./types"
import { AddSJAModal } from "./add-sja-modal"
import { EditSJAModal } from "./edit-sja-modal"
import { BehandleSJAModal } from "./behandle-sja-modal"
import { SlettSJADialog } from "./slett-sja-dialog"
import { toast } from "sonner"
import { generatePDF } from "./pdf-utils"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface SJATableProps {
  data: SJAWithRelations[]
  onBehandle: (sja: SJAWithRelations) => void
}

export function SJATable({ data, onBehandle }: SJATableProps) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [behandleModalOpen, setBehandleModalOpen] = useState(false)
  const [slettDialogOpen, setSlettDialogOpen] = useState(false)
  const [selectedSJA, setSelectedSJA] = useState<SJAWithRelations | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const queryClient = useQueryClient()

  const handleAdd = (nySja: SJAWithRelations) => {
    if (onBehandle) {
      onBehandle(nySja)
    }
    toast.success("SJA opprettet")
  }

  const handleEdit = (oppdatertSja: SJAWithRelations) => {
    if (onBehandle) {
      onBehandle(oppdatertSja)
    }
    toast.success("SJA oppdatert")
  }

  const handleBehandle = async (oppdatertSja: SJAWithRelations) => {
    if (onBehandle) {
      await onBehandle(oppdatertSja)
    }
  }

  const handleGeneratePDF = async (sja: SJAWithRelations) => {
    setIsGeneratingPDF(true)
    try {
      await generatePDF(sja)
      toast.success("PDF generert")
    } catch (error) {
      toast.error("Kunne ikke generere PDF")
      console.error(error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">

      </div>

      <DataTable 
        columns={columns({ 
          onEdit: (sja) => {
            setSelectedSJA(sja)
            setEditModalOpen(true)
          },
          onBehandle: (sja) => {
            setSelectedSJA(sja)
            setBehandleModalOpen(true)
          },
          onSlett: (sja) => {
            setSelectedSJA(sja)
            setSlettDialogOpen(true)
          },
          onGeneratePDF: handleGeneratePDF,
          isGeneratingPDF
        })} 
        data={data}
        searchColumn="tittel"
      />

      <AddSJAModal 
        open={addModalOpen}
        onOpenChange={(open: boolean | undefined) => setAddModalOpen(open || false)}
        onAdd={handleAdd as (sja: SJAWithRelations | undefined) => void}
      />

      {selectedSJA && (
        <>
          <EditSJAModal
            sja={selectedSJA}
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onEdit={handleEdit}
          />

          <BehandleSJAModal
            sja={selectedSJA}
            open={behandleModalOpen}
            onOpenChange={setBehandleModalOpen}
            onBehandle={handleBehandle}
          />

          <SlettSJADialog
            sja={selectedSJA}
            open={slettDialogOpen}
            onOpenChange={setSlettDialogOpen}
            onSlett={(id) => {
              setSlettDialogOpen(false)
              setSelectedSJA(null)
            }}
          />
        </>
      )}
    </div>
  )
}
