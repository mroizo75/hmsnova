"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Company } from "./columns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils/date"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface Module {
  id: string
  key: string
  label: string
  description?: string | null
  isActive: boolean
  isDefault: boolean
}

interface CompanyDetailsDialogProps {
  company: Company | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompanyDetailsDialog({
  company,
  open,
  onOpenChange,
}: CompanyDetailsDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false)
  const [activeModules, setActiveModules] = useState<string[]>([])
  const [isLoadingModules, setIsLoadingModules] = useState(true)

  // Definer tilgjengelige moduler
  const availableModules: Module[] = [
    {
      id: "1",
      key: "HMS_HANDBOOK",
      label: "HMS Håndbok",
      description: "Standard HMS håndbok med tilpasninger",
      isActive: true,
      isDefault: true
    },
    {
      id: "2",
      key: "DEVIATIONS",
      label: "Avvikshåndtering",
      description: "System for registrering og oppfølging av avvik",
      isActive: true,
      isDefault: true
    },
    {
      id: "3",
      key: "RISK_ASSESSMENT",
      label: "Risikovurdering",
      description: "Verktøy for risikovurdering og tiltak",
      isActive: true,
      isDefault: true
    },
    {
      id: "4",
      key: "DOCUMENTS",
      label: "Dokumenthåndtering",
      description: "System for dokumenthåndtering og versjonskontroll",
      isActive: true,
      isDefault: true
    },
    {
      id: "5",
      key: "EMPLOYEES",
      label: "Ansatthåndtering",
      description: "Administrasjon av ansatte og tilganger",
      isActive: true,
      isDefault: true
    },
    {
      id: "6",
      key: "SAFETY_ROUNDS",
      label: "Vernerunder",
      description: "Planlegging og gjennomføring av vernerunder",
      isActive: false,
      isDefault: false
    },
    {
      id: "7",
      key: "HMS_CONSULTING",
      label: "HMS Rådgivning",
      description: "Tilgang til HMS-rådgivning og support",
      isActive: false,
      isDefault: false
    }
  ]

