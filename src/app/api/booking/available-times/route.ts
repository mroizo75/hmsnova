import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { format } from "date-fns"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const date = url.searchParams.get("date")
  
  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 })
  }

  // Hent alle bookinger for den valgte datoen
  const bookings = await prisma.booking.findMany({
    where: {
      date: new Date(date),
      status: {
        in: ["PENDING", "CONFIRMED"]
      }
    },
    select: {
      time: true
    }
  })

  // Alle tilgjengelige tider
  const allTimes = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"]
  
  // Filtrer ut tider som allerede er booket
  const bookedTimes = bookings.map(b => b.time)
  const availableTimes = allTimes.filter(time => !bookedTimes.includes(time))

  return NextResponse.json({ availableTimes })
} 