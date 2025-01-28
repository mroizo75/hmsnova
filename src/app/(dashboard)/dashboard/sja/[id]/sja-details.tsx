"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/date"
import { Upload, ExternalLink, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { AddVedleggModal } from "../add-vedlegg-modal"
import { Badge } from "@/components/ui/badge"
import { statusLabels, statusColors } from "@/lib/constants/sja"
import { SJAStatus } from "@prisma/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"

interface SJADetailsProps {
  sja: any
  userRole: string
}

export function SJADetails({ sja, userRole }: SJADetailsProps) {
  console.log('SJA data:', JSON.stringify(sja, null, 2))
  
  const [addVedleggOpen, setAddVedleggOpen] = useState(false)
  const isAdmin = userRole === "COMPANY_ADMIN"
  const router = useRouter()

  // Sikre at arrays alltid eksisterer
  const risikoer = sja.risikoer ?? []
  const tiltak = sja.tiltak ?? []
  const produkter = sja.produkter ?? []
  const vedlegg = sja.vedlegg ?? []
  const godkjenninger = sja.godkjenninger ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Tilbake
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
        {isAdmin && (
          <Button onClick={() => setAddVedleggOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Legg til vedlegg
          </Button>
        )}
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
              <dt className="font-medium">Opprettet av</dt>
              <dd>{sja.opprettetAv.name}</dd>
            </div>
            <div>
              <dt className="font-medium">Opprettet dato</dt>
              <dd>{formatDate(sja.opprettetDato)}</dd>
            </div>
          </dl>
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
            {risikoer.map((risiko: any) => (
              <div key={risiko.id} className="border-b pb-4 last:border-0">
                <h3 className="font-medium">{risiko.beskrivelse}</h3>
                <ul className="mt-2 space-y-2">
                  {tiltak.map((tiltak: any) => (
                    <li key={tiltak.id} className="text-sm">
                      • {tiltak.beskrivelse}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Vedlegg</h2>
          {vedlegg.length > 0 ? (
            <ul className="space-y-2">
              {vedlegg.map((v: any) => (
                <li key={v.id}>
                  <Link 
                    href={v.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {v.navn}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Ingen vedlegg lagt til</p>
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
                {risikoer.map((risiko: any) => (
                  <TableRow key={risiko.id}>
                    <TableCell>{risiko.aktivitet}</TableCell>
                    <TableCell>{risiko.fare}</TableCell>
                    <TableCell>{risiko.sannsynlighet}</TableCell>
                    <TableCell>{risiko.alvorlighet}</TableCell>
                    <TableCell>{risiko.risikoVerdi}</TableCell>
                  </TableRow>
                ))}
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

      <AddVedleggModal
        open={addVedleggOpen}
        onOpenChange={setAddVedleggOpen}
        sjaId={sja.id}
      />
    </div>
  )
} 