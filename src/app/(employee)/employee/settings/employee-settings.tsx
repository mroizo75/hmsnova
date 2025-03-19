"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2, User, Lock, Phone, MapPin, ArrowLeft, Settings, FileText, AlertTriangle, TestTube } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { MultiSelect } from "@/components/ui/multi-select"

const profileFormSchema = z.object({
  name: z.string().min(2, "Navn må være minst 2 tegn"),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z.string().min(8, "Telefonnummer må være minst 8 siffer"),
  address: z.object({
    street: z.string().min(2, "Gatenavn må være minst 2 tegn"),
    postalCode: z.string().min(4, "Postnummer må være 4 siffer"),
    city: z.string().min(2, "Poststed må være minst 2 tegn")
  }),
  certifications: z.object({
    machineCards: z.array(z.string()),
    driverLicenses: z.array(z.string())
  }),
  competencies: z.array(z.object({
    name: z.string().min(1, "Kompetansenavn er påkrevd"),
    description: z.string().optional(),
    expiryDate: z.string().optional(),
    certificateNumber: z.string().optional(),
  })).default([])
})

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, "Passord må være minst 6 tegn"),
  newPassword: z.string().min(6, "Passord må være minst 6 tegn"),
  confirmPassword: z.string().min(6, "Passord må være minst 6 tegn")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passordene må være like",
  path: ["confirmPassword"],
})

interface Option {
  value: string
  label: string
}

const MACHINE_CARDS: Option[] = [
  { value: "T1", label: "T1 - Masseforflytningsmaskiner" },
  { value: "T2", label: "T2 - Lastetruck" },
  { value: "T3", label: "T3 - Teleskoptruck" },
  { value: "T4", label: "T4 - Personløfter" },
  { value: "T5", label: "T5 - Bro- og traverskran" },
  { value: "T6", label: "T6 - Tårnkran" },
  { value: "T7", label: "T7 - Portalkran" },
  { value: "T8", label: "T8 - Mobilkran" }
]

const DRIVER_LICENSES: Option[] = [
  { value: "AM", label: "AM - Moped" },
  { value: "A1", label: "A1 - Lett motorsykkel" },
  { value: "A2", label: "A2 - Mellomtung motorsykkel" },
  { value: "A", label: "A - Tung motorsykkel" },
  { value: "B", label: "B - Personbil" },
  { value: "BE", label: "BE - Personbil med tilhenger" },
  { value: "C1", label: "C1 - Lett lastebil" },
  { value: "C1E", label: "C1E - Lett lastebil med tilhenger" },
  { value: "C", label: "C - Lastebil" },
  { value: "CE", label: "CE - Lastebil med tilhenger" },
  { value: "D1", label: "D1 - Minibuss" },
  { value: "D1E", label: "D1E - Minibuss med tilhenger" },
  { value: "D", label: "D - Buss" },
  { value: "DE", label: "DE - Buss med tilhenger" }
]

