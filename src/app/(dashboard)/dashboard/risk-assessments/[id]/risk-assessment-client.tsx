"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { AddHazardDialog } from "./add-hazard-dialog"
import { RiskMatrix } from "./risk-matrix"
import { useState, useEffect, useCallback } from "react"
import { Pencil, ArrowLeft, MapPin, RefreshCw, Plus } from "lucide-react"
import Link from "next/link"
import { HazardCard } from "./hazard-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UpdateStatusDialog } from "./update-status-dialog"
import { WeatherForecast } from "./weather-forecast"
import { LocationDialog } from "./location-dialog"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { AddMeasureDialog } from "./add-measure-dialog"

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

interface Hazard {
  id: string
  description: string
  consequence: string
  probability: number
  severity: number
  riskLevel: number
  existingMeasures: string | null
  measures: Measure[]
  riskMeasures: {
    id: string
    description: string
    status: string
    type: string
    priority: string
    hazardId: string
  }[]
  hmsChanges: {
    hmsChange: {
      id: string
      title: string
      description: string
      status: string
      implementedAt: Date | null
    }
  }[]
  metadata?: any
}

interface RiskAssessment {
  id: string
  title: string
  description: string
  department: string | null
  activity: string
  status: string
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
  hazards: Hazard[]
  equipment?: {
    id: string
    name: string
    type: string
    category: string
    serialNumber?: string | null
    location?: string | null
  } | null
  location?: {
    latitude: number | null
    longitude: number | null
    name?: string | null
  } | null
}

interface PageProps {
  assessment: RiskAssessment
  onUpdate: () => Promise<void>
}

