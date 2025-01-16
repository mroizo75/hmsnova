"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Download, Search } from "lucide-react"
import { toast } from "sonner"

interface CustomReportProps {
  companyId: string
}

const reportTypes = [
  { id: 'deviations', label: 'Avvik' },
  { id: 'risks', label: 'Risikovurderinger' },
  { id: 'measures', label: 'Tiltak' },
  { id: 'documents', label: 'Dokumenter' }
]

const columns = {
  deviations: [
    { id: 'title', label: 'Tittel' },
    { id: 'type', label: 'Type' },
    { id: 'status', label: 'Status' },
    { id: 'severity', label: 'Alvorlighetsgrad' },
    { id: 'createdAt', label: 'Opprettet' },
    { id: 'measures', label: 'Antall tiltak' }
  ],
  risks: [
    { id: 'title', label: 'Tittel' },
    { id: 'status', label: 'Status' },
    { id: 'department', label: 'Avdeling' },
    { id: 'createdAt', label: 'Opprettet' },
    { id: 'hazards', label: 'Antall farer' }
  ],
  // ... flere kolonnedefinisjoner
}

export function CustomReport({ companyId }: CustomReportProps) {
  const [selectedType, setSelectedType] = useState<string>('deviations')
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/reports/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          columns: selectedColumns,
          dateFrom,
          dateTo,
          companyId
        })
      })

      if (!response.ok) throw new Error('Søk feilet')
      
      const data = await response.json()
      setResults(data)
      toast.success('Rapport generert')
    } catch (error) {
      toast.error('Kunne ikke generere rapport')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          format: 'excel',
          data: results
        })
      })

      if (!response.ok) throw new Error('Eksport feilet')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tilpasset-rapport-${new Date().toISOString()}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('Rapport eksportert')
    } catch (error) {
      toast.error('Kunne ikke eksportere rapport')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Rapporttype</label>
              <Select 
                value={selectedType} 
                onValueChange={setSelectedType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Datoperiode</label>
              <div className="flex gap-2">
                <DatePicker date={dateFrom} setDate={setDateFrom} />
                <DatePicker date={dateTo} setDate={setDateTo} />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Velg kolonner</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {columns[selectedType as keyof typeof columns]?.map(column => (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.id}
                    checked={selectedColumns.includes(column.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedColumns([...selectedColumns, column.id])
                      } else {
                        setSelectedColumns(selectedColumns.filter(id => id !== column.id))
                      }
                    }}
                  />
                  <label htmlFor={column.id}>{column.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? 'Genererer...' : 'Generer rapport'}
            </Button>
            {results.length > 0 && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Eksporter
              </Button>
            )}
          </div>
        </div>
      </Card>

      {results.length > 0 && (
        <Card className="p-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {selectedColumns.map(column => (
                    <TableHead key={column}>
                      {columns[selectedType as keyof typeof columns]
                        .find(col => col.id === column)?.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((row, i) => (
                  <TableRow key={i}>
                    {selectedColumns.map(column => (
                      <TableCell key={column}>
                        {formatCellValue(row[column])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}

function formatCellValue(value: any): string {
  if (value instanceof Date) {
    return new Date(value).toLocaleDateString('nb-NO')
  }
  if (Array.isArray(value)) {
    return value.length.toString()
  }
  if (typeof value === 'boolean') {
    return value ? 'Ja' : 'Nei'
  }
  return value?.toString() || ''
} 