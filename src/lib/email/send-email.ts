import { postmarkClient } from "./postmark"
import { emailConfig } from "./config"

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from = emailConfig.fromEmail }: EmailOptions) {
  try {
    await postmarkClient.sendEmail({
      From: from,
      To: to,
      Subject: subject,
      HtmlBody: html,
      MessageStream: "outbound"
    })
    return true
  } catch (error) {
    console.error("Feil ved sending av e-post:", error)
    return false
  }
} 