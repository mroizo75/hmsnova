"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ImageUpload } from "@/components/ui/image-upload"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { MultiSelect } from "@/components/ui/multi-select"
import { useState, useEffect, useRef } from "react"
import { Loader2, AlertCircle, Info, FileText, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Navn må være minst 2 tegn.",
  }),
  email: z.string().email({
    message: "Ugyldig e-postadresse.",
  }),
  phone: z.string().regex(/^(\+?47)?[49]\d{7}$/, {
    message: "Ugyldig telefonnummer. Bruk norsk format (8 siffer).",
  }).optional().or(z.literal('')),
  address: z.object({
    street: z.string().min(2, "Gatenavn må være minst 2 tegn.").optional().or(z.literal('')),
    postalCode: z.string().regex(/^\d{4}$/, "Postnummer må være 4 siffer").optional().or(z.literal('')),
    city: z.string().min(2, "Byen må være minst 2 tegn.").optional().or(z.literal('')),
  }),
  image: z.union([z.string(), z.instanceof(File)]).optional(),
  machineCards: z.array(z.string()).default([]),
  driverLicenses: z.array(z.string()).default([]),
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

type ProfileFormValues = z.infer<typeof profileFormSchema>

// Predefinerte valg
const MACHINE_CARDS = [
  { value: "M1", label: "M1 - Doser" },
  { value: "M2", label: "M2 - Gravemaskin" },
  { value: "M3", label: "M3 - Veihøvel" },
  { value: "M4", label: "M4 - Hjullaster" },
  { value: "M5", label: "M5 - Gravelaster" },
  { value: "M6", label: "M6 - Dumper" },
  { value: "G4", label: "G4 - Traverskran" },
  { value: "G8", label: "G8 - Lastebilkran" },
  { value: "G11", label: "G11 - Løfteredskap" },
  { value: "T1", label: "T1 - Palletruck" },
  { value: "T2", label: "T2 - Støttebeinstruck" },
  { value: "T4", label: "T4 - Motvekstruck" },
]

const DRIVER_LICENSES = [
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
]

