'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { validateCompany, type ParsedCompanyData } from "@/lib/services/brreg-service"
import Link from "next/link"
import { useState, useCallback } from "react"
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
  employeeCount: number;
  storageSize: string;
  includeVernerunde: string;
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
  subscriptionPlan: z.enum(["STANDARD", "STANDARD_PLUS", "PREMIUM"]),
  employeeCount: z.string().min(1, "Antall ansatte må være minst 1"),
  storageSize: z.enum(["1GB", "5GB", "20GB", "100GB"]),
  includeVernerunde: z.enum(["no", "yes"]),
})

type EmployeeRange = "1-5" | "5-10" | "10-30"
type StorageSize = "1GB" | "5GB" | "20GB" | "100GB"

const basePrices = {
  STANDARD: { monthly: 699, yearly: 8388 },
  STANDARD_PLUS: { monthly: 1699, yearly: 20388 },
  PREMIUM: { monthly: 2290, yearly: 27480 }
}

const storagePricing: Record<StorageSize, number> = {
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

export default function RegisterPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subscriptionPlan: "STANDARD",
      employeeCount: "1-5",
      storageSize: "5GB",
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
      },
      includeVernerunde: "no",
    }
  })
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
        storageSize: form.getValues('storageSize'),
        includeVernerunde: form.getValues('includeVernerunde'),
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
    const storage = form.watch("storageSize")
    const vernerunde = form.watch("includeVernerunde")

    const basePrice = basePrices[plan as keyof typeof basePrices].monthly
    const employeePrice = employeePricing[employees as EmployeeRange] || 0
    const storagePrice = storagePricing[storage] || 0
    const vernerundePrice = vernerunde === "yes" ? 416 : 0
    const monthlyPrice = basePrice + employeePrice + storagePrice + vernerundePrice

    return (
      <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
        <FormField
          control={form.control}
          name="subscriptionPlan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Velg pakke</FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value)
                if (value === "PREMIUM") {
                  form.setValue("includeVernerunde", "no")
                }
              }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Velg pakke" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard ({basePrices.STANDARD.monthly},-)</SelectItem>
                  <SelectItem value="STANDARD_PLUS">Standard+ ({basePrices.STANDARD_PLUS.monthly},-)</SelectItem>
                  <SelectItem value="PREMIUM">Premium (inkl. vernerunde) ({basePrices.PREMIUM.monthly},-)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {(plan === "STANDARD" || plan === "STANDARD_PLUS") && (
          <FormField
            control={form.control}
            name="includeVernerunde"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vernerunde-modul (+416 kr/mnd)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Velg alternativ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="no">Nei</SelectItem>
                    <SelectItem value="yes">Ja (+5000 kr/år)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Inkluderer én årlig vernerunde. Reise og kost kommer i tillegg.
                </p>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="employeeCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Antall ansatte</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Velg antall" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1-5">1-5 ansatte</SelectItem>
                  <SelectItem value="5-10">5-10 ansatte (+299,- /mnd)</SelectItem>
                  <SelectItem value="10-30">10-30 ansatte (+599,- /mnd)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="storageSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lagringskapasitet</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Velg lagring" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1GB">1GB (inkludert)</SelectItem>
                  <SelectItem value="5GB">5GB (+199,- /mnd)</SelectItem>
                  <SelectItem value="20GB">20GB (+399,- /mnd)</SelectItem>
                  <SelectItem value="100GB">100GB (+699,- /mnd)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="text-center pt-4">
          <p className="text-2xl font-bold text-gray-900">
            {monthlyPrice},-
            <span className="text-base font-normal"> per måned</span>
          </p>
          <p className="text-sm text-gray-600">
            {monthlyPrice * 12},- per år
          </p>
        </div>
      </div>
    )
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