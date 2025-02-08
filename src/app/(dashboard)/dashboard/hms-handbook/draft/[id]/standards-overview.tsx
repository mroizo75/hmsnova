"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface Standard {
  id: string
  code: string
  title: string
  description: string
  category: string
}

const ISO_STANDARDS: Standard[] = [
  {
    id: "iso-45001",
    code: "ISO 45001",
    title: "Arbeidsmiljøstyringssystemer",
    description: "Krav og veiledning for bruk",
    category: "HMS"
  },
  {
    id: "iso-14001",
    code: "ISO 14001",
    title: "Miljøstyringssystemer",
    description: "Spesifikasjon med veiledning",
    category: "Miljø"
  },
  // Legg til flere standarder her
]

const NS_STANDARDS: Standard[] = [
  {
    id: "ns-5814",
    code: "NS 5814",
    title: "Krav til risikovurderinger",
    description: "Prinsipper for strukturert risikovurdering",
    category: "Risiko"
  },
  // Legg til flere standarder her
]

interface Props {
  section: Section
  onUpdateStandards: (standards: string[]) => void
}

export function StandardsOverview({ section, onUpdateStandards }: Props) {
  const [selectedStandards, setSelectedStandards] = useState<string[]>(
    section.standards?.map(s => s.id) || []
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Relevante standarder</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Legg til standard
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Velg standarder</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">ISO Standarder</h3>
                <div className="space-y-3">
                  {ISO_STANDARDS.map(standard => (
                    <div key={standard.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={standard.id}
                        checked={selectedStandards.includes(standard.id)}
                        onCheckedChange={(checked) => {
                          const newSelected = checked
                            ? [...selectedStandards, standard.id]
                            : selectedStandards.filter(id => id !== standard.id)
                          setSelectedStandards(newSelected)
                          onUpdateStandards(newSelected)
                        }}
                      />
                      <div className="space-y-1">
                        <label htmlFor={standard.id} className="text-sm font-medium">
                          {standard.code} - {standard.title}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {standard.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Norsk Standard</h3>
                <div className="space-y-3">
                  {NS_STANDARDS.map(standard => (
                    <div key={standard.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={standard.id}
                        checked={selectedStandards.includes(standard.id)}
                        onCheckedChange={(checked) => {
                          const newSelected = checked
                            ? [...selectedStandards, standard.id]
                            : selectedStandards.filter(id => id !== standard.id)
                          setSelectedStandards(newSelected)
                          onUpdateStandards(newSelected)
                        }}
                      />
                      <div className="space-y-1">
                        <label htmlFor={standard.id} className="text-sm font-medium">
                          {standard.code} - {standard.title}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {standard.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selectedStandards.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ingen standarder er valgt for denne seksjonen
        </p>
      ) : (
        <div className="grid gap-4 grid-cols-2">
          {selectedStandards.map(standardId => {
            const standard = [...ISO_STANDARDS, ...NS_STANDARDS].find(s => s.id === standardId)
            if (!standard) return null

            return (
              <Card key={standard.id} className="p-4">
                <h3 className="font-medium">{standard.code}</h3>
                <p className="text-sm">{standard.title}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {standard.description}
                </p>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 