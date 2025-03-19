import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "../db"
import { verifyPassword } from "../utils/auth"
import { Adapter } from "next-auth/adapters"

declare module "next-auth" {
  interface User {
    id: string
    companyId: string
    role: string
  }
  
  interface Session {
    user: User & {
      id: string
      companyId: string
      role: string
      isSystemAdmin: boolean
    }
  }
}

// Definer hvor lenge en token skal være gyldig
// 12 timer i sekunder
const MAX_AGE = 12 * 60 * 60;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: MAX_AGE, // 12 timer i sekunder
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "E-post", type: "email" },
        password: { label: "Passord", type: "password" }
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            companyId: true
          }
        })

        if (!user) {
          return null
        }

        const isValid = await verifyPassword(credentials.password, user.password)

        if (!isValid) {
          return null
        }

        // Legg til isSystemAdmin basert på rolle
        const isSystemAdmin = user.role === 'ADMIN' || user.role === 'SUPPORT'

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          isSystemAdmin
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Beregn utløpstid for tokenet hvis det ikke finnes
      if (!token.exp) {
        token.exp = Math.floor(Date.now() / 1000) + MAX_AGE;
      }
      
      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyId = user.companyId
        token.isSystemAdmin = user.role === 'ADMIN' || user.role === 'SUPPORT'
        // Forny token ved innlogging
        token.exp = Math.floor(Date.now() / 1000) + MAX_AGE;
      }
      
      // Sjekk om tokenet snart utløper og forny det (hvis mindre enn 1 time gjenstår)
      const ONE_HOUR = 60 * 60;
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (token.exp && (token.exp - currentTime) < ONE_HOUR) {
        console.log("Fornyer JWT token som snart utløper");
        token.exp = currentTime + MAX_AGE;
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
        session.user.isSystemAdmin = token.role === 'ADMIN' || token.role === 'SUPPORT'
      }
      return session
    }
  }
} 