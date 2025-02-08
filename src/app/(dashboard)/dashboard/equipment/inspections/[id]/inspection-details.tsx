"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils/date"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function InspectionDetails({ inspection }: { inspection: any }) {
  const [status, setStatus] = useState(inspection.status)
  const [comments, setComments] = useState(inspection.comments || "")
  const [isSubmitting, setIsSubmitting] = useState(false)


  async function updateInspection() {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/equipment/inspections/${inspection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comments }),
      })

      if (!response.ok) throw new Error('Kunne ikke oppdatere inspeksjon')
      toast.success('Inspeksjon oppdatert')
    } catch (error) {
      toast.error('Noe gikk galt')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Inspeksjon av {inspection.equipment.name}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge>{inspection.type}</Badge>
            <Badge variant={status === 'PASSED' ? 'success' : status === 'FAILED' ? 'destructive' : 'warning'}>
              {status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detaljer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Inspektør:</span> {inspection.inspector.name}
            </div>
            <div>
              <span className="font-medium">Dato:</span> {formatDate(inspection.createdAt)}
            </div>
            <div>
              <span className="font-medium">Neste inspeksjon:</span>{" "}
              {inspection.nextInspection ? formatDate(inspection.nextInspection) : "Ikke planlagt"}
            </div>
            {inspection.findings && (
              <div>
                <span className="font-medium">Funn:</span>
                <p className="mt-1">{inspection.findings}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oppdater status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PASSED">Godkjent</SelectItem>
                  <SelectItem value="FAILED">Ikke godkjent</SelectItem>
                  <SelectItem value="NEEDS_ATTENTION">Krever oppfølging</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="font-medium">Kommentarer</label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Legg til kommentarer..."
                rows={4}
              />
            </div>

            <Button 
              onClick={updateInspection} 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Oppdaterer..." : "Oppdater inspeksjon"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 