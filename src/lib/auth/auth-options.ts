import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "../db"
import { verifyPassword } from "../utils/auth"
import { Adapter } from "next-auth/adapters"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string | null
    companyId: string
    role: string
    isSystemAdmin: boolean
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
  // Legg til eksplisitt cookie-konfigurasjon - FORBEDRET FOR T3 STACK
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
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
    async jwt({ token, user, trigger, session }) {
      // Ved hver innlogging, hent oppdatert brukerinfo fra databasen
      if (user) {
        // Brukeren har nettopp logget inn, oppdater token med brukerdata
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId;
        token.isSystemAdmin = user.role === 'ADMIN' || user.role === 'SUPPORT';
        console.log(`JWT Callback (LOGIN): Oppdaterer token med rolle ${user.role}`);
      } else if (trigger === "update" && session) {
        // Håndter sesjonsoppdateringer
        console.log("JWT Callback (UPDATE): Oppdaterer token med ny sesjonsdata");
        token.role = session.user.role;
        token.companyId = session.user.companyId;
      } else {
        // Hver gang tokenet bekreftes (på hver forespørsel), sjekk om vi trenger å hente fersk brukerdata
        try {
          // Kjør en ekstra sjekk mot databasen for å sikre at vi har riktig rolle
          const latestUserData = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { 
              role: true,
              companyId: true 
            }
          });
          
          if (latestUserData && (
              latestUserData.role !== token.role || 
              latestUserData.companyId !== token.companyId
            )) {
            console.log(`JWT Callback (REFRESH): Oppdaterer token med oppdatert rolle ${latestUserData.role}`);
            token.role = latestUserData.role;
            token.companyId = latestUserData.companyId;
            token.isSystemAdmin = latestUserData.role === 'ADMIN' || latestUserData.role === 'SUPPORT';
          }
        } catch (error) {
          console.error("Feil ved henting av oppdatert brukerinfo:", error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string;
        session.user.isSystemAdmin = token.role === 'ADMIN' || token.role === 'SUPPORT';
        console.log(`Session Callback: Setter sesjon med rolle ${token.role}`);
      }
      return session;
    }
  }
} 