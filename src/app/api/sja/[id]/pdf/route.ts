import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { prisma } from "@/lib/prisma"
import { getSignedUrl } from "@/lib/storage"
import { formatDate } from "@/lib/utils/date"
import { statusLabels } from "@/lib/constants/sja"
import type { Prisma, SJAStatus } from "@prisma/client"

type SJAWithIncludes = Prisma.SJAGetPayload<{
  include: {
    opprettetAv: true
    company: true
    risikoer: {
      include: {
        tiltak: true
      }
    }
    produkter: {
      include: {
        produkt: {
          include: {
            fareSymboler: true
          }
        }
      }
    }
    bilder: true
  }
}>

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Ikke autorisert", { status: 401 })
    }

    const sja = await prisma.sJA.findUnique({
      where: { id: params.id },
      include: {
        opprettetAv: true,
        company: {
          include: {
            address: true
          }
        },
        risikoer: true,
        tiltak: true,
        produkter: {
          include: {
            produkt: {
              include: {
                fareSymboler: true
              }
            }
          }
        },
        bilder: true
      }
    })

    if (!sja) {
      return new NextResponse("SJA ikke funnet", { status: 404 })
    }

    const pdfDoc = await PDFDocument.create()
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    let page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    let yPos = height - 50

    // Hjelpefunksjoner
    const addText = (text: string, { isBold = false, size = 12, indent = 0 }) => {
      if (yPos < 50) {
        page = pdfDoc.addPage()
        yPos = height - 50
      }
      page.drawText(text, {
        x: 50 + indent,
        y: yPos,
        size,
        font: isBold ? helveticaBold : helvetica
      })
      yPos -= size + 8
    }

    // Ny hjelpefunksjon for å tegne tabellrader
    const drawTableRow = (label: string, value: string, y: number) => {
      // Tegn bakgrunn for raden
      page.drawRectangle({
        x: 50,
        y: y - 15,
        width: width - 100,
        height: 20,
        color: rgb(0.97, 0.97, 0.97),
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      })
      
      // Tegn label og verdi
      page.drawText(label, {
        x: 60,
        y: y - 10,
        size: 10,
        font: helveticaBold,
      })
      
      page.drawText(value, {
        x: 200,
        y: y - 10,
        size: 10,
        font: helvetica,
      })
      
      return y - 25 // Returner ny y-posisjon
    }

    // Header med bedriftsinformasjon
    addText(sja.company.name, { isBold: true, size: 20 })
    if (sja.company.address) {
      addText(`${sja.company.address.street} ${sja.company.address.streetNo}`, { size: 10 })
      addText(`${sja.company.address.postalCode} ${sja.company.address.city}`, { size: 10 })
      addText(sja.company.address.country, { size: 10 })
    }
    addText(`Org.nr: ${sja.company.orgNumber}`, { size: 10 })
    yPos -= 20

    // SJA Tittel
    addText("SIKKER JOBB ANALYSE (SJA)", { isBold: true, size: 16 })
    addText(`Dokument ID: ${sja.id}`, { size: 10 })
    yPos -= 20

    // Prosjektinformasjon som tabell
    addText("Prosjektinformasjon:", { isBold: true, size: 14 })
    yPos -= 20

    const infoItems = [
      { label: "Tittel:", value: sja.tittel },
      { label: "Arbeidssted:", value: sja.arbeidssted },
      { label: "Status:", value: statusLabels[sja.status as SJAStatus] },
      { label: "Startdato:", value: formatDate(sja.startDato) },
      { label: "Sluttdato:", value: sja.sluttDato ? formatDate(sja.sluttDato) : "Ikke satt" },
      { label: "Opprettet av:", value: sja.opprettetAv?.name || "Ukjent" },
      { label: "Deltakere:", value: sja.deltakere }
    ]

    for (const item of infoItems) {
      yPos = drawTableRow(item.label, item.value, yPos)
    }
    yPos -= 20

    // Produkter
    if (sja.produkter.length > 0) {
      addText("Produkter fra stoffkartotek:", { isBold: true, size: 14 })
      for (const p of sja.produkter) {
        addText(`• ${p.produkt.produktnavn}`, { indent: 10 })
        addText(`  Produsent: ${p.produkt.produsent || 'Ikke spesifisert'}`, { indent: 20 })
        if (p.mengde) {
          addText(`  Mengde: ${p.mengde}`, { indent: 20 })
        }
      }
      yPos -= 20
    }

    // Risikoer og tiltak
    if (sja.risikoer.length > 0) {
      addText("Identifiserte risikoer og tiltak:", { isBold: true, size: 14 })
      for (const risiko of sja.risikoer) {
        const risikoVerdi = risiko.sannsynlighet * risiko.alvorlighet
        
        addText(`Aktivitet: ${risiko.aktivitet}`, { indent: 10 })
        addText(`Fare: ${risiko.fare}`, { indent: 10 })
        addText(`Risikoverdi: ${risiko.sannsynlighet} × ${risiko.alvorlighet} = ${risikoVerdi}`, { indent: 10 })
        
        const relaterteTiltak = sja.tiltak.filter((t: any) => t.risikoId === risiko.id)
        if (relaterteTiltak.length > 0) {
          addText("Tiltak:", { indent: 20 })
          for (const tiltak of relaterteTiltak) {
            addText(`• ${tiltak.beskrivelse}`, { indent: 30 })
          }
        }
        yPos -= 10
      }
    }

    // Bilder med størrelseskontroll
    if (sja.bilder.length > 0) {
      // Start på toppen av siden hvis det er lite plass
      if (yPos < 300) {
        page = pdfDoc.addPage()
        yPos = height - 50
      }

      addText("Bilder:", { isBold: true, size: 14 })
      yPos -= 20

      for (const bilde of sja.bilder) {
        try {
          const signedUrl = await getSignedUrl(`companies/${sja.companyId}/${bilde.url}`)
          const imageResponse = await fetch(signedUrl)
          const imageArrayBuffer = await imageResponse.arrayBuffer()

          let pdfImage
          try {
            pdfImage = await pdfDoc.embedJpg(imageArrayBuffer)
          } catch {
            pdfImage = await pdfDoc.embedPng(imageArrayBuffer)
          }

          // Beregn bildestørrelse med maksbredde på 400 punkter
          const maxWidth = 400
          const maxHeight = height - 100  // Maksimal høyde justert for footer (50px) og margin
          let { height: imgHeight, width: imgWidth } = pdfImage.scale(1)
          let width = imgWidth  // Bruk riktig startbredde

          // Beregn skalering basert på tilgjengelig plass
          const availableHeight = yPos - 50 // 50px for footer
          if (imgHeight > availableHeight) {
            // Hvis bildet er for høyt for gjenstående plass, start ny side
            if (imgHeight > maxHeight) {
              // Skaler ned bildet hvis det er større enn maksimal høyde
              const scale = maxHeight / imgHeight
              width *= scale
              imgHeight = maxHeight
            }
            page = pdfDoc.addPage()
            yPos = height - 50
          }

          // Beregn skalering for bredde hvis nødvendig
          if (width > maxWidth) {
            const scale = maxWidth / width
            width *= scale
            imgHeight *= scale
          }

          // Sentrer bildet
          const xPos = (page.getSize().width - width) / 2
          const imageY = yPos - imgHeight

          // Tegn bildet
          page.drawImage(pdfImage, {
            x: xPos,
            y: imageY,
            width,
            height: imgHeight,
          })

          // Oppdater y-posisjon og legg til beskrivelse
          yPos = imageY - 30
          if (bilde.beskrivelse) {
            const textWidth = helvetica.widthOfTextAtSize(bilde.beskrivelse, 10)
            const textX = (page.getSize().width - textWidth) / 2
            page.drawText(bilde.beskrivelse, {
              x: textX,
              y: yPos + 10,
              size: 10,
              font: helvetica
            })
            yPos -= 20
          }

          // Sjekk om vi har plass til neste bilde
          if (yPos < 100) {
            page = pdfDoc.addPage()
            yPos = height - 50
          }
        } catch (error) {
          console.error('Feil ved prosessering av bilde:', error)
          continue
        }
      }
    }

    // Footer på hver side
    const pageCount = pdfDoc.getPageCount()
    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i)
      const { height } = page.getSize()
      page.drawText(`${sja.company.name} - Side ${i + 1} av ${pageCount}`, {
        x: 50,
        y: 30,
        size: 8,
        font: helvetica
      })
      page.drawText(formatDate(new Date()), {
        x: 450,
        y: 30,
        size: 8,
        font: helvetica
      })
    }

    const pdfBytes = await pdfDoc.save()
    
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="SJA-${sja.id}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Feil ved generering av PDF:', error)
    return new NextResponse("Serverfeil", { status: 500 })
  }
} 