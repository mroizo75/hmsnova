import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Award, Calendar, Info, LucideUpload, PlusCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
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
import FileUploader from "./file-uploader"

export default async function AddCompetencePage({
  searchParams,
}: {
  searchParams?: { type?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }
  
  // Sjekk om kompetansemodulen er aktivert for bedriften (sjekk både COMPETENCE og COMPETENCY)
  const competenceModule = await prisma.module.findFirst({
    where: {
      companyId: session.user.companyId,
      OR: [
        { key: "COMPETENCE", isActive: true },
        { key: "COMPETENCY", isActive: true }
      ]
    }
  })

  if (!competenceModule) {
    redirect('/employee')
  }
  
  // Hent alle kompetansetyper for bedriften
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
  
  // Hvis det ikke finnes noen kompetansetyper, vis en melding med mulighet for å opprette standardtyper
  if (competenceTypes.length === 0) {
    return (
      <div className="space-y-6 p-4 pb-20 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-muted-foreground" />
              <h2 className="text-xl font-bold tracking-tight">Legg til kompetanse</h2>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/employee/competence">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tilbake
            </Link>
          </Button>
        </div>
        <Separator />
        
        <Card>
          <CardHeader>
            <CardTitle>Ingen kompetansetyper tilgjengelig</CardTitle>
            <CardDescription>
              Din bedrift har ikke opprettet noen kompetansetyper ennå.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              For å komme i gang med kompetanseregistrering, kan du opprette standard 
              kompetansetyper for din bedrift. Dette vil gi deg et utgangspunkt som du 
              senere kan tilpasse etter behov.
            </p>
            
            <form action="/api/dashboard/competence/types/seed" method="POST">
              <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Opprett standard kompetansetyper
              </Button>
            </form>
            
            <p className="text-sm text-muted-foreground mt-4">
              Eller kontakt din administrator for å få opprettet kompetansetyper.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Sjekk om det finnes en forhåndsvalgt kompetansetype
  const params = await searchParams
  const selectedTypeId = params?.type || ""
  
  // Standard utløpsdato hvis kompetansetypen har en angitt gyldighetsperiode
  const today = new Date()
  const formattedToday = today.toISOString().split('T')[0]
  
  return (
    <div className="space-y-6 p-4 pb-24 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-xl font-bold tracking-tight">Legg til kompetanse</h2>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/employee/competence">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake
          </Link>
        </Button>
      </div>
      <Separator />
      
      {/* Registreringsskjema - optimalisert for mobil */}
      <Card>
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
          <form action="/api/employee/competence/add?redirect=/employee/competence" method="POST" className="space-y-6" encType="multipart/form-data">
            <div className="space-y-4">
              <FormItem>
                <FormLabel>Kompetansetype <span className="text-red-500">*</span></FormLabel>
                <Select name="competenceTypeId" defaultValue={selectedTypeId} required>
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
              
              <div className="space-y-4">
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
                    La denne være tom hvis kompetansen ikke utløper
                  </FormDescription>
                </FormItem>
              </div>
              
              <FormItem>
                <FormLabel>Sertifikatnummer</FormLabel>
                <FormControl>
                  <Input name="certificateNumber" placeholder="F.eks. SN1234567" />
                </FormControl>
              </FormItem>
              
              <FormItem>
                <FormLabel>Kursholder / Utdanningsinstitusjon</FormLabel>
                <FormControl>
                  <Input name="issuer" placeholder="F.eks. NTNU, Kiwa eller Røde Kors" />
                </FormControl>
              </FormItem>
              
              <FormItem>
                <FormLabel>Notater</FormLabel>
                <FormControl>
                  <Textarea 
                    name="notes" 
                    placeholder="Legg til tilleggsinformasjon om kompetansen her" 
                    className="min-h-[100px]"
                  />
                </FormControl>
              </FormItem>
              
              <FormItem>
                <FormLabel>Last opp dokumentasjon</FormLabel>
                <FileUploader />
              </FormItem>
            </div>
            
            <Button type="submit" className="w-full">
              Lagre kompetanse
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 