import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import * as z from "zod"

// Schema for validering av innkommende data
const updateCompetenceSchema = z.object({
  competenceTypeId: z.string(),
  achievedDate: z.string().or(z.date()),
  expiryDate: z.string().or(z.date()).nullable().optional(),
  notes: z.string().max(1000).optional().nullable(),
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Sjekk om kompetansemodulen er aktivert for bedriften
    const competenceModule = await prisma.module.findFirst({
      where: {
        companyId: session.user.companyId,
        key: "COMPETENCE",
        isActive: true
      }
    })

    if (!competenceModule) {
      return NextResponse.json({ error: "Competence module not activated" }, { status: 403 })
    }
    
    // Parse input data
    const json = await req.json()
    
    try {
      updateCompetenceSchema.parse(json)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ 
          error: "Validation error", 
          details: error.errors 
        }, { status: 400 })
      }
      throw error
    }
    
    // Hent kompetansen som skal oppdateres
    const competence = await prisma.competence.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, companyId: true }
        },
        competenceType: {
          select: { name: true }
        }
      }
    })
    
    if (!competence) {
      return NextResponse.json({ error: "Competence not found" }, { status: 404 })
    }
    
    // Sjekk om kompetansen tilhører samme bedrift som brukeren
    if (competence.user.companyId !== session.user.companyId) {
      return NextResponse.json({
        error: "Competence belongs to a different company"
      }, { status: 403 })
    }
    
    // Sjekk brukerens tillatelser
    // Hent bruker med fullt metadata for å sjekke HMS-ansvarlig status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    
    // Sjekk om brukeren er admin (ADMIN, COMPANY_ADMIN, HMS_RESPONSIBLE eller bruker med isHMSResponsible=true)
    const isAdmin = 
      session.user.role === "ADMIN" || 
      session.user.role === "COMPANY_ADMIN" || 
      session.user.role === "HMS_RESPONSIBLE" || 
      session.user.role === "SUPPORT";
    
    // Sjekk om brukeren er markert som HMS-ansvarlig i metadata
    let isHMSResponsible = false;
    if (user?.metadata) {
      const metadata = typeof user.metadata === 'string' 
        ? JSON.parse(user.metadata) 
        : user.metadata;
      
      if (metadata.isHMSResponsible === true) {
        isHMSResponsible = true;
      }
    }
    
    const isOwnCompetence = competence.user.id === session.user.id
    
    // Vanlige brukere kan bare oppdatere notater for sin egen kompetanse
    if (!isAdmin && !isHMSResponsible && !isOwnCompetence) {
      return NextResponse.json({ 
        error: "You don't have permission to update this competence" 
      }, { status: 403 })
    }
    
    // Vanlige brukere kan bare oppdatere notater
    const updateData: any = {}
    
    if (isAdmin || isHMSResponsible) {
      // Admin kan oppdatere alle felt
      updateData.competenceTypeId = json.competenceTypeId
      updateData.achievedDate = new Date(json.achievedDate)
      updateData.expiryDate = json.expiryDate ? new Date(json.expiryDate) : null
      updateData.verificationStatus = json.verificationStatus
      
      // Hvis status endres til VERIFIED, sett verifiseringsinformasjon
      if (json.verificationStatus === 'VERIFIED' && competence.verificationStatus !== 'VERIFIED') {
        updateData.verifiedBy = session.user.id
        updateData.verifiedAt = new Date()
      } else if (json.verificationStatus !== 'VERIFIED' && competence.verificationStatus === 'VERIFIED') {
        // Hvis status endres fra VERIFIED til noe annet, fjern verifiseringsinformasjon
        updateData.verifiedBy = null
        updateData.verifiedAt = null
      }
    } else if (isOwnCompetence) {
      // For egen kompetanse, kan brukeren oppdatere notater og andre felt som ikke krever admin-tilgang
      // Men vi beholder opprinelige tilstandsfelt
      updateData.verificationStatus = competence.verificationStatus;
      
      // Vi beholder achievedDate og expiryDate hvis de finnes i requesten
      if (json.achievedDate) {
        updateData.achievedDate = new Date(json.achievedDate);
      }
      
      if (json.expiryDate) {
        updateData.expiryDate = new Date(json.expiryDate);
      } else if (json.expiryDate === null) {
        updateData.expiryDate = null;
      }
      
      // Også tillat oppdatering av kompetansetypen for egne kompetanser
      if (json.competenceTypeId) {
        updateData.competenceTypeId = json.competenceTypeId;
      }
    }
    
    // Alle kan oppdatere notater
    updateData.notes = json.notes
    
    // Oppdater kompetansen
    const updatedCompetence = await prisma.competence.update({
      where: { id: params.id },
      data: updateData,
      include: {
        competenceType: true
      }
    })
    
    // Send notifikasjon hvis admin har endret noe
    if ((isAdmin || isHMSResponsible) && !isOwnCompetence) {
      await prisma.notification.create({
        data: {
          userId: competence.user.id,
          type: "COMPETENCE_UPDATED",
          title: `Kompetanse oppdatert: ${updatedCompetence.competenceType.name}`,
          message: `Din kompetanse "${updatedCompetence.competenceType.name}" har blitt oppdatert av en administrator.`,
          read: false
        }
      })
    }
    
    return NextResponse.json({ 
      message: "Competence successfully updated",
      competence: updatedCompetence
    })
    
  } catch (error) {
    console.error('Error updating competence:', error)
    return NextResponse.json({ 
      error: "An error occurred while updating the competence" 
    }, { status: 500 })
  }
} 