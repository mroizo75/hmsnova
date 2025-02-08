import type { 
  SafetyRound, 
  SafetyRoundTemplate, 
  SafetyRoundParticipant,
  SafetyRoundFinding,
  SafetyRoundImage,
  User,
  SafetyRoundStatus,
  FindingSeverity,
  FindingStatus,
  ParticipantRole
} from "@prisma/client"

export type SafetyRoundWithRelations = SafetyRound & {
  template: Pick<SafetyRoundTemplate, "id" | "name"> | null
  assignedUser: Pick<User, "id" | "name" | "email" | "image"> | null
  participants: Array<{
    role: ParticipantRole
    user: Pick<User, "id" | "name" | "email" | "image">
  }>
  findings: Array<SafetyRoundFinding & {
    images: SafetyRoundImage[]
  }>
  images: SafetyRoundImage[]
} 