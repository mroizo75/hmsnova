import { NextResponse } from "next/server"
import { ServerClient } from "postmark"
import prisma from "@/lib/db"
import { format } from "date-fns"

const postmark = new ServerClient(process.env.POSTMARK_API_TOKEN || "")

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, company, phone, date, time, meetingType, participants } = body

    // Sjekk om tiden fortsatt er tilgjengelig
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: new Date(date),
        time: time,
        status: {
          in: ["PENDING", "CONFIRMED"]
        }
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: "Tiden er dessverre ikke lenger tilgjengelig" },
        { status: 409 }
      )
    }

    // Opprett booking i databasen
    const booking = await prisma.booking.create({
      data: {
        date: new Date(date),
        time,
        status: "PENDING",
        meetingType,
        name,
        email,
        company,
        phone,
        participants
      }
    })

    // Send e-post til kunde
    await postmark.sendEmail({
      From: "info@kksas.no",
      To: email,
      Subject: "Møteforespørsel mottatt - HMS Nova",
      HtmlBody: `
        <h2>Takk for din møteforespørsel</h2>
        <p>Vi har mottatt din forespørsel og vil bekrefte tidspunktet så snart som mulig.</p>
        <p>Ønsket tidspunkt: ${format(new Date(date), 'dd.MM.yyyy')} kl. ${time}</p>
      `
    })

    // Send varsling til admin
    await postmark.sendEmail({
      From: "info@kksas.no",
      To: "kenneth@kksas.no",
      Subject: `Ny møteforespørsel fra ${company}`,
      HtmlBody: `
        <h2>Ny møteforespørsel</h2>
        <p><strong>Bedrift:</strong> ${company}</p>
        <p><strong>Kontaktperson:</strong> ${name}</p>
        <p><strong>E-post:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Ønsket dato:</strong> ${format(new Date(date), 'dd.MM.yyyy')}</p>
        <p><strong>Tidspunkt:</strong> ${time}</p>
        <p><strong>Type:</strong> ${meetingType}</p>
        <p><strong>Antall deltakere:</strong> ${participants}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings/${booking.id}">Håndter booking</a></p>
      `
    })

    return NextResponse.json({ success: true, bookingId: booking.id })
  } catch (error) {
    console.error("Error booking meeting:", error)
    return NextResponse.json(
      { error: "Could not book meeting" },
      { status: 500 }
    )
  }
} 