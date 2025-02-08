export const SAFETY_ROUND_STATUSES = {
  DRAFT: "Utkast",
  SCHEDULED: "Planlagt",
  IN_PROGRESS: "Pågår",
  COMPLETED: "Fullført",
  APPROVED: "Godkjent"
} as const

export type SafetyRoundStatus = keyof typeof SAFETY_ROUND_STATUSES

export const getStatusBadgeVariant = (status: SafetyRoundStatus) => {
  const variants: Record<SafetyRoundStatus, "default" | "secondary" | "success" | "warning"> = {
    DRAFT: "secondary",
    SCHEDULED: "default",
    IN_PROGRESS: "warning",
    COMPLETED: "success",
    APPROVED: "success"
  }
  return variants[status]
} 