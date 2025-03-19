import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Award, Calendar, FileQuestion, Info, LucideUpload, UserCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { notFound } from "next/navigation"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileUploadScript } from "./file-upload-script"

export default async function AddCompetencePage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }
  
  // Sjekk om kompetansemodulen er aktivert for bedriften
  const competenceModule = await prisma.module.findFirst({
    where: {
      companyId: session.user.companyId,
      key: "COMPETENCE",
      isActive: true
    }
  })

  if (!competenceModule) {
    redirect('/dashboard/competence')
  }
  
  // Hent bruker for å verifisere at den finnes og tilhører riktig bedrift
  const { id } = await params
  const user = await prisma.user.findFirst({
    where: {
      id: id,
      companyId: session.user.companyId
    }
  })
  
  if (!user) {
    notFound()
  }
  
  // Hent tilgjengelige kompetansetyper for bedriften
  const competenceTypes = await prisma.competenceType.findMany({
    where: {
      companyId: session.user.companyId,
      isActive: true
    },
    orderBy: [
      { category: 'asc' },
      { name: 'asc' }
    ]
  })
  
  // Grupper kompetansetyper etter kategori for dropdown-menyen
  const groupedCompetenceTypes: Record<string, typeof competenceTypes> = {}
  competenceTypes.forEach(type => {
    const category = type.category
    if (!groupedCompetenceTypes[category]) {
      groupedCompetenceTypes[category] = []
    }
    groupedCompetenceTypes[category].push(type)
  })
  
  // Hvis det ikke finnes noen kompetansetyper, send til konfigurasjonssiden
  if (competenceTypes.length === 0) {
    redirect('/dashboard/competence/types?empty=true')
  }
  
  // Standard utløpsdato hvis kompetansetypen har en angitt gyldighetsperiode
  const today = new Date()
  const formattedToday = today.toISOString().split('T')[0]
  
  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold tracking-tight">Legg til kompetanse</h2>
          </div>
          <p className="text-muted-foreground">
            Registrer ny kompetanse eller sertifisering for {user.name}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/competence/employees/${user.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake til ansattoversikt
          </Link>
        </Button>
      </div>
      <Separator />
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Ansattinformasjon */}
        <Card className="md:w-1/3">
          <CardHeader>
            <CardTitle className="text-xl">Ansattinformasjon</CardTitle>
            <CardDescription>Informasjon om ansatt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="text-lg">{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{user.name}</p>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800">Tips for registrering</h3>
                  <ul className="text-sm text-blue-700 space-y-2 mt-2 list-disc pl-4">
                    <li>Last opp et skannet dokument eller bilde av kompetansebeviset</li>
                    <li>Oppnådd dato skal være datoen sertifiseringen ble oppnådd</li>
                    <li>Sett utløpsdato hvis sertifiseringen har begrenset gyldighet</li>
                    <li>Kompetanser må verifiseres av HMS-ansvarlig før de blir gyldige</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Kompetanseregistreringsskjema */}
        <Card className="md:w-2/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Registrer kompetanse
            </CardTitle>
            <CardDescription>
              Fyll ut skjemaet for å registrere ny kompetanse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={`/api/dashboard/competence/add`} method="POST" className="space-y-6" encType="multipart/form-data" id="competence-form">
              <input type="hidden" name="userId" value={user.id} />
              
              <div className="space-y-4">
                <FormItem>
                  <FormLabel>Kompetansetype <span className="text-red-500">*</span></FormLabel>
                  <Select name="competenceTypeId" required>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg kompetansetype" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(groupedCompetenceTypes).map(([category, types]) => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-gray-50">
                            {category}
                          </div>
                          {types.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Velg type kompetanse eller sertifisering
                  </FormDescription>
                </FormItem>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Oppnådd dato <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-muted-foreground absolute ml-3" />
                        <Input
                          type="date"
                          name="achievedDate"
                          className="pl-10"
                          defaultValue={formattedToday}
                          required
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Dato for når kompetansen ble oppnådd
                    </FormDescription>
                  </FormItem>
                  
                  <FormItem>
                    <FormLabel>Utløpsdato</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-muted-foreground absolute ml-3" />
                        <Input
                          type="date"
                          name="expiryDate"
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Sertifiseringens utløpsdato (om relevant)
                    </FormDescription>
                  </FormItem>
                </div>
                
                <FormItem>
                  <FormLabel>Last opp kompetansebevis <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/40 transition cursor-pointer">
                      <LucideUpload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <label htmlFor="certificateFile" className="block cursor-pointer">
                        <span className="text-sm text-muted-foreground">
                          Klikk for å laste opp, eller dra og slipp
                        </span>
                        <Input
                          id="certificateFile"
                          name="certificateFile"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          required
                          aria-describedby="file-upload-description"
                        />
                      </label>
                      <div id="selected-file" className="text-xs mt-2 font-medium text-blue-600 hidden"></div>
                      <div id="upload-status" className="text-xs mt-2 font-medium text-green-600 hidden"></div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Støttede formater: PDF, JPG, PNG (maks 5MB)
                      </p>
                    </div>
                  </FormControl>
                  <FormDescription id="file-upload-description">
                    Last opp et skannet dokument eller bilde av kompetansebeviset
                  </FormDescription>
                </FormItem>
                
                <FormItem>
                  <FormLabel>Beskrivelse</FormLabel>
                  <FormControl>
                    <Textarea
                      name="description"
                      placeholder="Skriv inn ytterligere detaljer om kompetansen..."
                      className="h-24"
                    />
                  </FormControl>
                  <FormDescription>
                    Valgfri beskrivelse eller tilleggsinformasjon
                  </FormDescription>
                </FormItem>
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button variant="outline" type="button" asChild>
                  <Link href={`/dashboard/competence/employees/${user.id}`}>
                    Avbryt
                  </Link>
                </Button>
                <Button type="submit" id="submit-button">
                  Registrer kompetanse
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <FileUploadScript />
    </div>
  )
} 