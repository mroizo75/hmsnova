"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { CreateAssessmentDialog } from "./create-assessment-dialog"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RiskAssessmentList } from "./risk-assessment-list"
import { FilterBar, FilterOptions, SortOptions } from "./filter-bar"

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

interface RiskAssessmentsClientProps {
  assessments: RiskAssessment[]
}

export function RiskAssessmentsClient({ assessments }: RiskAssessmentsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    status: "all",
    dateFrom: undefined,
    dateTo: undefined,
  })
  const [sortOption, setSortOption] = useState<SortOptions>("newest")

  const activeAssessments = assessments.filter(a => 
    ['DRAFT', 'IN_PROGRESS', 'REVIEW'].includes(a.status)
  )
  const completedAssessments = assessments.filter(a => 
    ['COMPLETED', 'CLOSED'].includes(a.status)
  )

  // Statistikk
  const totalAssessments = assessments.length
  const openAssessments = assessments.filter(a => a.status === 'DRAFT').length
  const inProgressAssessments = assessments.filter(a => a.status === 'IN_PROGRESS').length
  const completedAssessmentsCount = assessments.filter(a => a.status === 'COMPLETED').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Risikovurderinger</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ny risikovurdering
        </Button>
      </div>

      {/* Statistikk-kort */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <div className="text-sm font-medium">Totalt</div>
          </div>
          <div className="text-2xl font-bold">{totalAssessments}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <div className="text-sm font-medium">Åpne</div>
          </div>
          <div className="text-2xl font-bold">{openAssessments}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <div className="text-sm font-medium">Under arbeid</div>
          </div>
          <div className="text-2xl font-bold">{inProgressAssessments}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div className="text-sm font-medium">Fullført</div>
          </div>
          <div className="text-2xl font-bold">{completedAssessmentsCount}</div>
        </Card>
      </div>

      {/* Filtreringsbar */}
      <FilterBar
        filterOptions={filterOptions}
        onFilterChange={setFilterOptions}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Aktive risikovurderinger
          </TabsTrigger>
          <TabsTrigger value="completed">
            Fullførte risikovurderinger
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <RiskAssessmentList assessments={activeAssessments} />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <RiskAssessmentList assessments={completedAssessments} />
        </TabsContent>
      </Tabs>

      <CreateAssessmentDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
      />
    </div>
  )
} 