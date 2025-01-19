"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, ClipboardCheck } from "lucide-react"
import { CreateSafetyRoundDialog } from "./create-safety-round-dialog"
import { SafetyRoundsList } from "./safety-rounds-list"
import { CompletedRoundsList } from "./completed-rounds-list"
import { Role } from "@prisma/client"

interface SafetyRoundsAdminClientProps {
  companyId: string
  safetyRounds: Array<{
    id: string
    title: string
    description: string | null
    status: string
    scheduledDate: Date | null
    dueDate: Date | null
    completedAt: Date | null
    findings: Array<{
      id: string
      severity: string
      status: string
      measures: Array<{
        completedAt: Date | null
      }>
    }>
  }>
  users: Array<{
    id: string
    name: string | null
    email: string
    role: Role
  }>
}

export function SafetyRoundsAdminClient({ companyId, safetyRounds, users }: SafetyRoundsAdminClientProps) {
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
          <CompletedRoundsList safetyRounds={safetyRounds} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 