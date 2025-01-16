import { HMSChanges } from "@/components/hms/hms-changes"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { useState } from "react"

export function HazardDetails({ hazard }: { hazard: Hazard }) {
  const [showHMSDialog, setShowHMSDialog] = useState(false)

  return (
    <div className="space-y-4">
      {/* Eksisterende fare-detaljer ... */}

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">HMS-tiltak for denne faren</h3>
          <Button 
            variant="outline"
            onClick={() => setShowHMSDialog(true)}
          >
            Registrer HMS-endring
          </Button>
        </div>

        {/* Vis eksisterende HMS-endringer koblet til denne faren */}
        <div className="space-y-4">
          {hazard.hmsChanges?.map(change => (
            <div key={change.id} className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium">{change.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {change.description}
              </p>
              <div className="mt-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {change.changeType}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Dialog for å registrere ny HMS-endring */}
        <Dialog open={showHMSDialog} onOpenChange={setShowHMSDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Registrer HMS-endring for fare: {hazard.description}
              </DialogTitle>
            </DialogHeader>
            <HMSChanges 
              sectionId={hazard.riskAssessment.department || 'general'}
              riskAssessmentId={hazard.riskAssessmentId}
              hazardId={hazard.id}
              mode="create"
              context={{
                type: 'HAZARD',
                description: hazard.description,
                riskLevel: hazard.riskLevel
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 