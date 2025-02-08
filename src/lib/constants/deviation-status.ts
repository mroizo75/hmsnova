import { Status } from "@prisma/client"

// De tillatte statusene for avvik
export const DEVIATION_STATUSES = {
  OPEN: Status.OPEN,
  IN_PROGRESS: Status.IN_PROGRESS,
  CLOSED: Status.CLOSED
} as const

// For debugging
console.log('Available deviation statuses:', DEVIATION_STATUSES)

// Norske labels for avviksstatuser
export const deviationStatusLabels: Record<Status, string> = {
  [Status.OPEN]: "Åpen",
  [Status.IN_PROGRESS]: "Pågår",
  [Status.CLOSED]: "Lukket",
  // Legg til resten for å tilfredsstille TypeScript, men disse vil ikke bli brukt for avvik
  DRAFT: "Utkast",
  SCHEDULED: "Planlagt",
  COMPLETED: "Fullført",
  CANCELLED: "Kansellert",
  AAPEN: "Åpen",
  PAAGAAR: "Pågår",
  LUKKET: "Lukket"
}

// Hjelpefunksjon for å sjekke om en status er gyldig for avvik
export function isValidDeviationStatus(status: Status): boolean {
  return Object.values(DEVIATION_STATUSES).includes(status)
} 