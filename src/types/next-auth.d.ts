import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name: string | null
    email: string
    companyId: string
    role: string
    phone: string | null
    address: {
      street: string
      postalCode: string
      city: string
    } | null
    isSystemAdmin: boolean
    certifications?: {
      machineCards: string[]
      driverLicenses: string[]
    }
  }

  interface Session {
    user: User & DefaultSession["user"]
  }
} 