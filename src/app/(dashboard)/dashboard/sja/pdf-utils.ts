import { SJAWithRelations } from "./types"
import { formatDate } from "@/lib/utils/date"
import { jsPDF } from "jspdf"
import autoTable from 'jspdf-autotable'
import { statusLabels } from "@/lib/constants/sja"
import { FareSymbol } from "@prisma/client"

export async function generatePDF(sja: SJAWithRelations) {
  const doc = new jsPDF()
  
  // Tittel og header
  doc.setFontSize(20)
  doc.text("Sikker Jobb Analyse", 14, 20)
  
  // Generell informasjon
  doc.setFontSize(12)
  doc.text(`Tittel: ${sja.tittel}`, 14, 35)
  doc.text(`Arbeidssted: ${sja.arbeidssted}`, 14, 42)
  doc.text(`Status: ${statusLabels[sja.status]}`, 14, 49)
  doc.text(`Startdato: ${formatDate(sja.startDato)}`, 14, 56)
  if (sja.sluttDato) {
    doc.text(`Sluttdato: ${formatDate(sja.sluttDato)}`, 14, 63)
  }
  
  // Produkter fra stoffkartotek
  doc.setFontSize(14)
  doc.text("Produkter fra stoffkartotek", 14, 77)
  
  const produktData = sja.produkter.map(p => [
    p.produkt.produktnavn,
    p.produkt.produsent || 'Ikke spesifisert',
    p.mengde || 'Ikke spesifisert',
    p.produkt.fareSymboler?.map((fs: any) => fs.symbol).join(', ') || 'Ingen'
  ])
  
  autoTable(doc, {
    startY: 82,
    head: [['Produkt', 'Produsent', 'Mengde', 'Faresymboler']],
    body: produktData
  })
  
  // Beskrivelse
  const currentY = (doc as any).lastAutoTable.finalY + 15
  doc.setFontSize(14)
  doc.text("Beskrivelse", 14, currentY)
  doc.setFontSize(12)
  doc.text(sja.beskrivelse, 14, currentY + 7)
  
  // Risikoer og tiltak
  const risikoY = currentY + 25
  doc.setFontSize(14)
  doc.text("Identifiserte risikoer", 14, risikoY)
  
  if (sja.risikoer && Array.isArray(sja.risikoer) && sja.risikoer.length > 0) {
    const risikoData = sja.risikoer.map((r: any) => [
      r.beskrivelse,
      sja.tiltak
        .filter((t: any) => t.risikoId === r.id)
        .map((t: any) => `• ${t.beskrivelse}`)
        .join('\n') || 'Ingen tiltak registrert'
    ])
    
    autoTable(doc, {
      startY: risikoY + 5,
      head: [['Risiko', 'Tiltak']],
      body: risikoData
    })
  } else {
    doc.setFontSize(12)
    doc.text("Ingen risikoer registrert", 14, risikoY + 7)
  }
  
  // Vedlegg
  const vedleggY = (doc as any).lastAutoTable?.finalY + 15 || risikoY + 25
  doc.setFontSize(14)
  doc.text("Vedlegg", 14, vedleggY)
  
  if (sja.vedlegg && Array.isArray(sja.vedlegg) && sja.vedlegg.length > 0) {
    let currentY = vedleggY + 10

    for (const vedlegg of sja.vedlegg) {
      try {
        const isImage = vedlegg.type?.startsWith('image/') || 
                       /\.(jpg|jpeg|png|gif)$/i.test(vedlegg.url)

        if (isImage) {
          console.log('Processing image:', vedlegg.navn)
          
          // Hent signert URL fra vår egen API
          const response = await fetch(`/api/sja/${sja.id}/vedlegg/image?url=${encodeURIComponent(vedlegg.url)}`)
          if (!response.ok) {
            throw new Error('Kunne ikke hente signert URL')
          }
          
          const { url: signedUrl } = await response.json()
          
          // Last ned bildet med signert URL
          const imageResponse = await fetch(signedUrl)
          if (!imageResponse.ok) {
            throw new Error('Kunne ikke laste ned bildet')
          }

          const blob = await imageResponse.blob()
          console.log('Blob type:', blob.type)
          
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })

          // Beregn bildestørrelse (maks 180px bredde for A4-side)
          const img = new Image()
          await new Promise((resolve) => {
            img.onload = resolve
            img.src = base64
          })

          const maxWidth = 180
          const ratio = img.height / img.width
          const width = Math.min(maxWidth, img.width)
          const height = width * ratio

          // Sjekk om vi trenger ny side
          if (currentY + height > doc.internal.pageSize.height - 20) {
            doc.addPage()
            currentY = 20
          }

          // Legg til bildenavn
          doc.setFontSize(12)
          doc.text(vedlegg.navn, 14, currentY)
          currentY += 7

          // Legg til bildet
          doc.addImage(base64, 'JPEG', 14, currentY, width, height)
          currentY += height + 10

        } else {
          if (currentY > doc.internal.pageSize.height - 30) {
            doc.addPage()
            currentY = 20
          }
          doc.setFontSize(12)
          doc.text(`📎 ${vedlegg.navn} (${vedlegg.type || 'Ukjent type'})`, 14, currentY)
          currentY += 7
        }
      } catch (error) {
        console.error(`Error processing vedlegg ${vedlegg.navn}:`, error)
        doc.setFontSize(12)
        doc.text(`❌ Kunne ikke laste: ${vedlegg.navn}`, 14, currentY)
        currentY += 7
      }
    }
  } else {
    doc.setFontSize(12)
    doc.text("Ingen vedlegg", 14, vedleggY + 10)
  }
  
  // Footer med metadata
  doc.setFontSize(10)
  const pageHeight = doc.internal.pageSize.height
  doc.text(`Opprettet av: ${sja.opprettetAv?.name || 'Ukjent'}`, 14, pageHeight - 20)
  doc.text(`Dato: ${formatDate(sja.opprettetDato as any)}`, 14, pageHeight - 15)
  doc.text(`Bedrift: ${sja.company?.name || 'Ukjent'}`, 14, pageHeight - 10)
  
  // Last ned PDF
  doc.save(`SJA-${sja.id}.pdf`)
}
