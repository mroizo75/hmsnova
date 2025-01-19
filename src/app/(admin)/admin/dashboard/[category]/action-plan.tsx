"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, RefreshCw, Clock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ActionPlanProps {
  category: string
  deviations: any[]
}

function getPriorityLabel(priority: string): string {
  switch (priority.toUpperCase()) {
    case 'HIGH':
      return 'Høy'
    case 'MEDIUM':
      return 'Middels'
    case 'LOW':
      return 'Lav'
    default:
      return priority
  }
}

function getPriorityVariant(priority: string): "default" | "secondary" | "destructive" | "outline" {
  switch (priority) {
    case 'HIGH':
      return "destructive"
    case 'MEDIUM':
      return "secondary"
    case 'LOW':
      return "outline"
    default:
      return "default"
  }
}

export function ActionPlan({ category, deviations }: ActionPlanProps) {
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActionPlan = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/analysis/${encodeURIComponent(category)}?deviations=${encodeURIComponent(JSON.stringify(deviations))}`,
        {
          headers: {
            'Accept-Language': 'nb-NO',
            'Cache-Control': 'no-cache'
          }
        }
      )
      if (!response.ok) throw new Error('Kunne ikke hente handlingsplan')
      const data = await response.json()
      setPlan(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ukjent feil')
    } finally {
      setLoading(false)
    }
  }, [category, deviations])

  useEffect(() => {
    fetchActionPlan()
  }, [fetchActionPlan])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Genererer handlingsplan...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Analyse og implementeringsplan</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchActionPlan}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Oppdater analyse
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Situasjonsoppsummering</h3>
          <p className="text-muted-foreground">{plan.summary}</p>
          
          <h3 className="font-semibold mt-6">Hovedutfordringer</h3>
          <ul className="list-disc pl-4 space-y-2">
            {plan.mainChallenges.map((challenge: string, i: number) => (
              <li key={i} className="text-muted-foreground">{challenge}</li>
            ))}
          </ul>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="shortterm">
            <AccordionTrigger>Kortsiktige tiltak (0-3 måneder)</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                {plan.shortTermActions.map((action: any, i: number) => (
                  <div key={i} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{action.action}</p>
                      <Badge variant={getPriorityVariant(action.priority)}>
                        {getPriorityLabel(action.priority)}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{action.timeframe}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Ressurser:</strong> {action.resources}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="long-term">
            <AccordionTrigger>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Langsiktige tiltak (3-12 måneder)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                {plan.longTermActions.map((action: any, i: number) => (
                  <div key={i} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{action.action}</p>
                      <Badge variant={getPriorityVariant(action.priority)}>
                        {getPriorityLabel(action.priority)}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{action.timeframe}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Ressurser:</strong> {action.resources}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="resources">
            <AccordionTrigger>Ressursbehov og KPIer</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Ressursbehov</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>Personell: {plan.resourceNeeds.personnel}</li>
                      <li>Opplæring: {plan.resourceNeeds.training}</li>
                      <li>Utstyr: {plan.resourceNeeds.equipment}</li>
                      <li>Estimert kostnad: {plan.resourceNeeds.estimated_cost}</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Foreslåtte KPIer</h4>
                    <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                      {plan.kpis.map((kpi: string, i: number) => (
                        <li key={i}>{kpi}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="risks">
            <AccordionTrigger>Implementeringsrisiko</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                {plan.implementationRisks.map((risk: any, i: number) => (
                  <div key={i} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{risk.risk}</p>
                      <Badge variant={getPriorityVariant(risk.impact)}>
                        {getPriorityLabel(risk.impact)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tiltak: {risk.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
} 