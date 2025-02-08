"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeviationList } from "./deviation-list"
import { CreateDeviationDialog } from "./create-deviation-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Deviation } from "@/lib/types/deviation"
import { useState } from "react"

interface Props {
  deviations: Deviation[]
}

export function DeviationsClient({ deviations }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  
  
  const activeDeviations = deviations.filter(d => {
    const status = (d.status || '').toUpperCase()
    const isActive = [
      'OPEN',           // Engelsk
      'IN_PROGRESS',    // Engelsk
      'AAPEN',          // Norsk
      'PAAGAAR',        // Norsk
      'NY'             // Norsk
    ].includes(status)
    return isActive
  })
  
  const closedDeviations = deviations.filter(d => {
    const status = (d.status || '').toUpperCase()
    return [
      'CLOSED',         // Engelsk
      'COMPLETED',      // Engelsk
      'LUKKET',         // Norsk
      'FULLFOERT'       // Norsk
    ].includes(status)
  })


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Avviksbehandling</h1>
          <p className="text-muted-foreground">
            Registrering og oppfølging av avvik og hendelser
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nytt avvik
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Aktive avvik</TabsTrigger>
          <TabsTrigger value="closed">Lukkede avvik</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <DeviationList deviations={activeDeviations} />
        </TabsContent>
        
        <TabsContent value="closed">
          <DeviationList deviations={closedDeviations} />
        </TabsContent>
      </Tabs>

      <CreateDeviationDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </div>
  )
} 