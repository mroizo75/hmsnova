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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt"
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
      async authorize(credentials) {
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
      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyId = user.companyId
        token.isSystemAdmin = user.role === 'ADMIN' || user.role === 'SUPPORT'
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