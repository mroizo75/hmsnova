"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, FileText, User, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils/date"
import Link from "next/link"

interface SafetyRoundCardProps {
  round: any // TODO: Legg til riktig type
  onUpdate: (round: any) => void
}

export function SafetyRoundCard({ round, onUpdate }: SafetyRoundCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">Utkast</Badge>
      case 'SCHEDULED':
        return <Badge variant="default">Planlagt</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="default">Pågår</Badge>
      case 'COMPLETED':
        return <Badge variant="success">Fullført</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{round.title}</CardTitle>
            <CardDescription>
              {round.description || "Ingen beskrivelse"}
            </CardDescription>
          </div>
          {getStatusBadge(round.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Building2 className="mr-2 h-4 w-4" />
                {round.company.name}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="mr-2 h-4 w-4" />
                Opprettet av: {round.creator.name}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Opprettet: {formatDate(round.createdAt)}
              </div>
              {round.dueDate && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  Frist: {formatDate(round.dueDate)}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              asChild
            >
              <Link href={`/admin/safety-rounds/${round.id}`}>
                <FileText className="h-4 w-4 mr-2" />
                Se detaljer
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 