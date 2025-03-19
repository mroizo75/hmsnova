import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "@/lib/utils/auth";

const prisma = new PrismaClient();

// Hent alle kontakter for en bedrift
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    
    // Sjekk at params og id eksisterer
    if (!params || !params.id) {
      return NextResponse.json({ error: 'Manglende ID-parameter' }, { status: 400 });
    }
    
    const companyId = params.id;
    
    const contacts = await prisma.customerContact.findMany({
      where: { companyId: companyId }
    });
    
    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Feil ved henting av kontakter:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente kontakter" },
      { status: 500 }
    );
  }
}

// Legg til en ny kontakt
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    
    // Sjekk at params og id eksisterer
    if (!params || !params.id) {
      return NextResponse.json({ error: 'Manglende ID-parameter' }, { status: 400 });
    }
    
    const companyId = params.id;
    const data = await request.json();
    
    // Sjekk om bedriften eksisterer
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });
    
    if (!company) {
      return NextResponse.json({ error: 'Bedrift ikke funnet' }, { status: 404 });
    }
    
    // Hvis denne kontakten skal være primær, fjern primærflagg fra andre kontakter
    if (data.isPrimary) {
      await prisma.customerContact.updateMany({
        where: { companyId: companyId },
        data: { isPrimary: false }
      });
    }
    
    // Opprett ny kontakt
    const contact = await prisma.customerContact.create({
      data: {
        companyId: companyId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        position: data.position,
        isPrimary: data.isPrimary,
        notes: data.notes
      }
    });
    
    // Hvis dette er en primærkontakt, oppdater også bedriften
    if (data.isPrimary) {
      await prisma.company.update({
        where: { id: companyId },
        data: {
          // Bruk riktige feltnavn i henhold til Prisma-skjemaet
          // Enten oppdater bare kontakt-ID-en, eller add annen custom logikk her
          // basert på databaseskjemaet ditt
          // primaryContact: `${data.firstName} ${data.lastName}`,
          // primaryEmail: data.email,
          // primaryPhone: data.phone
        }
      });
    }
    
    return NextResponse.json(contact);
  } catch (error) {
    console.error("Feil ved opprettelse av kontakt:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette kontakt" },
      { status: 500 }
    );
  }
}

// Oppdater en eksisterende kontakt
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    
    // Sjekk at params og id eksisterer
    if (!params || !params.id) {
      return NextResponse.json({ error: 'Manglende ID-parameter' }, { status: 400 });
    }
    
    const companyId = params.id;
    const data = await request.json();
    
    // Sjekk at kontakt-ID er inkludert
    if (!data.id) {
      return NextResponse.json({ error: 'Kontakt-ID mangler' }, { status: 400 });
    }
    
    // Sjekk om bedriften eksisterer
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });
    
    if (!company) {
      return NextResponse.json({ error: 'Bedrift ikke funnet' }, { status: 404 });
    }
    
    // Sjekk om kontakten eksisterer
    const existingContact = await prisma.customerContact.findUnique({
      where: { id: data.id }
    });
    
    if (!existingContact) {
      return NextResponse.json({ error: 'Kontakt ikke funnet' }, { status: 404 });
    }
    
    // Sjekk om kontakten tilhører denne bedriften
    if (existingContact.companyId !== companyId) {
      return NextResponse.json({ error: 'Kontakten tilhører ikke denne bedriften' }, { status: 403 });
    }
    
    // Hvis denne kontakten skal være primær, fjern primærflagg fra andre kontakter
    if (data.isPrimary) {
      await prisma.customerContact.updateMany({
        where: { 
          companyId: companyId,
          id: { not: data.id }
        },
        data: { isPrimary: false }
      });
    }
    
    // Oppdater kontakten
    const contact = await prisma.customerContact.update({
      where: { id: data.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        position: data.position,
        isPrimary: data.isPrimary,
        notes: data.notes
      }
    });
    
    // Hvis dette er en primærkontakt, oppdater også bedriften
    if (data.isPrimary) {
      await prisma.company.update({
        where: { id: companyId },
        data: {
          // Bruk riktige feltnavn i henhold til Prisma-skjemaet
          // Enten oppdater bare kontakt-ID-en, eller add annen custom logikk her
          // basert på databaseskjemaet ditt
          // primaryContact: `${data.firstName} ${data.lastName}`,
          // primaryEmail: data.email,
          // primaryPhone: data.phone
        }
      });
    }
    
    return NextResponse.json(contact);
  } catch (error) {
    console.error("Feil ved oppdatering av kontakt:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere kontakt" },
      { status: 500 }
    );
  }
}

// Legg til DELETE-metode for å slette en kontakt
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; contactId: string } }
) {
  try {
    await requireAuth();
    
    if (!params?.id || !params?.contactId) {
      return NextResponse.json({ error: 'Manglende parametere' }, { status: 400 });
    }
    
    const companyId = params.id;
    const contactId = params.contactId;
    
    // Sjekk om kontakten eksisterer
    const contact = await prisma.customerContact.findUnique({
      where: { id: contactId }
    });
    
    if (!contact) {
      return NextResponse.json({ error: 'Kontakt ikke funnet' }, { status: 404 });
    }
    
    // Sjekk om kontakten tilhører denne bedriften
    if (contact.companyId !== companyId) {
      return NextResponse.json({ error: 'Kontakten tilhører ikke denne bedriften' }, { status: 403 });
    }
    
    // Slett kontakten
    await prisma.customerContact.delete({
      where: { id: contactId }
    });
    
    // Hvis dette var en primærkontakt, fjern referansen i bedriften
    if (contact.isPrimary) {
      // Finn en annen kontakt som kan være primær
      const otherContact = await prisma.customerContact.findFirst({
        where: { companyId }
      });
      
      if (otherContact) {
        // Sett denne som primær
        await prisma.customerContact.update({
          where: { id: otherContact.id },
          data: { isPrimary: true }
        });
        
        // Oppdater bedriften med den nye primærkontakten
        await prisma.company.update({
          where: { id: companyId },
          data: {
            // Bruk riktige feltnavn i henhold til Prisma-skjemaet
            // primaryContact: `${otherContact.firstName} ${otherContact.lastName}`,
            // primaryEmail: otherContact.email,
            // primaryPhone: otherContact.phone
          }
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feil ved sletting av kontakt:", error);
    return NextResponse.json(
      { error: "Kunne ikke slette kontakt" },
      { status: 500 }
    );
  }
} 