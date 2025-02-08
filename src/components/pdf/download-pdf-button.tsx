"use client"

import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { SafetyRoundPDF } from "./safety-round-pdf"
import { SafetyRound } from "@/types/safety-rounds"

interface DownloadPDFButtonProps {
  data: SafetyRound
  filename?: string
}

export function DownloadPDFButton({ data, filename }: DownloadPDFButtonProps) {
  return (
    <PDFDownloadLink
      document={<SafetyRoundPDF data={data} />}
      fileName={filename || `vernerunde-${data.id}.pdf`}
    >
      {({ blob, url, loading, error }) => (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          Last ned PDF
        </Button>
      )}
    </PDFDownloadLink>
  )
} 