import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { Award, Edit, Plus, Settings, Trash, Download } from "lucide-react"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CompetenceTypeDialog } from "./competence-type-dialog"
import { getUserPermissions } from "@/lib/auth/permissions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ImportStandardTypes from './import-standard-types'

// Hjelpefunksjon for å gruppere typer etter kategori
function groupByCategory(types: any[]) {
  const grouped: Record<string, any[]> = {}
  types.forEach(type => {
    const category = type.category
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(type)
  })
  return grouped
}

export default async function CompetenceTypesPage({
  searchParams,
}: {
  searchParams?: { empty?: string }
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
  
  // Sjekk at brukeren har tillatelse til å administrere kompetansetyper
  const permissions = await getUserPermissions(session.user.id)
  const canManageCompetenceTypes = permissions.includes("ADMIN") || permissions.includes("HMS_RESPONSIBLE")
  
  if (!canManageCompetenceTypes) {
    redirect('/dashboard/competence')
  }
  
  // Hent alle kompetansetyper for bedriften
  const competenceTypes = await prisma.competenceType.findMany({
    where: {
      companyId: session.user.companyId
    },
    orderBy: [
      { category: 'asc' },
      { name: 'asc' }
    ]
  })
  
  // Del opp i aktive og inaktive
  const activeTypes = competenceTypes.filter(type => type.isActive)
  const inactiveTypes = competenceTypes.filter(type => !type.isActive)
  
  // Gruppér etter kategori
  const groupedActiveTypes = groupByCategory(activeTypes)
  const groupedInactiveTypes = groupByCategory(inactiveTypes)
  
  // Sjekk om vi ble sendt hit med empty=true parameteren
  const params = await searchParams
  const isEmpty = params?.empty === 'true'
  
  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold tracking-tight">Kompetansetyper</h2>
          </div>
          <p className="text-muted-foreground">
            Administrer kompetansetyper og sertifiseringskategorier
          </p>
        </div>
        <div className="flex gap-2">
          <ImportStandardTypes />
          <CompetenceTypeDialog />
        </div>
      </div>
      <Separator />
      
      {isEmpty && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex gap-3">
            <div className="text-yellow-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-yellow-800 mb-1">Ingen kompetansetyper funnet</h3>
              <p className="text-yellow-700">
                Du må opprette minst én kompetansetype før du kan registrere kompetanser for ansatte.
                Bruk "Legg til kompetansetype"-knappen øverst til høyre for å komme i gang eller importer standard kompetansetyper.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active" className="relative">
            Aktive
            {activeTypes.length > 0 && (
              <Badge className="ml-2 bg-primary text-xs">{activeTypes.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="inactive" className="relative">
            Inaktive
            {inactiveTypes.length > 0 && (
              <Badge className="ml-2 bg-muted-foreground text-xs">{inactiveTypes.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          {Object.keys(groupedActiveTypes).length === 0 ? (
            <div className="text-center py-12 border rounded-md bg-muted/10">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Ingen aktive kompetansetyper</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Du har ingen aktive kompetansetyper. Opprett en ny for å komme i gang med kompetansestyring.
              </p>
              <CompetenceTypeDialog>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Legg til kompetansetype
                </Button>
              </CompetenceTypeDialog>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedActiveTypes).map(([category, types]) => (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle>{category}</CardTitle>
                    <CardDescription>
                      {types.length} {types.length === 1 ? 'kompetansetype' : 'kompetansetyper'} i denne kategorien
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Navn</TableHead>
                          <TableHead>Beskrivelse</TableHead>
                          <TableHead>Gyldighet</TableHead>
                          <TableHead>Påminnelse</TableHead>
                          <TableHead className="text-right">Handlinger</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {types.map((type) => (
                          <TableRow key={type.id}>
                            <TableCell className="font-medium">{type.name}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {type.description || <span className="text-muted-foreground italic">Ingen beskrivelse</span>}
                            </TableCell>
                            <TableCell>
                              {type.validity ? `${type.validity} måneder` : 'Utløper ikke'}
                            </TableCell>
                            <TableCell>
                              {type.validity ? `${type.reminderMonths || 3} måneder før utløp` : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <CompetenceTypeDialog type={type}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </CompetenceTypeDialog>
                                
                                <form action={`/api/dashboard/competence/types/${type.id}/toggle-status`} method="POST">
                                  <input type="hidden" name="action" value="deactivate" />
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </form>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="pb-3 pt-5 px-6">
                    <CompetenceTypeDialog initialCategory={category}>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-3 w-3" />
                        Legg til i {category}
                      </Button>
                    </CompetenceTypeDialog>
                  </CardFooter>
                </Card>
              ))}
              
              <div className="flex justify-center mt-6">
                <CompetenceTypeDialog>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Legg til ny kompetansetype
                  </Button>
                </CompetenceTypeDialog>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="inactive" className="mt-6">
          {Object.keys(groupedInactiveTypes).length === 0 ? (
            <div className="text-center py-12 border rounded-md bg-muted/10">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Ingen inaktive kompetansetyper</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Du har ingen inaktive kompetansetyper. Kompetansetyper som er deaktivert vil vises her.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedInactiveTypes).map(([category, types]) => (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle>{category}</CardTitle>
                    <CardDescription>
                      {types.length} {types.length === 1 ? 'kompetansetype' : 'kompetansetyper'} i denne kategorien
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Navn</TableHead>
                          <TableHead>Beskrivelse</TableHead>
                          <TableHead>Gyldighet</TableHead>
                          <TableHead>Påminnelse</TableHead>
                          <TableHead className="text-right">Handlinger</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {types.map((type) => (
                          <TableRow key={type.id} className="opacity-60">
                            <TableCell className="font-medium">{type.name}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {type.description || <span className="text-muted-foreground italic">Ingen beskrivelse</span>}
                            </TableCell>
                            <TableCell>
                              {type.validity ? `${type.validity} måneder` : 'Utløper ikke'}
                            </TableCell>
                            <TableCell>
                              {type.validity ? `${type.reminderMonths || 3} måneder før utløp` : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <form action={`/api/dashboard/competence/types/${type.id}/toggle-status`} method="POST">
                                <input type="hidden" name="action" value="activate" />
                                <Button variant="outline" size="sm">
                                  Aktiver
                                </Button>
                              </form>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 