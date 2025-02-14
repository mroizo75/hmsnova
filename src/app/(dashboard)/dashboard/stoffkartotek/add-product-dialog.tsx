"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FareSymbol, PPESymbol } from "@prisma/client"
import { FareSymbolBadge } from "./fare-symbol-badge"
import { PPESymbolBadge } from "./ppe-symbol-badge"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddStoffkartotekModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void 
  onAdd: (formData: FormData) => Promise<any>
}

// Definer PPE_GROUPS etter at vi er sikre på at PPESymbol er importert
console.log("Available PPE Symbols:", Object.values(PPESymbol)) // Debug logging

// Definer gruppene med PPESymbol fra Prisma
const PPE_GROUPS = {
  'Personlig verneutstyr': [
    'M003_WEAR_EAR_PROTECTION',
    'M004_WEAR_EYE_PROTECTION',
    'M007_WEAR_OPAQUE_EYE_PROTECTION',
    'M008_WEAR_FOOT_PROTECTION',
    'M009_WEAR_PROTECTIVE_GLOVES',
    'M010_WEAR_PROTECTIVE_CLOTHING',
    'M013_WEAR_FACE_SHIELD',
    'M014_WEAR_HEAD_PROTECTION',
    'M015_WEAR_HIGH_VISIBILITY',
    'M016_WEAR_MASK',
    'M017_WEAR_RESPIRATORY_PROTECTION',
    'M018_WEAR_SAFETY_HARNESS',
    'M026_USE_PROTECTIVE_APRON',
    'M047_USE_BREATHING_EQUIPMENT',
    'M059_WEAR_LAB_COAT'
  ] as PPESymbol[],
  'Hygiene og sikkerhet': [
    'M011_WASH_HANDS',
    'M022_USE_BARRIER_CREAM'
  ] as PPESymbol[]
} as const;

export function AddStoffkartotekModal({
  open,
  onOpenChange,
  onAdd,
}: AddStoffkartotekModalProps) {
  console.log("Component mounted") // Debug logging
  
  const [selectedSymbols, setSelectedSymbols] = useState<FareSymbol[]>([])
  const [selectedPPE, setSelectedPPE] = useState<PPESymbol[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.includes('pdf')) {
        alert('Kun PDF-filer er tillatt')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Filen er for stor (maks 10MB)')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      const formData = new FormData(e.currentTarget)
      
      let databladUrl = ''
      if (selectedFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', selectedFile)
        
        const uploadResponse = await fetch('/api/stoffkartotek/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Kunne ikke laste opp datablad')
        }

        const uploadData = await uploadResponse.json()
        databladUrl = uploadData.url
      }
      
      const requestData = {
        produktnavn: formData.get('produktnavn'),
        produsent: formData.get('produsent'),
        databladUrl,
        beskrivelse: formData.get('beskrivelse'),
        bruksomrade: formData.get('bruksomrade'),
        fareSymboler: selectedSymbols.map(symbol => ({ symbol })),
        ppeSymboler: selectedPPE.map(symbol => ({ symbol }))
      }

      const response = await fetch('/api/stoffkartotek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error('Kunne ikke lagre produkt')
      }

      onOpenChange(false)
      setSelectedSymbols([])
      setSelectedPPE([])
      setSelectedFile(null)
      setUploadProgress(0)
      ;(e.target as HTMLFormElement).reset()

      window.location.reload()
    } catch (error) {
      console.error('Feil ved lagring:', error)
      alert(error instanceof Error ? error.message : 'Kunne ikke lagre produkt')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleSymbol = (symbol: FareSymbol) => {
    setSelectedSymbols(prev => 
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    )
  }

  const togglePPE = (symbol: PPESymbol) => {
    console.log("Toggling symbol:", symbol)
    setSelectedPPE(prev => 
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Legg til nytt produkt</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-6 -mr-6">
          <div className="space-y-6 pb-6 mx-3">
            {/* Grunnleggende info */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">
                Grunnleggende informasjon
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="produktnavn">Produktnavn *</Label>
                  <Input
                    id="produktnavn"
                    name="produktnavn"
                    required
                    placeholder="Produktnavn"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="produsent">Produsent</Label>
                  <Input
                    id="produsent"
                    name="produsent"
                    placeholder="Produsent"
                  />
                </div>
              </div>
            </div>

            {/* Datablad */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">
                Sikkerhetsdatablad
              </h3>
              <div className="space-y-2">
                <Label htmlFor="datablad">Last opp datablad (PDF)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="datablad"
                    name="datablad"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-16 text-sm text-muted-foreground">
                      {uploadProgress}%
                    </div>
                  )}
                </div>
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Valgt fil: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Faresymboler */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">
                Faresymboler
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(FareSymbol).map((symbol) => (
                  <button
                    key={symbol}
                    type="button"
                    onClick={() => toggleSymbol(symbol)}
                    className={cn(
                      "flex items-center justify-start w-full p-2 rounded transition-colors",
                      selectedSymbols.includes(symbol)
                        ? "bg-secondary/20 ring-2 ring-secondary"
                        : "hover:bg-secondary/10"
                    )}
                  >
                    <FareSymbolBadge 
                      symbol={symbol} 
                      showLabel 
                      selected={selectedSymbols.includes(symbol)} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* PPE Symboler */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">
                Påkrevd verneutstyr
              </h3>
              {Object.entries(PPE_GROUPS).map(([groupName, symbols]) => (
                <div key={groupName} className="space-y-2">
                  <h4 className="text-sm font-medium">{groupName}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {symbols.map((symbol) => (
                      <button
                        key={symbol}
                        type="button"
                        onClick={() => togglePPE(symbol)}
                        className={cn(
                          "flex items-center justify-start w-full p-2 rounded transition-colors",
                          selectedPPE.includes(symbol)
                            ? "bg-secondary/20 ring-2 ring-secondary"
                            : "hover:bg-secondary/10"
                        )}
                      >
                        <PPESymbolBadge 
                          symbol={symbol} 
                          showLabel 
                          selected={selectedPPE.includes(symbol)} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Beskrivelse og bruksområde */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">
                Detaljer
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="beskrivelse">Beskrivelse</Label>
                  <Textarea
                    id="beskrivelse"
                    name="beskrivelse"
                    placeholder="Beskrivelse av produktet"
                    className="h-24"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bruksomrade">Bruksområde</Label>
                  <Textarea
                    id="bruksomrade"
                    name="bruksomrade"
                    placeholder="Hvor og hvordan brukes produktet"
                    className="h-24"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer med knapper */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Avbryt
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            onClick={() => {
              const form = document.querySelector('form')
              if (form) form.requestSubmit()
            }}
          >
            {isSubmitting ? 'Lagrer...' : 'Lagre'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 