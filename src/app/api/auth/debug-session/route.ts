import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Ingen aktiv økt funnet" }, { status: 401 });
    }
    
    // Returner basis sesjonsinformasjon, men ikke sensitive data
    return NextResponse.json({
      session: {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
          companyId: session.user.companyId,
          isSystemAdmin: session.user.isSystemAdmin
        },
        expires: (session as any).expires
      }
    });
  } catch (error) {
    console.error("Feil ved henting av sesjon:", error);
    return NextResponse.json({ error: "Intern serverfeil" }, { status: 500 });
  }
} 