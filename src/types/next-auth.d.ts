import "next-auth"

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
  }

  interface Session {
    user: User
  }
} 