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
  driverLicenses: z.array(z.string()).default([])
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

export function ProfileForm({ user }: { user: any }) {
  const router = useRouter()
  console.log("User data from database:", {
    certifications: user?.certifications,
    machineCards: user?.certifications?.machineCards,
    driverLicenses: user?.certifications?.driverLicenses
  })

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: {
        street: user?.address?.street || "",
        postalCode: user?.address?.postalCode || "",
        city: user?.address?.city || "",
      },
      image: user?.image || "",
      machineCards: user?.certifications?.machineCards || [],
      driverLicenses: user?.certifications?.driverLicenses || []
    },
  })

  async function onSubmit(values: ProfileFormValues) {
    try {
      let imageUrl = values.image
      console.log("Starting submit with values:", values)

      if (values.image instanceof File) {
        console.log("Uploading file:", values.image)
        const formData = new FormData()
        formData.append('file', values.image)
        formData.append('companyId', user.companyId)
        formData.append('type', 'profile')

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        console.log("Upload response status:", uploadRes.status)
        if (!uploadRes.ok) {
          const errorText = await uploadRes.text()
          console.error("Upload error:", errorText)
          throw new Error('Kunne ikke laste opp bilde')
        }

        const data = await uploadRes.json()
        console.log("Upload response:", data)
        imageUrl = data.url
      }

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          image: imageUrl || null,
          address: {
            street: values.address.street || null,
            postalCode: values.address.postalCode || null,
            city: values.address.city || null
          },
          certifications: {
            machineCards: values.machineCards,
            driverLicenses: values.driverLicenses
          }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("Profile update error response:", error)
        throw new Error(error.message || "Kunne ikke oppdatere profil")
      }

      const data = await response.json()
      console.log("Profile updated successfully:", data)

      toast({
        title: "Profil oppdatert",
        description: "Din profilinformasjon har blitt oppdatert.",
      })

      router.refresh()
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Feil",
        description: error instanceof Error ? error.message : "Kunne ikke oppdatere profil. Prøv igjen senere.",
        variant: "destructive",
      })
    }
  }

  return (
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
                      onChange={(file) => field.onChange(file || '')}
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
                  <FormLabel>Telefonnummer</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678" {...field} />
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
                        <Input placeholder="Gatenavn 123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 grid-cols-2">
                  <FormField
                    control={form.control}
                    name="address.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postnummer</FormLabel>
                        <FormControl>
                          <Input placeholder="0000" {...field} />
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
                        <FormLabel>Poststed</FormLabel>
                        <FormControl>
                          <Input placeholder="Oslo" {...field} />
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
            <Button type="submit">Lagre endringer</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 