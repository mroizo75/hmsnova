import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { requireAuth } from "@/lib/utils/auth"

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    
    const { id } = context.params;
    
    if (!id) {
      return NextResponse.json({ error: 'Manglende ID-parameter' }, { status: 400 });
    }
    
    const company = await prisma.company.findUnique({
      where: {
        id,
      },
      include: {
        modules: true,
        salesOpportunities: true,
        contacts: true
      }
    })

    if (!company) {
      return NextResponse.json(
        { error: "Bedrift ikke funnet" },
        { status: 404 }
      )
    }

    const formattedCompany = {
      ...company,
      activeModules: company.modules.map(m => m.key),
      activeOpportunities: company.salesOpportunities.length,
      potentialValue: company.salesOpportunities.reduce((sum, opp) => sum + opp.value, 0),
      primaryContact: company.contacts.find(c => c.isPrimary)?.firstName + ' ' + company.contacts.find(c => c.isPrimary)?.lastName,
      email: company.contacts.find(c => c.isPrimary)?.email,
      phone: company.contacts.find(c => c.isPrimary)?.phone
    }

    return NextResponse.json(formattedCompany)
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente bedriftsinformasjon" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    
    if (!id) {
      return NextResponse.json({ error: 'Manglende ID-parameter' }, { status: 400 });
    }
    
    const data = await request.json();
    
    const existingCompany = await prisma.company.findUnique({
      where: { id },
      include: { modules: true }
    });
    
    if (!existingCompany) {
      return NextResponse.json({ error: 'Bedrift ikke funnet' }, { status: 404 });
    }
    
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        isVerified: data.isVerified !== undefined ? data.isVerified : undefined,
        paymentStatus: data.paymentStatus !== undefined ? data.paymentStatus : undefined,
        subscriptionPlan: data.subscriptionPlan !== undefined ? data.subscriptionPlan : undefined,
        isProspect: data.isProspect !== undefined ? data.isProspect : undefined,
        metadata: data.metadata !== undefined ? 
          (typeof data.metadata === 'string' ? data.metadata : JSON.stringify(data.metadata)) 
          : undefined,
      },
      include: {
        modules: true,
        salesOpportunities: true,
        contacts: true
      }
    });
    
    if (data.activeModules) {
      const currentModuleKeys = existingCompany.modules.map(m => m.key);
      const modulesToRemove = currentModuleKeys.filter(key => !data.activeModules.includes(key));
      
      const modulesToAdd = data.activeModules.filter((key: string) => !currentModuleKeys.includes(key));
      
      if (modulesToRemove.length > 0) {
        await prisma.module.deleteMany({
          where: {
            companyId: id,
            key: { in: modulesToRemove }
          }
        });
      }
      
      if (modulesToAdd.length > 0) {
        await prisma.module.createMany({
          data: modulesToAdd.map((key: string) => ({
            companyId: id,
            key,
            label: getModuleLabel(key),
            isActive: true,
            isDefault: key !== "SAFETY_ROUNDS" && key !== "COMPETENCE"
          }))
        });
      }
    }
    
    const refreshedCompany = await prisma.company.findUnique({
      where: { id },
      include: {
        modules: true,
        salesOpportunities: true,
        contacts: true
      }
    });
    
    const formattedCompany = {
      ...refreshedCompany,
      activeModules: refreshedCompany?.modules.map(m => m.key) || [],
      activeOpportunities: refreshedCompany?.salesOpportunities.length || 0,
      potentialValue: refreshedCompany?.salesOpportunities.reduce((sum, opp) => sum + opp.value, 0) || 0,
      primaryContact: refreshedCompany?.contacts.find(c => c.isPrimary)?.firstName + ' ' + refreshedCompany?.contacts.find(c => c.isPrimary)?.lastName,
      email: refreshedCompany?.contacts.find(c => c.isPrimary)?.email,
      phone: refreshedCompany?.contacts.find(c => c.isPrimary)?.phone
    };
    
    return NextResponse.json(formattedCompany);
  } catch (error) {
    console.error('Feil ved oppdatering av bedrift:', error);
    return NextResponse.json({ error: 'Kunne ikke oppdatere bedrift' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    
    const { id } = context.params;
    
    if (!id) {
      return NextResponse.json({ error: 'Manglende ID-parameter' }, { status: 400 });
    }
    
    const existingCompany = await prisma.company.findUnique({
      where: { id },
      include: {
        users: true
      }
    });
    
    if (!existingCompany) {
      return NextResponse.json({ error: 'Bedrift ikke funnet' }, { status: 404 });
    }

    const { Storage } = require('@google-cloud/storage');
    
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
    });
    
    const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);
    
    console.log(`Starter sletting av bedrift: ${existingCompany.name} (${id})`);
    
    try {
      console.log(`Sletter filer for bedrift ${id} fra Google Storage...`);
      
      await bucket.deleteFiles({
        prefix: `companies/${id}/`
      });
      
      console.log(`Filer slettet fra Google Storage for bedrift ${id}`);
    } catch (storageError) {
      console.error('Feil ved sletting av filer fra Google Storage:', storageError);
    }
    
    await prisma.$transaction(async (tx) => {
      console.log(`Sletter relatert data for bedrift ${id}...`);
      
      const userIds = existingCompany.users.map(user => user.id);

      if (userIds.length > 0) {
        console.log(`Sletter brukerrelaterte data for ${userIds.length} brukere...`);
        
        await tx.passwordResetToken.deleteMany({
          where: { userId: { in: userIds } }
        });
        
        await tx.notificationSettings.deleteMany({
          where: { userId: { in: userIds } }
        });
        
        await tx.userSettings.deleteMany({
          where: { userId: { in: userIds } }
        });
      }
      
      await tx.customerContact.deleteMany({ 
        where: { companyId: id } 
      });
      
      await tx.salesOpportunity.deleteMany({ 
        where: { companyId: id } 
      });
      
      await tx.hMSChange.deleteMany({ 
        where: { companyId: id } 
      });
      
      await tx.hMSHandbook.deleteMany({ 
        where: { companyId: id } 
      });
      
      await tx.document.deleteMany({ 
        where: { companyId: id } 
      });
      
      await tx.deviationStatusHistory.deleteMany({
        where: { deviation: { companyId: id } }
      });
      
      await tx.deviation.deleteMany({ 
        where: { companyId: id } 
      });
      
      await tx.riskAssessment.deleteMany({ 
        where: { companyId: id } 
      });
      
      await tx.safetyRound.deleteMany({ 
        where: { companyId: id } 
      });
      
      await tx.sJA.deleteMany({ 
        where: { companyId: id } 
      });
      
      await tx.sJAMal.deleteMany({ 
        where: { companyId: id } 
      });
      
      await tx.stoffkartotek.deleteMany({ 
        where: { companyId: id } 
      });
      
      await tx.daluxSync.deleteMany({ 
        where: { companyId: id } 
      });
      
      await tx.module.deleteMany({ 
        where: { companyId: id } 
      });
      
      await tx.hMSGoal.deleteMany({ 
        where: { companyId: id } 
      });
      
      await tx.training.deleteMany({ 
        where: { companyId: id } 
      });
      
      if (userIds.length > 0) {
        console.log(`Sletter ${userIds.length} brukere...`);
        await tx.user.deleteMany({ 
          where: { companyId: id } 
        });
      }
      
      await tx.company.delete({ 
        where: { id } 
      });
      
      console.log(`All relatert data for bedrift ${id} er slettet fra databasen`);
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Bedrift ${existingCompany.name} er fullstendig slettet med alle tilknyttede data` 
    });
  } catch (error) {
    console.error('Feil ved sletting av bedrift:', error);
    return NextResponse.json({ 
      error: 'Kunne ikke slette bedrift', 
      details: (error as any).message 
    }, { status: 500 });
  }
}

function getModuleLabel(key: string): string {
  const moduleLabels: Record<string, string> = {
    'HMS_HANDBOOK': 'HMS Håndbok',
    'DEVIATIONS': 'Avvikshåndtering',
    'RISK_ASSESSMENT': 'Risikovurdering',
    'DOCUMENTS': 'Dokumenthåndtering',
    'EMPLOYEES': 'Ansatthåndtering',
    'SAFETY_ROUNDS': 'Vernerunder',
    'COMPETENCE': 'Kompetansestyring'
  }
  
  return moduleLabels[key] || key
} 