"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { AddHazardDialog } from "./add-hazard-dialog"
import { RiskMatrix } from "./risk-matrix"
import { useState } from "react"
import { Pencil, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { HazardCard } from "./hazard-card"

interface Measure {
  id: string
  description: string
  type: string
  status: string
  priority: string
  dueDate: Date | null
  completedAt: Date | null
  assignedTo: string | null
}

interface Hazard {
  id: string
  description: string
  consequence: string
  probability: number
  severity: number
  riskLevel: number
  existingMeasures: string | null
  measures: Measure[]
  riskMeasures: {
    id: string
    description: string
    status: string
    type: string
    priority: string
    hazardId: string
  }[]
  hmsChanges: {
    hmsChange: {
      id: string
      title: string
      description: string
      status: string
      implementedAt: Date | null
    }
  }[]
}

interface RiskAssessment {
  id: string
  title: string
  description: string
  department: string | null
  activity: string
  status: string
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
  hazards: Hazard[]
}

interface PageProps {
  assessment: RiskAssessment
}

export function RiskAssessmentClient({ assessment }: PageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Beregn statistikk for risikomatrisen
  const matrixData = assessment.hazards.reduce((acc, hazard) => {
    acc[hazard.severity - 1][hazard.probability - 1] = 
      (acc[hazard.severity - 1][hazard.probability - 1] || 0) + 1
    return acc
  }, Array(5).fill(null).map(() => Array(5).fill(0)))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/risk-assessments"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 flex justify-between items-center">
          <h1 className="text-3xl font-bold">{assessment.title}</h1>
          <div className="flex items-center gap-2">
            <Badge>{assessment.status}</Badge>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {isEditing ? "Avslutt redigering" : "Rediger"}
            </Button>
            <AddHazardDialog 
              assessmentId={assessment.id} 
              open={dialogOpen}
              onOpenChange={setDialogOpen}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Beskrivelse</h3>
                <p className="text-muted-foreground">{assessment.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Avdeling/Område</h3>
                  <p className="text-muted-foreground">{assessment.department || "Ikke spesifisert"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Aktivitet</h3>
                  <p className="text-muted-foreground">{assessment.activity}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Frist</h3>
                  <p className="text-muted-foreground">
                    {assessment.dueDate ? formatDate(assessment.dueDate) : "Ingen frist satt"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Sist oppdatert</h3>
                  <p className="text-muted-foreground">{formatDate(assessment.updatedAt)}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Risikomatrise</h2>
            <RiskMatrix data={matrixData} />
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Identifiserte farer</h2>
              <Button onClick={() => setDialogOpen(true)}>Legg til fare</Button>
            </div>
            <div className="space-y-4">
              {assessment.hazards.map((hazard) => (
                <HazardCard 
                  key={hazard.id}
                  assessmentId={assessment.id}
                  hazard={hazard as Hazard}
                />
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Statistikk</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Totalt antall farer:</span>
                <span className="font-medium">{assessment.hazards.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Høy risiko ({">"}15):</span>
                <span className="font-medium">
                  {assessment.hazards.filter(h => h.riskLevel > 15).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Middels risiko (9-15):</span>
                <span className="font-medium">
                  {assessment.hazards.filter(h => h.riskLevel > 8 && h.riskLevel <= 15).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Lav risiko (≤8):</span>
                <span className="font-medium">
                  {assessment.hazards.filter(h => h.riskLevel <= 8).length}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 