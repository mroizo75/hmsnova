"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils/date"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, FileText, Building2, User } from "lucide-react"

interface SafetyRoundsClientProps {
  safetyRounds: any[] // Vi kan lage en type for dette senere
}

export function SafetyRoundsClient({ safetyRounds }: SafetyRoundsClientProps) {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vernerunder</h1>
          <p className="text-muted-foreground">
            Oversikt over alle vernerunder
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/safety-rounds/templates">
              <FileText className="mr-2 h-4 w-4" />
              Administrer maler
            </Link>
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Opprett ny vernerunde
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle vernerunder</CardTitle>
          <CardDescription>
            En oversikt over alle vernerunder på tvers av bedrifter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Bedrift</TableHead>
                <TableHead>Mal</TableHead>
                <TableHead>Opprettet av</TableHead>
                <TableHead>Tildelt til</TableHead>
                <TableHead>Dato</TableHead>
                <TableHead>Handling</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safetyRounds.map((round) => (
                <TableRow key={round.id}>
                  <TableCell>
                    <Badge variant={getStatusVariant(round.status)}>
                      {getStatusText(round.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      {round.company.name}
                    </div>
                  </TableCell>
                  <TableCell>{round.template.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      {round.createdBy.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {round.assignedTo ? (
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        {round.assignedTo.name}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Ikke tildelt</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(round.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/safety-rounds/${round.id}`}>
                        Se detaljer
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'PENDING':
      return 'secondary'
    case 'IN_PROGRESS':
      return 'default'
    case 'COMPLETED':
      return 'success'
    default:
      return 'secondary'
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'PENDING':
      return 'Venter'
    case 'IN_PROGRESS':
      return 'Pågår'
    case 'COMPLETED':
      return 'Fullført'
    default:
      return status
  }
} 