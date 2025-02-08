"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ChevronRight, Pencil, Search, History, GitCompare } from "lucide-react"
import { AddSectionDialog } from "./add-section-dialog"
import { HMSContent } from "./hms-content"
import { HMSNavigation } from "./hms-navigation"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ReleaseDialog } from "./release-dialog"
import { VersionHistoryDialog } from "./version-history-dialog"
import { Input } from "@/components/ui/input"
import type { JsonValue } from "@prisma/client/runtime/library"
import { CreateVersionButton } from "./create-version-button"
import Link from "next/link"
import { format } from "date-fns"


interface HMSChange {
  id: string
  title: string
  description: string
  status: string
  implementedAt: Date | null
  deviations: Array<{
    deviation: {
      id: string
      title: string
      description: string
    }
  }>
  riskAssessments: Array<{
    riskAssessment: {
      id: string
      title: string
      description: string
    }
  }>
  hazards: Array<{
    hazard: {
      id: string
      description: string
      riskLevel: number
    }
  }>
}

export interface Section {
  id: string
  title: string
  content: JsonValue | string
  order: number
  handbookId: string
  createdAt: Date
  updatedAt: Date
  parentId: string | null
  subsections: Section[]
  changes: Array<{
    id: string
    title: string
    description: string
    status: string
    implementedAt: Date | null
    createdAt: Date
    deviations: Array<{
      deviation: {
        id: string
        title: string
        description: string
      }
    }>
    riskAssessments: Array<{
      riskAssessment: {
        id: string
        title: string
        description: string
      }
    }>
    hazards: Array<{
      hazard: {
        id: string
        description: string
        riskLevel: number
      }
    }>
  }>
}

export interface HMSHandbook {
  id: string
  version: number
  title: string
  description: string | null
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
  sections: Section[]
  companyId: string
  hasDraft: boolean
  draftId?: string
  updatedAt: Date
}

interface Props {
  handbook: HMSHandbook
}

export function HMSHandbookClient({ handbook }: Props) {
  const [selectedSection, setSelectedSection] = useState<Section | null>(handbook.sections[0])
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)

  // Legg til søkefunksjonalitet som ikke påvirker eksisterende kode
  const filteredSections = searchQuery.trim().length >= 2
    ? findAllMatchingSections(handbook.sections, searchQuery.toLowerCase())
    : []

  // Hjelpefunksjon for å søke rekursivt gjennom seksjoner
  function findAllMatchingSections(sections: Section[], query: string): Section[] {
    return sections.reduce((matches: Section[], section) => {
      if (
        section.title.toLowerCase().includes(query) ||
        (typeof section.content === 'string' && section.content.toLowerCase().includes(query))
      ) {
        matches.push(section)
      }
      if (section.subsections.length > 0) {
        matches.push(...findAllMatchingSections(section.subsections, query))
      }
      return matches
    }, [])
  }

  // Hvis håndboken eksisterer men ikke har seksjoner, vis initialiseringsknapp
  if (handbook.sections.length === 0) {
    async function initializeHandbook() {
      try {
        const response = await fetch('/api/hms-handbook/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message)
        }

        toast.success("HMS-håndbok initialisert")
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error 
            ? error.message 
            : "Kunne ikke initialisere HMS-håndbok"
        )
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">HMS-håndbok</h1>
        </div>
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">HMS-håndbok uten innhold</h2>
            <p className="text-muted-foreground">
              Din HMS-håndbok er opprettet, men har ingen seksjoner ennå.
            </p>
            <Button onClick={initializeHandbook}>Initialiser med standardseksjoner</Button>
          </div>
        </Card>
      </div>
    )
  }

  // Hvis ingen håndbok finnes, vis opprettelsesknapp
  if (!handbook) {
    async function createHandbook() {
      try {
        const response = await fetch('/api/hms-handbook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || "Kunne ikke opprette HMS-håndbok")
        }

        toast.success("HMS-håndbok opprettet")
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error 
            ? error.message 
            : "Kunne ikke opprette HMS-håndbok"
        )
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">HMS-håndbok</h1>
        </div>
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Ingen HMS-håndbok funnet</h2>
            <p className="text-muted-foreground">
              Du har ikke opprettet en HMS-håndbok ennå.
            </p>
            <Button onClick={createHandbook}>Opprett HMS-håndbok</Button>
          </div>
        </Card>
      </div>
    )
  }

  // Funksjon for å finne en seksjon basert på ID
  const findSection = (sections: Section[], id: string): Section | null => {
    for (const section of sections) {
      if (section.id === id) return section
      if (section.subsections.length > 0) {
        const found = findSection(section.subsections, id)
        if (found) return found
      }
    }
    return null
  }

  // Håndter valg av seksjon
  const handleSelectSection = (sectionId: string) => {
    const section = findSection(handbook.sections, sectionId)
    setSelectedSection(section)
    setIsEditing(false)
  }

  const publishHandbook = async () => {
    try {
      setIsPublishing(true)
      const response = await fetch(`/api/hms-handbook/${handbook.id}/publish`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Kunne ikke publisere håndboken')
      }

      toast.success('HMS-håndboken er nå publisert')
      window.location.reload()
    } catch (error) {
      toast.error('Kunne ikke publisere håndboken')
    } finally {
      setIsPublishing(false)
    }
  }

  // Vis håndboken med seksjoner
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HMS-håndbok v{handbook.version}</h1>
          <p className="text-muted-foreground">
            Sist oppdatert: {format(new Date(handbook.updatedAt), 'dd.MM.yyyy')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <CreateVersionButton 
            version={handbook.version}
            companyId={handbook.companyId}
          />
          <Button variant="outline" asChild>
            <Link href="/dashboard/hms-handbook/history">
              <History className="w-4 h-4 mr-2" />
              Historikk
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/hms-handbook/compare">
              <GitCompare className="w-4 h-4 mr-2" />
              Sammenlign versjoner
            </Link>
          </Button>
        </div>
      </div>

      {/* Legg til søkefelt */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Søk i HMS-håndboken..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Vis søkeresultater hvis det søkes, ellers vis normal visning */}
      {searchQuery.trim().length >= 2 && filteredSections.length > 0 ? (
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">
            Søkeresultater ({filteredSections.length})
          </h2>
          <div className="space-y-4">
            {filteredSections.map(section => (
              <div
                key={section.id}
                className="p-4 border rounded-lg cursor-pointer hover:border-primary"
                onClick={() => {
                  handleSelectSection(section.id)
                  setSearchQuery("")  // Tøm søket når en seksjon velges
                }}
              >
                <h3 className="font-medium">{section.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {typeof section.content === 'string' ? section.content.substring(0, 200) : ''}...
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Card className="p-4">
              <HMSNavigation 
                sections={handbook.sections} 
                handbookId={handbook.id}
                selectedSection={selectedSection?.id}
                onSelectSection={handleSelectSection}
              />
            </Card>
          </div>

          <div className="col-span-9">
            <Card className="p-6">
              <HMSContent 
                section={selectedSection || undefined}
                isEditable={isEditing}
                handbookId={handbook.id}
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
