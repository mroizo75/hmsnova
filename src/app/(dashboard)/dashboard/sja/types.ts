import { SJA, User, Company, Risiko, Tiltak, SJAProdukt, SJAVedlegg, SJABilde, SJAStatus } from "@prisma/client"

export interface SJAWithRelations {
  id: string
  tittel: string
  arbeidssted: string
  beskrivelse: string
  startDato: Date
  sluttDato: Date | null
  status: SJAStatus
  produkter: Array<{
    produkt: {
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