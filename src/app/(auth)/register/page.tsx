'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { validateCompany, type ParsedCompanyData } from "@/lib/services/brreg-service"
import Link from "next/link"
import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ContractModal } from "@/components/contract-modal"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

interface FormData {
  orgNumber: string;
  companyName: string;
  organizationType: string;
  organizationCode: string;
  website?: string;
  address?: {
    street: string;
    streetNo?: string;
    postalCode: string;
    city: string;
  };
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  subscriptionPlan: string;
  employeeCount: string;
}

const formSchema = z.object({
  orgNumber: z.string().length(9, "Organisasjonsnummeret må være 9 siffer"),
  companyName: z.string().min(1, "Bedriftsnavn er påkrevd"),
  organizationType: z.string().min(1, "Organisasjonsform er påkrevd"),
  organizationCode: z.string().min(1, "Organisasjonskode er påkrevd"),
  website: z.string().optional(),
  address: z.object({
    street: z.string().min(1, "Adresselinje 1 er påkrevd"),
    streetNo: z.string().optional(),
    postalCode: z.string().min(1, "Postnummer er påkrevd"),
    city: z.string().min(1, "By er påkrevd"),
  }).optional(),
  name: z.string().min(1, "Navn er påkrevd"),
  email: z.string().email("Ugyldig e-post"),
  password: z.string().min(8, "Passord må være minst 8 tegn"),
  confirmPassword: z.string().min(8, "Bekreft passord må være minst 8 tegn"),
  subscriptionPlan: z.enum(["STANDARD", "PREMIUM"]),
  employeeCount: z.string().min(1, "Antall ansatte må være minst 1"),
})

type EmployeeRange = "1-5" | "5-10" | "10-30"
// Standardverdi for lagring
const defaultStorageSize = "5GB"

// Originale priser
const originalPrices = {
  STANDARD: { monthly: 899, yearly: 899 * 12 - 899 }, // 1 måned gratis ved årsavtale
  PREMIUM: { monthly: 1299, yearly: 1299 * 12 - 1299 } // 1 måned gratis ved årsavtale
}

// Kampanjepriser
const basePrices = {
  STANDARD: { monthly: 699, yearly: 699 * 12 - 699 }, // 1 måned gratis ved årsavtale
  PREMIUM: { monthly: 1099, yearly: 1099 * 12 - 1099 } // 1 måned gratis ved årsavtale
}

const storagePricing: Record<string, number> = {
  "1GB": 0,
  "5GB": 199,
  "20GB": 399,
  "100GB": 699
}

const employeePricing: Record<EmployeeRange, number> = {
  "1-5": 0,
  "5-10": 299,
  "10-30": 599
}

const calculatePrice = (plan: string, employees: string) => {
  const basePrice = basePrices[plan as keyof typeof basePrices].monthly
  const employeePrice = employeePricing[employees as EmployeeRange] || 0
  return basePrice + employeePrice
}

