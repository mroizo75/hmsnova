import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

interface ContractModalProps {
  onAccept: () => void
  children: React.ReactNode
}

export function ContractModal({ onAccept, children }: ContractModalProps) {
  const [open, setOpen] = useState(false)

  const handleAccept = async () => {
    setOpen(false)
    await onAccept()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Abonnementsvilkår HMS Nova</DialogTitle>
          <DialogDescription>
            Les nøye gjennom vilkårene før du godtar
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold mb-2">1. Prøveperiode og binding</h3>
              <ul className="list-disc pl-4 space-y-2">
                <li>14 dagers kostnadsfri prøveperiode fra registreringsdato</li>
                <li>Automatisk overgang til betalt abonnement etter prøveperioden hvis ikke avbestilt</li>
                <li>12 måneders bindingstid etter prøveperioden</li>
                <li>2 måneders oppsigelsestid, må meldes skriftlig</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">2. Betaling</h3>
              <ul className="list-disc pl-4 space-y-2">
                <li>Månedlig fakturering forskuddsvis</li>
                <li>14 dagers betalingsfrist</li>
                <li>Priser kan justeres med 30 dagers varsel</li>
                <li>Alle priser er oppgitt eks. mva</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. Tjenester og bruk</h3>
              <ul className="list-disc pl-4 space-y-2">
                <li>Tilgang til HMS Nova-plattformen 24/7</li>
                <li>Support på e-post og telefon i ordinær arbeidstid</li>
                <li>Automatiske oppdateringer og forbedringer</li>
                <li>Sikker lagring av data iht. GDPR</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. Ansvar og sikkerhet</h3>
              <ul className="list-disc pl-4 space-y-2">
                <li>Kunden er ansvarlig for egne data og brukertilganger</li>
                <li>HMS Nova tar backup daglig</li>
                <li>99.9% oppetidsgaranti</li>
                <li>Force majeure-forbehold iht. norsk lov</li>
              </ul>
            </section>
          </div>
        </ScrollArea>

        <div className="flex justify-end space-x-2 mt-4">
          <DialogTrigger asChild>
            <Button variant="outline">Avbryt</Button>
          </DialogTrigger>
          <Button 
            onClick={handleAccept}
            className="bg-[#2C435F] hover:bg-[#2C435F]/80"
          >
            Jeg godtar vilkårene
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 