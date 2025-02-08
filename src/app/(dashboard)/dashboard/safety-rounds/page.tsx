import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import { SafetyRoundsClient } from "./safety-rounds-client"
import prisma from "@/lib/db"

export default async function SafetyRoundsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }

  const safetyRounds = await prisma.safetyRound.findMany({
    where: {
      companyId: session.user.companyId,
    },
    include: {
      template: true,
      assignedUser: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      },
      findings: {
        include: {
          images: true,
          measures: true
        }
      },
      checklistItems: {
        orderBy: {
          order: 'asc'
        }
      },
      images: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Hent tilgjengelige maler
  const templates = await prisma.safetyRoundTemplate.findMany({
    where: {
      companies: {
        some: {
          id: session.user.companyId
        }
      },
      isActive: true
    },
    include: {
      sections: {
        include: {
          checkpoints: true
        },
        orderBy: {
          order: 'asc'
        }
      }
    }
  })

  // Hent ansatte som kan delta
  const employees = await prisma.user.findMany({
    where: {
      companyId: session.user.companyId,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true
    }
  })

  return (
    <div className="container py-6">
      <SafetyRoundsClient 
        initialSafetyRounds={safetyRounds}
        templates={templates}
        employees={employees}
      />
    </div>
  )
}

export const metadata = {
  title: 'Vernerunder',
  description: 'Administrer vernerunder for din bedrift'
} 