export function EmployeeSettings() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [hasCompetencyModule, setHasCompetencyModule] = useState(false)

  useEffect(() => {
    const checkCompetencyModule = async () => {
      try {
        const response = await fetch('/api/company/modules')
        if (response.ok) {
          const data = await response.json()
          setHasCompetencyModule(data.modules.some((module: any) => module.key === 'COMPETENCY' && module.isActive))
        }
      } catch (error) {
        console.error('Kunne ikke sjekke kompetansemodul:', error)
      }
    }
    checkCompetencyModule()
  }, [])

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: session?.user?.phone || "",
      address: session?.user?.address || { 
        street: "", 
        postalCode: "", 
        city: "" 
      },
      certifications: session?.user?.certifications || {
        machineCards: [],
        driverLicenses: []
      },
      competencies: session?.user?.competencies || []
    }
  })

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema)
  })

  const machineCardOptions = MACHINE_CARDS
  const driverLicenseOptions = DRIVER_LICENSES

  const onProfileSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Kunne ikke oppdatere profil')
      
      await update({ ...session, user: { ...session?.user, ...data } })
      toast.success('Profil oppdatert')
    } catch (error) {
      toast.error('Kunne ikke oppdatere profil')
    } finally {
      setIsLoading(false)
    }
  }

  const onPasswordSubmit = async (data: z.infer<typeof passwordFormSchema>) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Kunne ikke oppdatere passord')
      
      toast.success('Passord oppdatert')
      passwordForm.reset()
    } catch (error) {
      toast.error('Kunne ikke oppdatere passord')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/employee-dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Innstillinger</h1>
            <p className="text-sm text-muted-foreground">
              Administrer din profil og sikkerhet
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Sikkerhet</span>
            </TabsTrigger>
            {hasCompetencyModule && (
              <TabsTrigger value="competency" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Kompetanse</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-4 md:p-6">
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Navn</FormLabel>
                        <FormControl>
                          <Input placeholder="Ditt navn" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-post</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="din@epost.no" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <Input type="tel" placeholder="12345678" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <FormLabel>Adresse</FormLabel>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="address.street"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Gateadresse" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={profileForm.control}
                          name="address.postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Postnr" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="address.city"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Poststed" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <FormLabel>Sertifiseringer</FormLabel>
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="certifications.machineCards"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maskinførerkort</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={machineCardOptions}
                              selected={field.value}
                              onChange={field.onChange}
                              placeholder="Velg maskinførerkort..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="certifications.driverLicenses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Førerkort</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={driverLicenseOptions}
                              selected={field.value}
                              onChange={field.onChange}
                              placeholder="Velg førerkort..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Lagrer...
                      </>
                    ) : (
                      "Lagre endringer"
                    )}
                  </Button>
                </form>
              </Form>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="p-4 md:p-6">
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nåværende passord</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nytt passord</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bekreft nytt passord</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Lagrer...
                      </>
                    ) : (
                      "Oppdater passord"
                    )}
                  </Button>
                </form>
              </Form>
            </Card>
          </TabsContent>

          {hasCompetencyModule && (
            <TabsContent value="competency">
              <Card className="p-4 md:p-6">
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="competencies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dine kompetanser</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              {field.value.map((competency, index) => (
                                <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                                  <div className="flex-1 space-y-4">
                                    <Input
                                      placeholder="Kompetansenavn"
                                      value={competency.name}
                                      onChange={(e) => {
                                        const newCompetencies = [...field.value];
                                        newCompetencies[index] = { ...competency, name: e.target.value };
                                        field.onChange(newCompetencies);
                                      }}
                                    />
                                    <Input
                                      placeholder="Beskrivelse (valgfritt)"
                                      value={competency.description || ""}
                                      onChange={(e) => {
                                        const newCompetencies = [...field.value];
                                        newCompetencies[index] = { ...competency, description: e.target.value };
                                        field.onChange(newCompetencies);
                                      }}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                      <Input
                                        type="date"
                                        placeholder="Utløpsdato (valgfritt)"
                                        value={competency.expiryDate || ""}
                                        onChange={(e) => {
                                          const newCompetencies = [...field.value];
                                          newCompetencies[index] = { ...competency, expiryDate: e.target.value };
                                          field.onChange(newCompetencies);
                                        }}
                                      />
                                      <Input
                                        placeholder="Sertifikatnummer (valgfritt)"
                                        value={competency.certificateNumber || ""}
                                        onChange={(e) => {
                                          const newCompetencies = [...field.value];
                                          newCompetencies[index] = { ...competency, certificateNumber: e.target.value };
                                          field.onChange(newCompetencies);
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      const newCompetencies = field.value.filter((_, i) => i !== index);
                                      field.onChange(newCompetencies);
                                    }}
                                  >
                                    Fjern
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  field.onChange([...field.value, { name: "", description: "", expiryDate: "", certificateNumber: "" }]);
                                }}
                              >
                                Legg til kompetanse
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Lagrer...
                        </>
                      ) : (
                        "Lagre kompetanse"
                      )}
                    </Button>
                  </form>
                </Form>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

    </div>
  )
} 