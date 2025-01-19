"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChecklistItem } from "../types"

export interface ChecklistItemInput {
  category: string
  question: string
  description: string | null
  isRequired: boolean
  order: number
  response?: string | null
  comment?: string | null
  imageUrl?: string | null
  completedAt?: string | null
  completedBy?: string | null
  safetyRoundId?: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ChecklistItemInput) => Promise<void>
  initialData?: ChecklistItem
  existingCategories: string[]
}

const defaultCategories = [
  "Arbeidsmiljø",
  "Brannsikkerhet",
  "Elektrisk sikkerhet",
  "Førstehjelpsutstyr",
  "Kjemikalier",
  "Maskiner og utstyr",
  "Personlig verneutstyr",
  "Rømningsveier",
  "Orden og renhold"
]

export function ChecklistItemDialog({ open, onOpenChange, onSubmit, initialData, existingCategories }: Props) {
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState(initialData?.category || "")
  const [newCategory, setNewCategory] = useState("")
  const [question, setQuestion] = useState(initialData?.question || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [isRequired, setIsRequired] = useState(initialData?.isRequired ?? true)
  const [useExistingCategory, setUseExistingCategory] = useState(true)

  const allCategories = Array.from(new Set([
    ...defaultCategories,
    ...existingCategories
  ]))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await onSubmit({
        category: category === "NEW" ? newCategory : category,
        question,
        description,
        isRequired,
        order: initialData?.order ?? 0
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting checklist item:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Rediger sjekkpunkt" : "Legg til sjekkpunkt"}
          </DialogTitle>
          <DialogDescription>
            Fyll ut informasjonen under for å {initialData ? "oppdatere" : "legge til"} et sjekkpunkt
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Kategori</Label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                id="existing"
                checked={useExistingCategory}
                onChange={() => setUseExistingCategory(true)}
              />
              <Label htmlFor="existing">Bruk eksisterende kategori</Label>
              
              <input
                type="radio"
                id="new"
                checked={!useExistingCategory}
                onChange={() => setUseExistingCategory(false)}
              />
              <Label htmlFor="new">Opprett ny kategori</Label>
            </div>

            {useExistingCategory ? (
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg kategori" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Skriv inn ny kategori"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Spørsmål</Label>
            <Input
              placeholder="F.eks: Er rømningsveiene frie for hindringer?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Beskrivelse (valgfri)</Label>
            <Textarea
              placeholder="Legg til hjelpetekst eller veiledning"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="required"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
            />
            <Label htmlFor="required">Obligatorisk sjekkpunkt</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={loading || !category || !question}>
              {loading ? "Lagrer..." : initialData ? "Oppdater" : "Legg til"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 