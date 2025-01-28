import { sendEmail } from "../postmark"

interface SystemUserWelcomeEmailProps {
  to: string
  name: string
  password: string
  role: "ADMIN" | "SUPPORT"
}

export async function sendWelcomeEmail({ to, name, password, role }: SystemUserWelcomeEmailProps) {
  const subject = "Velkommen som systembruker"
  
  const html = `
    <h1>Velkommen som ${role === 'ADMIN' ? 'administrator' : 'support-bruker'}!</h1>
    <p>Hei ${name},</p>
    <p>Din brukerkonto er nå opprettet med følgende innloggingsinformasjon:</p>
    <ul>
      <li>E-post: ${to}</li>
      <li>Passord: ${password}</li>
    </ul>
    <p>Vi anbefaler at du endrer passordet ditt ved første innlogging.</p>
    <p>Logg inn her: <a href="${process.env.NEXTAUTH_URL}/login">${process.env.NEXTAUTH_URL}/login</a></p>
  `

  return sendEmail({
    to,
    subject,
    html,
    from: process.env.POSTMARK_FROM_EMAIL || 'no-reply@example.com'
  })
} 