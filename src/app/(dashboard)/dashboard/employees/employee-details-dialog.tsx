"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/date"
import { Phone, Mail, MapPin, Calendar, Award } from "lucide-react"

// Predefinerte valg for visning av sertifiseringer
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

interface EmployeeDetailsProps {
  employee: {
    id: string
    name: string | null
    email: string
    role: string
    phone: string | null
    image: string | null
    address: {
      street?: string
      postalCode?: string
      city?: string
    } | null
    metadata: {
      certifications?: {
        machineCards: string[]
        driverLicenses: string[]
      }
    }
    createdAt: Date
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployeeDetailsDialog({ 
  employee, 
  open, 
  onOpenChange 
}: EmployeeDetailsProps) {
  const certifications = employee.metadata?.certifications

  // Hjelpefunksjon for å finne label fra verdi
  const getLabel = (value: string, options: typeof MACHINE_CARDS) => {
    return options.find(opt => opt.value === value)?.label || value
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Ansattdetaljer</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6">
            {/* Profil header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={employee.image || ''} />
                <AvatarFallback>
                  {employee.name?.charAt(0) || employee.email.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{employee.name}</h2>
                <p className="text-muted-foreground">{employee.email}</p>
                <p className="text-sm text-muted-foreground">
                  {employee.role === "COMPANY_ADMIN" ? "Administrator" : "Ansatt"}
                </p>
              </div>
            </div>

            {/* Kontaktinformasjon */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Kontaktinformasjon</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{employee.phone || 'Ikke registrert'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{employee.email}</span>
                      </div>
                      {employee.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                          <div>
                            <p>{employee.address.street}</p>
                            <p>{employee.address.postalCode} {employee.address.city}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Ansatt siden {formatDate(employee.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sertifiseringer */}
                  {certifications && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">Sertifiseringer</h3>
                      </div>
                      <div className="grid gap-2">
                        {certifications.machineCards?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Award className="h-5 w-5 text-muted-foreground" />
                              <h3 className="font-semibold">Maskinførerkort</h3>
                            </div>
                            <div className="grid gap-2">
                              {certifications.machineCards.map((card) => (
                                <div key={card} className="flex items-center gap-2">
                                  <span>{getLabel(card, MACHINE_CARDS)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {certifications.driverLicenses?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Award className="h-5 w-5 text-muted-foreground" />
                              <h3 className="font-semibold">Førerkort</h3>
                            </div>
                            <div className="grid gap-2">
                              {certifications.driverLicenses.map((license) => (
                                <div key={license} className="flex items-center gap-2">
                                  <span>{getLabel(license, DRIVER_LICENSES)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 