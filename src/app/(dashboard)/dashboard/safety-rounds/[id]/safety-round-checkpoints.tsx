"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { AlertCircle, CheckCircle, HelpCircle, Image as ImageIcon, Trash2 } from "lucide-react"
import { SafetyRoundImageUpload } from "@/components/safety-rounds/safety-round-image-upload"
import { FindingStatus } from "@prisma/client"
import { FindingSeverity } from "@prisma/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { DialogFooter } from "@/components/ui/dialog"

interface ChecklistItem {
  id: string
  category: string
  question: string
  description: string | null
  response: string | null
  comment: string | null
  order: number
  isRequired: boolean
  completedAt: Date | null
  completedBy: string | null
  safetyRoundId: string
  createdAt: Date
  updatedAt: Date
  findings: Array<{
    id: string
    severity: FindingSeverity
    status: FindingStatus
    images: Array<{
      id: string
      url: string
    }>
  }>
  images: Array<{
    id: string
    url: string
    caption: string | null
  }>
}

interface Props {
  checklistItems: ChecklistItem[]
  safetyRoundId: string
  onUpdate: (responses: Record<string, string>) => Promise<void>
}

interface FindingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  safetyRoundId: string
  checklistItemId: string
  setItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>
  setFindingDialogOpen: (open: boolean) => void
}

interface FindingFormData {
  description: string
  severity: FindingSeverity
  location?: string
  dueDate?: Date
}

