import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SJAMal {
  id: string
  navn: string
  arbeidssted: string
  beskrivelse: string
  deltakere: string
  risikoer: any[]
  tiltak: any[]
}

interface MalVelgerProps {
  onVelgMal: (mal: SJAMal) => void
}

export function MalVelger({ onVelgMal }: MalVelgerProps) {
  const [open, setOpen] = useState(false)

  const { data: maler, isLoading, error } = useQuery<SJAMal[]>({
    queryKey: ['sjaMaler'],
    queryFn: async () => {
      const response = await fetch('/api/sja/mal')
      if (!response.ok) throw new Error('Kunne ikke hente maler')
      return response.json()
    }
  })

  if (error) {
    toast.error('Kunne ikke hente maler')
  }

  const handleVelgMal = async (malId: string) => {
    try {
      const response = await fetch(`/api/sja/mal/${malId}`)
      if (!response.ok) throw new Error('Kunne ikke hente mal')
      
      const mal = await response.json()
      onVelgMal(mal)
      setOpen(false)
    } catch (error) {
      console.error('Feil ved henting av mal:', error)
      toast.error('Kunne ikke hente mal')
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Velg fra mal
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Velg SJA-mal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Select
              disabled={isLoading}
              onValueChange={handleVelgMal}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={isLoading ? "Laster maler..." : "Velg mal"} />
              </SelectTrigger>
              <SelectContent>
                {maler?.map((mal) => (
                  <SelectItem key={mal.id} value={mal.id}>
                    {mal.navn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 