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
import { Loader2, User, Lock, Phone, MapPin, ArrowLeft, Settings, FileText, AlertTriangle, TestTube, ExternalLink } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { MultiSelect } from "@/components/ui/multi-select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert" 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    id: z.string().optional(),
    name: z.string().min(1, "Kompetansenavn er påkrevd"),
    description: z.string().optional(),
    expiryDate: z.string().optional(),
    certificateNumber: z.string().optional(),
    competenceTypeId: z.string().optional(),
    certificateUrl: z.string().optional(),
    certificateFile: z.any().optional(),
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
  const [competenceTypes, setCompetenceTypes] = useState<any[]>([])
  const [isLoadingCompetenceTypes, setIsLoadingCompetenceTypes] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File}>({})
  const [userCompetencies, setUserCompetencies] = useState<any[]>([])
  const [formalCompetencies, setFormalCompetencies] = useState<any[]>([])

  useEffect(() => {
    const checkCompetencyModule = async () => {
      try {
        const response = await fetch('/api/company/modules')
        if (response.ok) {
          const data = await response.json()
          const hasModule = data.modules.some(
            (module: any) => (module.key === 'COMPETENCY' || module.key === 'COMPETENCE') && module.isActive
          )
          setHasCompetencyModule(hasModule)
          
          if (hasModule) {
            // Hent kompetansetyper
            setIsLoadingCompetenceTypes(true)
            try {
              const companyId = session?.user?.companyId
              const typesResponse = await fetch(`/api/user/competence-types?companyId=${companyId}`)
              if (typesResponse.ok) {
                const typesData = await typesResponse.json()
                setCompetenceTypes(typesData)
              }
            } catch (error) {
              console.error('Kunne ikke hente kompetansetyper:', error)
            } finally {
              setIsLoadingCompetenceTypes(false)
            }
            
            // Hent brukerens kompetanser
            try {
              const competenciesResponse = await fetch('/api/user/competencies/me')
              if (competenciesResponse.ok) {
                const competenciesData = await competenciesResponse.json()
                setUserCompetencies(competenciesData.personalCompetencies || [])
                setFormalCompetencies(competenciesData.formalCompetencies || [])
              }
            } catch (error) {
              console.error('Kunne ikke hente kompetanser:', error)
            }
          }
        }
      } catch (error) {
        console.error('Kunne ikke sjekke kompetansemodul:', error)
      }
    }
    
    if (session?.user) {
      checkCompetencyModule()
    }
  }, [session])

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
      competencies: userCompetencies.map((comp) => ({
        id: comp.id,
        name: comp.name,
        description: comp.description || "",
        expiryDate: comp.expiryDate ? new Date(comp.expiryDate).toISOString().split('T')[0] : "",
        certificateNumber: comp.certificateNumber || "",
        competenceTypeId: "custom", // Standard er egendefinert for eksisterende
        certificateUrl: comp.certificateUrl || ""
      }))
    }
  })
  
  // Oppdater skjemaet når kompetanser lastes
  useEffect(() => {
    if (userCompetencies.length > 0) {
      profileForm.setValue('competencies', userCompetencies.map((comp) => ({
        id: comp.id,
        name: comp.name,
        description: comp.description || "",
        expiryDate: comp.expiryDate ? new Date(comp.expiryDate).toISOString().split('T')[0] : "",
        certificateNumber: comp.certificateNumber || "",
        competenceTypeId: "custom", // Standard er egendefinert for eksisterende
        certificateUrl: comp.certificateUrl || ""
      })))
    }
  }, [userCompetencies, profileForm])

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema)
  })

  const machineCardOptions = MACHINE_CARDS
  const driverLicenseOptions = DRIVER_LICENSES

  const onProfileSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    setIsLoading(true)
    try {
      // Last opp kompetansedokumenter
      const competenciesWithFiles = [...data.competencies];
      
      // Last opp sertifikatfiler
      for (let i = 0; i < competenciesWithFiles.length; i++) {
        const comp = competenciesWithFiles[i];
        const fileKey = `comp_${i}`; // Unik nøkkel for hver kompetanse
        
        if (uploadedFiles[fileKey]) {
          try {
            const file = uploadedFiles[fileKey];
            const uniqueFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const filePath = `companies/${session?.user?.companyId}/competence/${session?.user?.id}/${uniqueFileName}`;
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('path', filePath);
            formData.append('companyId', session?.user?.companyId || '');
            
            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            });
            
            if (!uploadResponse.ok) {
              throw new Error('Kunne ikke laste opp dokumentasjon');
            }
            
            const uploadData = await uploadResponse.json();
            
            // Oppdater kompetansen med dokument-URL
            competenciesWithFiles[i] = {
              ...comp,
              certificateUrl: uploadData.url
            };
            
            console.log(`Dokumentasjon lastet opp: ${uploadData.url}`);
          } catch (error) {
            console.error(`Feil ved opplasting av dokumentasjon for kompetanse ${i}:`, error);
            toast.error("Kunne ikke laste opp dokumentasjon for en eller flere kompetanser");
          }
        }
      }
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          certifications: {
            machineCards: data.certifications.machineCards,
            driverLicenses: data.certifications.driverLicenses
          }
        })
      })

      if (!response.ok) throw new Error('Kunne ikke oppdatere profil')
      
      // Lagre kompetanser hvis modulen er aktiv
      if (hasCompetencyModule && competenciesWithFiles.length > 0) {
        try {
          const competencyResponse = await fetch("/api/user/competencies", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: session?.user?.id,
              companyId: session?.user?.companyId,
              competencies: competenciesWithFiles
            }),
          });

          if (!competencyResponse.ok) {
            throw new Error('Kunne ikke lagre kompetanseinformasjon');
          }
        } catch (error) {
          console.error("Feil ved lagring av kompetanse:", error);
          toast.error("Kunne ikke lagre kompetanseinformasjon");
        }
      }
      
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
              <Card className="p-4 md:p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <h3 className="text-lg font-medium">Kompetansemodulen er aktiv</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Kompetanse du registrerer her vil bli sendt til godkjenning. En administrator må verifisere kompetansen før den blir synlig i kompetanseoversikten.
                  </p>
                </div>
                
                {/* Vis godkjente kompetanser hvis det finnes noen */}
                {formalCompetencies && formalCompetencies.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Mine godkjente kompetanser</h3>
                    <div className="divide-y border rounded-lg">
                      {formalCompetencies.map((comp: any) => (
                        <div key={comp.id} className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{comp.competenceType?.name || "Ukjent kompetanse"}</h4>
                              {comp.notes && <p className="text-sm text-muted-foreground">{comp.notes}</p>}
                            </div>
                            <div className="text-right">
                              <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                comp.verificationStatus === 'VERIFIED' 
                                  ? 'bg-green-100 text-green-800' 
                                  : comp.verificationStatus === 'REJECTED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {comp.verificationStatus === 'VERIFIED' 
                                  ? 'Godkjent' 
                                  : comp.verificationStatus === 'REJECTED'
                                  ? 'Avvist'
                                  : 'Venter godkjenning'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm flex-wrap">
                            {comp.achievedDate && (
                              <div>
                                <span className="text-muted-foreground">Oppnådd:</span>{' '}
                                {new Date(comp.achievedDate).toLocaleDateString('nb-NO')}
                              </div>
                            )}
                            {comp.expiryDate && (
                              <div className={`${
                                new Date(comp.expiryDate) < new Date() ? 'text-red-600 font-medium' : ''
                              }`}>
                                <span className="text-muted-foreground">Utløper:</span>{' '}
                                {new Date(comp.expiryDate).toLocaleDateString('nb-NO')}
                              </div>
                            )}
                            {comp.certificateUrl && (
                              <div>
                                <a 
                                  href={comp.certificateUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center text-blue-600 hover:underline"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  <span>Se dokumentasjon</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center border rounded-lg bg-muted/10">
                    <p className="text-sm text-muted-foreground">
                      Du har ingen godkjente kompetanser ennå. Registrer din kompetanse nedenfor, så vil den bli sendt til godkjenning.
                    </p>
                  </div>
                )}
                
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Registrer ny kompetanse</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentCompetencies = profileForm.getValues("competencies") || [];
                          profileForm.setValue("competencies", [
                            ...currentCompetencies,
                            { name: "", description: "", expiryDate: "", certificateNumber: "", competenceTypeId: "custom" }
                          ]);
                        }}
                      >
                        Legg til kompetanse
                      </Button>
                    </div>
                    
                    {profileForm.watch("competencies").length === 0 ? (
                      <div className="p-6 text-center border rounded-lg bg-muted/10">
                        <p className="text-sm text-muted-foreground">
                          Du har ikke registrert noen nye kompetanser. Klikk på "Legg til kompetanse" for å registrere din første kompetanse.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {profileForm.watch("competencies").map((_, index) => (
                          <div key={index} className="space-y-4 p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">Kompetanse {index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const currentCompetencies = profileForm.getValues("competencies");
                                  profileForm.setValue(
                                    "competencies",
                                    currentCompetencies.filter((_, i) => i !== index)
                                  );
                                }}
                              >
                                Fjern
                              </Button>
                            </div>

                            <div className="space-y-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                  control={profileForm.control}
                                  name={`competencies.${index}.competenceTypeId`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Velg kompetansetype</FormLabel>
                                      <Select 
                                        onValueChange={(value) => {
                                          field.onChange(value);
                                          
                                          // Hvis vi velger en eksisterende kompetansetype, sett inn navnet automatisk
                                          if (value !== "custom") {
                                            const selectedType = competenceTypes.find(type => type.id === value);
                                            if (selectedType) {
                                              profileForm.setValue(`competencies.${index}.name`, selectedType.name);
                                            }
                                          }
                                        }} 
                                        defaultValue={field.value || "custom"}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Velg en type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {isLoadingCompetenceTypes ? (
                                            <div className="p-2 flex items-center justify-center">
                                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                              Laster...
                                            </div>
                                          ) : (
                                            <>
                                              <SelectItem value="custom">Egendefinert</SelectItem>
                                              {competenceTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id}>
                                                  {type.name}
                                                </SelectItem>
                                              ))}
                                            </>
                                          )}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              
                                <FormField
                                  control={profileForm.control}
                                  name={`competencies.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Navn</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder="Kompetansenavn" 
                                          {...field} 
                                          disabled={profileForm.watch(`competencies.${index}.competenceTypeId`) !== "custom" && 
                                                   profileForm.watch(`competencies.${index}.competenceTypeId`) !== ""}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                  control={profileForm.control}
                                  name={`competencies.${index}.certificateNumber`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Sertifikatnummer</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Sertifikatnummer" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={profileForm.control}
                                  name={`competencies.${index}.expiryDate`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Utløpsdato</FormLabel>
                                      <FormControl>
                                        <Input type="date" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={profileForm.control}
                                  name={`competencies.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Beskrivelse</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Beskrivelse" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={profileForm.control}
                                  name={`competencies.${index}.certificateFile`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Last opp dokumentasjon</FormLabel>
                                      <FormControl>
                                        <div className="flex flex-col space-y-2">
                                          {/* Vis eksisterende dokument hvis det finnes */}
                                          {profileForm.getValues(`competencies.${index}.certificateUrl`) && (
                                            <div className="flex items-center p-2 border rounded-md bg-muted/20">
                                              <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                              <span className="text-sm flex-grow truncate">
                                                Dokumentasjon lastet opp
                                              </span>
                                              <a 
                                                href={profileForm.getValues(`competencies.${index}.certificateUrl`) || "#"} 
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-xs text-blue-600 hover:underline"
                                              >
                                                <ExternalLink className="h-3 w-3 mr-1" />
                                                Vis
                                              </a>
                                            </div>
                                          )}

                                          {/* File upload input */}
                                          <Input 
                                            type="file"
                                            accept="image/jpeg,image/png,application/pdf" 
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const fileKey = `comp_${index}`;
                                                setUploadedFiles(prev => ({
                                                  ...prev,
                                                  [fileKey]: file
                                                }));
                                                field.onChange(file);
                                              }
                                            }}
                                          />
                                          {uploadedFiles[`comp_${index}`] && (
                                            <div className="text-sm text-muted-foreground">
                                              {uploadedFiles[`comp_${index}`].name}
                                            </div>
                                          )}
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
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