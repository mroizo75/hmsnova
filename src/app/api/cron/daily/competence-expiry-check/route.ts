import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/email";

// Sikkerhetsnøkkel som kreves fra miljøvariabel
const CRON_API_KEY = process.env.CRON_API_KEY;

export async function POST(req: NextRequest) {
  // Sikkerhetssjekk - verifiser API-nøkkel
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !CRON_API_KEY || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providedApiKey = authHeader.replace("Bearer ", "");
  if (providedApiKey !== CRON_API_KEY) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  try {
    console.log("[CRON] Starting daily competence expiry check");
    
    // Dagens dato
    const today = new Date();

    // Finn alle aktive kompetansetyper som har reminderMonths satt
    const competenceTypes = await prisma.competenceType.findMany({
      where: {
        isActive: true,
        validity: { gt: 0 },
        reminderMonths: { not: null }
      }
    });

    let totalNotificationsSent = 0;
    let totalEmailsSent = 0;

    // For hver kompetansetype
    for (const competenceType of competenceTypes) {
      const reminderMonths = competenceType.reminderMonths || 3;

      // Beregn datoen vi skal sende påminnelse ved
      // For eksempel, for en 3-måneders påminnelse, sjekk kompetanser som utløper om 3 måneder
      const reminderDate = new Date(today);
      reminderDate.setMonth(reminderDate.getMonth() + reminderMonths);
      
      // Sett til begynnelsen av dagen
      reminderDate.setHours(0, 0, 0, 0);
      
      // Finn dato for slutten av dagen
      const endOfDay = new Date(reminderDate);
      endOfDay.setHours(23, 59, 59, 999);

      console.log(`[CRON] Checking competencies of type "${competenceType.name}" expiring around ${reminderDate.toISOString().split('T')[0]}`);

      // Finn kompetanser av denne typen som utløper på denne datoen
      // og som ikke allerede har en aktiv påminnelse
      const expiringCompetencies = await prisma.competence.findMany({
        where: {
          competenceTypeId: competenceType.id,
          expiryDate: {
            gte: reminderDate,
            lte: endOfDay,
          },
          isActive: true,
          verificationStatus: "VERIFIED"
        },
        include: {
          user: true,
          competenceType: true
        }
      });

      console.log(`[CRON] Found ${expiringCompetencies.length} expiring competencies`);

      // For hver utløpende kompetanse, opprett en notifikasjon og send e-post
      for (const competence of expiringCompetencies) {
        // Sjekk om det allerede finnes en aktiv påminnelse for denne kompetansen
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: competence.userId,
            type: "COMPETENCE_EXPIRY",
            isRead: false,
            metadata: {
              path: ["competenceId"],
              equals: competence.id
            }
          }
        });

        if (!existingNotification) {
          // Opprett ny notifikasjon
          await prisma.notification.create({
            data: {
              userId: competence.userId,
              type: "COMPETENCE_EXPIRY",
              title: `Kompetanse utløper snart: ${competence.competenceType.name}`,
              message: `Din kompetanse "${competence.competenceType.name}" utløper ${competence.expiryDate?.toLocaleDateString('no-NO')}. Vennligst forny den før utløpsdato.`,
              isRead: false,
              metadata: {
                competenceId: competence.id
              }
            }
          });

          totalNotificationsSent++;

          // Send også e-post hvis brukeren har en e-postadresse
          if (competence.user.email) {
            try {
              await sendEmail({
                to: competence.user.email,
                subject: `Påminnelse: ${competence.competenceType.name} utløper snart`,
                text: `Hei ${competence.user.name},

Dette er en påminnelse om at din kompetanse "${competence.competenceType.name}" utløper ${competence.expiryDate?.toLocaleDateString('no-NO')}.

Vennligst forny denne kompetansen før utløpsdato for å sikre at du fortsatt har gyldig sertifisering.

Logg inn på HMS Nova for å se detaljer og laste opp ny dokumentasjon.

Vennlig hilsen,
HMS Nova-teamet`,
                html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Påminnelse om utløpende kompetanse</h2>
  <p>Hei ${competence.user.name},</p>
  <p>Dette er en påminnelse om at din kompetanse <strong>"${competence.competenceType.name}"</strong> utløper <strong>${competence.expiryDate?.toLocaleDateString('no-NO')}</strong>.</p>
  <p>Vennligst forny denne kompetansen før utløpsdato for å sikre at du fortsatt har gyldig sertifisering.</p>
  <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/employee/competence" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">Logg inn for å se detaljer</a></p>
  <p>Vennlig hilsen,<br>HMS Nova-teamet</p>
</div>`
              });
              
              totalEmailsSent++;
            } catch (error) {
              console.error(`[CRON] Failed to send email to ${competence.user.email}:`, error);
            }
          }
        }
      }

      // Finn også kompetanser som har utløpt i løpet av de siste 7 dagene
      // men som brukeren ikke har gjort noe med
      const recentlyExpiredDate = new Date(today);
      recentlyExpiredDate.setDate(recentlyExpiredDate.getDate() - 7);

      const recentlyExpiredCompetencies = await prisma.competence.findMany({
        where: {
          competenceTypeId: competenceType.id,
          expiryDate: {
            lt: today,
            gte: recentlyExpiredDate
          },
          isActive: true,
          verificationStatus: "VERIFIED"
        },
        include: {
          user: true,
          competenceType: true
        }
      });

      console.log(`[CRON] Found ${recentlyExpiredCompetencies.length} recently expired competencies`);

      // Varsle om nylig utløpte kompetanser
      for (const competence of recentlyExpiredCompetencies) {
        // Sjekk om det allerede finnes en aktiv påminnelse om utløp
        const existingExpiredNotification = await prisma.notification.findFirst({
          where: {
            userId: competence.userId,
            type: "COMPETENCE_EXPIRED",
            isRead: false,
            metadata: {
              path: ["competenceId"],
              equals: competence.id
            }
          }
        });

        if (!existingExpiredNotification) {
          // Opprett ny notifikasjon
          await prisma.notification.create({
            data: {
              userId: competence.userId,
              type: "COMPETENCE_EXPIRED",
              title: `Kompetanse utløpt: ${competence.competenceType.name}`,
              message: `Din kompetanse "${competence.competenceType.name}" utløp ${competence.expiryDate?.toLocaleDateString('no-NO')}. Vennligst forny den så snart som mulig.`,
              isRead: false,
              metadata: {
                competenceId: competence.id
              }
            }
          });

          totalNotificationsSent++;

          // Send også e-post om utløp
          if (competence.user.email) {
            try {
              await sendEmail({
                to: competence.user.email,
                subject: `Viktig: ${competence.competenceType.name} har utløpt`,
                text: `Hei ${competence.user.name},

Dette er en viktig melding om at din kompetanse "${competence.competenceType.name}" utløp ${competence.expiryDate?.toLocaleDateString('no-NO')}.

Vennligst forny denne kompetansen så snart som mulig for å sikre at du har gyldig sertifisering for ditt arbeid.

Logg inn på HMS Nova for å se detaljer og laste opp ny dokumentasjon.

Vennlig hilsen,
HMS Nova-teamet`,
                html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #c0392b;">Viktig: Kompetanse har utløpt</h2>
  <p>Hei ${competence.user.name},</p>
  <p>Dette er en viktig melding om at din kompetanse <strong>"${competence.competenceType.name}"</strong> utløp <strong>${competence.expiryDate?.toLocaleDateString('no-NO')}</strong>.</p>
  <p>Vennligst forny denne kompetansen så snart som mulig for å sikre at du har gyldig sertifisering for ditt arbeid.</p>
  <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/employee/competence" style="background-color: #c0392b; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">Logg inn for å se detaljer</a></p>
  <p>Vennlig hilsen,<br>HMS Nova-teamet</p>
</div>`
              });
              
              totalEmailsSent++;
            } catch (error) {
              console.error(`[CRON] Failed to send expiry email to ${competence.user.email}:`, error);
            }
          }
        }
      }
    }

    // Varsle også HMS-ansvarlige om utløpte kompetanser i bedriften
    // For hver bedrift med aktive kompetansemoduler
    const companies = await prisma.company.findMany({
      where: {
        modules: {
          some: {
            key: "COMPETENCE",
            isActive: true
          }
        }
      }
    });

    for (const company of companies) {
      // Finn alle utløpte kompetanser for denne bedriften
      const expiredCompetencies = await prisma.competence.count({
        where: {
          user: {
            companyId: company.id
          },
          expiryDate: {
            lt: today
          },
          isActive: true,
          verificationStatus: "VERIFIED"
        }
      });

      if (expiredCompetencies > 0) {
        // Finn HMS-ansvarlige i bedriften
        const hmsResponsibles = await prisma.user.findMany({
          where: {
            companyId: company.id,
            role: {
              in: ["ADMIN", "HMS_RESPONSIBLE"]
            },
            isActive: true
          }
        });

        // Opprett en daglig sammendragsnotifikasjon for HMS-ansvarlige
        for (const responsible of hmsResponsibles) {
          // Sjekk om vi allerede har sendt en sammendragsnotifikasjon i dag
          const existingSummaryNotification = await prisma.notification.findFirst({
            where: {
              userId: responsible.id,
              type: "COMPETENCE_EXPIRY_SUMMARY",
              createdAt: {
                gte: new Date(today.setHours(0, 0, 0, 0))
              }
            }
          });

          if (!existingSummaryNotification) {
            await prisma.notification.create({
              data: {
                userId: responsible.id,
                type: "COMPETENCE_EXPIRY_SUMMARY",
                title: `Kompetansesammendrag: ${expiredCompetencies} utløpte kompetanser`,
                message: `Det er ${expiredCompetencies} utløpte kompetanser i bedriften. Se kompetanserapporten for å se detaljer og følge opp.`,
                isRead: false,
                metadata: {
                  expiredCount: expiredCompetencies,
                  companyId: company.id
                }
              }
            });

            totalNotificationsSent++;

            // Send også e-post til HMS-ansvarlig
            if (responsible.email) {
              try {
                await sendEmail({
                  to: responsible.email,
                  subject: `HMS Nova: Daglig sammendrag av utløpte kompetanser`,
                  text: `Hei ${responsible.name},

Dette er et daglig sammendrag av kompetansestatus i din bedrift.

Det er for øyeblikket ${expiredCompetencies} utløpte kompetanser som krever oppfølging.

Logg inn på HMS Nova for å se detaljer og følge opp med de berørte ansatte.

Vennlig hilsen,
HMS Nova-teamet`,
                  html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2c3e50;">Daglig kompetansesammendrag</h2>
  <p>Hei ${responsible.name},</p>
  <p>Dette er et daglig sammendrag av kompetansestatus i din bedrift.</p>
  <div style="background-color: #f8f9fa; border-left: 4px solid #e74c3c; padding: 15px; margin: 15px 0;">
    <p style="margin: 0; font-weight: bold;">Det er for øyeblikket ${expiredCompetencies} utløpte kompetanser som krever oppfølging.</p>
  </div>
  <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/competence/report" style="background-color: #3498db; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">Se kompetanserapport</a></p>
  <p>Vennlig hilsen,<br>HMS Nova-teamet</p>
</div>`
                });
                
                totalEmailsSent++;
              } catch (error) {
                console.error(`[CRON] Failed to send summary email to ${responsible.email}:`, error);
              }
            }
          }
        }
      }
    }

    console.log(`[CRON] Competence expiry check completed. Sent ${totalNotificationsSent} notifications and ${totalEmailsSent} emails.`);

    return NextResponse.json({
      success: true,
      notificationsSent: totalNotificationsSent,
      emailsSent: totalEmailsSent
    });

  } catch (error) {
    console.error("[CRON] Error in competence expiry check:", error);
    return NextResponse.json(
      { error: "Internal server error during competence expiry check" },
      { status: 500 }
    );
  }
} 