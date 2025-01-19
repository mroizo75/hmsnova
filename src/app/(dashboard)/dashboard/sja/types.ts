import { SJA, User, Company, Risiko, Tiltak, SJAProdukt, SJAVedlegg, SJABilde, SJAStatus } from "@prisma/client"

export interface SJAWithRelations {
  godkjenninger: any
  risikoer: boolean
  tiltak: any
  vedlegg: boolean
  opprettetAv: any
  opprettetDato(opprettetDato: any): unknown
  company: any
  id: string
  tittel: string
  arbeidssted: string
  beskrivelse: string
  startDato: Date
  sluttDato: Date | null
  status: SJAStatus
  produkter: Array<{
    mengde: string
    produktId: any
    produkt: {
      produktnavn: any
      produsent: string
      fareSymboler: any
      navn: string
    }
  }>
  
  // ... andre relasjoner
}

export interface RisikoFormData {
  aktivitet: string
  fare: string
  konsekvens: string
  sannsynlighet: number
  alvorlighet: number
  risikoVerdi: number
  tiltak: string
}

export interface TiltakFormData {
  beskrivelse: string
  ansvarlig: string
  frist?: Date
  status: string
}

export type RisikoNiva = 'LAV' | 'MIDDELS' | 'HØY'

export interface RisikoMatriseCell {
  sannsynlighet: number
  alvorlighet: number
  niva: RisikoNiva
  antall: number
  risikoer: Risiko[]
} 