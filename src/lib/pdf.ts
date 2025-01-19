import { SafetyRound } from "@prisma/client"

export async function generatePDF(safetyRound: SafetyRound): Promise<Buffer> {
  // Her kan du implementere PDF-generering med f.eks. PDFKit eller lignende
  // For nå returnerer vi en dummy buffer
  return Buffer.from(`
    Vernerunde Rapport
    ------------------
    Tittel: ${safetyRound.title}
    Dato: ${safetyRound.createdAt}
    Status: ${safetyRound.status}
  `)
} 