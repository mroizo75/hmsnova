import { ServerClient } from "postmark"

const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN || "")

interface EmailOptions {
  to: string
  subject: string
  html: string
  from: string
}

export async function sendEmail({ 
  to, 
  subject, 
  html, 
  from 
}: EmailOptions) {
  if (!process.env.POSTMARK_API_TOKEN) {
    console.error('POSTMARK_API_TOKEN is not set')
    throw new Error('Email configuration missing')
  }

  try {
    const response = await postmarkClient.sendEmail({
      From: from,
      To: to,
      Subject: subject,
      HtmlBody: html,
      MessageStream: "outbound"
    })

    return response
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function sendPasswordResetEmail(to: string, newPassword: string) {
  // Tilpass avsender og tekst
  await postmarkClient.sendEmail({
    From: "no-reply@hmsnova.com",
    To: to,
    Subject: "Nytt passord",
    TextBody: `Hei!

Vi har opprettet et nytt midlertidig passord til deg:
${newPassword}

Logg inn og oppdater passordet ditt snarest for bedre sikkerhet.

Hilsen,
HMSNova-teamet
`,
    MessageStream: "outbound"
  })
} 