"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/date"
import { Upload, ExternalLink, ArrowLeft, Image as ImageIcon, FileText } from "lucide-react"
import { useState } from "react"
import { AddVedleggModal } from "../add-vedlegg-modal"
import { Badge } from "@/components/ui/badge"
import { statusLabels, statusColors } from "@/lib/constants/sja"
import { SJAStatus } from "@prisma/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { useSignedUrls } from '@/hooks/use-signed-urls'
import Image from 'next/image'
import { ImageModal } from "@/components/ui/image-modal"
import { toast } from 'react-hot-toast'
import { LocationButton } from '../location-button'
import { getSignedImageUrls, getSignedAttachmentUrls, SJAPDFDocument } from '@/app/(dashboard)/dashboard/sja/pdf-util'
import ReactPDF from '@react-pdf/renderer'

interface SJADetailsProps {
  sja: any
  userRole: string
}

export function SJADetails({ sja, userRole }: SJADetailsProps) {
  const [addVedleggOpen, setAddVedleggOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const isAdmin = userRole === "COMPANY_ADMIN"
  const router = useRouter()

  // Sikre at arrays alltid eksisterer
  const risikoer = sja?.risikoer ?? []
  const tiltak = sja?.tiltak ?? []
  const produkter = sja?.produkter ?? []
  const vedlegg = sja?.vedlegg ?? []
  const bilder = sja?.bilder ?? []
  const godkjenninger = sja?.godkjenninger ?? []

  // Hjelpefunksjon for å konstruere full URL
  const getFullImageUrl = (path: string) => {
    if (!path || path.trim() === '') return null
    return `companies/${sja.companyId}/${path}`
  }

  // Samle alle URLer som faktisk eksisterer
  const urlsToSign = [
    ...(vedlegg?.map((v: any) => v.url) || []),
    ...(bilder?.map((b: any) => getFullImageUrl(b.url)) || [])
  ].filter(Boolean)

  const { signedUrls, loading: urlsLoading, error: urlError } = useSignedUrls(urlsToSign)

  // Bildegalleri-seksjonen
  const renderBilder = () => {
    if (!sja) return <p>Laster...</p>
    
    if (urlsLoading) {
      return <p>Laster bilder...</p>
    }

    if (urlError) {
      return <p className="text-red-500">Kunne ikke laste bilder: {urlError}</p>
    }

    if (!bilder?.length) {
      return <p className="text-muted-foreground">Ingen bilder er lagt til</p>
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bilder.map((bilde: any, index: number) => {
          const fullUrl = getFullImageUrl(bilde.url)
          const signedUrl = signedUrls[fullUrl as string]
          
          if (!signedUrl || !bilde.url) return null

          return (
            <div 
              key={bilde.id} 
              className="relative aspect-video group cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedImage(signedUrl)}
            >
              <Image
                src={signedUrl}
                alt={bilde.beskrivelse || `Bilde ${index + 1}`}
                fill
                className="object-cover rounded-lg"
                priority={index < 3} // Prioriter de første 3 bildene
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  async function getBase64FromUrl(url: string): Promise<string> {
    const response = await fetch(url)
    const blob = await response.blob()
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        // Fjern data:image/jpeg;base64, fra starten
        const base64Clean = base64.split(',')[1]
        resolve(base64Clean)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const generatePDF = async () => {
    try {
      // Hent signerte URL-er for bilder og vedlegg
      const signedImageUrls = await getSignedImageUrls(sja);
      const signedAttachmentUrls = await getSignedAttachmentUrls(sja);
      
      // Generer PDF
      const blob = await ReactPDF.pdf(<SJAPDFDocument 
        sja={sja} 
        signedImageUrls={signedImageUrls} 
        signedAttachmentUrls={signedAttachmentUrls} 
      />).toBlob();
      
      // Lagre PDF
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SJA-${sja.tittel.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('PDF generert');
    } catch (error) {
      console.error('Feil ved generering av PDF:', error);
      toast.error('Kunne ikke generere PDF. Prøv på nytt senere.');
    }
  }

  // Hjelpefunksjon for å beregne risikoverdi
  const beregnRisikoverdi = (sannsynlighet: number, alvorlighet: number) => {
    return sannsynlighet * alvorlighet;
  }

  const getRisikoNivå = (risikoVerdi: number) => {
    // Bestem risikonivå og farge basert på risikoverdi
    if (risikoVerdi > 15) return { verdi: risikoVerdi, nivå: "Høy", color: "text-red-600" }
    if (risikoVerdi > 8) return { verdi: risikoVerdi, nivå: "Middels", color: "text-yellow-600" }
    return { verdi: risikoVerdi, nivå: "Lav", color: "text-green-600" }
  }

  if (!sja) return <div>Laster...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/dashboard/sja')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Tilbake til oversikt
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{sja.tittel}</h1>
          <div className="mt-2">
            <Badge variant={statusColors[sja.status as SJAStatus] as any}>
              {statusLabels[sja.status as SJAStatus]}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button onClick={() => router.push(`/dashboard/sja/${sja.id}/edit`)}>
                Rediger
              </Button>
              <Button onClick={() => setAddVedleggOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Legg til vedlegg
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Generell informasjon</h2>
          <dl className="space-y-2">
            <div>
              <dt className="font-medium">Arbeidssted</dt>
              <dd>{sja.arbeidssted}</dd>
            </div>
            <div>
              <dt className="font-medium">Beskrivelse</dt>
              <dd>{sja.beskrivelse}</dd>
            </div>
            <div>
              <dt className="font-medium">Startdato</dt>
              <dd>{formatDate(sja.startDato)}</dd>
            </div>
            {sja.sluttDato && (
              <div>
                <dt className="font-medium">Sluttdato</dt>
                <dd>{formatDate(sja.sluttDato)}</dd>
              </div>
            )}
            <div>
              <dt className="font-medium">Deltakere</dt>
              <dd>{sja.deltakere}</dd>
            </div>
            <div>
              <dt className="font-medium">Opprettet av</dt>
              <dd>{sja.opprettetAv?.name}</dd>
            </div>
            <div>
              <dt className="font-medium">Opprettet dato</dt>
              <dd>{formatDate(sja.opprettetDato)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Lokasjon og værforhold</h2>
          {sja.location ? (
            <LocationButton
              sjaId={sja.id}
              initialLocation={sja.location}
            />
          ) : (
            <p className="text-muted-foreground">Ingen lokasjon registrert</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Produkter fra stoffkartotek</h2>
          <ul className="space-y-4">
            {produkter.map((p: any) => (
              <li key={p.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.produkt.produktnavn}</p>
                  <p className="text-sm text-muted-foreground">
                    Produsent: {p.produkt.produsent || 'Ikke spesifisert'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mengde: {p.mengde || "Ikke spesifisert"}
                  </p>
                  {p.produkt.fareSymboler?.length > 0 && (
                    <div className="mt-1">
                      <p className="text-sm font-medium">Faresymboler:</p>
                      <div className="flex gap-1 mt-1">
                        {p.produkt.fareSymboler.map((fs: any) => (
                          <span key={fs.id} className="text-xs bg-yellow-100 px-2 py-1 rounded">
                            {fs.symbol}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {p.produkt.databladUrl && (
                  <Link 
                    href={p.produkt.databladUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Datablad
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Risikoer og tiltak</h2>
          <div className="space-y-4">
            {risikoer.map((risiko: any, index: number) => {
              // Bruk den lagrede risikoVerdi eller beregn den hvis den ikke finnes
              const risikoVerdi = risiko.risikoVerdi || beregnRisikoverdi(risiko.sannsynlighet, risiko.alvorlighet);
              const { verdi, nivå, color } = getRisikoNivå(risikoVerdi);
              return (
                <div key={index} className="space-y-2 p-4 border rounded-lg">
                  <p><strong>Aktivitet:</strong> {risiko.aktivitet}</p>
                  <p><strong>Fare:</strong> {risiko.fare}</p>
                  <p>
                    <strong>Risikoverdi:</strong>{" "}
                    <span className={color}>
                      {risiko.sannsynlighet} × {risiko.alvorlighet} = {verdi} ({nivå})
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      (Sannsynlighet × Alvorlighet = Risikoverdi)
                    </span>
                  </p>
                  <ul className="mt-2 space-y-2">
                    {tiltak.map((tiltak: any) => (
                      <li key={tiltak.id} className="text-sm">
                        • {tiltak.beskrivelse}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Bilder</h2>
          {renderBilder()}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Vedlegg</h2>
          {urlsLoading ? (
            <p>Laster vedlegg...</p>
          ) : vedlegg.length > 0 ? (
            <ul className="space-y-2">
              {vedlegg.map((v: any) => (
                <li key={v.id}>
                  <Link 
                    href={signedUrls[v.url as string] || v.url}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {v.navn || 'Vedlegg'}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Ingen vedlegg er lagt til</p>
          )}
        </Card>
      </div>

      {/* Risikoer seksjon */}
      {risikoer.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Identifiserte risikoer</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aktivitet</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Sannsynlighet</TableHead>
                  <TableHead>Alvorlighet</TableHead>
                  <TableHead>Risikoverdi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {risikoer.map((risiko: any) => {
                  const risikoVerdi = risiko.risikoVerdi || beregnRisikoverdi(risiko.sannsynlighet, risiko.alvorlighet);
                  const { verdi, nivå, color } = getRisikoNivå(risikoVerdi);
                  return (
                    <TableRow key={risiko.id}>
                      <TableCell>{risiko.aktivitet}</TableCell>
                      <TableCell>{risiko.fare}</TableCell>
                      <TableCell>{risiko.sannsynlighet}</TableCell>
                      <TableCell>{risiko.alvorlighet}</TableCell>
                      <TableCell>{risikoVerdi}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tiltak seksjon */}
      {tiltak.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tiltak for å redusere risiko</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Beskrivelse</TableHead>
                  <TableHead>Ansvarlig</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Frist</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiltak.map((tiltak: any) => (
                  <TableRow key={tiltak.id}>
                    <TableCell>{tiltak.beskrivelse}</TableCell>
                    <TableCell>{tiltak.ansvarlig}</TableCell>
                    <TableCell>{tiltak.status}</TableCell>
                    <TableCell>{tiltak.frist ? formatDate(tiltak.frist) : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
      />

      <AddVedleggModal
        open={addVedleggOpen}
        onOpenChange={setAddVedleggOpen}
        sjaId={sja.id}
      />

      <Button 
        variant="outline" 
        onClick={generatePDF}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        Generer PDF
      </Button>
    </div>
  )
} 