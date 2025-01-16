import { HMSChanges } from "@/components/hms/hms-changes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HMSSection } from "@prisma/client"

export function SectionDetails({ section }: { section: HMSSection }) {
  return (
    <div className="space-y-6">
      {/* Eksisterende innhold ... */}

      <Card>
        <CardHeader>
          <CardTitle>Endringshistorikk</CardTitle>
          <CardDescription>
            Oversikt over endringer i denne seksjonen basert på avvik og risikovurderinger
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HMSChanges 
            sectionId={section.id}
          />
        </CardContent>
      </Card>
    </div>
  )
} 