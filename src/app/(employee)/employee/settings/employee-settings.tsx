"use client"

import { useState } from "react"
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

const profileFormSchema = z.object({
  name: z.string().min(2, "Navn må være minst 2 tegn"),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z.string().min(8, "Telefonnummer må være minst 8 siffer"),
  address: z.object({
    street: z.string().min(2, "Gatenavn må være minst 2 tegn"),
    postalCode: z.string().min(4, "Postnummer må være 4 siffer"),
    city: z.string().min(2, "Poststed må være minst 2 tegn")
  })
})

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, "Passord må være minst 6 tegn"),
  newPassword: z.string().min(6, "Passord må være minst 6 tegn"),
  confirmPassword: z.string().min(6, "Passord må være minst 6 tegn")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passordene må være like",
  path: ["confirmPassword"],
})

export function EmployeeSettings() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)

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
      }
    }
  })

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema)
  })

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Sikkerhet</span>
            </TabsTrigger>
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

                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Lagre endringer
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

                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Oppdater passord
                  </Button>
                </form>
              </Form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-2">
        <div className="flex justify-around">
          <Link href="/employee/hms-handbook">
            <div className="flex flex-col items-center">
              <FileText className="w-6 h-6 text-gray-500" />
              <span className="text-xs text-gray-600 mt-1">HMS</span>
            </div>
          </Link>
          <Link href="/employee/sja">
            <div className="flex flex-col items-center">
              <FileText className="w-6 h-6 text-gray-500" />
              <span className="text-xs text-gray-600 mt-1">SJA</span>
            </div>
          </Link>
          <Link href="/employee/deviations/new">
            <div className="flex flex-col items-center">
              <AlertTriangle className="w-6 h-6 text-gray-500" />
              <span className="text-xs text-gray-600 mt-1">Avvik</span>
            </div>
          </Link>
          <Link href="/employee/stoffkartotek">
            <div className="flex flex-col items-center">
              <TestTube className="w-6 h-6 text-gray-500" />
              <span className="text-xs text-gray-600 mt-1">Stoffkartotek</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
} 