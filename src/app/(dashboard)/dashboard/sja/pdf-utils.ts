import { SJAWithRelations } from "./types"
import { formatDate } from "@/lib/utils/date"
import { jsPDF } from "jspdf"
import autoTable from 'jspdf-autotable'
import { statusLabels } from "@/lib/constants/sja"

interface ImagePosition {
  x: number
  y: number
}

export async function generatePDF(sja: SJAWithRelations, signedImageUrls?: Record<string, string>) {
  const doc = new jsPDF()
  let yPos = 20 // Start y-posisjon
  
  // Tittel og header
  doc.setFontSize(20)
  doc.text("Sikker Jobb Analyse", 14, yPos)
  yPos += 20
  
  // Generell informasjon
  doc.setFontSize(12)
  doc.text(`Tittel: ${sja.tittel}`, 14, yPos); yPos += 7
  doc.text(`Arbeidssted: ${sja.arbeidssted}`, 14, yPos); yPos += 7
  doc.text(`Status: ${statusLabels[sja.status as keyof typeof statusLabels]}`, 14, yPos); yPos += 7
  doc.text(`Startdato: ${formatDate(sja.startDato as any)}`, 14, yPos); yPos += 7
  if (sja.sluttDato) {
    doc.text(`Sluttdato: ${formatDate(sja.sluttDato as any)}`, 14, yPos)
    yPos += 7
  }
  yPos += 10

  // Produkter fra stoffkartotek
  doc.setFontSize(14)
  doc.text("Produkter fra stoffkartotek", 14, yPos)
  yPos += 10

  const produktData = sja.produkter.map(p => [
    p.produkt.produktnavn,
    p.produkt.produsent || 'Ikke spesifisert',
    p.mengde || 'Ikke spesifisert',
    p.produkt.fareSymboler?.map((fs: any) => fs.symbol).join(', ') || 'Ingen'
  ])
  
  autoTable(doc, {
    startY: yPos,
    head: [['Produkt', 'Produsent', 'Mengde', 'Faresymboler']],
    body: produktData
  })
  
  yPos = (doc as any).lastAutoTable.finalY + 15

  // Risikoer og tiltak
  doc.setFontSize(14)
  doc.text("Identifiserte risikoer og tiltak", 14, yPos)
  yPos += 10

  if (sja.risikoer?.length > 0) {
    const risikoData = sja.risikoer.map(r => [
      r.aktivitet,
      r.fare,
      r.konsekvens,
      r.sannsynlighet.toString(),
      r.alvorlighet.toString(),
      r.risikoVerdi.toString(),
      sja.tiltak
        .filter((t: any) => t.risikoId === r.id)
        .map(t => `• ${t.beskrivelse}`)
        .join('\n') || 'Ingen tiltak'
    ])
    
    autoTable(doc, {
      startY: yPos,
      head: [['Aktivitet', 'Fare', 'Konsekvens', 'S', 'A', 'R', 'Tiltak']],
      body: risikoData,
      styles: { fontSize: 10 },
      columnStyles: {
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 15 }
      }
    })
    
    yPos = (doc as any).lastAutoTable.finalY + 15
  }

  // Bilder
  if (sja.bilder && sja.bilder.length > 0) {
    doc.setFontSize(14)
    doc.text("Bilder", 14, yPos)
    yPos += 10

    const imageWidth = 80
    const imageHeight = 60
    const margin = 14

    for (const bilde of sja.bilder) {
      try {
        if (yPos + imageHeight > doc.internal.pageSize.height - 20) {
          doc.addPage()
          yPos = 20
        }

        // Bygg full URL for bildet
        const fullPath = `companies/${sja.companyId}/${bilde.url}`
        
        // Hent signert URL
        const response = await fetch(`/api/sja/${sja.id}/pdf-images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: [fullPath] })
        })

        if (!response.ok) continue
        
        const { urls } = await response.json()
        const signedUrl = urls[0]?.signedUrl

        if (!signedUrl) continue

        // Last ned bildet
        const imageResponse = await fetch(signedUrl)
        if (!imageResponse.ok) continue

        const blob = await imageResponse.blob()
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })

        // Legg til bildet i PDF
        doc.addImage(base64, 'JPEG', margin, yPos, imageWidth, imageHeight)

        // Legg til beskrivelse hvis den finnes
        if (bilde.beskrivelse) {
          doc.setFontSize(10)
          doc.text(bilde.beskrivelse, margin, yPos + imageHeight + 5)
          yPos += imageHeight + 20
        } else {
          yPos += imageHeight + 10
        }
      } catch (error) {
        console.error('Feil ved prosessering av bilde:', error)
      }
    }
  }

  // Footer på hver side
  const pageCount = (doc as any).internal.pages.length
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    const pageHeight = doc.internal.pageSize.height
    doc.text(`Opprettet av: ${sja.opprettetAv?.name || 'Ukjent'}`, 14, pageHeight - 20)
    doc.text(`Dato: ${formatDate(sja.opprettetDato as any)}`, 14, pageHeight - 15)
    doc.text(`Side ${i} av ${pageCount}`, 14, pageHeight - 10)
  }

  return doc
}
