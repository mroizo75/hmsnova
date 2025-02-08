"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ChevronRight, 
  Clock, 
  Image as ImageIcon,
  Users,
  AlertCircle 
} from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils/date"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { SafetyRound } from "@prisma/client"

interface Props {
  rounds: (SafetyRound & {
    template: {
      name: string
    } | null
    assignedUser: {
      id: string
      name: string | null
      email: string
    } | null
    participants: Array<{
      user: {
        id: string
        name: string | null
        email: string
      }
    }>
    findings: Array<{
      id: string
      severity: string
      status: string
      images: Array<{
        id: string
        url: string
      }>
    }>
    images: Array<{
      id: string
      url: string
    }>
  })[]
  onUpdate: (round: SafetyRound) => void
}

const statusLabels: Record<string, string> = {
  'DRAFT': 'Utkast',
  'SCHEDULED': 'Planlagt',
  'IN_PROGRESS': 'Pågår',
  'COMPLETED': 'Fullført',
  'CANCELLED': 'Kansellert'
}

const statusColors: Record<string, string> = {
  'DRAFT': 'bg-gray-100 text-gray-800',
  'SCHEDULED': 'bg-blue-100 text-blue-800',
  'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
  'COMPLETED': 'bg-green-100 text-green-800',
  'CANCELLED': 'bg-red-100 text-red-800'
}

export function SafetyRoundList({ rounds, onUpdate }: Props) {
  if (rounds.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Ingen vernerunder å vise
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {rounds.map((round) => {
        const isOverdue = round.dueDate && new Date(round.dueDate) < new Date()
        const totalImages = (round.images?.length || 0) + 
          round.findings.reduce((acc, finding) => acc + (finding.images?.length || 0), 0)
        
        return (
          <Card key={round.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{round.title}</h3>
                    <Badge className={statusColors[round.status]}>
                      {statusLabels[round.status]}
                    </Badge>
                    {isOverdue && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Forfalt
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {round.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Opprettet: {formatDate(round.createdAt)}</span>
                    {round.scheduledDate && (
                      <span>Planlagt: {formatDate(round.scheduledDate)}</span>
                    )}
                    {round.dueDate && (
                      <span>Frist: {formatDate(round.dueDate)}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    {round.template && (
                      <Badge variant="outline">
                        Mal: {round.template.name}
                      </Badge>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {totalImages} {totalImages === 1 ? 'bilde' : 'bilder'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {round.findings.length} {round.findings.length === 1 ? 'funn' : 'funn'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex -space-x-2">
                            {round.assignedUser && (
                              <Avatar className="h-8 w-8 border-2 border-background">
                                <AvatarImage 
                                  src={round.assignedUser.image} 
                                  alt={round.assignedUser.name || round.assignedUser.email} 
                                />
                                <AvatarFallback>
                                  {(round.assignedUser.name || round.assignedUser.email).charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            {round.participants.slice(0, 3).map(({ user }) => (
                              <Avatar key={user.id} className="h-8 w-8 border-2 border-background">
                                <AvatarImage 
                                  src={user.image} 
                                  alt={user.name || user.email} 
                                />
                                <AvatarFallback>
                                  {(user.name || user.email).charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {round.participants.length > 3 && (
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border-2 border-background">
                                <span className="text-xs">
                                  +{round.participants.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            {round.assignedUser && (
                              <p className="text-sm">
                                Ansvarlig: {round.assignedUser.name || round.assignedUser.email}
                              </p>
                            )}
                            <p className="text-sm">
                              Deltakere: {round.participants.length}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <Link href={`/dashboard/safety-rounds/${round.id}`}>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 