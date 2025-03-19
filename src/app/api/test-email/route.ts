import { NextResponse } from 'next/server';

// Postmark API-nøkkel fra miljøvariablene
const POSTMARK_API_KEY = process.env.POSTMARK_API_TOKEN;
const POSTMARK_FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL || 'noreply@innutio.no';

export async function GET(request: Request) {
  // Sjekk om det finnes en API-nøkkel
  if (!POSTMARK_API_KEY) {
    return NextResponse.json(
      { 
        error: 'Postmark API-nøkkel mangler',
        envStatus: {
          hasPostmarkApiKey: Boolean(POSTMARK_API_KEY),
          fromEmail: POSTMARK_FROM_EMAIL,
          nodeEnv: process.env.NODE_ENV,
          allEnvKeys: Object.keys(process.env).filter(key => key.includes('POSTMARK')),
        }
      },
      { status: 500 }
    );
  }
  
  // Hent test-e-postadressen fra request parameter
  const url = new URL(request.url);
  const testEmail = url.searchParams.get('email');
  
  if (!testEmail) {
    return NextResponse.json(
      { error: 'Mangler email parameter. Bruk ?email=din@epost.no' },
      { status: 400 }
    );
  }
  
  try {
    // Send en test-epost via Postmark
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': POSTMARK_API_KEY,
      },
      body: JSON.stringify({
        From: POSTMARK_FROM_EMAIL,
        To: testEmail,
        Subject: 'Test-epost fra HMS Nova CRM',
        HtmlBody: `
          <h1>Test-epost fra HMS Nova CRM</h1>
          <p>Denne eposten bekrefter at Postmark API er korrekt konfigurert.</p>
          <p>Hvis du mottar denne eposten, fungerer Postmark-integrasjonen riktig.</p>
          <p>Sendt til: ${testEmail}</p>
          <p>Tidspunkt: ${new Date().toLocaleString('no-NO')}</p>
        `,
        TextBody: `Test-epost fra HMS Nova CRM\n\nDenne eposten bekrefter at Postmark API er korrekt konfigurert.\n\nHvis du mottar denne eposten, fungerer Postmark-integrasjonen riktig.\n\nSendt til: ${testEmail}\n\nTidspunkt: ${new Date().toLocaleString('no-NO')}`,
        MessageStream: 'outbound',
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { 
          error: 'Kunne ikke sende epost via Postmark', 
          details: errorData,
          postmarkConfig: {
            hasApiKey: Boolean(POSTMARK_API_KEY),
            keyLength: POSTMARK_API_KEY?.length,
            fromEmail: POSTMARK_FROM_EMAIL
          }
        },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    return NextResponse.json({ 
      success: true, 
      message: `Test-epost sendt til ${testEmail}`,
      messageId: result.MessageID,
      postmarkConfig: {
        hasApiKey: Boolean(POSTMARK_API_KEY),
        keyLength: POSTMARK_API_KEY?.length,
        fromEmail: POSTMARK_FROM_EMAIL
      }
    });
  } catch (error) {
    console.error('Test-epost sending feilet:', error);
    return NextResponse.json(
      { error: 'Serverfeil ved sending av test-epost', details: error },
      { status: 500 }
    );
  }
} 