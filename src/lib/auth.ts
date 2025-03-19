import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import prisma from "./db"
import { Adapter } from "next-auth/adapters"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    companyId: string
    role: string
    isSystemAdmin: boolean
    competencies?: Array<{
      name: string
      description?: string
      expiryDate?: string
      certificateNumber?: string
    }>
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
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: { 
            id: true,
            companyId: true,
            email: true,
            name: true
          }
        })
        
        if (dbUser) {
          session.user = {
            ...session.user,
            id: dbUser.id,
            companyId: dbUser.companyId,
          }
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
} 