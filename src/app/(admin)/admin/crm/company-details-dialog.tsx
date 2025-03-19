"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Company as BaseCompany } from "./columns"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { formatCurrency } from "@/lib/utils/format"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Building2, 
  Calendar, 
  Check, 
  FileText, 
  Github, 
  Globe, 
  MailCheck, 
  Package, 
  Receipt, 
  UserPlus, 
  Users, 
  X,
  ToggleLeft,
  ToggleRight,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

// Utvid Company-grensesnittet for å inkludere metadata
interface Company extends BaseCompany {
  metadata?: any;
}

export interface CompanyDetailsDialogProps {
  company: Company | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: (updatedCompany: Company) => void
  isNew?: boolean
  // Nye props for å integrere med andre dialoger
  onOpenContactDialog?: (company: Company) => void
  onOpenSalesDialog?: (company: Company) => void
  onSendWelcomeEmail?: (company: Company) => void
  onDelete?: (companyId: string, companyName: string) => void
}

export function CompanyDetailsDialog({
  company,
  open,
  onOpenChange,
  onUpdate,
  isNew = false,
  onOpenContactDialog,
  onOpenSalesDialog,
  onSendWelcomeEmail,
  onDelete
}: CompanyDetailsDialogProps) {
  const { toast } = useToast()
  // Tilstandsvariabler for de mindre dialogene
  const [showSubscriptionEdit, setShowSubscriptionEdit] = useState(false)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false)
  // Oppdater hvordan isCompanyActive initialiseres for å sikre at den reflekterer riktig status
  const [isCompanyActive, setIsCompanyActive] = useState<boolean>(false);
  
  // Oppdater isCompanyActive når company endres
  useEffect(() => {
    if (company) {
      // Bruk eksplisitt true/false-kontroll for å sikre at det er en boolsk verdi
      setIsCompanyActive(company.isActive === true);
    }
  }, [company]);
  
  // Ny tilstandsvariabel for å sende velkomstepost ved aktivering
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(false)
  // Om bedriften var inaktiv før og blir aktivert nå
  const isBeingActivated = company && !company.isActive && isCompanyActive
  
  if (!company) return null
  
  // Hent ut metadata hvis det finnes
  let metadata: any = {};
  try {
    // Bruk type assertion for å aksessere metadata-feltet
    const companyAny = company as any;
    if (companyAny.metadata && typeof companyAny.metadata === 'string') {
      metadata = JSON.parse(companyAny.metadata);
    } else if (companyAny.metadata) {
      metadata = companyAny.metadata;
    }
  } catch (error) {
    console.error('Feil ved parsing av metadata:', error);
  }
  
  // Beregn total månedspris
  // @ts-ignore - Bruk metadata hvis det finnes, ellers standard verdier
  const basePrice = metadata.basePrice || 699; // Kampanjepris (normalt 990)
  
  // Sjekk om bedriften har tilleggsmoduler
  const additionalModuleCount = company.activeModules.filter(
    module => module === "SAFETY_ROUNDS" || module === "COMPETENCE"
  ).length;
  
  // @ts-ignore - Bruk metadata hvis det finnes, ellers beregn
  const additionalPrice = metadata.additionalPrice || additionalModuleCount * 199;
  // @ts-ignore - Bruk metadata hvis det finnes, ellers beregn
  const totalPrice = metadata.totalPrice || basePrice + additionalPrice;
  
  // Beregn rabattert pris
  // @ts-ignore - Bruk metadata hvis det finnes, ellers beregn
  let finalPrice = metadata.finalPrice || totalPrice;
  // @ts-ignore - Bruk metadata hvis det finnes, ellers standard verdier
  const discountPercentage = metadata.discountPercentage || company.discountPercentage || 0;
  if (discountPercentage > 0 && !metadata.finalPrice) {
    finalPrice = totalPrice - (totalPrice * (discountPercentage / 100));
  }
  
  // Format priser og rabatt for visning
  const monthlyPrice = formatCurrency(finalPrice);
  const originalMonthlyPrice = discountPercentage > 0 ? formatCurrency(totalPrice) : null;
  const yearlyPrice = formatCurrency(finalPrice * 12);
  const discountText = discountPercentage > 0 ? `${discountPercentage}% rabatt` : null;
  // @ts-ignore - Bruk metadata hvis det finnes, ellers standard verdier
  const discountYears = metadata.discountYears || company.discountYears || 0;
  const discountYearsText = discountYears > 0 ? 
    `i ${discountYears} ${discountYears === 1 ? 'år' : 'år'}` : '';

  // Funksjon for å oppdatere bedriftens status
  const toggleCompanyStatus = () => {
    const newStatus = !isCompanyActive;
    setIsCompanyActive(newStatus);
    
    // Hvis vi aktiverer en tidligere inaktiv bedrift, vil vi kanskje sende velkomstepost
    if (newStatus && !company.isActive) {
      setSendWelcomeEmail(true);
    } else {
      setSendWelcomeEmail(false);
    }
  }

  // Funksjon for å lagre/oppdatere bedriften
  const handleSaveCompany = async () => {
    if (onUpdate && company) {
      try {
        // Oppdater bedriften med ny status
        const updatedCompany = {
          ...company,
          isActive: isCompanyActive,
          // Hvis bedriften var et prospect og nå blir aktivert, fjern prospect-statusen
          isProspect: isCompanyActive ? false : company.isProspect,
        };
        
        // Lagre endringene
        await onUpdate(updatedCompany);
        
        // Hvis bedriften blir aktivert og vi skal sende velkomstepost
        if (isBeingActivated && sendWelcomeEmail && onSendWelcomeEmail) {
          await onSendWelcomeEmail(updatedCompany);
        }
        
        // Vis bekreftelse
        toast({
          title: "Oppdatering komplett",
          description: `Bedriften er nå ${isCompanyActive ? 'aktivert' : 'deaktivert'}.`
        });
      } catch (error) {
        console.error("Feil ved lagring av bedriftsstatus:", error);
        toast({
          title: "Feil ved oppdatering",
          description: "Kunne ikke oppdatere bedriftsstatus. Prøv igjen senere.",
          variant: "destructive",
        });
      }
    }
    onOpenChange(false);
  }
  
  // Funksjon for å aktivere/deaktivere moduler
  const toggleModuleActivation = async (moduleKey: string, isActive: boolean) => {
    if (!company) return;
    
    try {
      const response = await fetch(`/api/companies/${company.id}/modules/${moduleKey}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive })
      });
      
      if (!response.ok) {
        throw new Error('Kunne ikke oppdatere modulstatus');
      }
      
      const updatedModule = await response.json();
      
      // Oppdater company objektet i minnet
      const updatedModules = [...(company.modules || [])];
      const existingModuleIndex = updatedModules.findIndex(m => m.key.startsWith(`${moduleKey}_`));
      
      if (existingModuleIndex !== -1) {
        updatedModules[existingModuleIndex] = updatedModule;
      } else {
        updatedModules.push(updatedModule);
      }
      
      // Oppdater bedriftsobjektet og send til foreldre-komponenten
      if (onUpdate) {
        const updatedCompany = {
          ...company,
          modules: updatedModules
        };
        
        onUpdate(updatedCompany);
      }
      
      toast({
        title: isActive ? "Modul aktivert" : "Modul deaktivert",
        description: `${updatedModule.label || moduleKey} er nå ${isActive ? 'aktivert' : 'deaktivert'} for denne bedriften.`,
      });
    } catch (error) {
      console.error('Feil ved oppdatering av modul:', error);
      toast({
        title: "Feil ved oppdatering",
        description: "Kunne ikke oppdatere modulstatus. Prøv igjen senere.",
        variant: "destructive",
      });
    }
  };
  
  // Funksjoner for handlingsknappene
  const handleAddContact = () => {
    if (onOpenContactDialog && company) {
      onOpenChange(false); // Lukk denne dialogen
      onOpenContactDialog(company);
    } else {
      toast({
        title: "Utilgjengelig funksjonalitet",
        description: "Funksjonaliteten for å legge til kontaktperson er utilgjengelig.",
        variant: "destructive"
      });
    }
  }
  
  const handleRegisterInvoice = () => {
    setShowInvoiceDialog(true);
    toast({
      title: "Kommer snart",
      description: "Fakturafunksjonalitet vil bli implementert snart."
    });
  }
  
  const handleChangeSubscription = () => {
    setShowSubscriptionEdit(true);
    toast({
      title: "Kommer snart",
      description: "Funksjonalitet for å endre abonnement vil bli implementert snart."
    });
  }
  
  const handleSendWelcomeEmail = () => {
    if (onSendWelcomeEmail && company) {
      onSendWelcomeEmail(company);
      toast({
        title: "E-post sendt",
        description: `Velkomstepost ble sendt til ${company.name}`
      });
    } else {
      toast({
        title: "Feil ved sending",
        description: "Kunne ikke sende velkomstepost.",
        variant: "destructive"
      });
    }
  }
  
  const handleScheduleFollowUp = () => {
    setShowFollowUpDialog(true);
    toast({
      title: "Kommer snart",
      description: "Funksjonalitet for oppfølging vil bli implementert snart."
    });
  }
  
  const handleRegisterOpportunity = () => {
    if (onOpenSalesDialog && company) {
      onOpenChange(false); // Lukk denne dialogen
      onOpenSalesDialog(company);
    } else {
      toast({
        title: "Utilgjengelig funksjonalitet",
        description: "Funksjonaliteten for å registrere salgsmulighet er utilgjengelig.",
        variant: "destructive"
      });
    }
  }

  // Gruppere moduler etter type
  const standardModules = [
    { key: "HMS_HANDBOOK", label: "HMS Håndbok", description: "Standard HMS håndbok med tilpasninger" },
    { key: "DEVIATIONS", label: "Avvikshåndtering", description: "System for registrering og oppfølging av avvik" },
    { key: "RISK_ASSESSMENT", label: "Risikovurdering", description: "Verktøy for risikovurdering og tiltak" },
    { key: "DOCUMENTS", label: "Dokumenthåndtering", description: "System for dokumenthåndtering og versjonskontroll" },
    { key: "EMPLOYEES", label: "Ansatthåndtering", description: "Administrasjon av ansatte og tilganger" },
    { key: "SJA", label: "Sikker Jobb Analyse", description: "System for sikker jobbanalyse og risikovurdering", isActive: true },
  ];
  
  const additionalModules = [
    { key: "SAFETY_ROUNDS", label: "Vernerunder", description: "Gjennomføring og oppfølging av vernerunder", price: 199 },
    { key: "COMPETENCE", label: "Kompetansestyring", description: "System for registrering og oppfølging av kompetanse, kurs og sertifiseringer", price: 199 },
    { key: "HMS_CONSULTING", label: "HMS Rådgivning", description: "HMS-rådgivning og kundeoppfølging", price: 199 },
  ];

  const subscriptionTab = company && (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Abonnementsinformasjon</CardTitle>
            <CardDescription>Oversikt over abonnement og priser</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Abonnementsinformasjon */}
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Basispris:</div>
              <div>{company.metadata && 'basePrice' in company.metadata ? `${company.metadata.basePrice} kr/mnd` : 'Ikke angitt'}</div>
              
              <div className="text-sm font-medium">Tilleggspris:</div>
              <div>{company.metadata && 'additionalPrice' in company.metadata ? `${company.metadata.additionalPrice} kr/mnd` : '0 kr/mnd'}</div>
              
              <div className="text-sm font-medium">Total pris:</div>
              <div>{company.metadata && 'totalPrice' in company.metadata ? `${company.metadata.totalPrice} kr/mnd` : 'Ikke angitt'}</div>
              
              {company.metadata && 'discountPercentage' in company.metadata && company.metadata.discountPercentage > 0 && (
                <>
                  <div className="text-sm font-medium">Rabatt:</div>
                  <div>{company.metadata.discountPercentage}% i {company.metadata && 'discountYears' in company.metadata ? company.metadata.discountYears : 1} år</div>
                  
                  <div className="text-sm font-medium">Pris med rabatt:</div>
                  <div className="font-semibold text-green-600">
                    {company.metadata && 'finalPrice' in company.metadata ? company.metadata.finalPrice : 
                      (company.metadata && 'totalPrice' in company.metadata ? 
                        Math.round(company.metadata.totalPrice * (1 - company.metadata.discountPercentage / 100)) : 
                        'Ikke angitt')} kr/mnd
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salgs- og kundeinformasjon</CardTitle>
            <CardDescription>Detaljer om kundetype og salgshistorikk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Kundetype:</div>
              <div>
                {company.isActive ? (
                  <Badge variant="default">Aktiv kunde</Badge>
                ) : company.metadata && 'isProspect' in company.metadata && company.metadata.isProspect ? (
                  <Badge variant="outline">Prospekt</Badge>
                ) : (
                  <Badge variant="secondary">Inaktiv</Badge>
                )}
              </div>
              
              {company.metadata && 'isProspect' in company.metadata && company.metadata.isProspect && (
                <>
                  <div className="text-sm font-medium">Potensiell verdi:</div>
                  <div>{company.metadata && 'potentialValue' in company.metadata ? 
                    `${new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(company.metadata.potentialValue)} kr/år` : 
                    'Ikke angitt'}</div>
                  
                  <div className="text-sm font-medium">Stadium:</div>
                  <div>{company.metadata && 'prospectStage' in company.metadata ? company.metadata.prospectStage : 'Ikke angitt'}</div>
                  
                  <div className="text-sm font-medium">Forventet avslutning:</div>
                  <div>{company.metadata && 'expectedCloseDate' in company.metadata ? company.metadata.expectedCloseDate : 'Ikke angitt'}</div>
                  
                  <div className="text-sm font-medium">Salgsnotater:</div>
                  <div className="col-span-2 text-sm border rounded p-2 bg-muted/20">
                    {company.metadata && 'salesNotes' in company.metadata ? company.metadata.salesNotes : 'Ingen notater'}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Moduler</CardTitle>
          <CardDescription>Oversikt over aktiverte moduler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Standardmoduler</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                {['HMS_HANDBOOK', 'DEVIATIONS', 'RISK_ASSESSMENT', 'DOCUMENTS', 'EMPLOYEES', 'SJA'].map(moduleKey => {
                  const moduleLabels: Record<string, string> = {
                    'HMS_HANDBOOK': 'HMS Håndbok',
                    'DEVIATIONS': 'Avvikshåndtering',
                    'RISK_ASSESSMENT': 'Risikovurdering',
                    'DOCUMENTS': 'Dokumenthåndtering',
                    'EMPLOYEES': 'Ansatthåndtering',
                    'SJA': 'Sikker Jobb Analyse'
                  };
                  
                  // SJA er alltid aktivert som standard
                  const isActive = moduleKey === 'SJA' ? true : company.modules?.some(
                    m => m.key.startsWith(`${moduleKey}_`) && m.isActive
                  );
                  
                  return (
                    <div key={moduleKey} className="flex justify-between items-center p-2 border rounded hover:bg-muted/20">
                      <div className="flex items-center gap-2">
                        <Badge variant={isActive ? "default" : "outline"}>
                          {isActive ? "Aktivert" : "Ikke aktivert"}
                        </Badge>
                        <span className="font-medium">{moduleLabels[moduleKey]}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant={isActive ? "destructive" : "default"}
                        onClick={() => toggleModuleActivation(moduleKey, !isActive)}
                        // Deaktivering av SJA er ikke tillatt
                        disabled={moduleKey === 'SJA' && isActive}
                      >
                        {isActive ? "Deaktiver" : "Aktiver"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Tilleggsmoduler</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                {['SAFETY_ROUNDS', 'COMPETENCE', 'HMS_CONSULTING'].map(moduleKey => {
                  const moduleLabels: Record<string, string> = {
                    'SAFETY_ROUNDS': 'Vernerunder',
                    'COMPETENCE': 'Kompetansestyring',
                    'HMS_CONSULTING': 'HMS Rådgivning'
                  };
                  
                  const isActive = company.modules?.some(
                    m => m.key.startsWith(`${moduleKey}_`) && m.isActive
                  );
                  
                  return (
                    <div key={moduleKey} className="flex justify-between items-center p-2 border rounded hover:bg-muted/20">
                      <div className="flex items-center gap-2">
                        <Badge variant={isActive ? "default" : "outline"}>
                          {isActive ? "Aktivert" : "Ikke aktivert"}
                        </Badge>
                        <span className="font-medium">{moduleLabels[moduleKey]}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant={isActive ? "destructive" : "default"}
                        onClick={() => toggleModuleActivation(moduleKey, !isActive)}
                      >
                        {isActive ? "Deaktiver" : "Aktiver"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-3xl w-full p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
            {isNew ? "Ny bedrift" : company.name}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {isNew ? 
              "Opprett en ny bedrift i systemet" : 
              `Org.nr: ${company.orgNumber} · ${company.organizationType} · Opprettet: ${formatDate(company.createdAt)}`
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-2">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Oversikt</TabsTrigger>
            <TabsTrigger value="subscription" className="text-xs sm:text-sm">Abonnement</TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs sm:text-sm">Faktura</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs sm:text-sm">Handlinger</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
            {/* Ny seksjon for å aktivere/deaktivere bedriften */}
            <div className="border rounded-md p-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCompanyActive ? 
                    <ToggleRight className="h-5 w-5 text-green-600" /> : 
                    <ToggleLeft className="h-5 w-5 text-red-600" />
                  }
                  <div>
                    <h3 className="text-sm font-semibold">Bedriftsstatus</h3>
                    <p className="text-xs text-muted-foreground">
                      {isCompanyActive ? 
                        "Bedriften er aktiv og har tilgang til systemet" : 
                        "Bedriften er deaktivert og har ikke tilgang"
                      }
                    </p>
                  </div>
                </div>
                <Button 
                  variant={isCompanyActive ? "destructive" : "default"} 
                  onClick={toggleCompanyStatus}
                  size="sm"
                  className="text-xs"
                >
                  {isCompanyActive ? "Deaktiver" : "Aktiver"}
                </Button>
              </div>
              
              {/* Vis mulighet for å sende velkomstepost når bedriften aktiveres */}
              {isBeingActivated && (
                <div className="mt-2 flex items-center space-x-2">
                  <Checkbox 
                    id="send-welcome-email" 
                    checked={sendWelcomeEmail}
                    onCheckedChange={(checked) => setSendWelcomeEmail(checked as boolean)}
                  />
                  <Label htmlFor="send-welcome-email" className="text-xs">
                    Send velkomstepost med innloggingsinformasjon ved aktivering
                  </Label>
                </div>
              )}
              
              {/* Vis advarsel hvis bedriften deaktiveres */}
              {!isCompanyActive && company.isActive && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-xs font-medium">Advarsel</AlertTitle>
                  <AlertDescription className="text-xs">
                    Når en bedrift deaktiveres, vil de ikke lenger ha tilgang til systemet.
                    Dette påvirker alle brukere knyttet til denne bedriften.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Vis informasjon om prospect-status */}
              {company.isProspect && (
                <Alert className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-xs font-medium">Prospect</AlertTitle>
                  <AlertDescription className="text-xs">
                    Dette er en prospect-bedrift. Ved aktivering vil den bli konvertert til en aktiv kunde.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <h3 className="mb-2 text-xs sm:text-sm font-semibold">Bedriftsinformasjon</h3>
                <Card>
                  <CardContent className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-muted-foreground">Status:</span>
                      <Badge variant={isCompanyActive ? "secondary" : "destructive"} className="text-xs">
                        {isCompanyActive ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-muted-foreground">Verifisert:</span>
                      {company.isVerified ? 
                        <Check className="h-4 w-4 text-green-600" /> : 
                        <X className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-muted-foreground">Antall ansatte:</span>
                      <span className="text-xs sm:text-sm">{company.employeeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-muted-foreground">Kontaktperson:</span>
                      <span className="text-xs sm:text-sm text-right">{company.primaryContact}</span>
                    </div>
                    {company.isProspect && (
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-muted-foreground">Prospect:</span>
                        <Badge variant="outline" className="text-xs bg-yellow-50">Prospekt</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="mb-2 text-xs sm:text-sm font-semibold">Salgsinformasjon</h3>
                <Card>
                  <CardContent className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-muted-foreground">Aktive muligheter:</span>
                      <span className="text-xs sm:text-sm">{company.activeOpportunities}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-muted-foreground">Potensialverdi:</span>
                      <span className="text-xs sm:text-sm">{new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(company.potentialValue || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-muted-foreground">Betaling:</span>
                      <Badge variant={
                        company.paymentStatus === 'PAID' ? "secondary" :
                        company.paymentStatus === 'PENDING' ? "default" :
                        company.paymentStatus === 'OVERDUE' ? "destructive" :
                        "outline"
                      } className="text-xs">
                        {company.paymentStatus === 'PAID' ? "Betalt" :
                         company.paymentStatus === 'PENDING' ? "Venter" :
                         company.paymentStatus === 'OVERDUE' ? "Forfalt" :
                         "Kansellert"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div>
              <h3 className="mb-2 text-xs sm:text-sm font-semibold">Aktive moduler</h3>
              <Card>
                <CardContent className="p-2 sm:p-3 md:p-4">
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {company.activeModules.map(module => {
                      // Konverter modulkode til lesbart navn
                      const moduleLabels: Record<string, string> = {
                        'HMS_HANDBOOK': 'HMS Håndbok',
                        'DEVIATIONS': 'Avvikshåndtering',
                        'RISK_ASSESSMENT': 'Risikovurdering',
                        'DOCUMENTS': 'Dokumenthåndtering',
                        'EMPLOYEES': 'Ansatthåndtering',
                        'SJA': 'Sikker Jobb Analyse',
                        'SAFETY_ROUNDS': 'Vernerunder',
                        'COMPETENCE': 'Kompetansestyring',
                        'HMS_CONSULTING': 'HMS Rådgivning'
                      };
                      
                      const moduleName = moduleLabels[module] || module;
                      const isStandard = ['HMS_HANDBOOK', 'DEVIATIONS', 'RISK_ASSESSMENT', 'DOCUMENTS', 'EMPLOYEES', 'SJA'].includes(module);
                      
                      return (
                        <Badge 
                          key={module} 
                          variant={isStandard ? "outline" : "default"} 
                          className="text-xs"
                        >
                          {moduleName}
                        </Badge>
                      );
                    })}
                    {/* Vis SJA som alltid aktiv hvis den ikke er i activeModules */}
                    {!company.activeModules.includes('SJA') && (
                      <Badge key="SJA" variant="outline" className="text-xs">
                        Sikker Jobb Analyse
                      </Badge>
                    )}
                    {company.activeModules.length === 0 && !company.activeModules.includes('SJA') && (
                      <div className="text-xs sm:text-sm text-muted-foreground">Ingen aktive moduler</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="subscription" className="space-y-3 sm:space-y-4 pt-2 sm:pt-3">
            {subscriptionTab}
          </TabsContent>
          
          <TabsContent value="invoices" className="space-y-3 sm:space-y-4 pt-2 sm:pt-3">
            <Card>
              <CardHeader className="p-2 sm:p-3 pb-1">
                <CardTitle className="text-base sm:text-lg">Fakturaoversikt</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-3">
                <div className="text-center text-xs sm:text-sm text-muted-foreground py-3 sm:py-4">
                  Implementering av Fiken API-integrasjon for fakturaoversikt kommer snart
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-3 sm:space-y-4 pt-2 sm:pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button 
                className="w-full text-xs sm:text-sm" 
                size="sm"
                onClick={handleAddContact}
              >
                <UserPlus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Legg til kontaktperson
              </Button>
              <Button 
                className="w-full text-xs sm:text-sm" 
                size="sm"
                onClick={handleRegisterInvoice}
              >
                <Receipt className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Registrer faktura
              </Button>
              <Button 
                className="w-full text-xs sm:text-sm" 
                size="sm"
                onClick={handleChangeSubscription}
              >
                <Globe className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Endre abonnement
              </Button>
              <Button 
                className="w-full text-xs sm:text-sm" 
                size="sm"
                onClick={handleSendWelcomeEmail}
              >
                <MailCheck className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Send velkomstepost
              </Button>
              <Button 
                className="w-full text-xs sm:text-sm" 
                variant="outline" 
                size="sm"
                onClick={handleScheduleFollowUp}
              >
                <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Planlegg oppfølging
              </Button>
              <Button 
                className="w-full text-xs sm:text-sm" 
                variant={isCompanyActive ? "outline" : "default"}
                size="sm"
                onClick={toggleCompanyStatus}
              >
                {isCompanyActive ? 
                  <ToggleLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> : 
                  <ToggleRight className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                }
                {isCompanyActive ? "Deaktiver bedrift" : "Aktiver bedrift"}
              </Button>
              <Button 
                className="w-full text-xs sm:text-sm" 
                variant="outline" 
                size="sm"
                onClick={handleRegisterOpportunity}
              >
                <Github className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Registrer kundemulighet
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-row justify-between items-center gap-2 p-3 sm:p-4">
          <div>
            {!isNew && onDelete && (
              <Button 
                variant="destructive" 
                size="sm"
                className="h-7 sm:h-8 text-xs sm:text-sm"
                onClick={() => onDelete(company.id, company.name)}
              >
                Slett bedrift
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 sm:h-8 text-xs sm:text-sm"
              onClick={() => onOpenChange(false)}
            >
              Lukk
            </Button>
            
            {onUpdate && (
              <Button 
                onClick={handleSaveCompany}
                size="sm"
                className="h-7 sm:h-8 text-xs sm:text-sm"
              >
                Lagre endringer
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 