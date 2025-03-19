import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Award, Calendar, Upload } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default async function UploadCompetencePage() {
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
    redirect('/employee/competence')
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

  // Grupper kompetansetyper etter kategori
  const groupedTypes: Record<string, typeof competenceTypes> = {}
  competenceTypes.forEach(type => {
    if (!groupedTypes[type.category]) {
      groupedTypes[type.category] = []
    }
    groupedTypes[type.category].push(type)
  })

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold tracking-tight">Last opp kompetansebevis</h2>
          </div>
          <p className="text-muted-foreground">
            Registrer nytt kompetansebevis eller sertifisering
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/employee/competence">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake til oversikt
          </Link>
        </Button>
      </div>
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Nytt kompetansebevis</CardTitle>
          <CardDescription>
            Fyll ut informasjon om kompetansebeviset og last opp dokumentasjon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/employee/competence/upload" method="POST" encType="multipart/form-data" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="competenceTypeId">Kompetansetype *</Label>
                <Select name="competenceTypeId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg kompetansetype" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(groupedTypes).map(([category, types]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                          {category}
                        </div>
                        {types.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                            {type.subcategory && ` (${type.subcategory})`}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="achievedDate">Oppnådd dato *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="achievedDate" 
                      name="achievedDate" 
                      type="date" 
                      required 
                      className="pl-10" 
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="expiryDate">Utløpsdato (valgfri)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="expiryDate" 
                      name="expiryDate" 
                      type="date" 
                      className="pl-10" 
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="certificate">Last opp dokumentasjon *</Label>
                <Input 
                  id="certificate" 
                  name="certificate" 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  required 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Godkjente filformater: PDF, JPG, PNG. Maks størrelse: 5MB
                </p>
              </div>
              
              <div>
                <Label htmlFor="notes">Notater (valgfri)</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  placeholder="Legg til eventuelle notater om kompetansebeviset" 
                  className="resize-none" 
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button asChild variant="outline">
                <Link href="/employee/competence">Avbryt</Link>
              </Button>
              <Button type="submit">
                <Award className="mr-2 h-4 w-4" />
                Last opp kompetansebevis
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 