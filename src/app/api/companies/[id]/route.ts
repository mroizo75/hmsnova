import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    
    const company = await prisma.company.findUnique({
      where: {
        id: params.id,
      },
      select: {
        name: true,
        orgNumber: true
      }
    })

    if (!company) {
      return NextResponse.json(
        { error: "Bedrift ikke funnet" },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente bedriftsinformasjon" },
      { status: 500 }
    )
  }
} 