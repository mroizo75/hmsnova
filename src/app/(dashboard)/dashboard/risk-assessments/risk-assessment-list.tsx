"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils/date"
import Link from "next/link"
import { statusColors, statusLabels } from "@/lib/constants/risk-assessments"

interface Hazard {
  id: string
  description: string
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
            </div>
            <Badge className={statusColors[assessment.status]}>
              {statusLabels[assessment.status]}
            </Badge>
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