import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"

// GET - Hent alle salgsmuligheter for en bedrift
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
    
    const opportunities = await prisma.salesOpportunity.findMany({
      where: {
        companyId: id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(opportunities)
  } catch (error) {
    console.error("Error fetching opportunities:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente salgsmuligheter" },
      { status: 500 }
    )
  }
}

// POST - Opprett en ny salgsmulighet for en bedrift
export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    
    const { id } = context.params;
    
    if (!id) {
      return NextResponse.json({ error: 'Manglende ID-parameter' }, { status: 400 });
    }
    
    const data = await request.json();
    
    // Validere data
    if (!data.title) {
      return NextResponse.json({ error: 'Manglende påkrevde felt' }, { status: 400 });
    }
    
    // Opprett ny salgsmulighet
    const opportunity = await prisma.salesOpportunity.create({
      data: {
        title: data.title,
        description: data.description || "",
        value: data.value || 0,
        probability: data.probability || 50,
        stage: data.stage || "LEAD",
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
        company: {
          connect: { id }
        },
        // Koble til brukeren som opprettet
        assignedTo: session.user?.id ? {
          connect: { id: session.user.id }
        } : undefined
      }
    });
    
    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error("Error creating opportunity:", error)
    return NextResponse.json(
      { error: "Kunne ikke opprette salgsmulighet" },
      { status: 500 }
    )
  }
} 