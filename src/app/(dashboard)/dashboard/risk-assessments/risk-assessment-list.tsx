"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils/date"
import Link from "next/link"
import { statusColors, statusLabels } from "@/lib/constants/risk-assessments"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Status } from "@prisma/client"

interface Hazard {
  id: string
  description: string
  probability: number
  severity: number
  riskLevel: number
  measures: {
    id: string
    status: string
  }[]
}

interface RiskAssessment {
  id: string
  title: string
  description: string
  status: string
  createdAt: Date
  updatedAt: Date
  hazards: Hazard[]
}

interface RiskAssessmentListProps {
  assessments: RiskAssessment[]
}

export function RiskAssessmentList({ assessments }: RiskAssessmentListProps) {
  const router = useRouter()



  // Hjelpefunksjon for å beregne høyeste risikofaktor
  const calculateHighestRisk = (hazards: Hazard[]) => {
    let highestRisk = 0

    hazards.forEach(hazard => {
      if (hazard.riskLevel > highestRisk) {
        highestRisk = hazard.riskLevel
      }
    })

    return highestRisk
  }

  // Hjelpefunksjon for å få risikofarge basert på verdi
  const getRiskColor = (risk: number) => {
    if (risk >= 15) return 'text-red-500 font-semibold'
    if (risk >= 8) return 'text-amber-500'
    return 'text-green-500'
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/risk-assessments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Kunne ikke oppdatere status')
      
      toast.success('Status oppdatert')
      router.refresh()
    } catch (error) {
      toast.error('Kunne ikke oppdatere status')
    }
  }

  return (
    <div className="space-y-4">
      {assessments.map((assessment) => (
        <Card key={assessment.id} className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                <Link 
                  href={`/dashboard/risk-assessments/${assessment.id}`}
                  className="hover:underline"
                >
                  {assessment.title}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground">
                {assessment.description}
              </p>
              <p className="text-sm text-muted-foreground">
                Høyeste risikofaktor: <span className={getRiskColor(calculateHighestRisk(assessment.hazards))}>
                  {calculateHighestRisk(assessment.hazards)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[assessment.status]}>
                {statusLabels[assessment.status]}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(assessment.id, Status.COMPLETED)}
                    disabled={assessment.status === Status.COMPLETED}
                  >
                    Fullfør
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(assessment.id, Status.DRAFT)}
                    disabled={assessment.status === Status.DRAFT}
                  >
                    Sett som utkast
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
            <div className="space-x-4">
              <span>Farer identifisert: {assessment.hazards.length}</span>
              <span>Tiltak: {assessment.hazards.reduce((acc, hazard) => 
                acc + hazard.measures.length, 0
              )}</span>
            </div>
            <span>Sist oppdatert: {formatDate(assessment.updatedAt)}</span>
          </div>
        </Card>
      ))}
    </div>
  )
} 