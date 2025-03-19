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
import { Company } from "./columns"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  User, 
  Package, 
  ShoppingCart, 
  Send,
  Users, 
  BarChart3,
  CreditCard,
  FileText,
  AlertTriangle,
  Shield,
  FolderOpen,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { toast } from "sonner"

export interface NewCompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateCompany: (company: Company) => void
}

// Skjemavalidering for ny bedrift
const companyFormSchema = z.object({
  // Bedriftsinformasjon
  name: z.string().min(1, "Bedriftsnavn er påkrevd"),
  orgNumber: z.string().min(9, "Organisasjonsnummer må ha 9 siffer"),
  organizationType: z.string().min(1, "Velg organisasjonstype"),
  isActive: z.boolean().default(true),
  employeeCount: z.coerce.number().min(1, "Legg inn antall ansatte"),
  
  // Kontaktinformasjon
  primaryContact: z.string().min(1, "Kontaktperson er påkrevd"),
  primaryEmail: z.string().email("Ugyldig e-post"),
  primaryPhone: z.string().optional(),
  primaryPosition: z.string().optional(),
  
  // Innloggingsinformasjon (brukernavn er nå e-postadressen)
  password: z
    .string()
    .min(8, "Passord må ha minst 8 tegn")
    .regex(/[A-Z]/, { message: "Passord må inneholde minst en stor bokstav" })
    .regex(/[0-9]/, { message: "Passord må inneholde minst ett tall" }),
  
  // Abonnementsinformasjon
  subscriptionPlan: z.string().min(1, "Velg abonnementstype"),
  additionalModules: z.array(z.string()).optional(),
  
  // Prisinformasjon
  hasDiscount: z.boolean().default(false),
  discountPercentage: z.coerce.number().min(0).max(100).default(0),
  overridePrice: z.boolean().default(false),
  customPrice: z.coerce.number().min(0).default(0),
  discountYears: z.coerce.number().min(1).max(3).default(1),

  // Salgsinformasjon
  salesNotes: z.string().optional(),
  annualValueWithoutDiscount: z.coerce.number().default(0),
  sendWelcomeEmail: z.boolean().default(false),
  
  // Prospect-spesifikk informasjon
  potentialValue: z.string().optional(), // Lagres som streng, konverteres til tall når det trengs
  prospectStage: z.enum(["LEAD", "CONTACT", "OPPORTUNITY", "NEGOTIATION"]).optional(),
  expectedCloseDate: z.string().optional(), // Dato i ISO-format
  
  // Prospect eller kunde
  isProspect: z.boolean().default(false),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

// Standardpakke moduler
const standardModules = [
  { id: "HMS_HANDBOOK", name: "HMS Håndbok", description: "Standard HMS håndbok med tilpasninger" },
  { id: "DEVIATIONS", name: "Avvikshåndtering", description: "System for registrering og oppfølging av avvik" },
  { id: "RISK_ASSESSMENT", name: "Risikovurdering", description: "Verktøy for risikovurdering og tiltak" },
  { id: "DOCUMENTS", name: "Dokumenthåndtering", description: "System for dokumenthåndtering og versjonskontroll" },
  { id: "EMPLOYEES", name: "Ansatthåndtering", description: "Administrasjon av ansatte og tilganger" },
];

// Tilleggsmoduler
const additionalModules = [
  { id: "SAFETY_ROUNDS", name: "Vernerunder", description: "Gjennomføring og oppfølging av vernerunder", price: 199 },
  { id: "COMPETENCE", name: "Kompetansestyring", description: "System for registrering og oppfølging av kompetanse", price: 199 },
];

// Oppdater moduleIcons-objektet for å bruke modulnavn (name) istedenfor label
const moduleIcons = {
  "HMS Håndbok": <FileText className="h-4 w-4 text-primary" />,
  "Avvikshåndtering": <AlertTriangle className="h-4 w-4 text-primary" />,
  "Risikovurdering": <Shield className="h-4 w-4 text-primary" />,
  "Dokumenthåndtering": <FolderOpen className="h-4 w-4 text-primary" />,
  "Ansatthåndtering": <Users className="h-4 w-4 text-primary" />,
  "Vernerunder": <ClipboardCheck className="h-4 w-4 text-primary" />,
  "Kompetansestyring": <GraduationCap className="h-4 w-4 text-primary" />
};

/**
 * Formaterer et tall til norsk prisformat med 2 desimaler
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('nb-NO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

/**
 * Sender en epost via Postmark API
 */
async function sendEmail(emailDetails: any) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailDetails),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Kunne ikke sende epost');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Epost sending feilet:', error);
    throw error;
  }
}

/**
 * Lager et e-postmeldingsinnhold med formatering for velkomst- eller tilbudsmail
 */
