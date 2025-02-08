"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { useState, useCallback } from "react"
import { SafetyRoundFindings } from "./safety-round-findings"
import type { SafetyRound } from "@prisma/client"
import { UpdateStatusDialog } from '@/app/(dashboard)/dashboard/safety-rounds/[id]/update-status-dialog'
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { SafetyRoundImageUpload } from "./safety-round-image-upload"
import { uploadToStorage } from "@/lib/storage"
import { SafetyRoundCheckpoints } from "@/app/(dashboard)/dashboard/safety-rounds/[id]/safety-round-checkpoints"

interface ChecklistItemImage {
  id: string
  url: string
  caption?: string | null
}

interface ChecklistItem {
  id: string
  category: string
  question: string
  description: string | null
  type: 'YES_NO' | 'MULTIPLE_CHOICE' | 'TEXT' | 'NUMBER' | 'PHOTO'
  options: any | null
  response: string | null
  comment: string | null
  order: number
  isRequired: boolean
  findings: Array<{
    id: string
    severity: string
    status: string
    images: Array<{
      id: string
      url: string
    }>
  }>
}

interface Props {
  safetyRound: {
    id: string
    companyId: string
    title: string
    description: string | null
    status: string
    scheduledDate: Date | null
    dueDate: Date | null
    completedAt: Date | null
    template: {
      id: string
      name: string
      description: string | null
    } | null
    assignedUser: {
      id: string
      name: string | null
      email: string
      image: string | null
    } | null
    participants: Array<{
      user: {
        id: string
        name: string | null
        email: string
        image: string | null
      }
    }>
    checklistItems: Array<{
      id: string
      category: string
      question: string
      description: string | null
      type: 'YES_NO' | 'MULTIPLE_CHOICE' | 'TEXT' | 'NUMBER' | 'PHOTO'
      options: any | null
      response: string | null
      comment: string | null
      order: number
      isRequired: boolean
      findings: Array<{
        id: string
        severity: string
        status: string
        images: Array<{
          id: string
          url: string
        }>
      }>
    }>
    images: Array<{
      id: string
      url: string
      caption?: string | null
    }>
    findings: Array<{
      id: string
      description: string
      severity: string
      status: string
      images: Array<{
        id: string
        url: string
        caption?: string | null
      }>
      measures: Array<{
        id: string
        description: string
        status: string
        priority: string
        dueDate?: Date | null
        completedAt?: Date | null
      }>
    }>
  }
  isAdmin?: boolean
}

export function SafetyRoundDetails({ safetyRound, isAdmin = false }: Props) {
  console.log('SafetyRoundDetails received:', {
    hasChecklistItems: !!safetyRound.checklistItems,
    checklistItemsLength: safetyRound.checklistItems?.length,
    firstItem: safetyRound.checklistItems?.[0]
  })

  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false)
  const [responses, setResponses] = useState<Record<string, { response: string; comment: string }>>(() => {
    // Initialiser med eksisterende svar
    return safetyRound.checklistItems.reduce((acc, item) => ({
      ...acc,
      [item.id]: { 
        response: item.response || '', 
        comment: item.comment || '' 
      }
    }), {})
  })
  const [itemImages, setItemImages] = useState<Record<string, ChecklistItemImage[]>>({})

  // Beregn fremgang
  const progress = Math.round(
    (Object.values(responses).filter(r => r.response).length / safetyRound.checklistItems.length) * 100
  )

  // Grupper sjekklistepunkter etter kategori
  const groupedChecklistItems = safetyRound.checklistItems.reduce((acc, item) => {
    console.log('Processing item for grouping:', item)
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof safetyRound.checklistItems>)

  console.log('Grouped items:', groupedChecklistItems)

  async function handleResponse(itemId: string, response: string) {
    try {
      const res = await fetch(`/api/safety-rounds/${safetyRound.id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklistItemId: itemId,
          response,
          comment: responses[itemId]?.comment
        })
      })

      if (!res.ok) throw new Error()

      setResponses(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], response }
      }))

      toast.success('Svar lagret')
    } catch {
      toast.error('Kunne ikke lagre svar')
    }
  }

  async function handleComment(itemId: string, comment: string) {
    setResponses(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], comment }
    }))
  }

  const handleImageUpload = useCallback(async (itemId: string, file: File) => {
    try {
      // Generer filsti med bedrift og vernerunde ID
      const path = `companies/${safetyRound.companyId}/safety-rounds/${safetyRound.id}/checklist-items/${itemId}/${file.name}`
      
      // Last opp fil til storage
      const filePath = await uploadToStorage(file, path, safetyRound.companyId)

      // Lagre bilde i databasen
      const response = await fetch(`/api/safety-rounds/${safetyRound.id}/checklist-items/${itemId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: filePath })
      })

      if (!response.ok) throw new Error()

      const newImage = await response.json()
      
      // Oppdater state
      setItemImages(prev => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), newImage]
      }))

      toast.success('Bilde lastet opp')
    } catch (error) {
      toast.error('Kunne ikke laste opp bilde')
    }
  }, [safetyRound.id, safetyRound.companyId])

  // Legg til nullsjekk på start
  if (!safetyRound || !safetyRound.checklistItems) {
    console.error('Invalid safetyRound data:', safetyRound)
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{safetyRound.title}</h1>
          {safetyRound.description && (
            <p className="text-muted-foreground mt-2">{safetyRound.description}</p>
          )}
        </div>
        {isAdmin && (
          <Button onClick={() => setIsUpdateStatusOpen(true)}>
            Oppdater status
          </Button>
        )}
      </div>

      {/* Fremgangsindikator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Fremgang</h3>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Deltagere */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">Deltagere</h2>
          {safetyRound.participants.map(participant => (
            <div key={participant.user.id}>
              {participant.user.name}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sjekkliste */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">Sjekkliste</h2>
          <div className="space-y-6">
            {(() => {
              console.log('About to render checklist, groups:', Object.keys(groupedChecklistItems))
              return Object.entries(groupedChecklistItems).map(([category, items]) => {
                console.log('Rendering category:', category, 'with items:', items)
                return (
                  <div key={category}>
                    <h3 className="font-medium text-lg mb-3">{category}</h3>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="border-b pb-3">
                          <p className="font-medium mb-2">{item.question}</p>
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              {['YES', 'NO', 'NA'].map((value) => (
                                <Button 
                                  key={value}
                                  size="sm" 
                                  variant={responses[item.id]?.response === value ? 'default' : 'outline'}
                                  onClick={() => handleResponse(item.id, value)}
                                >
                                  {value === 'YES' ? 'Ja' : value === 'NO' ? 'Nei' : 'N/A'}
                                </Button>
                              ))}
                            </div>
                            <Textarea
                              placeholder="Legg til kommentar..."
                              value={responses[item.id]?.comment || ''}
                              onChange={(e) => handleComment(item.id, e.target.value)}
                              className="h-20"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </CardContent>
      </Card>

      <SafetyRoundFindings 
        findings={safetyRound.findings as any} 
        safetyRoundId={safetyRound.id}
        open={false}
        onOpenChange={() => {}}
      />


      {isAdmin && (
        <UpdateStatusDialog 
          open={isUpdateStatusOpen}
          onOpenChange={setIsUpdateStatusOpen}
          safetyRound={safetyRound as any}
        />
      )}
    </div>
  )
} 