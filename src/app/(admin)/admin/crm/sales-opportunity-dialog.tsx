"use client"

import { useState, useRef, forwardRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Company } from "./columns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, BarChart4, DollarSign, Calendar, Trash2, Edit, CheckCircle2, AlertCircle, Clock, BadgePercent, Tags, Mail, Pencil } from "lucide-react"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils/format"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, isValid, parseISO } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { nb } from "date-fns/locale"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

// Definer salgsmulighet-typen
export interface SalesOpportunity {
  id: string
  title: string
  value: number
  stage: string
  probability: number
  expectedCloseDate: Date | string | null
  description: string
  contactPerson?: string
  tags?: string[]
  createdAt: Date | string
  updatedAt: Date | string
  
  // Produktinformasjon
  productPackage?: string
  additionalModules?: string[]
  basePrice?: number
  additionalPrice?: number
  discountPercentage?: number
  finalPrice?: number
  totalAnnualPrice?: number
  
  // For bakoverkompatibilitet
  proposalSent?: boolean
  proposalSentDate?: Date | string | null
  
  // Kobling til prospect
  sourceId?: string
  sourceType?: 'prospect' | 'lead' | 'manual'
}

export type SalesOpportunityDialogProps = {
  company: Company | null
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunities: SalesOpportunity[]
  onAddOpportunity: (opportunity: SalesOpportunity) => void
  onUpdateOpportunity: (opportunity: SalesOpportunity) => void
  onDeleteOpportunity: (id: string) => void
  onSendProposal?: (to: string, subject: string, htmlContent: string) => Promise<void> // Legg til dette
}

// Skjema for validering
const formSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd"),
  value: z.coerce.number().min(0, "Verdi må være et positivt tall"),
  stage: z.string(),
  probability: z.coerce.number().min(0, "Sannsynlighet må være mellom 0-100").max(100, "Sannsynlighet må være mellom 0-100"),
  expectedCloseDate: z.date(),
  description: z.string().default(""),
  contactPerson: z.string().optional(),
  tags: z.string().optional()
})

// Type for skjemaet
type FormValues = z.infer<typeof formSchema>;

// Hjelper for å vise salgssteg med riktige ikoner og farger
const stageData = {
  "prospecting": { 
    label: "Prospektering", 
    icon: <AlertCircle className="h-4 w-4" />, 
    color: "bg-yellow-100 text-yellow-800"
  },
  "qualification": { 
    label: "Kvalifisering", 
    icon: <Clock className="h-4 w-4" />, 
    color: "bg-blue-100 text-blue-800"
  },
  "needs-analysis": { 
    label: "Behovsanalyse", 
    icon: <BarChart4 className="h-4 w-4" />, 
    color: "bg-indigo-100 text-indigo-800"
  },
  "proposal": { 
    label: "Tilbud sendt", 
    icon: <DollarSign className="h-4 w-4" />, 
    color: "bg-purple-100 text-purple-800"
  },
  "negotiation": { 
    label: "Forhandling", 
    icon: <BadgePercent className="h-4 w-4" />, 
    color: "bg-orange-100 text-orange-800"
  },
  "closed-won": { 
    label: "Avtale inngått", 
    icon: <CheckCircle2 className="h-4 w-4" />, 
    color: "bg-green-100 text-green-800"
  },
  "closed-lost": { 
    label: "Tapt", 
    icon: <Trash2 className="h-4 w-4" />, 
    color: "bg-red-100 text-red-800"
  }
}

// Hjelpefunksjoner for håndtering av tagger
const stringToTags = (tagsString: string | undefined): string[] => {
  if (!tagsString) return [];
  return tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
};

const tagsToString = (tags: string[]): string => {
  if (!tags || !Array.isArray(tags)) return '';
  return tags.join(', ');
};