function createEmailContent({
  name,
  company,
  standardModules,
  additionalModules,
  basePrice,
  additionalPrice,
  hasDiscount,
  discountPercentage,
  totalPrice,
  finalPrice,
  annualPrice,
  discountYears,
  savingsAmount,
  username,
  password,
  isOffer = false // true hvis dette er en tilbudsmail, false hvis det er en velkomstmail
}: any) {
  const discountInfo = hasDiscount && discountPercentage > 0 
    ? `<tr>
        <td style="color: #10b981; font-weight: bold; padding: 5px 0;">Rabatt (${discountPercentage}%):</td>
        <td style="color: #10b981; font-weight: bold; text-align: right; padding: 5px 0;">-${formatPrice(Math.round(totalPrice * (discountPercentage / 100)))} kr/mnd</td>
      </tr>` 
    : '';
  
  const savingsInfo = savingsAmount > 0 
    ? `<p style="color: #10b981; font-weight: bold; margin-top: 15px; font-size: 16px;">Din besparelse over ${discountYears} år: ${formatPrice(savingsAmount)} kr</p>` 
    : '';
    
  const discountYearsInfo = discountYears > 1 
    ? `<p style="margin: 5px 0;">Rabatten gjelder i ${discountYears} år fra dato.</p>` 
    : '';
    
  // Legg til innloggingsinformasjon i e-posten hvis det er en velkomstmail og brukernavn/passord er oppgitt
  const loginInfo = !isOffer && username && password
    ? `<div style="background-color: #f8f0e3; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f0b165;">
        <h3 style="color: #b35900; margin-top: 0;">Din innloggingsinformasjon:</h3>
        <p style="margin-bottom: 5px;"><strong>Brukernavn:</strong> ${username} (din e-postadresse)</p>
        <p style="margin-bottom: 0;"><strong>Passord:</strong> ${password}</p>
        <p style="margin-top: 10px; font-size: 12px; color: #666;">
          Av sikkerhetsmessige årsaker anbefaler vi at du endrer passordet ditt etter første innlogging.
        </p>
      </div>`
    : '';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #333; margin-bottom: 5px;">${isOffer ? 'Tilbud fra' : 'Velkommen til'} HMS Nova</h1>
        <h2 style="color: #666; font-size: 18px; margin-top: 0;">${company}</h2>
      </div>
      
      <p style="margin-bottom: 20px; font-size: 16px;">Hei ${name},</p>
      
      <p style="margin-bottom: 20px; font-size: 16px;">
        ${isOffer 
          ? 'Takk for din interesse i HMS Nova. Her er detaljene om tilbudet vi har diskutert:' 
          : `Velkommen som kunde hos HMS Nova! Vi er glade for å ha ${company} med på laget.`}
      </p>
      
      ${loginInfo}
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Ditt abonnement inkluderer:</h3>
        <ul style="padding-left: 20px;">
          ${standardModules.map((m: any) => `<li style="margin-bottom: 8px;"><strong>${m.name || m}</strong> - ${m.description || ''}</li>`).join('')}
          ${additionalModules && additionalModules.length > 0 
            ? additionalModules.map((m: any) => `<li style="margin-bottom: 8px;"><strong>${m.name || m}</strong> - ${m.description || ''}</li>`).join('') 
            : ''}
        </ul>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">Prisdetaljer:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0;">Grunnpakke:</td>
            <td style="text-align: right; padding: 5px 0;">${formatPrice(basePrice)} kr/mnd</td>
          </tr>
          ${additionalPrice > 0 
            ? `<tr>
                <td style="padding: 5px 0;">Tilleggsmoduler:</td>
                <td style="text-align: right; padding: 5px 0;">${formatPrice(additionalPrice)} kr/mnd</td>
              </tr>` 
            : ''}
          <tr style="border-top: 1px solid #e0e0e0;">
            <td style="padding: 5px 0;">Subtotal:</td>
            <td style="text-align: right; padding: 5px 0;">${formatPrice(totalPrice)} kr/mnd</td>
          </tr>
          ${discountInfo}
          <tr style="border-top: 1px solid #e0e0e0; font-weight: bold;">
            <td style="padding: 5px 0; font-size: 16px;">Total månedspris:</td>
            <td style="text-align: right; padding: 5px 0; font-size: 16px;">${formatPrice(finalPrice)} kr/mnd</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">Årlig pris:</td>
            <td style="text-align: right; padding: 5px 0;">${formatPrice(annualPrice)} kr/år</td>
          </tr>
        </table>
      </div>
      
      ${savingsInfo}
      ${discountYearsInfo}
      
      <div style="background-color: #e6f7ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #0077cc; margin-top: 0;">Eksklusiv fordel for våre kunder:</h3>
        <p style="margin-bottom: 10px;">Som kunde hos HMS Nova får du <strong>15% rabatt på bedriftshelsetjenester</strong> hos Dr.Dropin.</p>
        <p style="margin-bottom: 0;">
          <a href="https://bedrift.drdropin.no/bedriftshelsetjeneste" style="color: #0077cc; text-decoration: underline;">Besøk Dr.Dropin</a> 
          og oppgi at du er HMS Nova-kunde for å motta rabatten.
        </p>
      </div>
      
      <p style="margin-top: 20px;">
        ${isOffer 
          ? 'Ta gjerne kontakt om du har spørsmål eller ønsker å diskutere dette tilbudet nærmere. Tilbudet er gyldig i 30 dager.' 
          : 'Ta gjerne kontakt med oss om du har spørsmål eller trenger hjelp med å komme i gang.'}
      </p>
      
      <p style="margin-top: 20px;">
        Vennlig hilsen,<br>
        Innutio-teamet
      </p>
    </div>
  `;
}

// Hjelpefunksjon for å generere et sikkert passord
const generateSecurePassword = () => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  
  // Sørg for at passordet inneholder minst én av hver type tegn
  password += charset.charAt(Math.floor(Math.random() * 26)); // Liten bokstav
  password += charset.charAt(26 + Math.floor(Math.random() * 26)); // Stor bokstav
  password += charset.charAt(52 + Math.floor(Math.random() * 10)); // Tall
  password += charset.charAt(62 + Math.floor(Math.random() * 12)); // Spesialtegn
  
  // Fyll ut resten av passordet
  for (let i = 4; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }
  
  // Bland tegn i passordet
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

export function NewCompanyDialog({
  open,
  onOpenChange,
  onCreateCompany
}: NewCompanyDialogProps) {
  const [currentTab, setCurrentTab] = useState("info")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalPrice, setTotalPrice] = useState(699) // Kampanjepris som standard
  const [basePrice, setBasePrice] = useState(699) // Kampanjepris som standard
  const [additionalPrice, setAdditionalPrice] = useState(0) // Pris for tilleggsmoduler
  const [finalPrice, setFinalPrice] = useState(699) // Endelig pris etter rabatt
  const [annualPrice, setAnnualPrice] = useState(699 * 12) // Årlig pris
  const [savingsAmount, setSavingsAmount] = useState(0) // Hvor mye kunden sparer
  const [originalAnnualPrice, setOriginalAnnualPrice] = useState(990 * 12) // Ordinær årspris
  const [isSendingOffer, setIsSendingOffer] = useState(false) // Ny state for å indikere sending av tilbud
  const [generatedPassword, setGeneratedPassword] = useState("") // State for automatisk generert passord
  const [isProspect, setIsProspect] = useState(false);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      orgNumber: "",
      organizationType: "AS",
      isActive: true,
      employeeCount: 1,
      
      primaryContact: "",
      primaryEmail: "",
      primaryPhone: "",
      primaryPosition: "",
      
      password: "", // Tom streng som standard
      
      subscriptionPlan: "STANDARD",
      additionalModules: [],
      
      hasDiscount: false,
      discountPercentage: 0,
      overridePrice: false,
      customPrice: 0,
      discountYears: 1,
      
      salesNotes: "",
      annualValueWithoutDiscount: 990 * 12, // Standardpris uten rabatt, årlig
      sendWelcomeEmail: false,
      isProspect: false,
    }
  });

  // Oppdater prisberegninger når moduler eller rabatter endres
  useEffect(() => {
    const additionalModulesList = form.watch("additionalModules") || [];
    const hasDiscount = form.watch("hasDiscount");
    const discountPercentage = form.watch("discountPercentage");
    const overridePrice = form.watch("overridePrice");
    const customPrice = form.watch("customPrice");
    const discountYears = form.watch("discountYears");
    
    // Beregn standardpris
    const basePrice = 699; // Kampanjepris (normalt 990)
    const additionalModulesPrice = additionalModulesList.length * 199;
    const subtotal = basePrice + additionalModulesPrice;
    
    // Beregn pris med eventuell rabatt
    let calculatedPrice = subtotal;
    if (hasDiscount && discountPercentage > 0) {
      calculatedPrice = subtotal - (subtotal * (discountPercentage / 100));
    }
    
    // Hvis brukeren overstyrer prisen, bruk den tilpassede prisen
    const final = overridePrice ? customPrice : calculatedPrice;
    
    // Beregn original pris uten kampanje
    const originalBasePrice = 990;
    const originalTotal = originalBasePrice + additionalModulesPrice;
    const annualOriginalPrice = originalTotal * 12;
    
    // Sett gjeldende priser
    setBasePrice(basePrice);
    setAdditionalPrice(additionalModulesPrice);
    setTotalPrice(subtotal);
    setFinalPrice(final);
    setAnnualPrice(final * 12);
    setOriginalAnnualPrice(annualOriginalPrice);
    setSavingsAmount(annualOriginalPrice - (final * 12 * discountYears));
    
    // Oppdater potensiell årlig verdi til å være den årlige verdien uten rabatt
    form.setValue("annualValueWithoutDiscount", annualOriginalPrice);
    
  }, [
    form.watch("additionalModules"), 
    form.watch("hasDiscount"), 
    form.watch("discountPercentage"),
    form.watch("overridePrice"),
    form.watch("customPrice"),
    form.watch("discountYears"),
    form
  ]);

  // Funksjon for å generere et sikkert passord
  function generateSecurePassword() {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=";
    let password = "";
    
    // Sikre at passordet har minst én stor bokstav og ett tall
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    
    // Fyll resten med tilfeldige tegn
    for (let i = 0; i < length - 2; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Blande tegnene
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    setGeneratedPassword(password);
    form.setValue("password", password);
    
    return password;
  }

  // Funksjon for å sende tilbudsmail
  const handleSendOffer = async () => {
    // Valider at vi har nødvendig informasjon for å sende tilbudet
    form.trigger(["name", "primaryContact", "primaryEmail"]).then(async isValid => {
      if (isValid) {
        setIsSendingOffer(true);
        
        const values = form.getValues();
        
        // Finn navnene på tilleggsmodulene
        const selectedAdditionalModules = values.additionalModules?.map(id => 
          additionalModules.find(m => m.id === id)
        ).filter(Boolean);
        
        // Lag en detaljert tilbudsmail med prisinformasjon
        const emailDetails = {
          to: values.primaryEmail,
          subject: `Tilbud på HMS-system til ${values.name}`,
          name: values.primaryContact,
          company: values.name,
          message: createEmailContent({
            name: values.primaryContact,
            company: values.name,
            standardModules,
            additionalModules: selectedAdditionalModules,
            basePrice,
            additionalPrice,
            hasDiscount: values.hasDiscount,
            discountPercentage: values.discountPercentage,
            totalPrice,
            finalPrice,
            annualPrice,
            discountYears: values.discountYears,
            savingsAmount,
            username: values.primaryEmail,
            password: values.password,
            isOffer: true
          })
        };
        
        try {
          // Send epost via API
          await sendEmail(emailDetails);
          toast.success(`Tilbudsmail sendt til ${values.primaryEmail}`);
        } catch (error) {
          console.error('Feil ved sending av tilbudsmail:', error);
          toast.error('Kunne ikke sende tilbudsmail. Sjekk konsollen for detaljer.');
        } finally {
          setIsSendingOffer(false);
        }
      } else {
        toast.error("Fyll ut nødvendig informasjon før du sender tilbud (bedriftsnavn, kontaktperson og e-post)");
      }
    });
  };

  // Funksjon for å lagre som prospect
  const handleSaveAsProspect = () => {
    // Valider nødvendige felt for prospect
    const companyName = form.getValues("name");
    const primaryContact = form.getValues("primaryContact");
    const email = form.getValues("primaryEmail");
    const salesNotes = form.getValues("salesNotes") || ""; // Hent eventuelt salgsnotater
    
    if (!companyName || !primaryContact || !email) {
      form.setError("name", {
        type: "manual",
        message: "Bedriftsnavn, primær kontakt og e-post er påkrevd for å lagre som prospect"
      });
      return toast.error("Fyll ut informasjon om bedrift, primær kontakt og e-post før du lagrer som prospect");
    }

    setIsSubmitting(true);

    try {
      // Generer passord hvis nødvendig
      const password = form.getValues("password") || generateSecurePassword();

      // Hent skjemaverdier
      const values = form.getValues();
      
      // Hent rabatt og prisinfo
      const hasDiscount = values.hasDiscount || false;
      const discountPercentage = hasDiscount ? (values.discountPercentage || 0) : 0;
      const discountYears = values.discountYears || 1;
      const selectedAdditionalModules = values.additionalModules || [];
      
      // Beregn månedspriser
      const baseMonthlyPrice = values.overridePrice && values.customPrice > 0 
        ? values.customPrice 
        : basePrice;
      const modulesPrices = selectedAdditionalModules.map(moduleId => {
        // Finn modulen fra additionalModules-arrayet
        const module = additionalModules.find(m => m.id === moduleId);
        return module ? module.price : 199; // Bruk 199 som standardpris hvis ikke funnet
      });
      const additionalMonthlyPrice = modulesPrices.reduce((sum, price) => sum + price, 0);
      const totalMonthlyPrice = baseMonthlyPrice + additionalMonthlyPrice;
      
      // Beregn rabattert månedspris
      const finalMonthlyPrice = hasDiscount 
        ? totalMonthlyPrice * (1 - (discountPercentage / 100)) 
        : totalMonthlyPrice;
      
      // Beregn årspriser
      const annualPrice = finalMonthlyPrice * 12;
      
      // Beregn totalt salgspotensial basert på rabattperiode
      const potentialValue = annualPrice * discountYears;
      
      // Hent prospect-spesifikk informasjon
      const prospectStage = values.prospectStage || "LEAD";
      const expectedCloseDate = values.expectedCloseDate || 
                            (new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]; // 30 dager fra nå
      
      // Samle alle moduler
      const allModules = [
        ...standardModules.map(m => m.id), 
        ...selectedAdditionalModules
      ];

      // Opprett registreringsdata som inkluderer både bedrift og bruker
      const registrationData = {
        company: {
          name: companyName,
          orgNumber: values.orgNumber || "",
          organizationType: values.organizationType || "AS",
          organizationCode: values.organizationType || "AS",
          isVerified: false,
          isActive: false, // Prospect er ikke aktiv
          paymentStatus: "NOT_STARTED",
          subscriptionPlan: values.subscriptionPlan || "STANDARD",
          employeeCount: values.employeeCount || 1,
        },
        user: {
          name: primaryContact,
          email: email,
          password: password,
          role: 'COMPANY_ADMIN'
        },
        // Overføre alle prisdata
        basePrice: baseMonthlyPrice,
        additionalPrice: additionalMonthlyPrice,
        totalPrice: totalMonthlyPrice,
        finalPrice: finalMonthlyPrice,
        discountPercentage: discountPercentage,
        discountYears: discountYears,
        annualPrice: annualPrice,
        potentialValue: potentialValue,
        // Modulinformasjon
        moduleNames: allModules,
        // Tilleggsinformasjon
        storageSize: "5GB",
        // Salgsinformasjon
        salesInfo: {
          potentialValue: potentialValue,
          prospectStage: prospectStage,
          expectedCloseDate: expectedCloseDate,
          salesNotes: salesNotes
        },
        // Detaljert modulinfo for å kunne gjenskape modulvalg
        moduleDetails: [
          ...standardModules.map(m => ({
            id: m.id,
            name: m.name,
            description: m.description,
            isStandard: true
          })),
          ...selectedAdditionalModules.map(moduleId => {
            const module = additionalModules.find(m => m.id === moduleId);
            return {
              id: moduleId,
              name: module?.name || moduleId,
              description: module?.description || "",
              price: module?.price || 199,
              isStandard: false
            };
          })
        ]
      };
      
      // Send registreringen til API-et
      fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.message || 'Kunne ikke registrere prospect');
          });
        }
        return response.json();
      })
      .then(data => {
        // Registrering vellykket
        console.log('Prospect registrering vellykket:', data);
        
        // Konverter API-responsen til riktig format for UI
        const newCompany: any = {
          id: data.company.id,
          name: data.company.name,
          orgNumber: data.company.orgNumber || "",
          organizationType: data.company.organizationType || "AS",
          address: "",
          postalCode: "",
          city: "",
          country: "Norge",
          primaryContact: data.user.name,
          email: data.user.email,
          phone: values.primaryPhone || "",
          website: "",
          industry: "",
          size: values.employeeCount?.toString() || "1-9",
          activeModules: data.modules.map((m: any) => m.key.split('_')[0]),
          isActive: false,
          isVerified: false,
          isProspect: true,
          createdAt: new Date(),
          salesNotes: salesNotes,
          paymentStatus: "NOT_STARTED",
          password: password,
          activeOpportunities: data.opportunity ? 1 : 0,
          // Inkluder alle prisdata
          basePrice: baseMonthlyPrice,
          additionalPrice: additionalMonthlyPrice,
          totalPrice: totalMonthlyPrice,
          finalPrice: finalMonthlyPrice,
          discountPercentage: discountPercentage,
          discountYears: discountYears,
          annualPrice: annualPrice,
          potentialValue: potentialValue,
          prospectStage: prospectStage,
          expectedCloseDate: expectedCloseDate,
          // Legg til salesOpportunities fra API-responsen
          salesOpportunities: data.opportunity ? [data.opportunity] : [],
        };
        
        // Legg til __password-felt for handleCreateCompany i crm-client.tsx
        // @ts-ignore - Ignorer TypeScript-feil for dette spesifikke tilfellet
        newCompany.__password = password;
        
        // Legg til et flag som indikerer at dette allerede er lagret i databasen
        newCompany.__skipApiCall = true;
        
        // Send til forelderkomponenten
        onCreateCompany(newCompany);
        
        // Vis suksessmelding
        toast.success(`${companyName} ble lagret som prospect med brukerkonto${data.opportunity ? ' og salgsmulight' : ''}`);
        
        // Tilbakestill skjema og lukk dialog
        form.reset();
        onOpenChange(false);
        setIsSubmitting(false);
      })
      .catch(error => {
        console.error('Feil ved registrering av prospect:', error);
        toast.error(`Registrering av prospect feilet: ${error.message}`);
        setIsSubmitting(false);
      });
    } catch (error) {
      console.error('Feil ved behandling av data:', error);
      toast.error(`Kunne ikke behandle prospect-data: ${error instanceof Error ? error.message : String(error)}`);
      setIsSubmitting(false);
    }
  };

  // Funksjon for å lagre som aktiv bedrift
  const handleSaveAsActiveCompany = () => {
    // For aktive bedrifter kjører vi full validering før lagring
    form.trigger().then(isValid => {
      if (isValid) {
        // Sett prospect-flagget til false og gjør bedriften aktiv
        form.setValue("isProspect", false);
        form.setValue("isActive", true);
        // Sett sendWelcomeEmail til true som standard for aktive bedrifter
        form.setValue("sendWelcomeEmail", true);
        
        setIsSubmitting(true);
        
        try {
          // Generer passord hvis nødvendig
          const password = form.getValues("password") || generateSecurePassword();
          form.setValue("password", password);
          
          // Vis bekreftelsesmelding og vent på svar
          const companyName = form.getValues("name");
          const primaryContact = form.getValues("primaryContact");
          const confirmation = confirm(`Bekreft at du vil opprette bedriften ${companyName} med kontaktperson ${primaryContact}?`);
          
          if (confirmation) {
            // Hent skjemaverdier
            const values = form.getValues();
            
            // Hent rabatt og prisinfo
            const hasDiscount = values.hasDiscount || false;
            const discountPercentage = hasDiscount ? (values.discountPercentage || 0) : 0;
            const discountYears = values.discountYears || 1;
            const selectedAdditionalModules = values.additionalModules || [];
            
            // Beregn månedspriser
            const baseMonthlyPrice = values.overridePrice && values.customPrice > 0 
              ? values.customPrice 
              : basePrice;
            const modulesPrices = selectedAdditionalModules.map(moduleId => {
              // Finn modulen fra additionalModules-arrayet
              const module = additionalModules.find(m => m.id === moduleId);
              return module ? module.price : 199; // Bruk 199 som standardpris hvis ikke funnet
            });
            const additionalMonthlyPrice = modulesPrices.reduce((sum, price) => sum + price, 0);
            const totalMonthlyPrice = baseMonthlyPrice + additionalMonthlyPrice;
            
            // Beregn rabattert månedspris
            const finalMonthlyPrice = hasDiscount 
              ? totalMonthlyPrice * (1 - (discountPercentage / 100)) 
              : totalMonthlyPrice;
            
            // Beregn årspriser
            const annualPrice = finalMonthlyPrice * 12;
            
            // Beregn totalt salgspotensial basert på rabattperiode
            const potentialValue = annualPrice * discountYears;
            
            // Samle alle moduler
            const allModules = [
              ...standardModules.map(m => m.id), 
              ...selectedAdditionalModules
            ];
            
            // Opprett registreringsdata
            const registrationData = {
              company: {
                name: values.name,
                orgNumber: values.orgNumber || "",
                organizationType: values.organizationType || "AS",
                organizationCode: values.organizationType || "AS",
                isVerified: false,
                isActive: true,
                paymentStatus: "PENDING",
                subscriptionPlan: values.subscriptionPlan || "STANDARD",
                employeeCount: values.employeeCount || 1,
              },
              user: {
                name: values.primaryContact,
                email: values.primaryEmail,
                password: password,
                role: 'COMPANY_ADMIN'
              },
              // Overføre alle prisdata
              basePrice: baseMonthlyPrice,
              additionalPrice: additionalMonthlyPrice,
              totalPrice: totalMonthlyPrice,
              finalPrice: finalMonthlyPrice,
              discountPercentage: discountPercentage,
              discountYears: discountYears,
              annualPrice: annualPrice,
              potentialValue: potentialValue,
              // Modulinformasjon
              moduleNames: allModules,
              // Tilleggsinformasjon
              storageSize: "5GB",
              sendWelcomeEmail: true,
              // Eventuelle salgsnotater
              salesNotes: values.salesNotes || "",
              // Legg til detaljert modulinfo for å kunne gjenskape modulvalg
              moduleDetails: [
                ...standardModules.map(m => ({
                  id: m.id,
                  name: m.name,
                  description: m.description,
                  isStandard: true
                })),
                ...selectedAdditionalModules.map(moduleId => {
                  const module = additionalModules.find(m => m.id === moduleId);
                  return {
                    id: moduleId,
                    name: module?.name || moduleId,
                    description: module?.description || "",
                    price: module?.price || 199,
                    isStandard: false
                  };
                })
              ]
            };

            // Legg til salgsinformasjon i registreringen
            if (potentialValue > 0) {
              // @ts-ignore - TypeScript kan ikke vite at vi trenger dette feltet
              registrationData.salesInfo = {
                potentialValue: potentialValue,
                prospectStage: "CUSTOMER", // Aktive bedrifter er allerede kunder
                expectedCloseDate: null, // Allerede "closed won"
                salesNotes: values.salesNotes || `Aktiv kunde med rabatt: ${discountPercentage}% i ${discountYears} år`
              };
            }
            
            // Send registreringen til API-et
            fetch('/api/auth/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(registrationData)
            })
            .then(response => {
              if (!response.ok) {
                return response.json().then(data => {
                  throw new Error(data.message || 'Kunne ikke registrere bedrift');
                });
              }
              return response.json();
            })
            .then(data => {
              console.log('Bedriftsregistrering vellykket:', data);
              
              // Konverter API-responsen til riktig format for UI
              const newCompany: any = {
                id: data.company.id,
                name: data.company.name,
                orgNumber: data.company.orgNumber || "",
                organizationType: data.company.organizationType || "AS",
                address: "",
                postalCode: "",
                city: "",
                country: "Norge",
                primaryContact: data.user.name,
                email: data.user.email,
                phone: values.primaryPhone || "",
                website: "",
                industry: "",
                size: values.employeeCount?.toString() || "1-9",
                activeModules: data.modules.map((m: any) => m.key.split('_')[0]),
                isActive: true,
                isVerified: false,
                isProspect: false,
                createdAt: new Date(),
                salesNotes: values.salesNotes || "",
                paymentStatus: "PENDING",
                password: password,
                activeOpportunities: data.opportunity ? 1 : 0,
                // Inkluder alle prisdata
                basePrice: baseMonthlyPrice,
                additionalPrice: additionalMonthlyPrice,
                totalPrice: totalMonthlyPrice,
                finalPrice: finalMonthlyPrice,
                discountPercentage: discountPercentage,
                discountYears: discountYears,
                annualPrice: annualPrice,
                potentialValue: potentialValue,
                // Legg til salgsmuligheter
                salesOpportunities: data.opportunity ? [data.opportunity] : [],
              };
              
              // Legg til __password-felt for handleCreateCompany i crm-client.tsx
              // @ts-ignore - Ignorer TypeScript-feil for dette spesifikke tilfellet
              newCompany.__password = password;
              
              // Legg til et flag som indikerer at dette allerede er lagret i databasen
              newCompany.__skipApiCall = true;
              
              // Send til forelderkomponenten
              onCreateCompany(newCompany);
              
              // Vis suksessmelding
              toast.success(`${values.name} ble opprettet som aktiv bedrift`, {
                description: "Velkomst-epost med innloggingsinformasjon blir sendt automatisk."
              });
              
              // Tilbakestill skjema og lukk dialog
              form.reset();
              onOpenChange(false);
            })
            .catch(error => {
              console.error('Feil ved registrering av bedrift:', error);
              toast.error(`Registrering av bedrift feilet: ${error.message}`);
              setIsSubmitting(false);
            });
          } else {
            setIsSubmitting(false);
          }
        } catch (error) {
          console.error('Feil ved registrering av bedrift:', error);
          toast.error(`Registrering av bedrift feilet: ${error instanceof Error ? error.message : String(error)}`);
          setIsSubmitting(false);
        }
      }
    });
  };

  const nextTab = () => {
    if (currentTab === "info") {
      // Valider feltene i info-fanen før vi går videre
      form.trigger(["name", "orgNumber", "organizationType", "employeeCount"]).then(isValid => {
        if (isValid) setCurrentTab("contact");
      });
    } else if (currentTab === "contact") {
      form.trigger(["primaryContact", "primaryEmail"]).then(isValid => {
        if (isValid) setCurrentTab("subscription");
      });
    } else if (currentTab === "subscription") {
      form.trigger(["subscriptionPlan"]).then(isValid => {
        if (isValid) setCurrentTab("sales");
      });
    }
  };

  const prevTab = () => {
    if (currentTab === "contact") {
      setCurrentTab("info");
    } else if (currentTab === "subscription") {
      setCurrentTab("contact");
    } else if (currentTab === "sales") {
      setCurrentTab("subscription");
    }
  };

  // Oppdatere subscription fane til å inkludere rabatt-funksjonalitet
  const renderSubscriptionTab = () => (
    <TabsContent value="subscription" className="space-y-3 sm:space-y-4 pt-2 sm:pt-3">
      <Card>
        <CardHeader className="p-2 sm:p-3 pb-1">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Abonnementsinformasjon
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 space-y-3 sm:space-y-4">
          <FormField
            control={form.control}
            name="subscriptionPlan"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm">Abonnement</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue placeholder="Velg abonnement" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard (699 kr/mnd - Kampanjepris)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs">
                  Standard pakke: Inkluderer HMS-basisfunksjonalitet med 5 grunnmoduler.
                </FormDescription>
                <div className="mt-1">
                  <Badge variant="secondary" className="text-xs">Kampanjepris 699 kr/mnd</Badge>
                  <span className="ml-2 line-through text-muted-foreground">Ordinær pris 990 kr/mnd</span>
                </div>
                <FormMessage className="text-xs"/>
              </FormItem>
            )}
          />
          
          <div className="pt-2 pb-2">
            <h4 className="text-sm font-medium mb-2">Inkluderte moduler i standardpakken:</h4>
            <div className="space-y-2 border rounded-md p-2">
              {standardModules.map((module) => (
                <div key={module.id} className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium">{module.name}</div>
                    <div className="text-muted-foreground">{module.description}</div>
                  </div>
                  <Badge variant="secondary">Inkludert</Badge>
                </div>
              ))}
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="additionalModules"
            render={({ field }) => (
              <FormItem>
                <div className="mb-2">
                  <FormLabel className="text-xs sm:text-sm">Tilleggsmoduler (valgfritt)</FormLabel>
                  <FormDescription className="text-xs">
                    Velg ekstra moduler for å utvide funksjonaliteten (199 kr/mnd per modul)
                  </FormDescription>
                </div>
                <div className="space-y-2 border rounded-md p-2">
                  {additionalModules.map((module) => (
                    <FormField
                      key={module.id}
                      control={form.control}
                      name="additionalModules"
                      render={({ field: moduleField }) => {
                        return (
                          <FormItem
                            key={module.id}
                            className="flex items-center justify-between space-y-0 py-1"
                          >
                            <div className="flex items-start space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={moduleField.value?.includes(module.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? moduleField.onChange([...(moduleField.value || []), module.id])
                                      : moduleField.onChange(
                                          moduleField.value?.filter(
                                            (value) => value !== module.id
                                          ) || []
                                      );
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-0 leading-none">
                                <FormLabel className="text-xs font-medium">
                                  {module.name}
                                </FormLabel>
                                <div className="text-xs text-muted-foreground">
                                  {module.description}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs font-medium">
                              +{formatPrice(module.price)} kr/mnd
                            </div>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage className="text-xs"/>
              </FormItem>
            )}
          />
          
          {/* Rabatt-seksjon */}
          <Card className="border-dashed border-primary/50">
            <CardHeader className="p-2 sm:p-3 pb-1">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                Prisjustering
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 space-y-3 sm:space-y-4">
              <FormField
                control={form.control}
                name="hasDiscount"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-xs sm:text-sm">
                        Gi rabatt
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Legg til prosentvis rabatt på totalprisen
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              {form.watch("hasDiscount") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm">Rabatt (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            max="100"
                            placeholder="0" 
                            className="text-xs sm:text-sm" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs"/>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="discountYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm">Rabatt gjelder (år)</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="text-xs sm:text-sm">
                              <SelectValue placeholder="Velg varighet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 år</SelectItem>
                            <SelectItem value="2">2 år</SelectItem>
                            <SelectItem value="3">3 år</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs"/>
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              <FormField
                control={form.control}
                name="overridePrice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-xs sm:text-sm">
                        Overstyr pris
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Angi en egendefinert månedspris uavhengig av moduler og rabatt
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              {form.watch("overridePrice") && (
                <FormField
                  control={form.control}
                  name="customPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">Egendefinert månedspris (kr)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="0" 
                          className="text-xs sm:text-sm" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs"/>
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>
          
          <div className="mt-3 pt-3 border-t space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs font-medium">Standardpakke:</div>
              <div className="text-xs">{formatPrice(basePrice)} kr/mnd</div>
            </div>
            
            {additionalPrice > 0 && (
              <div className="flex justify-between items-center">
                <div className="text-xs font-medium">Tilleggsmoduler:</div>
                <div className="text-xs">+{formatPrice(additionalPrice)} kr/mnd</div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="text-xs font-medium">Subtotal:</div>
              <div className="text-xs">{formatPrice(totalPrice)} kr/mnd</div>
            </div>
            
            {form.watch("hasDiscount") && form.watch("discountPercentage") > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <div className="text-xs font-medium">Rabatt ({form.watch("discountPercentage")}%):</div>
                <div className="text-xs">-{formatPrice(Math.round(totalPrice * (form.watch("discountPercentage") / 100)))} kr/mnd</div>
              </div>
            )}
            
            {form.watch("overridePrice") && (
              <div className="flex justify-between font-medium">
                <div className="text-xs">Egendefinert pris:</div>
                <div className="text-xs">{formatPrice(form.watch("customPrice"))} kr/mnd</div>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between items-center font-bold">
              <div className="text-sm">Total månedspris:</div>
              <div className="text-sm">{formatPrice(finalPrice)} kr/mnd</div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-xs font-medium">Årlig:</div>
              <div className="text-xs">{formatPrice(annualPrice)} kr/år</div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-xs font-medium">Ordinær årspris:</div>
              <div className="text-xs">{formatPrice(originalAnnualPrice)} kr/år</div>
            </div>
            
            {savingsAmount > 0 && (
              <div className="flex justify-between items-center text-green-600 font-medium">
                <div className="text-xs">Besparelse over {form.watch("discountYears")} år:</div>
                <div className="text-xs">{formatPrice(savingsAmount)} kr</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline"
          onClick={prevTab}
          className="text-xs sm:text-sm"
        >
          Tilbake
        </Button>
        <Button 
          type="button" 
          onClick={nextTab}
          className="text-xs sm:text-sm"
        >
          Neste: Salgsinformasjon
        </Button>
      </div>
    </TabsContent>
  );
  
  // Oppdatere Sales-fanen for å vise potensiell årlig verdi
  const renderSalesTab = () => (
    <TabsContent value="sales" className="space-y-3 sm:space-y-4 pt-2 sm:pt-3">
      <Card>
        <CardHeader className="p-2 sm:p-3 pb-1">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Salgsinformasjon
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 space-y-3 sm:space-y-4">
          <FormField
            control={form.control}
            name="annualValueWithoutDiscount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm">Total årlig verdi (NOK)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="0" 
                    className="text-xs sm:text-sm" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Ordinær årlig verdi for kundens abonnement (uten rabatt)
                </FormDescription>
                <FormMessage className="text-xs"/>
              </FormItem>
            )}
          />
          
          <div className="border p-3 rounded-md space-y-3">
            <h3 className="text-sm font-medium">Prospekt-informasjon</h3>
            
            <FormField
              control={form.control}
              name="potentialValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Potensiell verdi (NOK)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      placeholder="0" 
                      className="text-xs sm:text-sm" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Estimert årlig potensiell verdi for denne prospekten
                  </FormDescription>
                  <FormMessage className="text-xs"/>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="prospectStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Prospekt-stadium</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="text-xs sm:text-sm">
                        <SelectValue placeholder="Velg stadium" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LEAD" className="text-xs sm:text-sm">Lead</SelectItem>
                      <SelectItem value="CONTACT" className="text-xs sm:text-sm">Kontaktet</SelectItem>
                      <SelectItem value="OPPORTUNITY" className="text-xs sm:text-sm">Mulighet</SelectItem>
                      <SelectItem value="NEGOTIATION" className="text-xs sm:text-sm">Forhandling</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Hvor langt har dere kommet i salgsprosessen med denne prospekten?
                  </FormDescription>
                  <FormMessage className="text-xs"/>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expectedCloseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Forventet avslutningsdato</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      className="text-xs sm:text-sm" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Når forventes det at denne prospekten blir en kunde?
                  </FormDescription>
                  <FormMessage className="text-xs"/>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="salesNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm">Salgsnotater</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Legg til informasjon om kundeforholdet" 
                    className="resize-none h-20 text-xs sm:text-sm" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-xs"/>
              </FormItem>
            )}
          />
          
          <div className="flex flex-wrap gap-2">
            <FormField
              control={form.control}
              name="sendWelcomeEmail"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-xs sm:text-sm">
                      Send velkomstepost
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Send en automatisk velkomstepost til kontaktpersonen
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleSendOffer}
              disabled={isSendingOffer}
              className="text-xs sm:text-sm ml-auto"
            >
              <Send className="mr-2 h-3.5 w-3.5" />
              {isSendingOffer ? "Sender tilbud..." : "Send tilbud (uten å opprette)"}
            </Button>
          </div>
          
          <div className="pt-3 mt-3 border-t">
            <div className="text-xs font-medium mb-2">Oppsummering av ordre:</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Standard pakke (Kampanje):</span>
                <span>{formatPrice(basePrice)} kr/mnd</span>
              </div>
              {form.watch("additionalModules")?.map(moduleId => {
                const module = additionalModules.find(m => m.id === moduleId);
                return module ? (
                  <div key={module.id} className="flex justify-between">
                    <span>Tilleggsmodul: {module.name}:</span>
                    <span>{formatPrice(module.price)} kr/mnd</span>
                  </div>
                ) : null;
              })}
              
              {form.watch("hasDiscount") && form.watch("discountPercentage") > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Rabatt ({form.watch("discountPercentage")}%):</span>
                  <span>-{formatPrice(Math.round(totalPrice * (form.watch("discountPercentage") / 100)))} kr/mnd</span>
                </div>
              )}
              
              {form.watch("overridePrice") && (
                <div className="flex justify-between font-medium">
                  <span>Egendefinert pris:</span>
                  <span>{formatPrice(form.watch("customPrice"))} kr/mnd</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold pt-1 mt-1 border-t">
                <span>Total månedspris:</span>
                <span>{formatPrice(finalPrice)} kr/mnd</span>
              </div>
              
              <div className="flex justify-between">
                <span>Årlig kostnad:</span>
                <span>{formatPrice(annualPrice)} kr/år</span>
              </div>
              
              {savingsAmount > 0 && (
                <div className="flex justify-between mt-2 text-green-600 font-medium">
                  <span>Kundens besparelse (over {form.watch("discountYears")} år):</span>
                  <span>{formatPrice(savingsAmount)} kr</span>
                </div>
              )}
              
              <div className="flex justify-between mt-2 pt-2 border-t">
                <span className="text-blue-600 font-medium">Bedriftshelsetjeneste hos Dr.Dropin:</span>
                <span className="text-blue-600 font-medium">15% rabatt</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline"
          onClick={prevTab}
          className="text-xs sm:text-sm"
        >
          Tilbake
        </Button>
        <div className="flex gap-2">
          <Button 
            type="button"
            variant="outline"
            onClick={handleSaveAsProspect}
            disabled={isSubmitting}
            className="text-xs sm:text-sm"
          >
            <Users className="mr-2 h-3.5 w-3.5" />
            Lagre som prospect
          </Button>
          <Button 
            type="button"
            onClick={handleSaveAsActiveCompany}
            disabled={isSubmitting}
            className="text-xs sm:text-sm bg-primary"
          >
            <CreditCard className="mr-2 h-3.5 w-3.5" />
            Opprett aktiv bedrift
          </Button>
        </div>
      </div>
    </TabsContent>
  );

  // Oppdatere kontakt-fanen og fjern brukernavnfeltet (behold bare passordfeltet)
  const renderContactTab = () => (
    <TabsContent value="contact" className="space-y-3 sm:space-y-4 pt-2 sm:pt-3">
      <Card>
        <CardHeader className="p-2 sm:p-3 pb-1">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Kontaktinformasjon
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 space-y-3 sm:space-y-4">
          <FormField
            control={form.control}
            name="primaryContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm">Primærkontakt</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Navn på kontaktperson" 
                    className="text-xs sm:text-sm" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-xs"/>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="primaryPosition"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm">Stilling</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Stilling til kontaktperson" 
                    className="text-xs sm:text-sm" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-xs"/>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField
              control={form.control}
              name="primaryEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">E-post</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="E-post til kontaktperson" 
                      className="text-xs sm:text-sm" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Brukes også som brukernavn ved innlogging.
                  </FormDescription>
                  <FormMessage className="text-xs"/>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="primaryPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Telefon</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Telefonnummer" 
                      className="text-xs sm:text-sm" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs"/>
                </FormItem>
              )}
            />
          </div>
          
          <div className="pt-4 border-t mt-4">
            <h3 className="text-sm font-medium mb-3">Innloggingsinformasjon</h3>
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Passord</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        type="text"
                        placeholder="Passord for innlogging" 
                        className="text-xs sm:text-sm" 
                        {...field} 
                      />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => generateSecurePassword()}
                      className="text-xs whitespace-nowrap"
                    >
                      Generer
                    </Button>
                  </div>
                  <FormDescription className="text-xs">
                    Minimum 8 tegn, inkludert minst én stor bokstav og ett tall.
                  </FormDescription>
                  <FormMessage className="text-xs"/>
                </FormItem>
              )}
            />
            <div className="mt-3 text-xs text-muted-foreground">
              <p>E-postadressen vil bli brukt som brukernavn ved innlogging.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline"
          onClick={prevTab}
          className="text-xs sm:text-sm"
        >
          Tilbake
        </Button>
        <Button 
          type="button" 
          onClick={nextTab}
          className="text-xs sm:text-sm"
        >
          Neste: Abonnement
        </Button>
      </div>
    </TabsContent>
  );

  // Legg til onSubmit-funksjon
  const onSubmit = (values: CompanyFormValues) => {
    // Sjekk om bedriften skal lagres som prospect eller aktiv bedrift
    const saveAsProspect = currentTab === "sales" && values.isProspect;
    
    if (saveAsProspect) {
      handleSaveAsProspect();
    } else {
      handleSaveAsActiveCompany();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-3xl w-full p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
            Registrer ny bedrift
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Fyll ut informasjon om den nye bedriften for å opprette den i systemet.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info" className="text-xs sm:text-sm">Bedrift</TabsTrigger>
                <TabsTrigger value="contact" className="text-xs sm:text-sm">Kontakt</TabsTrigger>
                <TabsTrigger value="subscription" className="text-xs sm:text-sm">Abonnement</TabsTrigger>
                <TabsTrigger value="sales" className="text-xs sm:text-sm">Salg</TabsTrigger>
              </TabsList>
              
              {/* Bedriftsinformasjon */}
              <TabsContent value="info" className="space-y-3 sm:space-y-4 pt-2 sm:pt-3">
                <Card>
                  <CardHeader className="p-2 sm:p-3 pb-1">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      Bedriftsinformasjon
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-3 space-y-3 sm:space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Bedriftsnavn</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Skriv inn bedriftsnavn" 
                              className="text-xs sm:text-sm" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-xs"/>
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <FormField
                        control={form.control}
                        name="orgNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs sm:text-sm">Organisasjonsnummer</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Skriv inn org.nummer" 
                                className="text-xs sm:text-sm" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-xs"/>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="organizationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs sm:text-sm">Organisasjonstype</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="text-xs sm:text-sm">
                                  <SelectValue placeholder="Velg type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="AS">Aksjeselskap (AS)</SelectItem>
                                <SelectItem value="ENK">Enkeltpersonforetak (ENK)</SelectItem>
                                <SelectItem value="ANS">Ansvarlig selskap (ANS)</SelectItem>
                                <SelectItem value="DA">Delt ansvar (DA)</SelectItem>
                                <SelectItem value="SA">Samvirkeforetak (SA)</SelectItem>
                                <SelectItem value="STI">Stiftelse</SelectItem>
                                <SelectItem value="KOMMUNE">Kommune</SelectItem>
                                <SelectItem value="ANNET">Annet</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs"/>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <FormField
                        control={form.control}
                        name="employeeCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs sm:text-sm">Antall ansatte</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1"
                                placeholder="Antall" 
                                className="text-xs sm:text-sm" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-xs"/>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-2 pt-4 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-xs sm:text-sm">
                                Aktiv bedrift
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Sett bedriften som aktiv med en gang
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={nextTab}
                    className="text-xs sm:text-sm"
                  >
                    Neste: Kontaktinformasjon
                  </Button>
                </div>
              </TabsContent>
              
              {/* Kontaktinformasjon - bruker vår nye renderer */}
              {renderContactTab()}
              
              {/* Abonnementsinformasjon */}
              {renderSubscriptionTab()}
              
              {/* Salgsinformasjon */}
              {renderSalesTab()}
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 