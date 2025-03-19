import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'; // Vi bruker UUID for å generere garantert unike strenger

const prisma = new PrismaClient();

// POST-handler for å opprette ny bedrift
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Definerer standardmoduler
    const standardModules = [
      "HMS_HANDBOOK", 
      "DEVIATIONS", 
      "RISK_ASSESSMENT", 
      "DOCUMENTS", 
      "EMPLOYEES"
    ];
    
    // Sjekk hvilke tilleggsmoduler som er valgt
    const additionalModules = data.activeModules?.filter(
      (module: string) => module === "SAFETY_ROUNDS" || module === "COMPETENCE"
    ) || [];
    
    // Kombinere alle moduler
    const allModules = [...standardModules, ...additionalModules];
    
    // Sjekk for eksisterende organisasjonsnummer
    let orgNumber = data.orgNumber;
    
    if (orgNumber) {
      // Sjekk om dette organisasjonsnummeret allerede finnes
      const existingCompany = await prisma.company.findUnique({
        where: { orgNumber }
      });
      
      if (existingCompany) {
        return NextResponse.json(
          { error: `Bedrift med organisasjonsnummer ${orgNumber} finnes allerede` },
          { status: 400 }
        );
      }
    } else {
      // Generer et garantert unikt midlertidig organisasjonsnummer
      orgNumber = `temp-${Date.now()}-${uuidv4().substring(0, 8)}`;
    }
    
    // Beregn verdier for prisinfo
    const basePrice = 699; // Kampanjepris
    const additionalPrice = additionalModules.length * 199;
    const totalPrice = basePrice + additionalPrice;
    
    // Beregn rabattert pris hvis rabatt er satt
    let finalPrice = totalPrice;
    const discountPercentage = data.discountPercentage || 0;
    if (discountPercentage > 0) {
      finalPrice = totalPrice - (totalPrice * (discountPercentage / 100));
    }
    
    // Opprett ny bedrift i databasen
    const company = await prisma.company.create({
      data: {
        orgNumber: orgNumber,
        name: data.name,
        organizationType: data.organizationType || 'AS',
        organizationCode: data.organizationCode || 'AS',
        isVerified: data.isVerified || false,
        isActive: data.isActive ? true : false,
        paymentStatus: data.paymentStatus || 'PENDING',
        subscriptionPlan: data.subscriptionPlan || 'STANDARD',
        
        // Lagre metadata som et JSON-objekt
        // @ts-ignore - Metadata-feltet finnes i databasen, men TypeScript-typene er ikke oppdatert ennå
        metadata: {
          basePrice,
          additionalPrice,
          totalPrice,
          finalPrice,
          discountPercentage,
          discountYears: data.discountYears || 0,
          isProspect: data.isProspect || false,
          potentialValue: data.isProspect ? (data.potentialValue || finalPrice * 12) : 0,
          prospectStage: data.isProspect ? data.prospectStage || 'LEAD' : null,
          salesNotes: data.salesNotes || '',
          expectedCloseDate: data.expectedCloseDate
        },
        
        // Legg til moduler
        modules: {
          create: allModules.map((moduleKey: string) => ({
            key: moduleKey,
            label: getModuleLabel(moduleKey),
            isActive: true,
            isDefault: moduleKey !== "SAFETY_ROUNDS" && moduleKey !== "COMPETENCE"
          }))
        }
      }
    });
    
    // Legg til kontaktperson hvis oppgitt
    let contact = null;
    if (data.primaryContact && data.email) {
      contact = await prisma.customerContact.create({
        data: {
          firstName: data.primaryContact.split(' ')[0] || data.primaryContact,
          lastName: data.primaryContact.split(' ').slice(1).join(' ') || '',
          email: data.email,
          phone: data.phone || '',
          isPrimary: true,
          companyId: company.id
        }
      });
    }
    
    // Hvis det er en prospect, opprett en salgsmulighet
    if (data.isProspect) {
      // Beregn verdier
      const basePrice = 699; // Kampanjepris
      const additionalPrice = additionalModules.length * 199;
      const totalPrice = basePrice + additionalPrice;
      
      // Beregn rabattert pris hvis rabatt er satt
      let finalPrice = totalPrice;
      const discountPercentage = data.discountPercentage || 0;
      if (discountPercentage > 0) {
        finalPrice = totalPrice - (totalPrice * (discountPercentage / 100));
      }
      
      // Opprett salgsmulighet
      await prisma.salesOpportunity.create({
        data: {
          title: `HMS-tilbud til ${data.name}`,
          description: data.salesNotes || `Potensiell kunde interessert i HMS-system med standardpakke${additionalModules.length > 0 ? ' og tilleggsmoduler' : ''}.`,
          value: (finalPrice * 12) * (data.discountYears || 1), // Årspris ganger antall år med rabatt
          stage: 'LEAD',
          probability: 20,
          expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          companyId: company.id,
          // Koble til kontakten hvis den er opprettet
          contactId: contact?.id || null
        }
      });
    }
    
    // Hent den nyopprettede bedriften med alle relasjoner
    const createdCompany = await prisma.company.findUnique({
      where: { id: company.id },
      include: {
        modules: true,
        salesOpportunities: true,
        contacts: true
      }
    });
    
    // Formater for frontend
    const formattedCompany = {
      ...createdCompany,
      activeModules: createdCompany?.modules.map(m => m.key) || [],
      activeOpportunities: createdCompany?.salesOpportunities.length || 0,
      potentialValue: createdCompany?.salesOpportunities.reduce((sum, opp) => sum + opp.value, 0) || 0,
      primaryContact: createdCompany?.contacts.find(c => c.isPrimary)?.firstName + ' ' + createdCompany?.contacts.find(c => c.isPrimary)?.lastName,
      email: createdCompany?.contacts.find(c => c.isPrimary)?.email,
      phone: createdCompany?.contacts.find(c => c.isPrimary)?.phone,
      isProspect: data.isProspect || false
    };
    
    return NextResponse.json(formattedCompany, { status: 201 });
  } catch (error) {
    console.error('Feil ved oppretting av bedrift:', error);
    
    // Returner mer spesifikk feilmelding
    let errorMessage = 'Kunne ikke opprette bedrift';
    
    if (error instanceof Error) {
      // Hvis vi har en detaljert feilmelding, bruk den
      errorMessage = error.message;
      
      // Logg mer detaljert informasjon
      console.error('Detaljert feil:', {
        message: error.message,
        stack: error.stack,
      });
      
      // Håndter Prisma-feil spesielt
      if (error.name === 'PrismaClientKnownRequestError') {
        // @ts-ignore - Prisma-spesifikke felt
        const code = error.code;
        // @ts-ignore - Prisma-spesifikke felt
        const meta = error.meta;
        
        if (code === 'P2002') {
          errorMessage = `Duplisert verdi: ${meta?.target || 'ukjent felt'}`;
        } else if (code === 'P2003') {
          errorMessage = `Manglende relatert oppføring: ${meta?.field_name || 'ukjent felt'}`;
        } else if (code === 'P2025') {
          errorMessage = `Fant ikke oppføringen: ${meta?.cause || 'ukjent årsak'}`;
        }
        
        console.error('Prisma-feil:', { code, meta });
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// GET-handler for å hente alle bedrifter
export async function GET() {
  try {
    // Hent alle bedrifter fra databasen
    const companies = await prisma.company.findMany({
      include: {
        modules: true,
        salesOpportunities: true,
        contacts: true
      }
    });
    
    // Formater data for frontend
    const formattedCompanies = companies.map(company => ({
      ...company,
      activeModules: company.modules.map(m => m.key),
      activeOpportunities: company.salesOpportunities.length,
      potentialValue: company.salesOpportunities.reduce((sum, opp) => sum + opp.value, 0),
      primaryContact: company.contacts.find(c => c.isPrimary)?.firstName + ' ' + company.contacts.find(c => c.isPrimary)?.lastName,
      email: company.contacts.find(c => c.isPrimary)?.email,
      phone: company.contacts.find(c => c.isPrimary)?.phone
    }));
    
    return NextResponse.json(formattedCompanies);
  } catch (error) {
    console.error('Feil ved henting av bedrifter:', error);
    return NextResponse.json({ error: 'Kunne ikke hente bedrifter' }, { status: 500 });
  }
}

// Hjelpefunksjon for å få moduletiketter
function getModuleLabel(key: string): string {
  const moduleLabels: Record<string, string> = {
    'HMS_HANDBOOK': 'HMS Håndbok',
    'DEVIATIONS': 'Avvikshåndtering',
    'RISK_ASSESSMENT': 'Risikovurdering',
    'DOCUMENTS': 'Dokumenthåndtering',
    'EMPLOYEES': 'Ansatthåndtering',
    'SAFETY_ROUNDS': 'Vernerunder',
    'COMPETENCE': 'Kompetansestyring'
  };
  
  return moduleLabels[key] || key;
} 