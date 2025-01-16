import { ServerClient } from "postmark"

const client = new ServerClient(process.env.POSTMARK_API_TOKEN || "")

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
    const response = await client.sendEmail({
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