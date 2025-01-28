import { z } from "zod"

export const bookingSchema = z.object({
  id: z.string(),
  date: z.date(),
  time: z.string(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]),
  meetingType: z.enum(["online", "physical"]),
  name: z.string(),
  email: z.string().email(),
  company: z.string(),
  phone: z.string(),
  participants: z.string(),
  createdAt: z.date()
})

export type Booking = z.infer<typeof bookingSchema> 