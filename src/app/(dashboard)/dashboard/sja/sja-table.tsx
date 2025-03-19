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
import { PDFDownloadButton, getSignedImageUrls, getSignedAttachmentUrls, SJAPDFDocument } from "./pdf-util"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { optimizeImageUrl } from "@/lib/utils/image-utils"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils/date"
import Link from "next/link"
import { statusLabels, statusColors } from "@/lib/constants/sja"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface SJATableProps {
  data: SJAWithRelations[]
  onBehandle: (sja: SJAWithRelations) => void
  onDelete?: (id: string) => void
}

export function SJATable({ data, onBehandle, onDelete }: SJATableProps) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [behandleModalOpen, setBehandleModalOpen] = useState(false)
  const [slettModalOpen, setSlettModalOpen] = useState(false)
  const [selectedSJA, setSelectedSJA] = useState<SJAWithRelations | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const queryClient = useQueryClient()
  const [loadingPdf, setLoadingPdf] = useState<Record<string, boolean>>({})
  const [pdfUrls, setPdfUrls] = useState<Record<string, {
    images: Record<string, string>,
    attachments: Record<string, string>
  }>>({})
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false)

  // Optimalisert data med forbedret bildebehandling
  const [optimizedImages, setOptimizedImages] = useState<Record<string, string>>({})

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

  const handlePDFDownload = async (sja: SJAWithRelations) => {
    try {
      setLoadingPdf(prev => ({ ...prev, [sja.id]: true }))
      setSelectedSJA(sja)
      
      // Hent signerte URL-er for bilder
      const signedImageUrls = await getSignedImageUrls(sja)
      
      // Hent signerte URL-er for vedlegg
      const signedAttachmentUrls = await getSignedAttachmentUrls(sja)
      
      // Lagre signerte URLs for denne SJA-en
      setPdfUrls(prev => ({
        ...prev,
        [sja.id]: {
          images: signedImageUrls,
          attachments: signedAttachmentUrls
        }
      }))
      
      // Åpne PDF-dialogen
      setPdfDialogOpen(true)
      
      return { ready: true, signedImageUrls, signedAttachmentUrls }
    } catch (error) {
      console.error('Feil ved generering av PDF:', error)
      toast.error("Kunne ikke generere PDF. Prøv igjen senere.")
      return { ready: false }
    } finally {
      setLoadingPdf(prev => ({ ...prev, [sja.id]: false }))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">

      </div>

      <div className="rounded-md border bg-white">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium">Tittel</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Arbeidssted</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Startdato</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium">Handlinger</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {data.map((sja) => (
                <tr key={sja.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle">
                    <Link href={`/dashboard/sja/${sja.id}`} className="text-blue-600 hover:underline">
                      {sja.tittel}
                    </Link>
                  </td>
                  <td className="p-4 align-middle">{sja.arbeidssted}</td>
                  <td className="p-4 align-middle">{sja.startDato ? new Date(sja.startDato).toLocaleDateString('nb-NO') : '-'}</td>
                  <td className="p-4 align-middle">
                    <Badge className={statusColors[sja.status as keyof typeof statusColors]}>
                      {statusLabels[sja.status as keyof typeof statusLabels]}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Åpne meny</span>
                          <DotsHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/sja/${sja.id}`}>Vis detaljer</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/sja/${sja.id}/edit`}>Rediger</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onSelect={async (e) => {
                            e.preventDefault()
                            await handlePDFDownload(sja)
                          }}
                          disabled={loadingPdf[sja.id]}
                        >
                          {loadingPdf[sja.id] ? 'Genererer PDF...' : 'Last ned som PDF'}
                        </DropdownMenuItem>
                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onSelect={(e) => {
                                e.preventDefault()
                                if (confirm('Er du sikker på at du vil slette denne SJA-en?')) {
                                  onDelete(sja.id)
                                }
                              }}
                            >
                              Slett
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Dialog */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Last ned SJA som PDF</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {selectedSJA && pdfUrls[selectedSJA.id] && (
              <div className="text-center">
                <p className="mb-4">Klikk på knappen under for å laste ned PDF for {selectedSJA.tittel}</p>
                <PDFDownloadButton 
                  sja={selectedSJA} 
                  signedImageUrls={pdfUrls[selectedSJA.id].images}
                  signedAttachmentUrls={pdfUrls[selectedSJA.id].attachments}
                  fileName={`SJA-${selectedSJA.tittel.replace(/\s+/g, '_')}.pdf`}
                  buttonText="Last ned PDF"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
