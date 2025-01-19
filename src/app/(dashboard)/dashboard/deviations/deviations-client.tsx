"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { CreateDeviationDialog } from "./create-deviation-dialog"
import { DeviationList } from "./deviation-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import type { Deviation } from "@/lib/types/deviation"

interface PageProps {
  deviations: Deviation[]
}

export function DeviationsClient({ deviations }: PageProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const openDeviations = deviations.filter(d => d.status !== 'CLOSED')
  const closedDeviations = deviations.filter(d => d.status === 'CLOSED')

  const stats = {
    total: deviations.length,
    open: openDeviations.length,
    critical: deviations.filter(d => d.severity === 'CRITICAL').length,
    overdue: openDeviations.filter(d => d.dueDate && new Date(d.dueDate) < new Date()).length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Avviksbehandling</h1>
          <p className="text-muted-foreground">
            Registrering og oppfølging av avvik og hendelser
          </p>
        </div>
        <CreateDeviationDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Totalt</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Åpne</p>
              <p className="text-2xl font-bold">{stats.open}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Kritiske</p>
              <p className="text-2xl font-bold">{stats.critical}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Forfalt</p>
              <p className="text-2xl font-bold">{stats.overdue}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open">
            Åpne avvik
          </TabsTrigger>
          <TabsTrigger value="closed">
            Lukkede avvik
          </TabsTrigger>
        </TabsList>
        <TabsContent value="open" className="mt-4">
          <DeviationList deviations={openDeviations as Deviation[]} />
        </TabsContent>
        <TabsContent value="closed" className="mt-4">
          <DeviationList deviations={closedDeviations as Deviation[]} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 