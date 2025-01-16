"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, ClipboardCheck } from "lucide-react"
import { CreateSafetyRoundDialog } from "./create-safety-round-dialog"
import { SafetyRoundsList } from "./safety-rounds-list"
import { CompletedRoundsList } from "./completed-rounds-list"

interface SafetyRoundsAdminClientProps {
  companyId: string
}

export function SafetyRoundsAdminClient({ companyId }: SafetyRoundsAdminClientProps) {
  const refreshData = () => {
    window.location.reload()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vernerunder</h1>
        <CreateSafetyRoundDialog companyId={companyId} onSuccess={refreshData} />
      </div>
      <Tabs defaultValue="planned">
        <TabsList>
          <TabsTrigger value="planned">Planlagte</TabsTrigger>
          <TabsTrigger value="completed">Fullførte</TabsTrigger>
        </TabsList>
        <TabsContent value="planned">
          <SafetyRoundsList companyId={companyId} />
        </TabsContent>
        <TabsContent value="completed">
          <CompletedRoundsList companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 