import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Håndterer POST-forespørsler for å bevare cookie-samtykke
export async function POST(request: Request) {
  try {
    console.log("========== PRESERVE COOKIE CONSENT API ==========");
    
    // Hent session for å sikre at brukeren er autentisert
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("Ingen gyldig session funnet");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Hent konsentdata fra request body
    const { consent } = await request.json();
    console.log("Mottatt konsentdata:", consent);
    
    if (!consent) {
      console.log("Ingen konsentdata mottatt");
      return NextResponse.json({ error: "Mangler konsentdata" }, { status: 400 });
    }
    
    // Opprett respons
    const response = NextResponse.json({ success: true });
    
    // Sett cookie i responsen
    response.cookies.set('cookieConsent', consent, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 år
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    console.log("Cookie-samtykke lagret på serveren");
    
    return response;
    
  } catch (error) {
    console.error("Feil i preserve-cookie-consent API:", error);
    return NextResponse.json(
      { error: "Intern serverfeil" },
      { status: 500 }
    );
  }
} 