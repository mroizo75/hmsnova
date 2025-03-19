'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Pencil } from 'lucide-react'
import { LocationDialog } from './location-dialog'
import { WeatherMiniPreview } from './weather-mini-preview'
import { toast } from 'sonner'

interface Location {
  latitude: number
  longitude: number
  name?: string | null
  weatherData?: any
}

interface LocationButtonProps {
  sjaId: string
  initialLocation?: string | null | undefined
}

export function LocationButton({ sjaId, initialLocation }: LocationButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [location, setLocation] = useState<Location | null>(parseLocation(initialLocation || null))
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Parse the location from JSON string
  function parseLocation(locationJson: string | null): Location | null {
    if (!locationJson) return null
    
    try {
      const parsed = JSON.parse(locationJson)
      
      // Validate if it contains required fields
      if (
        typeof parsed.latitude === 'number' && 
        typeof parsed.longitude === 'number' &&
        !isNaN(parsed.latitude) && 
        !isNaN(parsed.longitude)
      ) {
        return {
          latitude: parsed.latitude,
          longitude: parsed.longitude,
          name: parsed.name || null,
          weatherData: parsed.weatherData || null
        }
      }
      
      return null
    } catch (error) {
      console.error('Feil ved parsing av lokasjon:', error)
      return null
    }
  }
  
  // Handle location update after dialog is closed
  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      // Refetch the SJA to get the updated location
      const response = await fetch(`/api/sja/${sjaId}?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error('Kunne ikke hente oppdatert SJA')
      }
      
      const data = await response.json()
      const updatedLocation = parseLocation(data.location)
      
      if (updatedLocation) {
        setLocation(updatedLocation)
        toast.success('Lokasjon oppdatert', {
          description: `${updatedLocation.name || 'Lokasjon'} er registrert`
        })
      }
    } catch (error) {
      console.error('Feil ved oppdatering av lokasjon:', error)
      toast.error('Kunne ikke hente oppdatert lokasjon')
    } finally {
      setIsUpdating(false)
    }
  }
  
  return (
    <>
      <div className="space-y-4">
        {location ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <h3 className="text-sm font-medium">
                  {location.name || 'Lokasjon'} ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
                </h3>
              </div>
            </div>
            
            <WeatherMiniPreview 
              latitude={location.latitude} 
              longitude={location.longitude} 
              id={sjaId}
              locationName={location.name}
              weatherData={location.weatherData}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Ingen lokasjon er registrert for denne SJA-en. Legg til lokasjon for å se værvarsel.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsDialogOpen(true)}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Legg til lokasjon
            </Button>
          </div>
        )}
      </div>
      
      <LocationDialog 
        sjaId={sjaId}
        location={location}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onUpdate={handleUpdate}
      />
    </>
  )
} 