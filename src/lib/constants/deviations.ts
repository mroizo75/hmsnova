export const typeLabels: Record<string, string> = {
  NEAR_MISS: "Nestenulykke",
  INCIDENT: "Hendelse",
  ACCIDENT: "Ulykke",
  IMPROVEMENT: "Forbedringsforslag",
  OBSERVATION: "Observasjon"
}

export const severityLabels: Record<string, string> = {
  LOW: "Lav",
  MEDIUM: "Middels",
  HIGH: "Høy",
  CRITICAL: "Kritisk"
}

export const DEVIATION_STATUS = {
  OPEN: 'AAPEN',
  IN_PROGRESS: 'PAAGAAR',
  COMPLETED: 'FULLFOERT',
  CLOSED: 'LUKKET',
  NEW: 'NY'
} as const

export const statusLabels: Record<string, string> = {
  DRAFT: 'Utkast',
  OPEN: 'Åpen',
  IN_PROGRESS: 'Under arbeid',
  SCHEDULED: 'Planlagt',
  CLOSED: 'Lukket',
  COMPLETED: 'Fullført',
  CANCELLED: 'Kansellert',
  AAPEN: 'Åpen',
  PAAGAAR: 'Under arbeid',
  LUKKET: 'Lukket'
}

export const categoryOptions = [
  { value: "HMS", label: "HMS" },
  { value: "KVALITET", label: "Kvalitet" },
  { value: "MILJØ", label: "Miljø" },
  { value: "SIKKERHET", label: "Sikkerhet" }
]

export const severityColors: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800"
}

export const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  OPEN: 'bg-red-100 text-red-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  CLOSED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  AAPEN: 'bg-red-100 text-red-800',
  PAAGAAR: 'bg-yellow-100 text-yellow-800',
  LUKKET: 'bg-green-100 text-green-800'
} 