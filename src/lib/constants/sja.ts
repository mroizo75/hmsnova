import { SJAStatus } from "@prisma/client"

export const statusLabels: Record<SJAStatus, string> = {
  UTKAST: "Utkast",
  SENDT_TIL_GODKJENNING: "Sendt til godkjenning",
  GODKJENT: "Godkjent",
  AVVIST: "Avvist",
  UTGATT: "Utgått"
}

export const statusColors: Record<SJAStatus, string> = {
  UTKAST: "secondary",
  SENDT_TIL_GODKJENNING: "warning",
  GODKJENT: "success",
  AVVIST: "destructive",
  UTGATT: "default"
} 