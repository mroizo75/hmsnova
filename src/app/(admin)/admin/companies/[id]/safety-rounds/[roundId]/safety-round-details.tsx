"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Pencil, Plus, Download } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils/date"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent 
} from "@/components/ui/card"
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ChecklistItemDialog } from "./checklist-item-dialog"
import { debounce } from "lodash"
import { FindingDialog } from "./finding-dialog"
import { SafetyRoundReport } from "./safety-round-report"

interface SafetyRound {
  id: string
  title: string
  description: string | null
  status: string
  scheduledDate: string | null
  dueDate: string | null
  completedAt: string | null
  assignedTo: string | null
  assignedUser: {
    name: string
    email: string
  } | null
  checklistItems: Array<{
    id: string
    category: string
    question: string
    description: string | null
    response: string | null
    comment: string | null
    imageUrl: string | null
    isRequired: boolean
    completedAt: string | null
    completedBy: string | null
  }>
  findings: Array<{
    id: string
    description: string
    severity: string
    status: string
    measures: Array<any>
    checklistItem: {
      category: string
      question: string
    }
  }>
}

interface Props {
  params: {
    id: string
    roundId: string
  }
}

export function SafetyRoundDetails({ params }: Props) {
  const [safetyRound, setSafetyRound] = useState<SafetyRound | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | undefined>()
  const isEditable = safetyRound?.status === 'DRAFT' || safetyRound?.status === 'IN_PROGRESS'
  const [findingDialogOpen, setFindingDialogOpen] = useState(false)
  const [selectedChecklistItem, setSelectedChecklistItem] = useState<string | null>(null)

  const fetchSafetyRound = useCallback(async () => {
    console.log('Fetching safety round with params:', params)
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/admin/companies/${params.id}/safety-rounds/${params.roundId}`)
      console.log('Response status:', response.status)
      
      const data = await response.json()
      console.log('Received data:', data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Kunne ikke hente vernerunde')
      }
      
      console.log('Fetched safety round data:', data)
      console.log('Checklist items count:', data.checklistItems?.length)
      
      setSafetyRound(data)
    } catch (error) {
      console.error('Error fetching safety round:', error)
      setError(error instanceof Error ? error.message : 'Kunne ikke hente vernerunde')
      toast.error('Kunne ikke hente vernerunde')
    } finally {
      setLoading(false)
    }
  }, [params.id, params.roundId])

  const debouncedCommentUpdate = useCallback(
    debounce(async (itemId: string, comment: string) => {
      try {
        const response = await fetch(
          `/api/admin/companies/${params.id}/safety-rounds/${params.roundId}/checklist/${itemId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment })
          }
        )

        if (!response.ok) throw new Error('Kunne ikke oppdatere kommentar')

        const updatedItem = await response.json()
        setSafetyRound(prev => {
          if (!prev) return prev
          return {
            ...prev,
            checklistItems: prev.checklistItems.map(item =>
              item.id === itemId ? updatedItem : item
            )
          }
        })
      } catch (error) {
        console.error('Error updating comment:', error)
        toast.error('Kunne ikke oppdatere kommentar')
      }
    }, 500),
    [params.id, params.roundId]
  )

  useEffect(() => {
    fetchSafetyRound()
  }, [fetchSafetyRound])

  useEffect(() => {
    return () => {
      debouncedCommentUpdate.cancel()
    }
  }, [debouncedCommentUpdate])

  const handleChecklistUpdate = async (items: any) => {
    setSafetyRound(prev => prev ? { ...prev, checklistItems: items } : null)
  }

  const handleAddChecklistItem = () => {
    setSelectedItem(undefined)
    setDialogOpen(true)
  }

  const handleEditItem = (item: ChecklistItem) => {
    setSelectedItem(item)
    setDialogOpen(true)
  }

  const handleSubmitChecklistItem = async (data: Omit<ChecklistItem, 'id'>) => {
    try {
      const url = selectedItem 
        ? `/api/admin/companies/${params.id}/safety-rounds/${params.roundId}/checklist/${selectedItem.id}`
        : `/api/admin/companies/${params.id}/safety-rounds/${params.roundId}/checklist`

      const method = selectedItem ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          order: selectedItem 
            ? data.order 
            : safetyRound?.checklistItems.length ?? 0
        })
      })

      if (!response.ok) {
        throw new Error('Kunne ikke lagre sjekkpunkt')
      }

      const updatedItem = await response.json()
      
      setSafetyRound(prev => {
        if (!prev) return prev
        
        const items = selectedItem
          ? prev.checklistItems.map(item => 
              item.id === selectedItem.id ? updatedItem : item
            )
          : [...prev.checklistItems, updatedItem]

        return {
          ...prev,
          checklistItems: items
        }
      })

      toast.success(
        selectedItem 
          ? 'Sjekkpunkt oppdatert' 
          : 'Sjekkpunkt lagt til'
      )
    } catch (error) {
      console.error('Error saving checklist item:', error)
      toast.error('Kunne ikke lagre sjekkpunkt')
    }
  }

  const handleResponseChange = async (itemId: string, value: string) => {
    try {
      const response = await fetch(
        `/api/admin/companies/${params.id}/safety-rounds/${params.roundId}/checklist/${itemId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ response: value })
        }
      )

      if (!response.ok) throw new Error('Kunne ikke oppdatere svar')

      const updatedItem = await response.json()
      setSafetyRound(prev => {
        if (!prev) return prev
        return {
          ...prev,
          checklistItems: prev.checklistItems.map(item =>
            item.id === itemId ? updatedItem : item
          )
        }
      })
    } catch (error) {
      console.error('Error updating response:', error)
      toast.error('Kunne ikke oppdatere svar')
    }
  }

  const handleCommentChange = (itemId: string, comment: string) => {
    setSafetyRound(prev => {
      if (!prev) return prev
      return {
        ...prev,
        checklistItems: prev.checklistItems.map(item =>
          item.id === itemId ? { ...item, comment } : item
        )
      }
    })
    debouncedCommentUpdate(itemId, comment)
  }

  const handleAddFinding = (item: ChecklistItem) => {
    setSelectedChecklistItem(item.id)
    setFindingDialogOpen(true)
  }

  const handleSubmitFinding = async (data: {
    description: string
    severity: string
    checklistItemId: string
  }) => {
    try {
      if (!data.description || !data.severity || !data.checklistItemId) {
        throw new Error('Mangler påkrevde felt')
      }

      console.log('Sending finding data:', data)

      const response = await fetch(
        `/api/admin/companies/${params.id}/safety-rounds/${params.roundId}/findings`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      )

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Kunne ikke registrere funn')
      }

      console.log('Received new finding:', responseData)
      
      setSafetyRound(prev => {
        if (!prev) return prev
        return {
          ...prev,
          findings: [...prev.findings, responseData]
        }
      })

      toast.success('Funn registrert')
    } catch (error) {
      console.error('Error creating finding:', error)
      toast.error(error instanceof Error ? error.message : 'Kunne ikke registrere funn')
    }
  }

  const handleComplete = async () => {
    try {
      // Sjekk om alle obligatoriske sjekkpunkter er besvart
      const unansweredRequired = safetyRound?.checklistItems.filter(
        item => item.isRequired && !item.response
      )

      if (unansweredRequired && unansweredRequired.length > 0) {
        toast.error(
          `Du må svare på alle obligatoriske sjekkpunkter (${unansweredRequired.length} gjenstår)`
        )
        return
      }

      // Sjekk om alle "NEI" svar har registrerte funn
      const noResponsesWithoutFindings = safetyRound?.checklistItems.filter(item => 
        item.response === 'NO' && 
        !safetyRound.findings.some(f => f.checklistItemId === item.id)
      )

      if (noResponsesWithoutFindings && noResponsesWithoutFindings.length > 0) {
        toast.error(
          `Du må registrere funn for alle "Nei" svar (${noResponsesWithoutFindings.length} gjenstår)`
        )
        return
      }

      const response = await fetch(
        `/api/admin/companies/${params.id}/safety-rounds/${params.roundId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'COMPLETED'
          })
        }
      )

      if (!response.ok) {
        throw new Error('Kunne ikke fullføre vernerunden')
      }

      const updatedRound = await response.json()
      setSafetyRound(updatedRound)
      toast.success('Vernerunden er fullført')
    } catch (error) {
      console.error('Error completing safety round:', error)
      toast.error('Kunne ikke fullføre vernerunden')
    }
  }

  const handleDownloadReport = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/companies/${params.id}/safety-rounds/${params.roundId}/report`,
        {
          method: 'GET'
        }
      )

      if (!response.ok) throw new Error('Kunne ikke laste ned rapport')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Vernerunde-${safetyRound?.title}-${formatDate(new Date())}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Rapport lastet ned')
    } catch (error) {
      console.error('Error downloading report:', error)
      toast.error('Kunne ikke laste ned rapport')
    } finally {
      setLoading(false)
    }
  }

  const handleSendApprovalRequest = async () => {
    try {
      const response = await fetch(
        `/api/admin/companies/${params.id}/safety-rounds/${params.roundId}/send-approval`,
        {
          method: 'POST'
        }
      )

      if (!response.ok) throw new Error('Kunne ikke sende godkjenningsforespørsel')

      toast.success('Godkjenningsforespørsel sendt')
    } catch (error) {
      toast.error('Kunne ikke sende godkjenningsforespørsel')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Laster vernerunde...</p>
        </div>
      </div>
    )
  }

  if (error || !safetyRound) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{error || 'Fant ikke vernerunden'}</p>
          <Link
            href={`/admin/companies/${params.id}/safety-rounds`}
            className="text-sm text-primary hover:underline"
          >
            Tilbake til vernerunder
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link
              href={`/admin/companies/${params.id}/safety-rounds`}
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Tilbake til vernerunder
            </Link>
            <h1 className="text-2xl font-semibold">{safetyRound.title}</h1>
            {safetyRound.description && (
              <p className="text-muted-foreground">{safetyRound.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            {safetyRound.status === 'COMPLETED' && (
              <Button 
                onClick={handleDownloadReport}
                disabled={loading}
              >
                <Download className="w-4 h-4 mr-2" />
                Last ned rapport
              </Button>
            )}
            <Badge variant={
              safetyRound.status === 'DRAFT' ? "secondary" :
              safetyRound.status === 'IN_PROGRESS' ? "warning" :
              safetyRound.status === 'COMPLETED' ? "success" :
              "outline"
            }>
              {safetyRound.status === 'DRAFT' ? "Utkast" :
               safetyRound.status === 'IN_PROGRESS' ? "Pågår" :
               safetyRound.status === 'COMPLETED' ? "Fullført" :
               safetyRound.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Planlagt dato</p>
            <p className="text-sm text-muted-foreground">
              {safetyRound.scheduledDate ? formatDate(safetyRound.scheduledDate) : "Ikke satt"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Frist</p>
            <p className="text-sm text-muted-foreground">
              {safetyRound.dueDate ? formatDate(safetyRound.dueDate) : "Ikke satt"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Tildelt til</p>
            <p className="text-sm text-muted-foreground">
              {safetyRound.assignedUser?.name || "Ikke tildelt"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Sjekkliste</h2>
            <div className="flex gap-2">
              {safetyRound?.status === 'IN_PROGRESS' && (
                <Button 
                  onClick={handleComplete}
                  disabled={loading}
                >
                  Fullfør vernerunde
                </Button>
              )}
              {safetyRound.status === 'DRAFT' && (
                <Button 
                  variant="outline"
                  onClick={() => handleAddChecklistItem()}
                >
                  Legg til sjekkpunkt
                </Button>
              )}
            </div>
          </div>
          
          {safetyRound.checklistItems.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/50">
              <p className="text-muted-foreground">
                Ingen sjekkpunkter lagt til ennå
              </p>
              {safetyRound.status === 'DRAFT' && (
                <Button 
                  variant="link" 
                  onClick={() => handleAddChecklistItem()}
                >
                  Legg til første sjekkpunkt
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {safetyRound.checklistItems.map((item, index) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {item.category}
                        </Badge>
                        <CardTitle className="text-lg">
                          {item.question}
                        </CardTitle>
                        {item.description && (
                          <CardDescription>
                            {item.description}
                          </CardDescription>
                        )}
                      </div>
                      {safetyRound.status === 'DRAFT' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditItem(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <Select
                        value={item.response || ""}
                        onValueChange={(value) => handleResponseChange(item.id, value)}
                        disabled={!isEditable}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Velg svar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YES">Ja</SelectItem>
                          <SelectItem value="NO">Nei</SelectItem>
                          <SelectItem value="NA">Ikke relevant</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {item.response === 'NO' && (
                        <Button
                          variant="outline"
                          onClick={() => handleAddFinding(item)}
                        >
                          Registrer funn
                        </Button>
                      )}
                    </div>
                    
                    <Textarea
                      placeholder="Legg til kommentar"
                      value={item.comment || ""}
                      onChange={(e) => handleCommentChange(item.id, e.target.value)}
                      disabled={!isEditable}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Funn og tiltak</h2>
          {safetyRound.findings.length === 0 ? (
            <p className="text-muted-foreground">Ingen funn registrert</p>
          ) : (
            <div className="space-y-4">
              {/* Implementer visning av funn her */}
            </div>
          )}
        </div>
      </div>

      <ChecklistItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmitChecklistItem}
        initialData={selectedItem}
        existingCategories={
          Array.from(new Set(safetyRound?.checklistItems.map(item => item.category) ?? []))
        }
      />

      <FindingDialog
        open={findingDialogOpen}
        onOpenChange={setFindingDialogOpen}
        onSubmit={handleSubmitFinding}
        checklistItemId={selectedChecklistItem || ""}
      />

      {safetyRound?.status === 'COMPLETED' && (
        <div className="mt-8">
          <SafetyRoundReport 
            safetyRound={safetyRound}
            onDownload={handleDownloadReport}
            isLoading={loading}
          />
        </div>
      )}

      <Button 
        onClick={handleSendApprovalRequest}
        disabled={safetyRound.status !== 'COMPLETED'}
      >
        Send til godkjenning
      </Button>
    </>
  )
} 