interface ProfileFormProps {
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    image: string | null
    address: any
    certifications: any
    competencies: any
    formalCompetencies: any
    companyId: string
    hasCompetencyModule: boolean
    competenceTypes?: any[]
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File}>({})
  const [equipment, setEquipment] = useState<any[]>([])
  const [competenceTypes, setCompetenceTypes] = useState<any[]>(user.competenceTypes || [])
  const [isLoadingCompetenceTypes, setIsLoadingCompetenceTypes] = useState(false)

  console.log("Full user object:", user)

  if (!user.companyId) {
    throw new Error("CompanyId er påkrevd")
  }

  console.log("User data from database:", {
    certifications: user.certifications,
    machineCards: user.certifications?.machineCards,
    driverLicenses: user.certifications?.driverLicenses
  })

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: {
        street: user.address?.street || "",
        postalCode: user.address?.postalCode || "",
        city: user.address?.city || "",
      },
      image: user.image || "",
      machineCards: user.certifications?.machineCards || [],
      driverLicenses: user.certifications?.driverLicenses || [],
      competencies: user.competencies ? user.competencies.map((comp: any) => ({
        id: comp.id,
        name: comp.name,
        description: comp.description || "",
        expiryDate: comp.expiryDate ? new Date(comp.expiryDate).toISOString().split('T')[0] : "",
        certificateNumber: comp.certificateNumber || "",
        competenceTypeId: "custom", // Standard er egendefinert for eksisterende
        certificateUrl: comp.certificateUrl || ""
      })) : []
    },
  })

  const onSubmit = async (data: ProfileFormValues) => {
    console.log("Sending profile data:", data);
    setIsSubmitting(true)
    try {
      let imageUrl = data.image

      if (selectedImage) {
        const formData = new FormData()
        formData.append('file', selectedImage)
        formData.append('companyId', user.companyId)
        formData.append('type', 'profile')

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!uploadRes.ok) {
          throw new Error('Kunne ikke laste opp bilde')
        }

        const data = await uploadRes.json()
        imageUrl = data.url // Her får vi URL-en fra Google Storage

        // Oppdater form state med den nye bilde-URL-en
        form.setValue('image', imageUrl)
      }

      // Behandle opplasting av kompetansedokumenter før vi sender skjemaet
      const competenciesWithFiles = [...data.competencies];

      // Last opp sertifikatfiler
      for (let i = 0; i < competenciesWithFiles.length; i++) {
        const comp = competenciesWithFiles[i];
        const fileKey = `comp_${i}`; // Unik nøkkel for hver kompetanse
        
        if (uploadedFiles[fileKey]) {
          try {
            const file = uploadedFiles[fileKey];
            const uniqueFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const filePath = `companies/${user.companyId}/competence/${user.id}/${uniqueFileName}`;
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('path', filePath);
            formData.append('companyId', user.companyId);
            
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
            toast({
              title: "Advarsel",
              description: "Kunne ikke laste opp dokumentasjon for en eller flere kompetanser",
              variant: "destructive",
            });
          }
        }
      }
      
      // Lagre brukerinformasjon og sertifiseringer
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          certifications: {
            machineCards: data.machineCards,
            driverLicenses: data.driverLicenses
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Kunne ikke oppdatere profil')
      }

      // Hvis kompetansemodulen er aktiv, lagre kompetanseinformasjon med opplastede filer
      if (user.hasCompetencyModule && competenciesWithFiles.length > 0) {
        console.log("Lagrer kompetansedata:", competenciesWithFiles);
        
        try {
          const competencyResponse = await fetch("/api/user/competencies", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              companyId: user.companyId,
              competencies: competenciesWithFiles
            }),
          });

          if (!competencyResponse.ok) {
            const error = await competencyResponse.json();
            console.error("Kompetansefeil:", error);
            throw new Error('Kunne ikke lagre kompetanseinformasjon');
          }
        } catch (error) {
          console.error("Feil ved lagring av kompetanse:", error);
          toast({
            title: "Feil ved lagring av kompetanse",
            description: error instanceof Error ? error.message : "Noe gikk galt ved lagring av kompetanse",
            variant: "destructive",
          });
          // Fortsett med resten av skjemainnsendingen selv om kompetanselagringen feilet
        }
      }

      toast({
        title: "Profil oppdatert",
        description: "Profilinformasjonen din har blitt oppdatert.",
      })

      // Tving en refresh for å vise det nye bildet
      router.refresh()
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Feil",
        description: error instanceof Error ? error.message : "Kunne ikke oppdatere profil",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profilinformasjon</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profilbilde</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={typeof field.value === 'string' ? field.value : undefined}
                        onChange={(file) => {
                          setSelectedImage(file || null)
                          field.onChange(file || '')
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
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
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-post</FormLabel>
                      <FormControl>
                        <Input placeholder="din.epost@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input placeholder="+47 123 45 678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Adresse</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gateadresse</FormLabel>
                        <FormControl>
                          <Input placeholder="Gateadresse" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="address.postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postnummer</FormLabel>
                          <FormControl>
                            <Input placeholder="1234" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>By</FormLabel>
                          <FormControl>
                            <Input placeholder="By" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Sertifiseringer</h3>
                  <div className="grid gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="machineCards"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maskinførerkort</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={MACHINE_CARDS}
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
                      control={form.control}
                      name="driverLicenses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Førerkort</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={DRIVER_LICENSES}
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
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Lagre endringer"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {user.hasCompetencyModule && (
        <Card>
          <CardHeader>
            <CardTitle>Kompetanse</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Kompetansemodulen er aktiv</AlertTitle>
              <AlertDescription>
                Kompetanse du registrerer her vil bli sendt til godkjenning. En administrator må verifisere kompetansen før den blir synlig i kompetanseoversikten.
              </AlertDescription>
            </Alert>
            
            {user.formalCompetencies && user.formalCompetencies.length > 0 ? (
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Mine godkjente kompetanser</h3>
                <div className="border rounded-lg divide-y">
                  {user.formalCompetencies.map((comp: any) => (
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
                      <div className="flex items-center gap-4 text-sm">
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
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Mine godkjente kompetanser</h3>
                <div className="p-8 text-center border rounded-lg bg-muted/10">
                  <p className="text-muted-foreground">
                    Du har ingen godkjente kompetanser ennå. Registrer din kompetanse nedenfor, så vil den bli sendt til godkjenning.
                  </p>
                </div>
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Registrer ny kompetanse</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentCompetencies = form.getValues("competencies")
                        form.setValue("competencies", [
                          ...currentCompetencies,
                          { name: "", description: "", expiryDate: "", certificateNumber: "", competenceTypeId: "custom" }
                        ])
                      }}
                    >
                      Legg til kompetanse
                    </Button>
                  </div>

                  {form.watch("competencies").length === 0 ? (
                    <div className="p-8 text-center border rounded-lg bg-muted/10">
                      <p className="text-muted-foreground">
                        Du har ikke registrert noen nye kompetanser. Klikk på "Legg til kompetanse" for å registrere din første kompetanse.
                      </p>
                    </div>
                  ) : (
                    form.watch("competencies").map((_, index) => (
                      <div key={index} className="space-y-4 p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Kompetanse {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const currentCompetencies = form.getValues("competencies")
                              form.setValue(
                                "competencies",
                                currentCompetencies.filter((_, i) => i !== index)
                              )
                            }}
                          >
                            Fjern
                          </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 mb-4">
                          <FormField
                            control={form.control}
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
                                        form.setValue(`competencies.${index}.name`, selectedType.name);
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
                            control={form.control}
                            name={`competencies.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Navn</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Kompetansenavn" 
                                    {...field} 
                                    disabled={form.watch(`competencies.${index}.competenceTypeId`) !== "custom" && 
                                             form.watch(`competencies.${index}.competenceTypeId`) !== ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
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
                            control={form.control}
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
                            control={form.control}
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
                            control={form.control}
                            name={`competencies.${index}.certificateFile`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last opp dokumentasjon</FormLabel>
                                <FormControl>
                                  <div className="flex flex-col space-y-2">
                                    {/* Vis eksisterende dokument hvis det finnes */}
                                    {form.getValues(`competencies.${index}.certificateUrl`) && (
                                      <div className="flex items-center p-2 border rounded-md bg-muted/20">
                                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                        <span className="text-sm flex-grow truncate">
                                          Dokumentasjon lastet opp
                                        </span>
                                        <a 
                                          href={form.getValues(`competencies.${index}.certificateUrl`) || "#"} 
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
                                      className="flex-1"
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
                    ))
                  )}
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lagre kompetanse
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 