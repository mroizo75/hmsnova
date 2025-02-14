import { SJA, User, Company, Risiko, Tiltak, SJAProdukt, SJAVedlegg, SJABilde, SJAGodkjenning, Address } from "@prisma/client"
import { ReactNode } from "react"

export interface RisikoWithRelations extends Risiko {
  [x: string]: any
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
  risikoId: string
}

export interface SJABildeWithRelations extends SJABilde {
  id: string
  url: string
  beskrivelse: string | null
  sjaId: string
  lastetOppAvId: string
  lastetOppDato: Date
}

export interface SJAWithRelations {
  id: string
  tittel: string
  arbeidssted: string
  startDato: Date
  sluttDato?: Date
  status: string
  createdAt: Date
  updatedAt: Date
  company: (Company & {
    address: Address | null
  }) | null
  opprettetAv: Pick<User, "name" | "email" | "role"> | null
  risikoer: Risiko[]
  tiltak: Tiltak[]
  produkter: (SJAProdukt & {
    produkt: {
      produktnavn: string
      produsent: string | null
    }
  })[]
  bilder: SJABilde[]
  godkjenninger: (SJAGodkjenning & {
    godkjentAv: Pick<User, "name" | "email">
  })[]
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