// Sikre at dato er i riktig format og håndterer ugyldige verdier
const ensureDate = (dateValue: Date | string | null | undefined): Date => {
  if (!dateValue) {
    return new Date(); // Returner dagens dato hvis null eller undefined
  }
  
  if (typeof dateValue === 'string') {
    // Håndter tomme strenger
    if (!dateValue.trim()) {
      return new Date();
    }
    
    // Forsøk å opprette en gyldig dato
    const parsedDate = new Date(dateValue);
    
    // Sjekk om datoen er gyldig
    if (isNaN(parsedDate.getTime())) {
      console.warn('Ugyldig datoformat:', dateValue);
      return new Date(); // Returner dagens dato hvis uyldig
    }
    
    return parsedDate;
  }
  
  // Sjekk om Date-objektet er gyldig
  if (isNaN(dateValue.getTime())) {
    console.warn('Ugyldig Date-objekt');
    return new Date();
  }
  
  return dateValue;
};

export function SalesOpportunityDialog({
  company,
  open,
  onOpenChange,
  opportunities,
  onAddOpportunity,
  onUpdateOpportunity,
  onDeleteOpportunity,
  onSendProposal
}: SalesOpportunityDialogProps) {
  const [isAddingOpportunity, setIsAddingOpportunity] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState<SalesOpportunity | null>(null)
  const { data: sessionData } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      value: 0,
      stage: "prospecting",
      probability: 10,
      expectedCloseDate: new Date(),
      description: "",
      contactPerson: "",
      tags: ""
    }
  })

  if (!company) return null

  const onSubmit = (values: FormValues) => {
    try {
      if (editingOpportunity) {
        // Oppdater eksisterende salgsmulighet
        const updatedOpportunity: SalesOpportunity = { 
          ...editingOpportunity, 
          title: values.title,
          value: values.value,
          stage: values.stage,
          probability: values.probability,
          expectedCloseDate: values.expectedCloseDate,
          description: values.description,
          contactPerson: values.contactPerson,
          tags: stringToTags(values.tags),
          updatedAt: new Date()
        };
        
        onUpdateOpportunity(updatedOpportunity);
        toast.success("Salgsmulighet oppdatert");
        setEditingOpportunity(null);
      } else {
        // Legg til ny salgsmulighet
        const newOpportunity: SalesOpportunity = {
          id: Date.now().toString(),
          title: values.title,
          value: values.value,
          stage: values.stage,
          probability: values.probability,
          expectedCloseDate: values.expectedCloseDate,
          description: values.description,
          contactPerson: values.contactPerson,
          tags: stringToTags(values.tags),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        onAddOpportunity(newOpportunity);
        toast.success("Salgsmulighet opprettet");
      }
      
      setIsAddingOpportunity(false);
      form.reset();
    } catch (error) {
      console.error("Feil ved lagring av salgsmulighet:", error);
      toast.error("Kunne ikke lagre salgsmuligheten");
    }
  }

  const deleteOpportunity = (id: string) => {
    try {
      onDeleteOpportunity(id);
      toast.success("Salgsmulighet slettet");
    } catch (error) {
      console.error("Feil ved sletting av salgsmulighet:", error);
      toast.error("Kunne ikke slette salgsmuligheten");
    }
  }

  const editOpportunity = (opportunity: SalesOpportunity) => {
    form.reset({
      title: opportunity.title,
      value: opportunity.value,
      stage: opportunity.stage,
      probability: opportunity.probability,
      expectedCloseDate: ensureDate(opportunity.expectedCloseDate),
      description: opportunity.description,
      contactPerson: opportunity.contactPerson,
      tags: tagsToString(opportunity.tags || [])
    })
    setEditingOpportunity(opportunity)
    setIsAddingOpportunity(true)
  }

  // Funksjon for å sende tilbud basert på en salgsmulighet
  const handleSendProposal = async (opportunity: SalesOpportunity) => {
    if (!company || !company.email || !onSendProposal) return;
    
    try {
      setIsSubmitting(true);
      
      // Opprett e-post innhold basert på produktinformasjon
      const htmlContent = createProposalEmailContent(company, opportunity);
      
      // Send e-post
      await onSendProposal(
        company.email,
        `HMS-tilbud til ${company.name}`,
        htmlContent
      );
      
      toast.success("Tilbud sendt", {
        description: `Tilbud er sendt til ${company.email}`
      });
      
      // Oppdater salgsmuligheten med notater om tilbudet
      const updatedOpp = {
        ...opportunity,
        stage: opportunity.stage === 'prospecting' ? 'proposal' : opportunity.stage,
        updatedAt: new Date(),
        description: `${opportunity.description}\n\nTilbud sendt ${new Date().toLocaleDateString('nb-NO')}.`
      };
      
      onUpdateOpportunity(updatedOpp);
    } catch (error) {
      console.error("Feil ved sending av tilbud:", error);
      toast.error("Kunne ikke sende tilbud");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Funksjon for å opprette e-post innhold
  const createProposalEmailContent = (company: Company, opportunity: SalesOpportunity): string => {
    // Formater priser med 2 desimaler og norsk format
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('nb-NO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    };
    
    // Beregn rabattert beløp og sjekk om verdiene eksisterer
    const basePrice = opportunity.basePrice || 699;
    const discountPercentage = opportunity.discountPercentage || 0;
    const discountAmount = basePrice * (discountPercentage / 100);
    const totalMonth = opportunity.finalPrice || basePrice - discountAmount;
    const totalYear = opportunity.totalAnnualPrice || totalMonth * 12;
    
    // Flere moduler?
    const hasAdditionalModules = Array.isArray(opportunity.additionalModules) && 
      opportunity.additionalModules.length > 0;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://innutio.no/logo.png" alt="Innutio Logo" style="max-width: 150px; height: auto;">
        </div>
        
        <h2 style="color: #0055a4; border-bottom: 2px solid #0055a4; padding-bottom: 10px;">
          HMS-tilbud til ${company.name}
        </h2>
        
        <p>Hei ${company.primaryContact || 'der'},</p>
        
        <p>
          Takk for din interesse i Innutio's HMS-system. Som avtalt sender vi deg herved et 
          tilbud på vårt system tilpasset deres behov.
        </p>
        
        <div style="background-color: #f9f9f9; border-left: 4px solid #0055a4; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0055a4;">Ditt skreddersydde HMS-pakke</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 8px 0; font-weight: bold;">Produkt</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">Pris per måned</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 8px 0;">${opportunity.productPackage || 'Standard HMS Pakke'}</td>
              <td style="padding: 8px 0; text-align: right;">${formatPrice(basePrice)} kr/mnd</td>
            </tr>
            ${hasAdditionalModules ? opportunity.additionalModules!.map(module => `
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 8px 0;">Tilleggsmodul: ${module}</td>
                <td style="padding: 8px 0; text-align: right;">199,00 kr/mnd</td>
              </tr>
            `).join('') : ''}
            ${discountPercentage > 0 ? `
              <tr style="border-bottom: 1px solid #ddd; color: #27ae60;">
                <td style="padding: 8px 0;">Rabatt (${discountPercentage}%)</td>
                <td style="padding: 8px 0; text-align: right;">-${formatPrice(discountAmount)} kr/mnd</td>
              </tr>
            ` : ''}
            <tr style="border-bottom: 2px solid #ddd; font-weight: bold;">
              <td style="padding: 12px 0;">Total</td>
              <td style="padding: 12px 0; text-align: right;">${formatPrice(totalMonth)} kr/mnd</td>
            </tr>
            <tr style="font-weight: bold; color: #0055a4;">
              <td style="padding: 12px 0;">Årspris</td>
              <td style="padding: 12px 0; text-align: right;">${formatPrice(totalYear)} kr/år</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #e8f4fd; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #3498db;">Bedriftshelsetjeneste via Dr.Dropin</h3>
          <p>
            Som kunde av Innutio får du også 15% rabatt på bedriftshelsetjeneste gjennom Dr.Dropin.
            <a href="https://drdropin.no/bedrift" style="color: #3498db; text-decoration: underline;">
              Les mer om Dr.Dropin Bedrift
            </a>
          </p>
        </div>
        
        <p>
          Dette tilbudet er gyldig i 30 dager. For å gå videre med bestillingen eller om du har spørsmål,
          er du velkommen til å svare på denne e-posten eller kontakte oss på telefon 479 76 402.
        </p>
        
        <p>
          Vi ser frem til å hjelpe dere med å få på plass et enkelt og effektivt HMS-system!
        </p>
        
        <p style="margin-top: 30px;">
          Med vennlig hilsen,<br>
          ${sessionData?.user?.name || 'Innutio Team'}<br>
          Innutio AS
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; text-align: center;">
          Innutio AS | Org.nr: 930 566 306 | Web: <a href="https://innutio.no" style="color: #0055a4;">innutio.no</a> | E-post: <a href="mailto:post@innutio.no" style="color: #0055a4;">post@innutio.no</a>
        </div>
      </div>
    `;
  };

  const handleDelete = (id: string) => {
    deleteOpportunity(id);
  };

  const handleEdit = (opportunity: SalesOpportunity) => {
    editOpportunity(opportunity);
  };

  // Funksjon for å rendre en salgsmulighet
  const renderOpportunity = (opportunity: SalesOpportunity) => {
    return (
      <div className="border rounded-md p-4 mb-3 bg-card">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold">{opportunity.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Badge variant={
                opportunity.stage === 'prospecting' ? "outline" :
                opportunity.stage === 'qualification' ? "secondary" :
                opportunity.stage === 'proposal' ? "default" :
                opportunity.stage === 'negotiation' ? "default" :
                opportunity.stage === 'closed-won' ? "success" :
                "destructive"
              }>
                {opportunity.stage === 'prospecting' ? "Prospekt" :
                 opportunity.stage === 'qualification' ? "Kvalifisering" :
                 opportunity.stage === 'proposal' ? "Tilbud" :
                 opportunity.stage === 'negotiation' ? "Forhandling" :
                 opportunity.stage === 'closed-won' ? "Vunnet" :
                 "Tapt"}
              </Badge>
              
              <span>|</span>
              <span>{opportunity.probability}% sannsynlighet</span>
              <span>|</span>
              <span>Verdi: {formatCurrency(opportunity.value, 'nb-NO', 'NOK')}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Legg til Send tilbud-knapp */}
            {onSendProposal && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendProposal(opportunity)}
                disabled={isSubmitting}
              >
                Send tilbud
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEdit(opportunity)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Rediger
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDelete(opportunity.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Slett
            </Button>
          </div>
        </div>
        
        {/* Produktinformasjon */}
        {opportunity.productPackage && (
          <div className="border-t border-border pt-2 mt-2 mb-2">
            <h4 className="text-sm font-medium mb-1">Produktinformasjon:</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="flex justify-between">
                <span>Pakke:</span>
                <span className="font-medium">{opportunity.productPackage}</span>
              </div>
              
              {opportunity.additionalModules && opportunity.additionalModules.length > 0 && (
                <div className="flex justify-between">
                  <span>Tilleggsmoduler:</span>
                  <span className="font-medium">{opportunity.additionalModules.join(', ')}</span>
                </div>
              )}
              
              {opportunity.basePrice !== undefined && (
                <div className="flex justify-between">
                  <span>Grunnpris:</span>
                  <span>{new Intl.NumberFormat('nb-NO', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(opportunity.basePrice)} kr/mnd</span>
                </div>
              )}
              
              {opportunity.discountPercentage !== undefined && opportunity.discountPercentage > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Rabatt:</span>
                  <span>{opportunity.discountPercentage}%</span>
                </div>
              )}
              
              {opportunity.finalPrice !== undefined && (
                <div className="flex justify-between font-bold">
                  <span>Totalpris:</span>
                  <span>{new Intl.NumberFormat('nb-NO', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(opportunity.finalPrice)} kr/mnd</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="text-sm text-slate-700 my-2 whitespace-pre-line">
          {opportunity.description}
        </div>
        
        <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
          <div>
            Kontaktperson: <span className="font-medium">{opportunity.contactPerson}</span>
          </div>
          <div>
            Forventet dato: <span className="font-medium">
              {format(ensureDate(opportunity.expectedCloseDate), 'PPP', { locale: nb })}
            </span>
          </div>
          <div>
            Opprettet: <span className="font-medium">
              {format(ensureDate(opportunity.createdAt), 'PPP', { locale: nb })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Beregn total potensialverdi
  const calculateTotalPotential = () => {
    return opportunities.reduce((sum, opp) => sum + opp.value, 0);
  };
  
  // Hent antall aktive salgsmuligheter (ikke tapt)
  const getActiveOpportunities = () => {
    return opportunities.filter(opp => opp.stage !== 'closed-lost').length;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-3xl w-full p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <BarChart4 className="h-4 w-4 sm:h-5 sm:w-5" />
            Salgsmuligheter for {company?.name || ''}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Administrer potensielle salg og oppfølging
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Total potensialverdi:</span>
                <span className="font-medium">{formatCurrency(calculateTotalPotential(), 'nb-NO', 'NOK')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Aktive salgsmuligheter:</span>
                <span className="font-medium">{getActiveOpportunities()}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {!isAddingOpportunity ? (
          <>
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {opportunities.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <BarChart4 className="mx-auto h-8 w-8 mb-2 text-muted-foreground/60" />
                  <p>Ingen salgsmuligheter ennå.</p>
                  <p>Klikk på knappen under for å legge til en.</p>
                </div>
              ) : (
                opportunities.map(opportunity => (
                  <Card key={opportunity.id} className="relative">
                    <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-sm sm:text-base flex flex-wrap items-center">
                            {opportunity.title}
                          </CardTitle>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs", 
                                stageData[opportunity.stage as keyof typeof stageData]?.color
                              )}
                            >
                              <span className="mr-1">{stageData[opportunity.stage as keyof typeof stageData]?.icon}</span>
                              {stageData[opportunity.stage as keyof typeof stageData]?.label}
                            </Badge>
                            {opportunity.tags && Array.isArray(opportunity.tags) && opportunity.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                <Tags className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {/* Vis merke for sendt tilbud hvis relevant */}
                            {opportunity.proposalSent && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                <Mail className="h-3 w-3 mr-1" />
                                Tilbud sendt
                              </Badge>
                            )}
                          </div>
                        </div>
                        {/* Legg til knapp for å sende tilbud */}
                        <div className="flex gap-1">
                          {onSendProposal && !opportunity.proposalSent && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleSendProposal(opportunity)}
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              Send tilbud
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleEdit(opportunity)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleDelete(opportunity.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-1 sm:pb-2 px-2 sm:px-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 text-xs sm:text-sm">
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-muted-foreground shrink-0" />
                          <span>{formatCurrency(opportunity.value)}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-muted-foreground shrink-0" />
                          <span>{format(ensureDate(opportunity.expectedCloseDate), 'dd.MM.yyyy')}</span>
                        </div>
                        {opportunity.contactPerson && (
                          <div className="flex items-center truncate">
                            <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-muted-foreground shrink-0" />
                            <span className="truncate">{opportunity.contactPerson}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Ny seksjon for produktinformasjon hvis tilgjengelig */}
                      {(opportunity.productPackage || opportunity.additionalModules?.length) && (
                        <div className="mt-2 pt-2 border-t border-dashed">
                          <div className="text-xs font-medium mb-1">Produktpakke:</div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                            {opportunity.productPackage && (
                              <div className="flex justify-between col-span-2">
                                <span>Pakke:</span>
                                <span className="font-medium">{opportunity.productPackage}</span>
                              </div>
                            )}
                            {opportunity.additionalModules && opportunity.additionalModules.length > 0 && (
                              <div className="flex justify-between col-span-2">
                                <span>Tilleggsmoduler:</span>
                                <span className="font-medium">{opportunity.additionalModules.join(', ')}</span>
                              </div>
                            )}
                            
                            {/* Vise priser hvis tilgjengelig */}
                            {opportunity.basePrice && (
                              <div className="flex justify-between">
                                <span>Grunnpris:</span>
                                <span>{new Intl.NumberFormat('nb-NO', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(opportunity.basePrice)} kr/mnd</span>
                              </div>
                            )}
                            {opportunity.additionalPrice && opportunity.additionalPrice > 0 && (
                              <div className="flex justify-between">
                                <span>Tillegg:</span>
                                <span>{new Intl.NumberFormat('nb-NO', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(opportunity.additionalPrice)} kr/mnd</span>
                              </div>
                            )}
                            {opportunity.discountPercentage && opportunity.discountPercentage > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Rabatt:</span>
                                <span>-{opportunity.discountPercentage}%</span>
                              </div>
                            )}
                            {opportunity.finalPrice && (
                              <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>{new Intl.NumberFormat('nb-NO', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(opportunity.finalPrice)} kr/mnd</span>
                              </div>
                            )}
                            {opportunity.totalAnnualPrice && (
                              <div className="flex justify-between">
                                <span>Årlig:</span>
                                <span>{new Intl.NumberFormat('nb-NO', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(opportunity.totalAnnualPrice)} kr/år</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {opportunity.description && (
                        <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                          {opportunity.description}
                        </div>
                      )}
                      <div className="mt-1 sm:mt-2">
                        <div className="flex justify-between items-center mb-1 text-xs">
                          <span>Sannsynlighet</span>
                          <span>{opportunity.probability}%</span>
                        </div>
                        <Progress value={opportunity.probability} className="h-1.5" />
                      </div>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground pt-1 pb-2 sm:pb-3 px-2 sm:px-3 flex justify-between">
                      <span>Opprettet: {format(ensureDate(opportunity.createdAt), 'dd.MM.yyyy')}</span>
                      <div>
                        <span>Sist oppdatert: {format(ensureDate(opportunity.updatedAt), 'dd.MM.yyyy')}</span>
                        {opportunity.proposalSent && opportunity.proposalSentDate && (
                          <span className="ml-2">Tilbud sendt: {format(ensureDate(opportunity.proposalSentDate), 'dd.MM.yyyy')}</span>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
              
              <Button 
                className="w-full text-xs sm:text-sm" 
                variant="outline"
                size="sm"
                onClick={() => setIsAddingOpportunity(true)}
              >
                <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Legg til salgsmulighet
              </Button>
            </div>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 sm:space-y-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Tittel</FormLabel>
                    <FormControl>
                      <Input placeholder="Tittel på salgsmulighet" className="text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">Verdi (NOK)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1000" className="text-xs sm:text-sm" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="probability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">Sannsynlighet (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" className="text-xs sm:text-sm" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="text-xs sm:text-sm">
                            <SelectValue placeholder="Velg status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(stageData).map(([value, { label, icon }]) => (
                            <SelectItem key={value} value={value} className="flex items-center text-xs sm:text-sm">
                              <span className="flex items-center">
                                <span className="mr-2">{icon}</span>
                                {label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expectedCloseDate"
                  render={({ field }) => {
                    // Konvertere Date til string med YYYY-MM-DD format som input[type="date"] forventer
                    const isoDateString = field.value instanceof Date 
                      ? field.value.toISOString().split('T')[0] 
                      : '';
                    
                    return (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm">Forventet inngått dato</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            className="text-xs sm:text-sm" 
                            {...field}
                            value={isoDateString}
                            onChange={(e) => {
                              const newDate = e.target.value ? new Date(e.target.value) : new Date();
                              field.onChange(newDate);
                            }}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Når forventes det at denne muligheten blir inngått?
                        </FormDescription>
                        <FormMessage className="text-xs"/>
                      </FormItem>
                    );
                  }}
                />
              </div>
              
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Kontaktperson</FormLabel>
                    <FormControl>
                      <Input placeholder="Navn på kontaktperson" className="text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Beskrivelse</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Skriv detaljer om salgsmuligheten her..." 
                        {...field} 
                        className="resize-none h-16 sm:h-20 text-xs sm:text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Tagger (kommaseparert)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="f.eks. hms, oppgradering, prioritert" 
                        className="text-xs sm:text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                  onClick={() => {
                    setIsAddingOpportunity(false)
                    setEditingOpportunity(null)
                    form.reset()
                  }}
                >
                  Avbryt
                </Button>
                <Button type="submit" size="sm" className="text-xs sm:text-sm">
                  {editingOpportunity ? "Oppdater salgsmulighet" : "Legg til salgsmulighet"}
                </Button>
              </div>
            </form>
          </Form>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => onOpenChange(false)}>
            Lukk
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 