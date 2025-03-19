import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import CrmClient from "./crm-client"
import { Company } from "./columns"
import { PrismaClient } from "@prisma/client"

export const metadata: Metadata = {
  title: "CRM - Innutio Admin",
  description: "Administrer kunderelasjoner, kontakter og salgsmuligheter",
}

async function getCompanies() {
  try {
    const prisma = new PrismaClient()
    
    // Hent alle bedrifter fra databasen
    const companies = await prisma.company.findMany({
      include: {
        modules: true,
        salesOpportunities: true,
        contacts: true
      }
    })
    
    // Formater data for frontend
    const formattedCompanies = companies.map(company => ({
      ...company,
      activeModules: company.modules.map(m => m.key),
      activeOpportunities: company.salesOpportunities.length,
      potentialValue: company.salesOpportunities.reduce((sum, opp) => sum + opp.value, 0),
      primaryContact: company.contacts.find(c => c.isPrimary)?.firstName + ' ' + company.contacts.find(c => c.isPrimary)?.lastName,
      email: company.contacts.find(c => c.isPrimary)?.email,
      phone: company.contacts.find(c => c.isPrimary)?.phone,
      createdAt: company.createdAt // Sørg for at datofelter håndteres riktig
    }))
    
    return formattedCompanies
  } catch (error) {
    console.error('Feil ved henting av bedrifter:', error)
    return []
  }
}

export default async function AdminCrmPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const companies = await getCompanies()
  
  // Konverter dato til string for å unngå serialiseringsproblemer
  const serializedCompanies = companies.map(company => ({
    ...company,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt?.toISOString(),
    lastBrregUpdate: company.lastBrregUpdate?.toISOString(),
    lastPaymentDate: company.lastPaymentDate?.toISOString(),
    verificationDate: company.verificationDate?.toISOString()
  }))
  
  return <CrmClient companies={serializedCompanies as unknown as Company[]} />
} 