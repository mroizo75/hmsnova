import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "@/lib/utils/auth";

const prisma = new PrismaClient();

// Hent en spesifikk kontakt
export async function GET(
  request: Request,
  { params }: { params: { id: string; contactId: string } }
) {
  try {
    await requireAuth();
    
    // Sjekk at params og nødvendige id-er eksisterer
    if (!params || !params.id || !params.contactId) {
      return NextResponse.json({ error: 'Manglende parametere' }, { status: 400 });
    }
    
    const companyId = params.id;
    const contactId = params.contactId;
    
    const contact = await prisma.customerContact.findUnique({
      where: { id: contactId }
    });
    
    if (!contact) {
      return NextResponse.json({ error: 'Kontakt ikke funnet' }, { status: 404 });
    }
    
    if (contact.companyId !== companyId) {
      return NextResponse.json({ error: 'Kontakten tilhører ikke denne bedriften' }, { status: 403 });
    }
    
    return NextResponse.json(contact);
  } catch (error) {
    console.error("Feil ved henting av kontakt:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente kontakt" },
      { status: 500 }
    );
  }
}

// Oppdater en eksisterende kontakt
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; contactId: string } }
) {
  try {
    await requireAuth();
    
    // Sjekk at params og nødvendige id-er eksisterer
    if (!params || !params.id || !params.contactId) {
      return NextResponse.json({ error: 'Manglende parametere' }, { status: 400 });
    }
    
    const companyId = params.id;
    const contactId = params.contactId;
    const data = await request.json();
    
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
    
    // Hvis denne kontakten skal være primær, fjern primærflagg fra andre kontakter
    if (data.isPrimary) {
      await prisma.customerContact.updateMany({
        where: { 
          companyId: companyId,
          id: { not: contactId }
        },
        data: { isPrimary: false }
      });
    }
    
    // Oppdater kontakten
    const updatedContact = await prisma.customerContact.update({
      where: { id: contactId },
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
          // Her kan du legge til oppdatering av bedriftens primærkontaktinformasjon hvis dette er definert i skjemaet
        }
      });
    }
    
    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error("Feil ved oppdatering av kontakt:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere kontakt", details: (error as any).message },
      { status: 500 }
    );
  }
}

// Slett en kontakt
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; contactId: string } }
) {
  try {
    await requireAuth();
    
    // Sjekk at params og nødvendige id-er eksisterer
    if (!params || !params.id || !params.contactId) {
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
    
    // Hvis dette var en primærkontakt, finn en annen som kan være primær
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