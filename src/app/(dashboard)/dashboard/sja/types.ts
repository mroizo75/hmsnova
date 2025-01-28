import { SJA, User, Company, Risiko, Tiltak, SJAProdukt, SJAVedlegg, SJABilde } from "@prisma/client"
import { ReactNode } from "react"

export interface RisikoWithRelations extends Risiko {
  id: string
  aktivitet: string
  fare: string
  konsekvens: string
  sannsynlighet: number
  alvorlighet: number
  risikoVerdi: number
  sjaId: string
}

export interface TiltakWithRelations extends Tiltak {
  id: string
  beskrivelse: string
  ansvarlig: string
  frist: Date | null
  status: string
  sjaId: string
}

export interface SJAWithRelations extends Partial<SJA> {
  success: any
  data: any
  risikoer: RisikoWithRelations[]
  tiltak: TiltakWithRelations[]
  produkter: Array<{
    mengde: string
    produkt: {
      produktnavn: string
      produsent: string
      fareSymboler: string[]
    }
  }>
  godkjenninger: Array<{
    id: string
    godkjentAv: {
      name: string | null
      email: string
    }
  }>
  opprettetAv: {
    name: string | null
    email: string
  }
  company: {
    name: string
    orgNumber: string
  }
  vedlegg?: Array<{
    id: string
    navn: string
  }>
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

export type SJAStatus = 
  | 'UTKAST' 
  | 'SENDT_TIL_GODKJENNING' 
  | 'GODKJENT' 
  | 'AVVIST' 
  | 'UTGATT'
  | 'SLETTET' 