function FindingDialog({ 
  open, 
  onOpenChange, 
  safetyRoundId, 
  checklistItemId,
  setItems,
  setFindingDialogOpen 
}: FindingDialogProps) {
  const form = useForm<FindingFormData>({
    defaultValues: {
      description: '',
      severity: 'MEDIUM'
    }
  })

  async function handleRegisterFinding(data: FindingFormData) {
    try {
      const res = await fetch(`/api/safety-rounds/${safetyRoundId}/findings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          checklistItemId: checklistItemId
        })
      })

      if (!res.ok) throw new Error()

      const finding = await res.json()
      
      // Oppdater state med det nye funnet
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === checklistItemId
            ? {
                ...item,
                findings: [...item.findings, finding]
              }
            : item
        )
      )

      setFindingDialogOpen(false)
      toast.success('Funn registrert')
    } catch (error) {
      console.error('Error registering finding:', error)
      toast.error('Kunne ikke registrere funn')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrer funn</DialogTitle>
          <DialogDescription>
            Registrer et nytt funn for dette sjekkpunktet
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleRegisterFinding)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beskrivelse</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alvorlighetsgrad</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LOW">Lav</SelectItem>
                      <SelectItem value="MEDIUM">Middels</SelectItem>
                      <SelectItem value="HIGH">Høy</SelectItem>
                      <SelectItem value="CRITICAL">Kritisk</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sted</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frist</FormLabel>
                  <FormControl>
                    <DatePicker 
                      date={field.value} 
                      setDate={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Lagre funn</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Legg til hjelpefunksjon
async function getSignedUrl(url: string) {
  const res = await fetch('/api/storage/signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
  if (!res.ok) throw new Error('Failed to get signed URL')
  const { signedUrl } = await res.json()
  return signedUrl
}

export function SafetyRoundCheckpoints({ checklistItems, safetyRoundId, onUpdate }: Props) {
  const [findingDialogOpen, setFindingDialogOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [imageToDelete, setImageToDelete] = useState<{ id: string, itemId: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  useEffect(() => {
    console.log('SafetyRoundCheckpoints MOUNTED:', {
      itemsCount: checklistItems?.length,
      firstItem: checklistItems?.[0],
      allImages: checklistItems?.map(item => ({
        itemId: item.id,
        images: item.images,
        imageCount: item.images?.length
      }))
    })
  }, [checklistItems])

  const [responses, setResponses] = useState<Record<string, string>>({})

  // Initialiser items med signerte URLs
  const [items, setItems] = useState(() => {
    const processedItems = checklistItems.map(item => ({
      ...item,
      images: item.images.map(img => ({
        ...img,
        fullUrl: img.url // Vi oppdaterer denne med signert URL senere
      }))
    }))
    return processedItems
  })

  // Behold bare én useEffect for bildehenting
  useEffect(() => {
    async function fetchImages() {
      try {
        console.log('Fetching images for checklist items')
        const updatedItems = await Promise.all(
          checklistItems.map(async (item) => {
            const res = await fetch(`/api/safety-rounds/${safetyRoundId}/checklist-items/${item.id}/images/get`)
            if (!res.ok) throw new Error()
            const images = await res.json()
            console.log('Received images for item:', { itemId: item.id, imageCount: images.length })
            return { ...item, images }
          })
        )
        setItems(updatedItems)
      } catch (error) {
        console.error('Error fetching images:', error)
        toast.error('Kunne ikke hente bilder')
      }
    }
    
    fetchImages()
  }, [safetyRoundId, checklistItems])

  // Gruppering av sjekklistepunkter
  const groupedItems = useMemo(() => {
    console.log('Grouping items:', items)
    return items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {} as Record<string, typeof items>)
  }, [items])

  console.log('Grouped items:', groupedItems)

  // Sjekk at vi har gyldig data før rendering
  if (!Array.isArray(checklistItems)) {
    console.error('checklistItems is not an array:', checklistItems)
    return null
  }

  if (!groupedItems || typeof groupedItems !== 'object') {
    console.error('groupedItems is invalid:', groupedItems)
    return null
  }

  async function handleResponse(itemId: string, response: string) {
    try {
      const res = await fetch(`/api/safety-rounds/${safetyRoundId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklistItemId: itemId,
          response,
          comment: responses[itemId]
        })
      })

      if (!res.ok) throw new Error()

      setResponses(prev => ({
        ...prev,
        [itemId]: response
      }))

      toast.success('Svar lagret')
    } catch {
      toast.error('Kunne ikke lagre svar')
    }
  }

  const handleCommentChange = (checkpointId: string, comment: string) => {
    setResponses(prev => ({
      ...prev,
      [checkpointId]: comment
    }))
  }

  const handleSave = async () => {
    await onUpdate(responses)
  }

  async function handleImageUpload(itemId: string, file: File) {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch(
        `/api/safety-rounds/${safetyRoundId}/checklist-items/${itemId}/upload`,
        {
          method: 'POST',
          body: formData
        }
      )
      if (!uploadRes.ok) throw new Error()
      const { imageUrl } = await uploadRes.json()

      const saveRes = await fetch(
        `/api/safety-rounds/${safetyRoundId}/checklist-items/${itemId}/images`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl })
        }
      )
      if (!saveRes.ok) throw new Error()
      const savedImage = await saveRes.json()

      // Hent signert URL for det nye bildet
      const fullUrl = await getSignedUrl(savedImage.url)

      // Oppdater state med det nye bildet inkludert signert URL
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId 
            ? {
                ...item,
                images: [...(item.images || []), { ...savedImage, fullUrl }]
              }
            : item
        )
      )

      toast.success('Bilde lastet opp')
    } catch {
      toast.error('Kunne ikke laste opp bilde')
    }
  }

  function getResponseIcon(response: string | null) {
    if (!response) return <HelpCircle className="h-4 w-4 text-muted-foreground" />
    if (response === 'YES') return <CheckCircle className="h-4 w-4 text-green-500" />
    if (response === 'NO') return <AlertCircle className="h-4 w-4 text-red-500" />
    return <HelpCircle className="h-4 w-4 text-muted-foreground" />
  }

  async function handleDeleteImage(imageId: string, itemId: string) {
    try {
      setIsDeleting(true)
      const res = await fetch(
        `/api/safety-rounds/${safetyRoundId}/checklist-items/${itemId}/images/${imageId}`,
        { method: 'DELETE' }
      )
      
      if (!res.ok) throw new Error()
      
      // Oppdater state
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId
            ? {
                ...item,
                images: item.images.filter(img => img.id !== imageId)
              }
            : item
        )
      )
      
      toast.success('Bilde slettet')
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Kunne ikke slette bilde')
    } finally {
      setIsDeleting(false)
      setImageToDelete(null)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">Sjekkliste</h2>
        <div className="space-y-6">

          {(() => {
            const groups = Object.entries(groupedItems)
            console.log('About to render checklist, groups:', groups)
            
            return groups.map(([category, items]) => {
              console.log('Rendering category:', category, 'with items:', items)
              return (
                <div key={category}>
                  <h3 className="font-medium text-lg mb-3">{category}</h3>
                  <div className="space-y-4">
                    {Array.isArray(items) ? items.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getResponseIcon(item.response)}
                              <p className="font-medium">{item.question}</p>
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                          </div>
                          {item.isRequired && (
                            <span className="text-sm text-red-500">*Påkrevd</span>
                          )}
                        </div>

                        <div className="mt-4 space-y-4">
                          <div className="flex gap-2">
                            {['YES', 'NO', 'NA'].map((value) => (
                              <Button 
                                key={value}
                                size="sm" 
                                variant={responses[item.id] === value ? 'default' : 'outline'}
                                onClick={() => handleResponse(item.id, value)}
                              >
                                {value === 'YES' ? 'Ja' : value === 'NO' ? 'Nei' : 'N/A'}
                              </Button>
                            ))}
                          </div>

                          <Textarea
                            placeholder="Legg til kommentar..."
                            value={responses[item.id] || ''}
                            onChange={(e) => handleCommentChange(item.id, e.target.value)}
                            className="h-20"
                          />

                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Last opp bilder</h4>
                            <SafetyRoundImageUpload 
                              onUpload={(file) => handleImageUpload(item.id, file)}
                              maxSize={5}
                            />
                          </div>

                          {item.images?.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              {item.images.map(image => (
                                <div key={image.id} className="relative aspect-square group">
                                  <img 
                                    src={image.fullUrl}
                                    alt={image.caption || 'Sjekkpunkt bilde'}
                                    className="rounded-lg object-cover w-full h-full"
                                  />
                                  <button
                                    onClick={() => setImageToDelete({ id: image.id, itemId: item.id })}
                                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="h-4 w-4 text-white" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSelectedItemId(item.id)
                              setFindingDialogOpen(true)
                            }}
                            className="w-full"
                          >
                            Registrer funn
                          </Button>

                          {item.findings.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-red-500">
                                {item.findings.length} funn registrert
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )) : (
                      <p>Ingen sjekkpunkter i denne kategorien</p>
                    )}
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </CardContent>
      <AlertDialog 
        open={!!imageToDelete} 
        onOpenChange={() => setImageToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette vil permanent slette bildet. Denne handlingen kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => imageToDelete && handleDeleteImage(imageToDelete.id, imageToDelete.itemId)}
              disabled={isDeleting}
            >
              {isDeleting ? "Sletter..." : "Slett bilde"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FindingDialog 
        open={findingDialogOpen}
        onOpenChange={setFindingDialogOpen}
        safetyRoundId={safetyRoundId}
        checklistItemId={selectedItemId || ''}
        setItems={setItems as React.Dispatch<React.SetStateAction<ChecklistItem[]>>}
        setFindingDialogOpen={setFindingDialogOpen}
      />

      <div className="space-y-4">
        <Button onClick={handleSave}>
          Lagre kommentarer
        </Button>
      </div>
    </Card>
  )
}