import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    console.log("Debug-session API kalt");
    
    // Forsøk å hente noen cookies for debugging - error-safe implementasjon
    let cookieDebugInfo = {};
    try {
      const cookieStore = cookies();
      const sessionCookie = cookieStore.get('next-auth.session-token');
      cookieDebugInfo = {
        hasSessionCookie: !!sessionCookie
      };
    } catch (cookieError) {
      console.error("Feil ved henting av cookies:", cookieError);
    }
    
    // Hent sesjonen fra server
    const session = await getServerSession(authOptions);
    console.log("Session data fra server:", session);
    
    if (!session) {
      console.log("Ingen session funnet");
      return NextResponse.json({ 
        error: "Ingen aktiv økt funnet",
        cookieDebugInfo
      }, { status: 401 });
    }
    
    // Returner basis sesjonsinformasjon, men ikke sensitive data
    return NextResponse.json({
      session: {
        user: session.user ? {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
          companyId: session.user.companyId,
          isSystemAdmin: session.user.isSystemAdmin
        } : null,
        expires: (session as any).expires
      },
      cookieDebugInfo
    });
  } catch (error) {
    console.error("Feil ved henting av sesjon:", error);
    return NextResponse.json({ 
      error: "Intern serverfeil", 
      message: (error as Error).message,
      stack: process.env.NODE_ENV !== 'production' ? (error as Error).stack : undefined 
    }, { status: 500 });
  }
} 