"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HMSContent } from "../../hms-content"
import { HMSNavigation } from "../../hms-navigation"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ReleaseDialog } from "./release-dialog"
import { AddSectionDialog } from "../../add-section-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { Section } from "../../hms-handbook-client"
import { formatDate } from "@/lib/utils/date"
import { PendingChanges } from "./pending-changes"
import { PendingChangesDialog } from "./pending-changes-dialog"

interface HMSHandbookDraft {
  id: string
  version: number
  title: string
  description: string | null
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
  publishedAt: Date | null
  publishedBy: string | null
  sections: Section[]
  companyId: string
  createdAt: Date
  updatedAt: Date
}

interface Props {
  draft: HMSHandbookDraft
}

export function HMSHandbookDraftClient({ draft }: Props) {
  const [selectedSection, setSelectedSection] = useState<Section | null>(draft.sections[0])
  const [activeTab, setActiveTab] = useState("content")
  const router = useRouter()
  const [isChangesDialogOpen, setIsChangesDialogOpen] = useState(false)

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
    const section = findSection(draft.sections, sectionId)
    setSelectedSection(section)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">HMS-håndbok (Kladd)</h1>
          <p className="text-muted-foreground">
            Versjon {draft.version}
            {draft.publishedAt && (
              <> • Sist publisert: {formatDate(draft.publishedAt)}</>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <AddSectionDialog handbookId={draft.id} />
          <ReleaseDialog 
            handbookId={draft.id} 
            currentVersion={draft.version}
          />
        </div>
      </div>


      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <Card className="p-4">
            <HMSNavigation 
              sections={draft.sections} 
              handbookId={draft.id}
              selectedSection={selectedSection?.id}
              onSelectSection={handleSelectSection}
            />
          </Card>
        </div>

        <div className="col-span-9">
          {selectedSection && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="content">Innhold</TabsTrigger>
                <TabsTrigger value="changes">
                  HMS-endringer
                  {selectedSection.changes && selectedSection.changes.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedSection.changes.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="standards">Standarder og dokumenter</TabsTrigger>
              </TabsList>

              <TabsContent value="content">
                <Card className="p-6">
                  <HMSContent 
                    section={selectedSection as Section}
                    isEditable={true}
                    handbookId={draft.id}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="changes">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-medium">HMS-endringer for {selectedSection.title}</h2>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsChangesDialogOpen(true)}
                      >
                        Legg til endringer
                      </Button>
                    </div>
                    
                    {/* Vis eksisterende endringer */}
                    {selectedSection.changes && selectedSection.changes.length > 0 ? (
                      <div className="space-y-4">
                        {selectedSection.changes.map((change) => (
                          <Card key={change.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{change.title}</h3>
                              <Badge variant={change.status === 'OPEN' ? 'default' : 'secondary'}>
                                {change.status === 'OPEN' ? 'Aktiv' : change.status}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {change.description}
                            </p>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Ingen HMS-endringer er lagt til i denne seksjonen ennå
                      </p>
                    )}

                    {/* Dialog for å legge til endringer */}
                    <PendingChangesDialog
                      open={isChangesDialogOpen}
                      onOpenChange={setIsChangesDialogOpen}
                      sectionId={selectedSection.id}
                      onChangesSelected={() => {
                        router.refresh()
                        toast.success('HMS-endringer lagt til')
                      }}
                    />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="standards">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-medium">Relevante standarder og dokumenter</h2>
                    </div>
                    <div className="grid gap-4">
                      {selectedSection.title.toLowerCase().includes('arbeidsmiljø') && (
                        <div className="border p-4 rounded-lg">
                          <h3 className="font-medium">ISO 45001 - Arbeidsmiljø</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Standard for styringssystemer for arbeidsmiljø
                          </p>
                        </div>
                      )}
                      {selectedSection.title.toLowerCase().includes('miljø') && (
                        <div className="border p-4 rounded-lg">
                          <h3 className="font-medium">ISO 14001 - Miljøstyring</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Standard for miljøstyringssystemer
                          </p>
                        </div>
                      )}
                      {/* Legg til flere standarder basert på innhold */}
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
} 