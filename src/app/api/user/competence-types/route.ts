import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Autentiser brukeren
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
    }

    // Hent company ID fra query parameter
    const url = new URL(req.url);
    const companyId = url.searchParams.get('companyId');

    // Sjekk om companyId er oppgitt
    if (!companyId) {
      return NextResponse.json({ error: "Bedrifts-ID er påkrevd" }, { status: 400 });
    }

    // Sjekk om brukeren har tilgang til bedriften
    if (session.user.companyId !== companyId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Du har ikke tilgang til denne bedriftens data" }, { status: 403 });
    }

    // Sjekk om kompetansemodulen er aktiv
    const competenceModule = await prisma.module.findFirst({
      where: {
        companyId: companyId,
        OR: [
          { key: "COMPETENCE", isActive: true },
          { key: "COMPETENCY", isActive: true }
        ]
      }
    });

    if (!competenceModule) {
      return NextResponse.json({ error: "Kompetansemodulen er ikke aktivert for denne bedriften" }, { status: 403 });
    }

    // Hent alle aktive kompetansetyper for bedriften
    const competenceTypes = await prisma.competenceType.findMany({
      where: {
        companyId: companyId,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(competenceTypes);
  } catch (error) {
    console.error("Feil ved henting av kompetansetyper:", error);
    return NextResponse.json({ error: "Intern serverfeil" }, { status: 500 });
  }
} 