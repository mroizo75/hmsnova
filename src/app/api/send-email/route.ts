import { NextResponse } from 'next/server';

// Postmark API-nøkkel fra miljøvariablene
const POSTMARK_API_KEY = process.env.POSTMARK_API_TOKEN;
const POSTMARK_FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL || 'noreply@innutio.no';

if (!POSTMARK_API_KEY) {
  console.error('Mangler POSTMARK_API_TOKEN i miljøvariablene');
}

export async function POST(request: Request) {
  try {
    // Sjekk om Postmark API-nøkkelen er konfigurert
    if (!POSTMARK_API_KEY) {
      return NextResponse.json(
        { error: 'Postmark API-nøkkel er ikke konfigurert' },
        { status: 500 }
      );
    }

    // Hent data fra request
    const data = await request.json();
    const { to, subject, message, name, company } = data;

    // Validere input
    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Mangler nødvendige feltene: to, subject eller message' },
        { status: 400 }
      );
    }

    // Forbered epost med Postmark Template API
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': POSTMARK_API_KEY,
      },
      body: JSON.stringify({
        From: POSTMARK_FROM_EMAIL,
        To: to,
        Subject: subject,
        HtmlBody: message,
        TextBody: message.replace(/<[^>]*>?/gm, ''), // Fjern HTML-tags for tekstversjon
        MessageStream: 'outbound',
      }),
    });

    // Sjekk respons fra Postmark
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Postmark API error:', errorData);
      return NextResponse.json(
        { error: 'Kunne ikke sende epost via Postmark', details: errorData },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    // Logg til konsoll
    console.log(`Epost sendt til ${to} (${name} fra ${company})`);
    
    return NextResponse.json({ success: true, messageId: result.MessageID });
  } catch (error) {
    console.error('Epost sending feilet:', error);
    return NextResponse.json(
      { error: 'Serverfeil ved sending av epost', details: error },
      { status: 500 }
    );
  }
} 