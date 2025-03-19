import { ServerClient } from 'postmark'

if (!process.env.POSTMARK_API_TOKEN) {
  throw new Error('POSTMARK_API_TOKEN er ikke satt i miljøvariablene')
}

if (!process.env.POSTMARK_FROM_EMAIL) {
  throw new Error('POSTMARK_FROM_EMAIL er ikke satt i miljøvariablene')
}

export const emailConfig = {
  fromEmail: process.env.POSTMARK_FROM_EMAIL as string,
  apiToken: process.env.POSTMARK_API_TOKEN as string
}

// Initialiser Postmark-klienten
const client = new ServerClient(process.env.POSTMARK_API_TOKEN)

// Test tilkobling ved oppstart
async function testConnection() {
  try {
    const response = await client.getServer()
    console.log('Postmark konfigurasjon:', {
      server: response.Name,
      fromEmail: process.env.POSTMARK_FROM_EMAIL,
      isConfigured: true
    })
  } catch (error) {
    console.error('Postmark tilkoblingsfeil:', {
      error: error instanceof Error ? error.message : 'Ukjent feil',
      token: process.env.POSTMARK_API_TOKEN ? 'Satt' : 'Ikke satt',
      fromEmail: process.env.POSTMARK_FROM_EMAIL
    })
  }
}

// Kjør test i development
if (process.env.NODE_ENV === 'development') {
  testConnection()
}

export async function sendEmail({ to, subject, html }: { 
  to: string
  subject: string
  html: string 
}) {
  if (!to || !subject || !html) {
    throw new Error('Mangler påkrevde felt for e-post (to, subject, html)')
  }

  try {
    const response = await client.sendEmail({
      From: process.env.POSTMARK_FROM_EMAIL as string,
      To: to,
      Subject: subject,
      HtmlBody: html,
      MessageStream: 'outbound'
    })
    
    console.log('E-post sendt:', {
      to,
      messageId: response.MessageID,
      status: response.Message
    })

    return { success: true, messageId: response.MessageID }
  } catch (error) {
    console.error('E-post feil:', {
      error: error instanceof Error ? error.message : 'Ukjent feil',
      to,
      subject
    })
    throw error
  }
} 