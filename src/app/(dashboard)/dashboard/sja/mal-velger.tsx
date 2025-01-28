import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MalVelgerProps {
  onVelgMal: (malId: string) => void
}

export function MalVelger({ onVelgMal }: MalVelgerProps) {
  const [open, setOpen] = useState(false)
  const [maler, setMaler] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function hentMaler() {
      setIsLoading(true)
      try {
        const response = await fetch('/api/sja/mal')
        if (!response.ok) throw new Error('Kunne ikke hente maler')
        const data = await response.json()
        setMaler(data)
      } catch (error) {
        console.error('Feil ved henting av maler:', error)
        toast.error('Kunne ikke hente maler')
      } finally {
        setIsLoading(false)
      }
    }

    hentMaler()
  }, [])

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
              onValueChange={(value) => {
                if (value) {
                  onVelgMal(value)
                  setOpen(false)
                }
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Velg mal" />
              </SelectTrigger>
              <SelectContent>
                {maler.map((mal) => (
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