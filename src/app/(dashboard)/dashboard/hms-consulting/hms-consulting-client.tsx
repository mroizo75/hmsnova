"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  consultations: {
    actions: {
      status: string
      id: string
      createdAt: Date
      updatedAt: Date
      description: string
      dueDate: Date | null
      completedAt: Date | null
      consultationId: string
    }[]
  }[]
}

export function HMSConsultingClient({ consultations }: Props) {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">HMS Rådgivning</h1>
      <Card>
        <CardHeader>
          <CardTitle>HMS Rådgivning</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Denne modulen er under utvikling.</p>
        </CardContent>
      </Card>
    </div>
  )
} 