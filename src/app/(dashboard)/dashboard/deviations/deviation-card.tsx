"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Clock } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils/date"
import { statusLabels } from "@/lib/constants/deviations"

// Oversettelser for prioritet
const priorityLabels: Record<string, string> = {
  "LOW": "Lav",
  "MEDIUM": "Middels",
  "HIGH": "Høy",
  "CRITICAL": "Kritisk"
}

// Status farger og tekst - kun norske statuser
const statusConfig: Record<string, { color: string; label: string }> = {
  "AAPEN": { color: "bg-yellow-500/10 text-yellow-500", label: "Åpen" },
  "PAAGAAR": { color: "bg-blue-500/10 text-blue-500", label: "Pågår" },
  "FULLFOERT": { color: "bg-green-500/10 text-green-500", label: "Fullført" },
  "LUKKET": { color: "bg-gray-500/10 text-gray-500", label: "Lukket" },
  // Mapping for engelske statuser til norske
  "OPEN": { color: "bg-yellow-500/10 text-yellow-500", label: "Åpen" },
  "IN_PROGRESS": { color: "bg-blue-500/10 text-blue-500", label: "Pågår" },
  "COMPLETED": { color: "bg-green-500/10 text-green-500", label: "Fullført" },
  "CLOSED": { color: "bg-gray-500/10 text-gray-500", label: "Lukket" }
}

interface DeviationCardProps {
  deviation: {
    id: string
    title: string
    description: string
    priority?: string
    status: string
    createdAt: Date
    createdBy: string
    reportedBy: string
    dueDate?: Date | null
    completedMeasures?: number
    totalMeasures?: number
    location?: string | null
  }
}

export function DeviationCard({ deviation }: DeviationCardProps) {
  const statusStyle = statusConfig[deviation.status] || { 
    color: "bg-gray-500/10 text-gray-500",
    label: deviation.status 
  }

  const isOverdue = deviation.dueDate && new Date(deviation.dueDate) < new Date()

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="p-6">
        <div className="flex items-start justify-between gap-4">
          <Link 
            href={`/dashboard/deviations/${deviation.id}`}
            className="flex-1 group"
          >
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
              {deviation.title}
            </h3>
          </Link>
          <div className="flex gap-2 flex-shrink-0">
            {isOverdue && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Forfalt
              </Badge>
            )}
            <Badge className={statusStyle.color}>
              {statusStyle.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          {deviation.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Opprettet:</span> {formatDate(deviation.createdAt)}
          </div>
          <div>
            <span className="font-medium">Alvorlighet:</span> {deviation.priority ? priorityLabels[deviation.priority] : "Ingen prioritet"}
          </div>
          <div>
            <span className="font-medium">Opprettet av:</span> {deviation.createdBy}
          </div>
          {deviation.dueDate && (
            <div>
              <span className="font-medium">Frist:</span> {formatDate(deviation.dueDate)}
            </div>
          )}
          {deviation.location && (
            <div>
              <span className="font-medium">Sted:</span> {deviation.location}
            </div>
          )}
          {deviation.totalMeasures !== undefined && (
            <div>
              <span className="font-medium">Tiltak:</span> {deviation.completedMeasures}/{deviation.totalMeasures}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Link href={`/dashboard/deviations/${deviation.id}`}>
            <Button variant="ghost" size="sm" className="hover:bg-primary/5">
              Se detaljer
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
} 