export function RiskAssessmentClient({ assessment, onUpdate }: PageProps) {
  // Logging for debugging av location-data
  console.log("RiskAssessmentClient - location:", assessment.location);
  if (assessment.location) {
    console.log("Location har name?", !!assessment.location.name);
    console.log("Location name verdi:", assessment.location.name);
  }

  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [locationDialogOpen, setLocationDialogOpen] = useState(false)
  const [uniqueHazards, setUniqueHazards] = useState<Hazard[]>([])
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [isRefetching, setIsRefetching] = useState(false)
  const [addMeasureDialogOpen, setAddMeasureDialogOpen] = useState(false)
  const [selectedHazardId, setSelectedHazardId] = useState<string | null>(null)

  // Funksjon for å hente risikovurdering med cache-busting
  const fetchRiskAssessment = useCallback(async () => {
    const timestamp = Date.now()
    const response = await fetch(`/api/risk-assessments/${assessment.id}?t=${timestamp}&nocache=true`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
    if (!response.ok) {
      throw new Error('Kunne ikke hente oppdatert risikovurdering')
    }
    
    return response.json()
  }, [assessment.id])
  
  // Bruk react-query for å håndtere data-fetching og caching
  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ['riskAssessment', assessment.id, lastUpdate],
    queryFn: fetchRiskAssessment,
    initialData: assessment,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 sekunder
    refetchInterval: 1000 * 60 * 2, // Refetch hver 2. minutt
  })

  useEffect(() => {
    if (error) {
      console.error('Feil ved henting av risikovurdering:', error)
      toast.error('Kunne ikke oppdatere risikovurderingen')
    }
  }, [error])
  
  // Manuell oppdatering av data
  const handleRefresh = async () => {
    setIsRefetching(true)
    try {
      await refetch()
      toast.success('Risikovurdering oppdatert')
    } catch (err) {
      console.error('Feil ved manuell oppdatering:', err)
      toast.error('Kunne ikke oppdatere risikovurderingen')
    } finally {
      setIsRefetching(false)
    }
  }
  
  useEffect(() => {
    if (data && data.hazards) {
      console.log('RiskAssessmentClient: Oppdaterer hazards', { 
        count: data.hazards.length,
        timestamp: Date.now()
      });
      
      const uniqueIds = new Set();
      const filteredHazards = data.hazards.filter((hazard: Hazard) => {
        if (uniqueIds.has(hazard.id)) {
          return false;
        }
        uniqueIds.add(hazard.id);
        return true;
      });
      
      // Sorter etter risikonivå (høyest først)
      const sortedHazards = [...filteredHazards].sort((a, b) => b.riskLevel - a.riskLevel);
      
      setUniqueHazards(sortedHazards);
      console.log(`Filtrert ${data.hazards.length} hazards til ${sortedHazards.length} unike hazards`);
    }
  }, [data, lastUpdate]);

  const handleUpdate = async () => {
    try {
      await onUpdate();
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Feil ved oppdatering:', error);
    }
  };

  const matrixData = uniqueHazards.reduce((acc, hazard) => {
    acc[hazard.severity - 1][hazard.probability - 1] = 
      (acc[hazard.severity - 1][hazard.probability - 1] || 0) + 1
    return acc
  }, Array(5).fill(null).map(() => Array(5).fill(0)))

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2 items-center">
          <Link href="/dashboard/risk-assessments" className="bg-primary/10 p-2 rounded-full">
            <ArrowLeft className="h-4 w-4 text-primary" />
          </Link>
          <h1 className="text-2xl font-bold">{data.title}</h1>
        </div>
        
        <div className="flex gap-2">
        <UpdateStatusDialog 
                assessment={data}
                open={statusDialogOpen}
                onOpenChange={setStatusDialogOpen}
                onUpdate={handleUpdate}
              />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Oppdater
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/risk-assessments/${data.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Rediger
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Detaljer</h2>
            <p className="text-gray-600 mb-4">{data.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium">Aktivitet</h3>
                <p>{data.activity}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Avdeling</h3>
                <p>{data.department || "Ikke spesifisert"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Status</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={
                    data.status === "Completed" ? "success" :
                    data.status === "In Progress" ? "warning" :
                    data.status === "Planned" ? "secondary" :
                    "default"
                  }>
                    {data.status === "Completed" ? "Fullført" :
                     data.status === "In Progress" ? "Pågående" :
                     data.status === "Planned" ? "Planlagt" :
                     data.status}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setStatusDialogOpen(true)}
                    className="h-7 px-2"
                  >
                    Endre
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium">Opprettet</h3>
                <p>{formatDate(data.createdAt)}</p>
              </div>
            </div>
            
            {/* Legg til dialogknapper for farer og statusendring */}
            {/* <div className="flex justify-between items-center mt-6">
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Legg til fare
              </Button>
              
            </div> */}
          </div>
        </Card>
        
        {/* Høyre kolonne */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Sammendrag</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Totalt antall farer:</span>
                <span className="font-medium">{uniqueHazards.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Sist oppdatert:</span>
                <span className="font-medium">{formatDate(data.updatedAt)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Liste over farer */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Identifiserte farer</h2>
        <div className="space-y-4">
          {uniqueHazards.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500">Ingen farer er lagt til ennå</p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Legg til første fare
              </Button>
            </Card>
          ) : (
            uniqueHazards.map((hazard) => (
              <HazardCard 
                key={hazard.id} 
                hazard={hazard} 
                assessmentId={data.id}
                onAddMeasure={() => {
                  setSelectedHazardId(hazard.id);
                  setAddMeasureDialogOpen(true);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Dialogen for å legge til farer */}
      <AddHazardDialog
        assessmentId={data.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        location={data.location}
      />
      
      {/* Dialog for å legge til tiltak */}
      {selectedHazardId && (
        <AddMeasureDialog
          assessmentId={data.id}
          hazardId={selectedHazardId}
          open={addMeasureDialogOpen}
          onOpenChange={setAddMeasureDialogOpen}
        />
      )}

      {/* Risikomatrise-delen */}
      <div className="grid md:grid-cols-1 gap-6 bg-white rounded-lg">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Risikovurdering</h2>
            <RiskMatrix data={uniqueHazards.map(h => [h.probability, h.severity, h.id])} />
            <div className="text-xs text-gray-500 mt-2 text-center">Risikofordeling ({uniqueHazards.length} farer)</div>
          </div>
        </Card>
      </div>
      
      {/* Værdata og lokasjon */}
      <div className="grid md:grid-cols-1 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Værdata</h2>
              {data.location && (
                <Button variant="outline" size="sm" onClick={() => setLocationDialogOpen(true)}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Endre lokasjon
                </Button>
              )}
            </div>
            
            {/* Ny WeatherForecast komponent som håndterer lokasjoner selv */}
            <WeatherForecast 
              initialLatitude={data.location?.latitude || null} 
              initialLongitude={data.location?.longitude || null} 
              initialLocationName={data.location?.name || null}
            />
          </div>
        </Card>
      </div>

      {data.location && (
        <LocationDialog
          assessmentId={data.id}
          location={data.location}
          open={locationDialogOpen}
          onOpenChange={setLocationDialogOpen}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
} 