import { Status } from "@prisma/client"

export const statusLabels: Record<Status, string> = {
  DRAFT: "Utkast",
  OPEN: "Åpen",
  IN_PROGRESS: "Pågår",
  SCHEDULED: "Planlagt",
  COMPLETED: "Fullført",
  CLOSED: "Lukket",
  CANCELLED: "Kansellert",
  AAPEN: "Åpen",
  PAAGAAR: "Pågår",
  LUKKET: "Lukket"
}

// Hjelpefunksjon for å få norsk status-tekst
export function getStatusLabel(status: Status): string {
  return statusLabels[status] || status
} 