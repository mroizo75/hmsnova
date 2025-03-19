'use client'

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin } from "lucide-react"
import { toast } from "sonner"

interface Location {
  latitude: number | null
  longitude: number | null
}

interface LocationEditDialogProps {
  assessmentId: string
  location?: Location | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => Promise<void>
}

export function LocationEditDialog({ 
  assessmentId, 
  location,
  open, 
  onOpenChange,
  onUpdate
}: LocationEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationValues, setLocationValues] = useState<Location>({
    latitude: null,
    longitude: null
  })
  
  // Oppdater lokasjonsverdier når dialog åpnes eller lokasjon endres
  useEffect(() => {
    if (open) {
      if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
        setLocationValues({
          latitude: location.latitude,
          longitude: location.longitude
        })
      } else {
        setLocationValues({
          latitude: null,
          longitude: null
        })
      }
    }
  }, [location, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!locationValues.latitude || !locationValues.longitude) {
      toast.error("Ugyldig lokasjon", {
        description: "Både breddegrad og lengdegrad må angis"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      console.log('Sender lokasjonsdata:', locationValues)
      // Sikre at desimaltallene sendes med punktum, ikke komma
      const dataToSend = {
        latitude: Number(locationValues.latitude),
        longitude: Number(locationValues.longitude)
      }
      
      const response = await fetch(`/api/dashboard/risk-assessments/${assessmentId}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })
      
      if (!response.ok) {
        throw new Error('Feil ved oppdatering av lokasjon')
      }
      
      toast.success("Lokasjon oppdatert", {
        description: "Lokasjonsinformasjonen er lagret"
      })
      
      await onUpdate()
      onOpenChange(false)
    } catch (error) {
      console.error('Feil ved oppdatering av lokasjon:', error)
      toast.error("Feil", {
        description: "Kunne ikke oppdatere lokasjon"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Konverter til Number for å sikre riktig formatering
          const lat = Number(position.coords.latitude);
          const lng = Number(position.coords.longitude);
          
          setLocationValues({
            latitude: lat,
            longitude: lng
          })
          
          toast.success("Posisjon funnet", {
            description: "Gjeldende posisjon er hentet"
          })
        },
        (error) => {
          console.error('Feil ved lokalisering:', error)
          toast.error("Kunne ikke hente posisjon", {
            description: error.message
          })
        }
      )
    } else {
      toast.error("Denne nettleseren støtter ikke geolokalisering")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'latitude' | 'longitude') => {
    // Erstatt alle komma med punktum for å sikre riktig formatering
    const rawValue = e.target.value.replace(/,/g, '.')
    const value = rawValue ? parseFloat(rawValue) : null
    
    setLocationValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatCoordinate = (value: number | null): string => {
    if (value === null) return '';
    // Sikre at desimaltall alltid vises med punktum, ikke komma
    return value.toString().replace(/,/g, '.');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rediger lokasjon</DialogTitle>
            <DialogDescription>
              Angi GPS-koordinater for denne risikovurderingen
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Breddegrad</Label>
                <Input
                  id="latitude"
                  type="text"
                  inputMode="decimal"
                  value={formatCoordinate(locationValues.latitude)}
                  onChange={(e) => handleInputChange(e, 'latitude')}
                  placeholder="f.eks. 59.911491"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Lengdegrad</Label>
                <Input
                  id="longitude"
                  type="text"
                  inputMode="decimal"
                  value={formatCoordinate(locationValues.longitude)}
                  onChange={(e) => handleInputChange(e, 'longitude')}
                  placeholder="f.eks. 10.757933"
                />
              </div>
            </div>
            
            <Button 
              type="button"
              variant="outline"
              onClick={handleGetCurrentLocation}
              className="w-full flex items-center justify-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Bruk min nåværende posisjon
            </Button>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Lagrer..." : "Lagre lokasjon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 