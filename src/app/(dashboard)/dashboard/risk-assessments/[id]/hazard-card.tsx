"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AddMeasureDialog } from "./add-measure-dialog"
import { useState } from "react"
import { formatDate } from "@/lib/utils/date"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, CloudSun, CloudRain, Wind, Snowflake, AlertTriangle } from "lucide-react"
import { MeasureList } from "./measure-list"
import { format, parseISO } from "date-fns"
import { nb } from "date-fns/locale"

interface Measure {
  id: string
  description: string
  type: string
  status: string
  priority: string
  dueDate: Date | null
  completedAt: Date | null
  assignedTo: string | null
}

interface RiskAssessmentMeasure {
  id: string
  description: string
  type: string
  status: string
  priority: string
  hazardId: string
}

interface HazardCardProps {
  assessmentId: string
  hazard: {
    id: string
    description: string
    consequence: string
    probability: number
    severity: number
    riskLevel: number
    existingMeasures: string | null
    riskMeasures: RiskAssessmentMeasure[]
    metadata?: any // For værrisikoinformasjon
  }
  onAddMeasure?: () => void
}

export function HazardCard({ assessmentId, hazard, onAddMeasure }: HazardCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const getRiskColor = (riskLevel: number) => {
    if (riskLevel > 15) return "destructive"
    if (riskLevel > 8) return "warning"
    return "outline"
  }
  
  // Sjekk om faren har værrisikoinformasjon
  const hasWeatherRisk = hazard.metadata?.weatherRisk?.included === true
  const weatherRiskNotes = hazard.metadata?.weatherRisk?.notes
  const weatherData = hazard.metadata?.weatherRisk?.forecasts || []

  // Hjelpefunksjoner for værsymboler og risikonivåer
  function getWeatherIcon(symbolCode: string) {
    if (!symbolCode) return <CloudSun className="h-4 w-4 text-blue-500" />;
    
    if (symbolCode.includes('rain')) {
      return <CloudRain className="h-4 w-4 text-blue-500" />
    } else if (symbolCode.includes('snow')) {
      return <Snowflake className="h-4 w-4 text-blue-200" />
    } else if (symbolCode.includes('clear')) {
      return <CloudSun className="h-4 w-4 text-yellow-500" />
    } else if (symbolCode.includes('cloud')) {
      return <CloudRain className="h-4 w-4 text-gray-500" strokeWidth={1} />
    } else {
      return <CloudSun className="h-4 w-4 text-blue-500" />
    }
  }

  function getRiskBadgeColor(riskLevel: 'high' | 'medium' | 'low') {
    if (riskLevel === 'high') return "text-red-700 bg-red-100";
    if (riskLevel === 'medium') return "text-amber-700 bg-amber-100";
    return "text-green-700 bg-green-100";
  }

  return (
    <Card className="p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </CollapsibleTrigger>
              <h3 className="font-medium">{hazard.description}</h3>
              {hasWeatherRisk && (
                <Badge variant="outline" className="ml-2 flex items-center gap-1">
                  <CloudSun className="h-3 w-3 text-blue-500" />
                  <span>Værrisiko</span>
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{hazard.consequence}</p>
            
            {/* Vis kortfattet værdata alltid - også når kortet er lukket */}
            {hasWeatherRisk && weatherData && weatherData.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {weatherData.slice(0, 3).map((forecast: any, index: number) => (
                  <div 
                    key={index} 
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ${getRiskBadgeColor(forecast.riskLevel)}`}
                  >
                    {getWeatherIcon(forecast.symbolCode)}
                    <span>{forecast.maxTemp?.toFixed(0) || "?"}°</span>
                    <Wind className="h-3 w-3 ml-1" />
                    <span>{forecast.maxWind?.toFixed(1) || "?"} m/s</span>
                    {forecast.riskLevel === 'high' && <AlertTriangle className="h-3 w-3 text-red-600" />}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Risikonivå: {hazard.riskLevel}
            </Badge>
            <Badge variant="secondary">
              S: {hazard.severity} | W: {hazard.probability}
            </Badge>
          </div>
        </div>

        <CollapsibleContent className="mt-4 space-y-4">
          {hazard.existingMeasures && (
            <div>
              <h4 className="text-sm font-medium mb-1">Eksisterende tiltak</h4>
              <p className="text-sm text-muted-foreground">
                {hazard.existingMeasures}
              </p>
            </div>
          )}
          
          {/* Vis detaljert værdata i utvidet visning */}
          {hasWeatherRisk && weatherRiskNotes && (
            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <CloudSun className="h-4 w-4 text-blue-500" />
                <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Værrisiko</h4>
              </div>
              
              {/* Vis detaljerte værdata hvis tilgjengelig */}
              {weatherData && weatherData.length > 0 && (
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {weatherData.slice(0, 3).map((forecast: any, index: number) => (
                    <div 
                      key={index} 
                      className={`border rounded-md p-2 ${getRiskBadgeColor(forecast.riskLevel)}`}
                    >
                      <div className="text-xs font-medium mb-1">
                        {forecast.date ? format(parseISO(forecast.date), 'EEE d.MMM', { locale: nb }) : `Dag ${index + 1}`}
                      </div>
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <div className="flex items-center gap-1">
                          {getWeatherIcon(forecast.symbolCode)}
                          <span>{forecast.maxTemp?.toFixed(0) || "?"}&deg;C</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Wind className="h-3 w-3" />
                          <span>{forecast.maxWind?.toFixed(1) || "?"} m/s</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {forecast.riskLevel === 'high' && <AlertTriangle className="h-3 w-3 text-red-600" />}
                        <span className="text-xs">
                          {forecast.riskLevel === 'high' ? 'Høy risiko' : 
                           forecast.riskLevel === 'medium' ? 'Moderat risiko' : 'Lav risiko'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-blue-700 dark:text-blue-300">
                {weatherRiskNotes}
              </p>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Nye tiltak</h4>
              <AddMeasureDialog
                assessmentId={assessmentId}
                hazardId={hazard.id}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
              />
            </div>
            <MeasureList 
              assessmentId={assessmentId}
              hazardId={hazard.id}
              measures={hazard.riskMeasures}
            />
          </div>

          <div className="mt-4 flex justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onAddMeasure ? onAddMeasure() : setDialogOpen(true)}
            >
              Legg til tiltak
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
} 