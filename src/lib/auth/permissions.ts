import prisma from "../db"

/**
 * Henter alle tillatelser som er tilknyttet en bruker
 * Basert på brukerens rolle i systemet
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  // Hent bruker og brukerens rolle
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })

  if (!user) {
    return []
  }

  // Tildel tillatelser basert på brukerens rolle
  switch (user.role) {
    case "ADMIN":
      return ["ADMIN", "HMS_RESPONSIBLE", "USER", "MANAGE_USERS", "MANAGE_COMPETENCE"]
    case "COMPANY_ADMIN":
      return ["ADMIN", "HMS_RESPONSIBLE", "USER", "MANAGE_USERS", "MANAGE_COMPETENCE"]
    case "SUPPORT":
      return ["ADMIN", "USER", "MANAGE_USERS", "SUPPORT"]
    case "EMPLOYEE":
      // Sjekk om ansatt er HMS-ansvarlig basert på metadata
      const metadata = user.metadata ? JSON.parse(typeof user.metadata === 'string' ? user.metadata : JSON.stringify(user.metadata)) : {}
      if (metadata.isHMSResponsible) {
        return ["HMS_RESPONSIBLE", "USER", "MANAGE_COMPETENCE"]
      }
      return ["USER"]
    default:
      return ["USER"]
  }
} 