  const toggleModule = async (moduleKey: string) => {
    try {
      const response = await fetch(`/api/admin/companies/${company?.id}/modules`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleKey,
          active: !activeModules.includes(moduleKey)
        })
      })

      if (!response.ok) throw new Error('Kunne ikke oppdatere moduler')
      
      setActiveModules(prev => 
        prev.includes(moduleKey) 
          ? prev.filter(key => key !== moduleKey)
          : [...prev, moduleKey]
      )
      
      toast.success("Moduler oppdatert")
    } catch (error) {
      toast.error("Kunne ikke oppdatere moduler")
    }
  }

  const toggleActive = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/companies/${company?.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !company?.isActive
        })
      })

      if (!response.ok) throw new Error('Kunne ikke oppdatere status')
      
      toast.success("Bedriftsstatus oppdatert")
      window.location.reload()
    } catch (error) {
      toast.error("Kunne ikke oppdatere status")
    } finally {
      setIsUpdating(false)
    }
  }

  // Hent aktive moduler når dialogen åpnes
  useEffect(() => {
    if (company && open) {
      setIsLoadingModules(true)
      fetch(`/api/admin/companies/${company.id}/modules`)
        .then(async (res) => {
          if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Kunne ikke hente moduler')
          }
          return res.json()
        })
        .then(data => {
          setActiveModules(data.modules.map((m: Module) => m.key))
        })
        .catch((error) => {
          console.error('Error fetching modules:', error)
          toast.error(error.message)
        })
        .finally(() => {
          setIsLoadingModules(false)
        })
    }
  }, [company, open])

  const moduleCategories = {
    standard: [
      {
        key: "HMS_HANDBOOK",
        label: "HMS Håndbok",
        description: "Standard HMS håndbok med tilpasninger",
        isDefault: true
      },
      {
        key: "DEVIATIONS",
        label: "Avvikshåndtering",
        description: "System for registrering og oppfølging av avvik",
        isDefault: true
      },
      {
        key: "RISK_ASSESSMENT",
        label: "Risikovurdering",
        description: "Verktøy for risikovurdering og tiltak",
        isDefault: true
      },
      {
        key: "DOCUMENTS",
        label: "Dokumenthåndtering",
        description: "System for dokumenthåndtering og versjonskontroll",
        isDefault: true
      },
      {
        key: "EMPLOYEES",
        label: "Ansatthåndtering",
        description: "Administrasjon av ansatte og tilganger",
        isDefault: true
      }
    ],
    sysadmin: [
      {
        key: "SAFETY_ROUNDS",
        label: "Vernerunder",
        description: "Gjennomføring og oppfølging av vernerunder",
        isDefault: false,
        path: "/admin/companies/{id}/safety-rounds"
      },
      {
        key: "HMS_CONSULTING",
        label: "HMS Rådgivning",
        description: "HMS-rådgivning og kundeoppfølging",
        isDefault: false
      }
    ]
  }

  const handleUpdatePaymentStatus = async () => {
    setIsUpdatingPayment(true)
    try {
      const nextStatus = 
        company.paymentStatus === 'PENDING' ? 'PAID' :
        company.paymentStatus === 'PAID' ? 'OVERDUE' :
        company.paymentStatus === 'OVERDUE' ? 'CANCELLED' : 'PENDING'

      const response = await fetch(`/api/admin/companies/${company?.id}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentStatus: nextStatus,
          lastPaymentDate: nextStatus === 'PAID' ? new Date().toISOString() : null
        })
      })

      if (!response.ok) throw new Error('Kunne ikke oppdatere betalingsstatus')
      
      toast.success("Betalingsstatus oppdatert")
      window.location.reload()
    } catch (error) {
      toast.error("Kunne ikke oppdatere betalingsstatus")
    } finally {
      setIsUpdatingPayment(false)
    }
  }

  if (!company) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <div className="px-6 py-4 border-b flex-shrink-0">
          <DialogHeader>
            <DialogTitle>Bedriftsdetaljer - {company.name}</DialogTitle>
          </DialogHeader>
        </div>

        <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 flex-shrink-0">
            <TabsList>
              <TabsTrigger value="info">Informasjon</TabsTrigger>
              <TabsTrigger value="modules">Moduler</TabsTrigger>
              <TabsTrigger value="users">Brukere</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="p-6">
              <TabsContent value="info" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Bedriftsinformasjon</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm text-muted-foreground">Navn</dt>
                          <dd>{company.name}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Org.nummer</dt>
                          <dd>{company.orgNumber}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Type</dt>
                          <dd>{company.organizationType}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Status</dt>
                          <dd>
                            <div className="flex gap-2 mt-1">
                              <Badge variant={company.isVerified ? "success" : "secondary"}>
                                {company.isVerified ? "Verifisert" : "Ikke verifisert"}
                              </Badge>
                              <Badge variant={company.isActive ? "default" : "secondary"}>
                                {company.isActive ? "Aktiv" : "Inaktiv"}
                              </Badge>
                            </div>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Opprettet</dt>
                          <dd>{formatDate(company.createdAt)}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Betalingsinformasjon</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm text-muted-foreground">Status</dt>
                          <dd>
                            <Badge className="mt-1" variant={
                              company.paymentStatus === 'PAID' ? "success" :
                              company.paymentStatus === 'PENDING' ? "warning" :
                              company.paymentStatus === 'OVERDUE' ? "destructive" :
                              "secondary"
                            }>
                              {company.paymentStatus === 'PAID' ? "Betalt" :
                               company.paymentStatus === 'PENDING' ? "Venter" :
                               company.paymentStatus === 'OVERDUE' ? "Forfalt" :
                               "Kansellert"}
                            </Badge>
                          </dd>
                        </div>
                        {company.lastPaymentDate && (
                          <div>
                            <dt className="text-sm text-muted-foreground">Sist betalt</dt>
                            <dd>{formatDate(company.lastPaymentDate)}</dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="modules" className="mt-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Standard HMS-pakke</CardTitle>
                    <CardDescription>
                      Grunnleggende moduler som er inkludert for alle bedrifter
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {moduleCategories.standard.map((module) => (
                        <div key={module.key} className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="font-medium">{module.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {module.description}
                            </div>
                          </div>
                          <Badge variant="secondary">Inkludert</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Systemadmin Tjenester</CardTitle>
                    <CardDescription>
                      HMS-tjenester som utføres av systemadministratorer
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {moduleCategories.sysadmin.map((module) => {
                        const isActive = activeModules.includes(module.key)
                        return (
                          <div key={module.key} className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="font-medium">{module.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {module.description}
                              </div>
                              {isActive && module.path && (
                                <div className="mt-2">
                                  <Button 
                                    variant="default"
                                    size="sm"
                                    onClick={() => {
                                      const url = module.path.replace('{id}', company.id)
                                      window.location.href = url
                                    }}
                                  >
                                    Administrer {module.label.toLowerCase()}
                                  </Button>
                                </div>
                              )}
                            </div>
                            <Switch
                              checked={isActive}
                              onCheckedChange={() => toggleModule(module.key)}
                              disabled={isLoadingModules}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Brukere</CardTitle>
                    <CardDescription>
                      Oversikt over bedriftens brukere
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Brukerlistekode her */}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>

        <div className="px-6 py-4 border-t flex justify-between gap-2 flex-shrink-0">
          <div>
            <Button
              variant="outline"
              onClick={handleUpdatePaymentStatus}
              disabled={isUpdatingPayment}
            >
              Oppdater betalingsstatus
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Lukk
            </Button>
            <Button
              variant="outline"
              onClick={toggleActive}
              disabled={isUpdating}
            >
              {company.isActive ? "Deaktiver bedrift" : "Aktiver bedrift"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 