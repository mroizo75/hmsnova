"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ChevronRight, ArrowLeftRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { prisma } from "@/lib/prisma"
import * as diff from 'diff'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateVersionButton } from "./create-version-button"

interface HandbookVersion {
  id: string
  version: number
  title: string
  publishedAt: Date | null
  publishedBy: string | null
  status: string
  sections: Array<{
    id: string
    title: string
    content: string
    order: number
    subsections: Array<{
      id: string
      title: string
      content: string
      order: number
    }>
  }>
}

export default function HistoryPage() {
  const [versions, setVersions] = useState<HandbookVersion[]>([])
  const [session, setSession] = useState<any>(null)
  const [selectedVersions, setSelectedVersions] = useState<{v1?: string, v2?: string}>({})
  const [comparison, setComparison] = useState<{v1?: HandbookVersion, v2?: HandbookVersion}>({})
  const [isComparing, setIsComparing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch('/api/auth/session')
      const sessionData = await response.json()
      
      if (!sessionData?.user?.companyId) {
        window.location.href = '/login'
        return
      }
      
      setSession(sessionData)
      fetchVersions()
    }

    checkAuth()
  }, [])

  async function fetchVersions() {
    try {
      setIsLoading(true)
      const response = await fetch('/api/hms-handbook/versions')
      if (!response.ok) throw new Error('Kunne ikke hente versjoner')
      
      const data = await response.json()
      setVersions(data.filter((v: HandbookVersion) => 
        v.status === 'ACTIVE' && v.publishedAt
      ))
    } catch (error) {
      setError('Kunne ikke laste versjonshistorikk')
      console.error('Error fetching versions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchVersionDetails(versionId: string) {
    const response = await fetch(`/api/hms-handbook/version/${versionId}`)
    if (response.ok) {
      return await response.json()
    }
    return null
  }

  async function handleCompare() {
    if (!selectedVersions.v1 || !selectedVersions.v2) return
    
    setIsComparing(true)
    const [v1, v2] = await Promise.all([
      fetchVersionDetails(selectedVersions.v1),
      fetchVersionDetails(selectedVersions.v2)
    ])
    
    setComparison({ v1, v2 })
    setIsComparing(false)
  }

  function renderDiff(oldText: string, newText: string) {
    const differences = diff.diffWords(oldText, newText)
    
    return differences.map((part, index) => {
      const color = part.added 
        ? 'bg-green-100 text-green-800' 
        : part.removed 
          ? 'bg-red-100 text-red-800' 
          : 'text-gray-800'
      
      return (
        <span key={index} className={color}>
          {part.value}
        </span>
      )
    })
  }

  if (isLoading) return <div>Laster...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Versjonshistorikk</h1>
        <Button 
          variant="outline" 
          onClick={() => setIsComparing(!isComparing)}
          className="gap-2"
        >
          <ArrowLeftRight className="h-4 w-4" />
          {isComparing ? "Vis historikk" : "Sammenlign versjoner"}
        </Button>
      </div>

      {session?.user && (
        <CreateVersionButton 
          companyId={session.user.companyId} 
          userId={session.user.id}
        />
      )}

      {isComparing ? (
        <Card className="p-6">
          <div className="flex gap-4 items-center mb-6">
            <Select
              value={selectedVersions.v1}
              onValueChange={(value) => setSelectedVersions(prev => ({ ...prev, v1: value }))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Velg versjon" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version) => (
                  <SelectItem 
                    key={version.id} 
                    value={version.id}
                    disabled={version.id === selectedVersions.v2}
                  >
                    Versjon {version.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span>vs</span>

            <Select
              value={selectedVersions.v2}
              onValueChange={(value) => setSelectedVersions(prev => ({ ...prev, v2: value }))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Velg versjon" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version) => (
                  <SelectItem 
                    key={version.id} 
                    value={version.id}
                    disabled={version.id === selectedVersions.v1}
                  >
                    Versjon {version.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={handleCompare}
              disabled={!selectedVersions.v1 || !selectedVersions.v2}
            >
              Sammenlign
            </Button>
          </div>

          {comparison.v1 && comparison.v2 && (
            <ScrollArea className="h-[600px] rounded-md border">
              <div className="p-4 space-y-6">
                {comparison.v1.sections.map((section, index) => {
                  const oldSection = comparison.v2?.sections[index]
                  if (!oldSection) return null

                  return (
                    <div key={section.id} className="space-y-4">
                      <h3 className="font-semibold">
                        {renderDiff(oldSection.title, section.title)}
                      </h3>
                      <div className="prose prose-sm max-w-none">
                        {renderDiff(oldSection.content, section.content)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </Card>
      ) : (
        <div className="border rounded-lg">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className={cn(
                "flex items-center justify-between p-4",
                index !== versions.length - 1 && "border-b"
              )}
            >
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Versjon {version.version}</h2>
                <p className="text-sm text-muted-foreground">
                  Publisert {version.publishedAt ? format(new Date(version.publishedAt), 'dd.MM.yyyy') : 'Ikke publisert'}
                  av {version.publishedBy}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/hms-handbook/version/${version.version}`}>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 