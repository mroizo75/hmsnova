"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { SafetyRoundImageUpload } from "@/components/safety-rounds/safety-round-image-upload"
import { FindingDialog } from "@/components/safety-rounds/finding-dialog"
import { useRouter } from "next/navigation"
import type { SafetyRound } from "@prisma/client"

interface Props {
  safetyRound: SafetyRound & {
    checklistItems: Array<{
      id: string
      category: string
      question: string
      description: string | null
      isRequired: boolean
      order: number
      findings: any[]
      images: any[]
    }>
  }
  userId: string
}

export function EmployeeSafetyRoundForm({ safetyRound, userId }: Props) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [findingDialogOpen, setFindingDialogOpen] = useState(false)

  const currentItem = safetyRound.checklistItems[currentStep]
  const totalSteps = safetyRound.checklistItems.length

  const isAllAnswered = safetyRound.checklistItems.every(
    item => responses[item.id]
  )

  const handleResponse = async (value: string) => {
    try {
      const res = await fetch(`/api/safety-rounds/${safetyRound.id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklistItemId: currentItem.id,
          response: value,
          comment: comments[currentItem.id]
        })
      })

      if (!res.ok) throw new Error()

      setResponses(prev => ({
        ...prev,
        [currentItem.id]: value
      }))

      // Gå automatisk til neste hvis ikke siste
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1)
      }

      toast.success('Svar lagret')
    } catch {
      toast.error('Kunne ikke lagre svar')
    }
  }

  const handleComplete = async () => {
    try {
      const res = await fetch(`/api/safety-rounds/${safetyRound.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      })

      if (!res.ok) throw new Error()

      toast.success('Vernerunde fullført')
      router.push('/employee/safety-rounds')
      router.refresh()
    } catch {
      toast.error('Kunne ikke fullføre vernerunden')
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Spørsmål {currentStep + 1} av {totalSteps}</span>
        <Badge>{safetyRound.status}</Badge>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full">
        <div 
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Current Question */}
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">{currentItem.question}</h3>
            {currentItem.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {currentItem.description}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {['YES', 'NO', 'NA'].map((value) => (
              <Button 
                key={value}
                variant={responses[currentItem.id] === value ? 'default' : 'outline'}
                onClick={() => handleResponse(value)}
              >
                {value === 'YES' ? 'Ja' : value === 'NO' ? 'Nei' : 'N/A'}
              </Button>
            ))}
          </div>

          <Textarea
            placeholder="Legg til kommentar..."
            value={comments[currentItem.id] || ''}
            onChange={(e) => setComments(prev => ({
              ...prev,
              [currentItem.id]: e.target.value
            }))}
          />

          <SafetyRoundImageUpload 
            onUpload={async (file) => {
              // Implementer bildeopplasting
            }}
          />

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setFindingDialogOpen(true)}
          >
            Registrer funn
          </Button>
        </div>
      </Card>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            Forrige
          </Button>
          
          {currentStep === totalSteps - 1 ? (
            <Button
              className="flex-1"
              onClick={handleComplete}
              disabled={!isAllAnswered}
            >
              Fullfør vernerunde
            </Button>
          ) : (
            <Button
              className="flex-1"
              onClick={() => setCurrentStep(prev => Math.min(totalSteps - 1, prev + 1))}
              disabled={!responses[currentItem.id]}
            >
              Neste
            </Button>
          )}
        </div>
      </div>

      <FindingDialog 
        open={findingDialogOpen}
        onOpenChange={setFindingDialogOpen}
        safetyRoundId={safetyRound.id}
        checklistItemId={currentItem.id}
      />
    </div>
  )
} 