function RegisterFormInner() {
  const searchParams = useSearchParams()
  
  // Hent pakkevalg fra URL-parametere
  const planParam = searchParams.get('plan') as "STANDARD" | "PREMIUM" | null
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subscriptionPlan: (planParam || "STANDARD") as "STANDARD" | "PREMIUM",
      employeeCount: "1-5",
      orgNumber: '',
      companyName: '',
      organizationType: '',
      organizationCode: '',
      website: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      address: {
        street: '',
        streetNo: '',
        postalCode: '',
        city: '',
      }
    }
  })
  
  // Oppdater feltene når URL-parametere endrer seg
  useEffect(() => {
    if (planParam && (planParam === "STANDARD" || planParam === "PREMIUM")) {
      form.setValue('subscriptionPlan', planParam);
    }
  }, [planParam, form]);
  
  const [companyData, setCompanyData] = useState<ParsedCompanyData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isCompanyValidated, setIsCompanyValidated] = useState(false)

  const validateOrgNumber = async () => {
    if (form.getValues('orgNumber').length !== 9) {
      toast.error('Organisasjonsnummeret må være 9 siffer')
      return
    }

    setIsValidating(true)
    try {
      const company = await validateCompany(form.getValues('orgNumber'))
      if (company) {
        setCompanyData(company)
        form.reset({
          ...form.getValues(),
          companyName: company.name,
          organizationType: company.organizationType,
          organizationCode: company.organizationCode,
          website: company.website || '',
          address: company.address
        })
        setIsCompanyValidated(true)
        toast.success('Bedrift funnet i Brønnøysundregistrene')
      } else {
        toast.error('Fant ikke bedriften i Brønnøysundregistrene')
        setIsCompanyValidated(false)
      }
    } catch (error) {
      toast.error('Kunne ikke validere organisasjonsnummeret')
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = useCallback(async () => {
    if (!isCompanyValidated) {
      toast.error('Bedriften må valideres først')
      return
    }

    if (form.getValues('password') !== form.getValues('confirmPassword')) {
      toast.error('Passordene må være like')
      return
    }

    setIsLoading(true)
    try {
      const formData = {
        company: {
          orgNumber: form.getValues('orgNumber'),
          name: form.getValues('companyName'),
          organizationType: form.getValues('organizationType'),
          organizationCode: form.getValues('organizationCode'),
          website: form.getValues('website')?.replace(/^https?:\/\//, '') || null,
          address: form.getValues('address')
        },
        user: {
          name: form.getValues('name'),
          email: form.getValues('email'),
          password: form.getValues('password'),
          role: 'COMPANY_ADMIN'
        },
        subscriptionPlan: form.getValues('subscriptionPlan'),
        employeeCount: form.getValues('employeeCount'),
        storageSize: defaultStorageSize
      }

      console.log('Sending registration data:', {
        ...formData,
        user: { ...formData.user, password: '[REDACTED]' }
      })

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      console.log('Server response:', {
        status: response.status,
        statusText: response.statusText,
        data
      })

      if (!response.ok) {
        throw new Error(data.message || 'Registrering feilet')
      }

      toast.success('Registrering vellykket!')
      window.location.href = '/login?registered=true'
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error instanceof Error ? error.message : 'Kunne ikke fullføre registreringen')
    } finally {
      setIsLoading(false)
    }
  }, [form, isCompanyValidated])

  const SubscriptionSection = () => {
    const plan = form.watch("subscriptionPlan")
    const employees = form.watch("employeeCount")
    
    const totalPrice = calculatePrice(plan, employees)
    const basePrice = basePrices[plan as keyof typeof basePrices].monthly
    const employeePrice = employeePricing[employees as EmployeeRange] || 0
    
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Velg abonnement</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="subscriptionPlan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Abonnementspakke</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg pakke" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard ({formatPrice(699)},-/mnd)</SelectItem>
                    <SelectItem value="PREMIUM">Premium ({formatPrice(1099)},-/mnd)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="employeeCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Antall ansatte</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg antall" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 ansatte (inkludert)</SelectItem>
                    <SelectItem value="5-10">5-10 ansatte (+299,-/mnd)</SelectItem>
                    <SelectItem value="10-30">10-30 ansatte (+599,-/mnd)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {plan === "PREMIUM" && (
          <div className="bg-green-50 p-4 rounded-md border border-green-200 mt-4">
            <p className="text-green-700 font-medium">Premium-pakken inkluderer:</p>
            <ul className="list-disc pl-5 mt-2 text-green-700 text-sm space-y-1">
              <li>Alt fra Standard-pakken</li>
              <li>Vernerunder med automatisk læsning</li>
              <li>Avansert HMS-dashboard</li>
              <li>Sikker Jobb Analyse (SJA)</li>
              <li>Utvidet rapportering og statistikk</li>
              <li>Prioritert kundestøtte</li>
            </ul>
          </div>
        )}
        
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
          <p className="font-medium">Månedlig kostnad:</p>
          <div className="space-y-2 mt-2">
            <div className="flex justify-between">
              <span>Basispris ({plan === "STANDARD" ? "Standard" : "Premium"}):</span>
              <span>{basePrice},-</span>
            </div>
            {employeePrice > 0 && (
              <div className="flex justify-between">
                <span>Tillegg for {employees} ansatte:</span>
                <span>{employeePrice},-</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-2 border-t border-gray-300">
              <span>Totalt per måned:</span>
              <span>{totalPrice},-</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Hjelpefunksjon for å formatere pris
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(price).replace(/\s/g, '');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="text-2xl font-bold text-[#2C435F]">
              <Image src="/HMSNova-logo.svg" alt="HMS Nova" width={200} height={200} className="block dark:hidden"/>
              <Image src="/HMSNova-white.svg" alt="HMS Nova" width={200} height={200} className="hidden dark:block"/>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Opprett ny konto</CardTitle>
          <CardDescription className="text-center">
            Registrer din bedrift for å komme i gang
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Organisasjonsnummer"
                    value={form.getValues('orgNumber')}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      if (value.length <= 9) {
                        form.reset({...form.getValues(), orgNumber: value})
                        setIsCompanyValidated(false)
                      }
                    }}
                    required
                    maxLength={9}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={validateOrgNumber}
                    disabled={isValidating || form.getValues('orgNumber').length !== 9}
                    className="bg-[#2C435F] hover:bg-[#2C435F]/80"
                  >
                    {isValidating ? "Sjekker..." : "Valider"}
                  </Button>
                </div>
                {isCompanyValidated && (
                  <p className="text-sm text-[#2C435F]">✓ Bedrift validert</p>
                )}
              </div>

              {isCompanyValidated && companyData && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bedriftsnavn</label>
                    <Input value={form.getValues('companyName')} disabled />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Organisasjonsform</label>
                    <Input value={form.getValues('organizationType')} disabled />
                  </div>
                  {form.getValues('website') && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nettside</label>
                      <Input value={form.getValues('website')} disabled />
                    </div>
                  )}
                  {form.getValues('address') && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Adresse</label>
                      <Input 
                        value={`${form.getValues('address')?.street} ${form.getValues('address')?.streetNo || ''}, ${form.getValues('address')?.postalCode} ${form.getValues('address')?.city}`} 
                        disabled 
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Input
                  placeholder="Ditt navn"
                  value={form.getValues('name')}
                  onChange={(e) => form.reset({...form.getValues(), name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="E-post"
                  value={form.getValues('email')}
                  onChange={(e) => form.reset({...form.getValues(), email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Passord"
                  value={form.getValues('password')}
                  onChange={(e) => form.reset({...form.getValues(), password: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Bekreft passord"
                  value={form.getValues('confirmPassword')}
                  onChange={(e) => form.reset({...form.getValues(), confirmPassword: e.target.value})}
                  required
                />
              </div>

              <SubscriptionSection />

              <ContractModal onAccept={handleSubmit}>
                <Button 
                  type="button"
                  className="w-full bg-[#2C435F] hover:bg-[#2C435F]/80"
                  disabled={isLoading || !isCompanyValidated}
                >
                  {isLoading ? "Registrerer..." : "Registrer bedrift"}
                </Button>
              </ContractModal>
            </form>

            <div className="mt-4 text-center text-sm">
              Har du allerede en konto?{" "}
              <Link href="/login" className="text-[#2C435F] hover:underline">
                Logg inn her
              </Link>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Laster registrering...</div>}>
      <RegisterFormInner />
    </Suspense>
  )
} 