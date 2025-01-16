import { randomBytes } from "crypto"

export async function generateApprovalToken(roundId: string): Promise<string> {
  // Generer en tilfeldig token på 32 bytes (64 hex-tegn)
  const randomToken = randomBytes(32).toString('hex')
  
  // Kombiner med roundId for å gjøre det mer unikt
  return `${roundId}-${randomToken}`
} 