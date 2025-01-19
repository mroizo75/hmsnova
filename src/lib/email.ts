import * as postmark from 'postmark'

const client = process.env.POSTMARK_API_KEY
  ? new postmark.ServerClient(process.env.POSTMARK_API_KEY)
  : null

export async function sendEmail({
  to,
  subject,
  html,
  from = 'no-reply@innutio.no'
}: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  try {
    if (!client) {
      console.error('POSTMARK_API_KEY is not configured')
      return { success: false, error: 'Email service not configured' }
    }

    const result = await client.sendEmail({
      From: from,
      To: to,
      Subject: subject,
      HtmlBody: html,
      MessageStream: 'outbound'
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export default sendEmail 