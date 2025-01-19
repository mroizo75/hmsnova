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

interface SJATableProps {
  data: SJAWithRelations[]
}

export function SJATable({ data }: SJATableProps) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [behandleModalOpen, setBehandleModalOpen] = useState(false)
  const [slettDialogOpen, setSlettDialogOpen] = useState(false)
  const [selectedSJA, setSelectedSJA] = useState<SJAWithRelations | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handleAdd = (nySja: SJAWithRelations) => {
    setData(prev => [nySja, ...prev])
    toast.success("SJA opprettet")
  }

  const handleEdit = (oppdatertSja: SJAWithRelations) => {
    setData(prev => prev.map((sja: { id: string }) => 
      sja.id === oppdatertSja.id ? oppdatertSja : sja
    ))
    toast.success("SJA oppdatert")
  }

  const handleBehandle = (oppdatertSja: SJAWithRelations) => {
    setData(prev => prev.map((sja: { id: string }) => 
      sja.id === oppdatertSja.id ? oppdatertSja : sja
    ))
    toast.success("SJA behandlet")
  }

  const handleSlett = (sjaId: string) => {
    setData(prev => prev.filter((sja: { id: string }) => sja.id !== sjaId))
    toast.success("SJA slettet")
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
            onSlett={handleSlett}
          />
        </>
      )}
    </div>
  )
} 

function setData(arg0: (prev: any) => any[]) {
  throw new Error("Function not implemented.")
}
