import { NextResponse } from "next/server"
import { ServerClient } from "postmark"

const postmark = new ServerClient(process.env.POSTMARK_API_TOKEN || "")

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, company, phone, message } = body

    await postmark.sendEmail({
      From: "info@kksas.no", // Din verifiserte Postmark avsender
      To: "kenneth@kksas.no", // Hvor du vil motta henvendelsene
      Subject: `Ny henvendelse fra ${company}`,
      TextBody: `
        Navn: ${name}
        E-post: ${email}
        Bedrift: ${company}
        Telefon: ${phone}
        
        Melding:
        ${message}
      `,
      HtmlBody: `
        <h2>Ny henvendelse fra nettsiden</h2>
        <p><strong>Navn:</strong> ${name}</p>
        <p><strong>E-post:</strong> ${email}</p>
        <p><strong>Bedrift:</strong> ${company}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Melding:</strong></p>
        <p>${message}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      { error: "Could not send email" },
      { status: 500 }
    )
  }
} 