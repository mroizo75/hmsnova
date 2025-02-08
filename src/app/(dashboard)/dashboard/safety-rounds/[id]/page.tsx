import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { SafetyRoundDetails } from "./safety-round-details"

interface PageProps {
  params: {
    id: string
  }
}

export default async function SafetyRoundPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  let safetyRound = await prisma.safetyRound.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId
    },
    include: {
      checklistItems: {
        include: {
          findings: {
            include: { 
              images: true,
              measures: true
            }
          },
          images: {
            select: {
              id: true,
              url: true,
              caption: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          order: 'asc'
        }
      },
      template: {
        include: {
          sections: {
            include: {
              checkpoints: true
            }
          }
        }
      },
      assignedUser: true,
      participants: {
        include: {
          user: true
        }
      },
      findings: {
        include: {
          images: true
        }
      }
    }
  })

  if (!safetyRound) return notFound()

  console.log('SafetyRound full data:', {
    id: safetyRound.id,
    title: safetyRound.title,
    checklistItems: safetyRound.checklistItems?.map(item => ({
      id: item.id,
      category: item.category,
      question: item.question
    }))
  })

  if (safetyRound?.template && safetyRound.checklistItems.length === 0) {
    await prisma.$transaction(async (tx) => {
      const sr = safetyRound!
      for (const section of sr.template?.sections || []) {
        for (const checkpoint of section.checkpoints) {
          await tx.safetyRoundChecklistItem.create({
            data: {
              safetyRoundId: sr.id,
              category: section.title,
              question: checkpoint.question,
              description: checkpoint.description,
              isRequired: checkpoint.isRequired,
              order: checkpoint.order 
            }
          })
        }
      }
    })

    // Hent oppdaterte data med alle relasjoner
    const updatedSafetyRound = await prisma.safetyRound.findUnique({
      where: { id: safetyRound.id },
      include: {
        template: {
          include: {
            sections: {
              include: {
                checkpoints: true
              }
            }
          }
        },
        checklistItems: {
          include: {
            findings: {
              include: { images: true }
            },
            images: true
          }
        },
        assignedUser: true,
        participants: {
          include: {
            user: true
          }
        },
        findings: {
          include: {
            images: true
          }
        }
      }
    })

    if (updatedSafetyRound) {
      safetyRound = updatedSafetyRound
    }
  }

  return (
    <div className="container py-6">
      <SafetyRoundDetails safetyRound={safetyRound as any} />
    </div>
  )
}

async function getSafetyRound(id: string) {
  const safetyRound = await prisma.safetyRound.findUnique({
    where: { id },
    include: {
      template: {
        select: {
          id: true,
          name: true
        }
      },
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
          images: true
        }
      },
      checklistItems: {
        include: {
          findings: true,
          images: true
        },
        orderBy: {
          order: 'asc'
        }
      },
      images: true
    }
  })

  if (!safetyRound) {
    notFound()
  }

  return safetyRound
} 