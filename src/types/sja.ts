/**
 * Type-definisjoner for SJA (Sikker Jobb Analyse)
 */

// Grunnleggende bruker-informasjon
export interface User {
  id: string;
  name: string;
  email: string;
}

// Definerer risiko-aspekter av SJA
export interface Risk {
  id: string;
  aktivitet: string;        // Aktivitet som vurderes
  fare: string;             // Potensielle farer
  konsekvens?: string;      // Mulig konsekvens
  sannsynlighet: number;    // Vurdering 1-5
  alvorlighet: number;      // Vurdering 1-5
  risikoVerdi: number;      // Beregnet risikoverdi (sannsynlighet * alvorlighet)
}

// Definerer tiltak
export interface Task {
  id: string;
  beskrivelse: string;      // Beskrivelse av tiltaket
  ansvarlig: string;        // Hvem er ansvarlig
  status: string;           // Status (PLANLAGT, PÅGÅENDE, FULLFØRT, etc.)
  frist?: Date | string;    // Frist for ferdigstillelse
}

// Bilde knyttet til SJA
export interface Image {
  id: string;
  url: string;              // URL til bildet
}

// Produkt-referanse
export interface Product {
  id: string;
  produktId: string;
  produkt?: {
    produktnavn: string;
  };
}

// Mulige statuser for en SJA
export type SJAStatus = 'PLANLAGT' | 'PÅGÅENDE' | 'FULLFØRT' | 'KANSELLERT';

// SJA-objekt med relasjoner
export interface SJAWithRelations {
  id: string;
  tittel: string;
  arbeidssted: string;
  beskrivelse: string;
  status: SJAStatus;
  opprettetDato: string;
  oppdatertDato: string;
  startDato: string;
  sluttDato?: string;
  companyId: string;
  opprettetAvId: string;
  location: string;
  
  // Relasjoner
  opprettetAv?: User;
  risikoer: Risk[];
  tiltak: Task[];
  bilder: Image[];
  produkter: Product[];
  deltakere?: string[];
}

// SJA-objekt uten relasjoner for input
export interface SJAInput {
  tittel: string;
  arbeidssted: string;
  beskrivelse: string;
  status?: SJAStatus;
  startDato: string;
  sluttDato?: string;
  deltakere?: string[];
  risikoer?: Omit<Risk, 'id'>[];
  tiltak?: Omit<Task, 'id'>[];
  bilder?: string[];
  produkter?: Product[];
} 