import prisma from "@/lib/db"
import { sendEmail } from "@/lib/email/send-email"
import { CompetenceExpiryEmailTemplate } from "@/components/email/competence-expiry-email"
import { render } from "@react-email/render"

/**
 * Sjekker etter kompetansebevis som utløper snart og sender varsler
 * Denne jobben bør kjøres daglig
 */
export async function checkExpiringCompetencies() {
  try {
    console.log("Starter sjekk av utløpende kompetansebevis...")
    
    // Hent alle aktive bedrifter med kompetansemodulen aktivert
    const companies = await prisma.company.findMany({
      where: {
        isActive: true,
        modules: {
          some: {
            key: "COMPETENCE",
            isActive: true
          }
        }
      }
    })
    
    let totalNotificationsSent = 0
    
    // For hver bedrift, sjekk etter utløpende kompetansebevis
    for (const company of companies) {
      console.log(`Sjekker utløpende kompetansebevis for bedrift: ${company.name}`)
      
      // Hent alle kompetansetyper for bedriften for å få varslingskonfigurasjon
      const competenceTypes = await prisma.competenceType.findMany({
        where: { companyId: company.id, isActive: true }
      })
      
      // For hver kompetansetype, finn utløpende kompetansebevis
      for (const competenceType of competenceTypes) {
        const reminderMonths = competenceType.reminderMonths || 3
        
        // Beregn dato for varsling basert på reminderMonths
        const now = new Date()
        const futureDate = new Date()
        futureDate.setDate(now.getDate() + 1) // Sjekk for i morgen
        
        const reminderDate = new Date()
        reminderDate.setMonth(now.getMonth() + reminderMonths)
        
        // Finn kompetansebevis som utløper om nøyaktig reminderMonths måneder
        // og som ikke allerede har fått varsel
        const expiringCompetencies = await prisma.competence.findMany({
          where: {
            competenceTypeId: competenceType.id,
            expiryDate: {
              gte: futureDate,
              lte: reminderDate
            },
            verificationStatus: 'VERIFIED',
            // Sjekk om det ikke allerede er sendt varsel for denne utløpsdatoen
            NOT: {
              notifications: {
                some: {
                  type: 'COMPETENCE_EXPIRY',
                  createdAt: {
                    gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Siste 7 dager
                  }
                }
              }
            }
          },
          include: {
            user: true,
            competenceType: true
          }
        })
        
        console.log(`Fant ${expiringCompetencies.length} utløpende kompetansebevis for ${competenceType.name}`)
        
        // Send varsler for hvert utløpende kompetansebevis
        for (const competence of expiringCompetencies) {
          const daysUntilExpiry = Math.ceil(
            (competence.expiryDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          )
          
          // Opprett varsel i systemet
          await prisma.notification.create({
            data: {
              userId: competence.userId,
              title: `Kompetansebevis utløper snart: ${competence.competenceType.name}`,
              message: `Ditt kompetansebevis for ${competence.competenceType.name} utløper om ${daysUntilExpiry} dager (${formatDate(competence.expiryDate!)}). Vennligst forny det før det utløper.`,
              type: 'COMPETENCE_EXPIRY',
              isRead: false,
              metadata: {
                competenceId: competence.id,
                expiryDate: competence.expiryDate,
                daysUntilExpiry
              }
            }
          })
          
          // Send e-post til brukeren
          if (competence.user.email) {
            const emailHtml = render(
              CompetenceExpiryEmailTemplate({
                userName: competence.user.name || 'Ansatt',
                competenceName: competence.competenceType.name,
                expiryDate: formatDate(competence.expiryDate!),
                daysUntilExpiry,
                companyName: company.name
              })
            )
            
            await sendEmail({
              to: competence.user.email,
              subject: `Kompetansebevis utløper snart: ${competence.competenceType.name}`,
              html: emailHtml
            })
          }
          
          totalNotificationsSent++
        }
        
        // Varsle også bedriftsadministratorer om utløpende kompetansebevis
        if (expiringCompetencies.length > 0) {
          const admins = await prisma.user.findMany({
            where: {
              companyId: company.id,
              role: 'COMPANY_ADMIN'
            }
          })
          
          for (const admin of admins) {
            await prisma.notification.create({
              data: {
                userId: admin.id,
                title: `${expiringCompetencies.length} kompetansebevis utløper snart`,
                message: `${expiringCompetencies.length} kompetansebevis for ${competenceType.name} utløper innen ${reminderMonths} måneder. Sjekk oversikten for detaljer.`,
                type: 'COMPETENCE_EXPIRY_ADMIN',
                isRead: false,
                metadata: {
                  competenceTypeId: competenceType.id,
                  count: expiringCompetencies.length
                }
              }
            })
            
            totalNotificationsSent++
          }
        }
      }
    }
    
    console.log(`Fullført sjekk av utløpende kompetansebevis. Sendt ${totalNotificationsSent} varsler.`)
    return { success: true, notificationsSent: totalNotificationsSent }
  } catch (error) {
    console.error("Feil ved sjekk av utløpende kompetansebevis:", error)
    return { success: false, error }
  }
}

// Hjelpefunksjon for å formatere dato
function formatDate(date: Date): string {
  return date.toLocaleDateString('nb-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
} 