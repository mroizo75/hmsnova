"use client"

import { useState, useEffect } from "react"
import { columns, Company } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Building2, Check, Clock, ShoppingCart, Mail, Users2, Briefcase, DollarSign, BarChart } from "lucide-react"
import { CompanyDetailsDialog } from "./company-details-dialog"
import { CustomerContactDialog } from "./customer-contact-dialog"
import { SalesOpportunityDialog, SalesOpportunity } from "./sales-opportunity-dialog"
import { NewCompanyDialog } from "./new-company-dialog"
import { SalesProspects } from "./sales-prospects"
import { Input } from "@/components/ui/input"
import { Row } from "@tanstack/react-table"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

// Kompakt datatabel-komponent spesifikt for CRM
function CompactDataTable<TData, TValue>({
  columns,
  data,
  searchQuery,
}: {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchQuery: string
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-8 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="p-1 h-8" style={{ width: header.getSize() }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-8 hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-1 h-8" style={{ width: cell.column.getSize() }}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-16 text-center text-xs"
                >
                  Ingen resultater.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-1 py-2">
        <Button
          variant="outline"
          size="sm"
          className="h-6 text-xs px-2"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Forrige
        </Button>
        <div className="text-xs mx-2">
          Side {table.getState().pagination.pageIndex + 1} av{" "}
          {table.getPageCount()}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-6 text-xs px-2"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Neste
        </Button>
      </div>
    </div>
  )
}

interface CrmClientProps {
  companies: Company[]
}

/**
 * Sender en epost via Postmark API
 */
async function sendEmail(emailDetails: any) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailDetails),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Kunne ikke sende epost');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Epost sending feilet:', error);
    throw error;
  }
}

export default function CRMClient({ companies: initialCompanies }: CrmClientProps) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showCompanyDetails, setShowCompanyDetails] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [showSalesDialog, setShowSalesDialog] = useState(false)
  const [showNewCompanyDialog, setShowNewCompanyDialog] = useState(false)
  const [salesOpportunities, setSalesOpportunities] = useState<{ [key: string]: SalesOpportunity[] }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [userRole, setUserRole] = useState<string>("ADMIN")

  // Hent bedrifter fra databasen ved oppstart
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Funksjon for å hente bedrifter fra databasen
  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/companies');
      if (!response.ok) {
        throw new Error('Kunne ikke hente bedrifter');
      }
      const data = await response.json();
      setCompanies(data);
      
      // Initialiser salgsmuligheter
      const opportunitiesMap: { [key: string]: SalesOpportunity[] } = {};
      data.forEach((company: Company) => {
        if (company.salesOpportunities && company.salesOpportunities.length > 0) {
          opportunitiesMap[company.id] = company.salesOpportunities;
        }
      });
      setSalesOpportunities(opportunitiesMap);
    } catch (error) {
      console.error('Feil ved henting av bedrifter:', error);
      toast.error('Kunne ikke hente bedrifter. Prøv igjen senere.');
    } finally {
      setIsLoading(false);
    }
  };

  // Beregn statistikker
  const activeCompanies = companies.filter(company => company.isActive).length
  const totalModules = companies.reduce((acc, company) => acc + company.activeModules.length, 0)
  const avgModules = companies.length > 0 ? Math.round(totalModules / companies.length) : 0
  const verifiedCompanies = companies.filter(company => company.isVerified).length
  const verifiedPercentage = companies.length > 0 ? Math.round((verifiedCompanies / companies.length) * 100) : 0
  const newCompanies = companies.filter(
    company => {
      const createdDate = new Date(company.createdAt)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return createdDate > thirtyDaysAgo
    }
  ).length
  
  // Beregn månedlig inntjening basert på aktive bedrifter
  const calculateMonthlyRevenue = () => {
    let totalRevenue = 0;
    
    companies.forEach(company => {
      if (company.isActive && company.paymentStatus !== 'OVERDUE') {
        // Sjekk om bedriften har metadata med priser
        let companyRevenue = 0;
        
        if (company.metadata) {
          try {
            const metadata = typeof company.metadata === 'string' 
              ? JSON.parse(company.metadata) 
              : company.metadata;
            
            // Bruk prisene direkte fra metadata hvis de finnes - alltid bruk reelle tall fra databasen
            // Hvis finalPrice er definert, bruk den (den har allerede tatt hensyn til rabatter)
            if (metadata.finalPrice) {
              companyRevenue = metadata.finalPrice;
            } 
            // Ellers beregn basert på basePrice, additionalPrice og rabatt
            else {
              const basePrice = metadata.basePrice || 0;
              const additionalPrice = metadata.additionalPrice || 0;
              
              // Total pris før rabatt
              const totalPriceBeforeDiscount = basePrice + additionalPrice;
              
              // Sjekk om bedriften har rabatt
              if (metadata.discountPercentage && metadata.discountPercentage > 0) {
                // Beregn rabattert pris
                const discountAmount = totalPriceBeforeDiscount * (metadata.discountPercentage / 100);
                companyRevenue = totalPriceBeforeDiscount - discountAmount;
              } else {
                // Ingen rabatt
                companyRevenue = totalPriceBeforeDiscount;
              }
            }
          } catch (e) {
            // Hvis det er feil i JSON-parsing, sett inntekt til 0 for denne bedriften
            // Vi vil ikke bruke hardkodede verdier siden vi skal bruke verdier fra databasen
            console.error("Feil ved parsing av metadata for bedrift:", company.name, e);
            companyRevenue = 0;
          }
        } else {
          // Hvis ingen metadata finnes, sett inntekt til 0 for denne bedriften
          // Vi vil ikke bruke hardkodede verdier siden vi skal bruke verdier fra databasen
          companyRevenue = 0;
        }
        
        totalRevenue += companyRevenue;
      }
    });
    
    return Math.round(totalRevenue); // Avrund til nærmeste hele tall
  };
  
  // Beregn total potensialverdi fra alle prospects
  const calculateTotalPotential = () => {
    let totalPotential = 0;
    
    // Fra eksisterende salgsmuligheter
    companies.forEach(company => {
      if (company.isProspect) {
        // Hvis bedriften har salgsmuligheter, bruk disse
        if (company.salesOpportunities && company.salesOpportunities.length > 0) {
          totalPotential += company.salesOpportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
        } 
        // Hvis ikke, bruk potentialValue feltet hvis det finnes
        else if (company.potentialValue) {
          totalPotential += company.potentialValue;
        }
      }
    });
    
    return totalPotential;
  };
  
  const monthlyRevenue = calculateMonthlyRevenue();
  const totalPotential = calculateTotalPotential();
  
  // Sjekk brukerrolle (dette er en forenklet versjon - erstatt med din faktiske brukerrollesjekk)
  useEffect(() => {
    // Her ville du normalt hente brukerens rolle fra en autentiseringstjeneste
    // For nå setter vi den bare til ADMIN for demonstrasjonsformål
    // setUserRole(fetchCurrentUserRole());
  }, []);

  // Filtrer bedrifter basert på søk
  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.email && company.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company.primaryContact && company.primaryContact.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const openCompanyDetails = (company: Company) => {
    setSelectedCompany(company)
    setShowCompanyDetails(true)
  }

  const openContactDialog = (company: Company) => {
    setSelectedCompany(company)
    setShowContactDialog(true)
  }
  
  const openSalesDialog = (company: Company) => {
    setSelectedCompany(company)
    setShowSalesDialog(true)
  }

  const handleNyBedrift = () => {
    setShowNewCompanyDialog(true)
  }

  // Funksjon for å oppdatere bedrift etter endringer
  const updateCompany = async (updatedCompany: Company) => {
    try {
      setIsLoading(true);
      
      // Forberede oppdatering for back-end API
      const companyUpdate = {
        id: updatedCompany.id,
        name: updatedCompany.name,
        isActive: updatedCompany.isActive,
        isVerified: updatedCompany.isVerified,
        paymentStatus: updatedCompany.paymentStatus,
        subscriptionPlan: updatedCompany.subscriptionPlan,
        activeModules: updatedCompany.activeModules || [], // Sikre at active modules sendes
        // Send med andre viktige felt som vi vil oppdatere
        metadata: updatedCompany.metadata,
        isProspect: updatedCompany.isProspect
      };
      
      console.log('Sender oppdatering til API:', companyUpdate);
      
      // Kall API for å oppdatere bedrift i databasen
      const response = await fetch(`/api/companies/${updatedCompany.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyUpdate),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API feilrespons:', errorData);
        throw new Error(errorData?.error || 'Kunne ikke oppdatere bedrift');
      }
      
      const savedCompany = await response.json();
      
      // Oppdater lokal tilstand
      setCompanies(companies.map(c => c.id === savedCompany.id ? savedCompany : c));
      setSelectedCompany(null);
      
      toast.success(`Bedriften ${savedCompany.name} er oppdatert`);
      return savedCompany; // Returner den oppdaterte bedriften for bruk i calling componenten
    } catch (error) {
      console.error('Feil ved oppdatering av bedrift:', error);
      toast.error(error instanceof Error ? error.message : 'Kunne ikke oppdatere bedriften. Prøv igjen senere.');
      throw error; // Re-throw feil så calling komponenten kan håndtere den
    } finally {
      setIsLoading(false);
    }
  }

  // Ny funksjon for å slette bedrift
  const deleteCompany = async (companyId: string, companyName: string) => {
    try {
      setIsLoading(true);
      
      // Bekreft at brukeren virkelig vil slette
      if (!window.confirm(`Er du sikker på at du vil slette bedriften "${companyName}"? Dette kan ikke angres.`)) {
        setIsLoading(false);
        return;
      }
      
      // Kall API for å slette bedrift
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunne ikke slette bedriften');
      }
      
      // Oppdater lokal tilstand
      setCompanies(companies.filter(c => c.id !== companyId));
      setSelectedCompany(null);
      setShowCompanyDetails(false);
      
      // Fjern salgsmuligheter for denne bedriften
      setSalesOpportunities(prev => {
        const newState = {...prev};
        delete newState[companyId];
        return newState;
      });
      
      toast.success(`Bedriften ${companyName} er slettet`);
    } catch (error) {
      console.error('Feil ved sletting av bedrift:', error);
      toast.error(error instanceof Error ? error.message : 'Kunne ikke slette bedriften. Prøv igjen senere.');
    } finally {
      setIsLoading(false);
    }
  }

  // Funksjon for å legge til ny bedrift
  const createCompany = async (newCompany: Company) => {
    try {
      setIsLoading(true);
      
      // Kall API for å lagre i databasen
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCompany),
      });
      
      if (!response.ok) {
        // Hent den faktiske feilmeldingen fra API-responsen
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunne ikke lagre bedrift i databasen');
      }
      
      const savedCompany = await response.json();
      
      // Opprett en kontaktperson fra primærkontaktinformasjonen, hvis tilgjengelig
      if (savedCompany.primaryContact && savedCompany.primaryEmail && 
          (!savedCompany.contacts || savedCompany.contacts.length === 0)) {
        try {
          // Del opp primærkontaktnavnet i fornavn og etternavn
          const nameParts = savedCompany.primaryContact.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          // Opprett en ny kontakt basert på primærkontaktinformasjonen
          const primaryContact = {
            firstName,
            lastName,
            email: savedCompany.primaryEmail,
            phone: savedCompany.primaryPhone || '',
            position: 'Primærkontakt',
            isPrimary: true,
            companyId: savedCompany.id
          };
          
          // Lagre kontaktpersonen til API-et
          const contactResponse = await fetch(`/api/companies/${savedCompany.id}/contacts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(primaryContact),
          });
          
          if (contactResponse.ok) {
            const savedContact = await contactResponse.json();
            savedCompany.contacts = [savedContact];
            console.log('Opprettet primærkontakt automatisk:', savedContact);
          } else {
            console.error('Kunne ikke opprette primærkontakt automatisk');
          }
        } catch (contactError) {
          console.error('Feil ved opprettelse av primærkontakt:', contactError);
        }
      }
      
      // Oppdater lokal tilstand
      setCompanies([...companies, savedCompany]);
      
      // Hvis dette er en prospect, initialiser salgsmuligheter
      if (savedCompany.salesOpportunities && savedCompany.salesOpportunities.length > 0) {
        setSalesOpportunities(prev => ({
          ...prev,
          [savedCompany.id]: savedCompany.salesOpportunities
        }));
      }
      
      if (savedCompany.isProspect) {
        toast.success(`Bedriften ${savedCompany.name} er opprettet som prospect og salgsmulighet er registrert`);
      } else {
        toast.success(`Bedriften ${savedCompany.name} er opprettet`);
      }
    } catch (error) {
      console.error('Feil ved lagring av bedrift:', error);
      // Vis den faktiske feilmeldingen hvis tilgjengelig
      toast.error(error instanceof Error ? error.message : 'Kunne ikke lagre bedriften. Prøv igjen senere.');
    } finally {
      setIsLoading(false);
    }
  }

  // Funksjon for å oppdatere kontaktinformasjon
  const updateContactInfo = (companyId: string, primaryContact: string, primaryEmail: string) => {
    // Denne funksjonen oppdaterer primærkontakten i bedriften slik at tabellen reflekterer endringer i kontaktperson
    setCompanies(companies.map(c => {
      if (c.id === companyId) {
        return { ...c, primaryContact, primaryEmail }
      }
      return c
    }))
  }

  // Funksjoner for håndtering av salgsmuligheter
  const getCompanyOpportunities = (companyId: string): SalesOpportunity[] => {
    return salesOpportunities[companyId] || [];
  }

  const addSalesOpportunity = (companyId: string, opportunity: SalesOpportunity) => {
    const companyOpportunities = getCompanyOpportunities(companyId);
    
    setSalesOpportunities(prev => ({
      ...prev,
      [companyId]: [...companyOpportunities, opportunity]
    }));
    
    // Oppdatere statistikken for bedriften i tabellen
    setCompanies(companies.map(c => {
      if (c.id === companyId) {
        return { 
          ...c, 
          activeOpportunities: (c.activeOpportunities || 0) + 1,
          potentialValue: (c.potentialValue || 0) + opportunity.value
        }
      }
      return c
    }));
  }

  const updateSalesOpportunity = (companyId: string, updatedOpportunity: SalesOpportunity) => {
    const companyOpportunities = getCompanyOpportunities(companyId);
    
    // Finn den gamle verdien for å beregne differansen
    const oldOpportunity = companyOpportunities.find(o => o.id === updatedOpportunity.id);
    const valueDifference = oldOpportunity ? updatedOpportunity.value - oldOpportunity.value : 0;
    
    // Oppdatere salgsmuligheter
    setSalesOpportunities(prev => ({
      ...prev,
      [companyId]: companyOpportunities.map(o => 
        o.id === updatedOpportunity.id ? updatedOpportunity : o
      )
    }));
    
    // Oppdatere statistikken for bedriften i tabellen hvis verdien har endret seg
    if (valueDifference !== 0) {
      setCompanies(companies.map(c => {
        if (c.id === companyId) {
          return { 
            ...c, 
            potentialValue: (c.potentialValue || 0) + valueDifference
          }
        }
        return c
      }));
    }
  }

  const deleteSalesOpportunity = (companyId: string, opportunityId: string) => {
    const companyOpportunities = getCompanyOpportunities(companyId);
    const opportunityToDelete = companyOpportunities.find(o => o.id === opportunityId);
    
    if (!opportunityToDelete) return;
    
    // Fjerne salgsmuligheten
    setSalesOpportunities(prev => ({
      ...prev,
      [companyId]: companyOpportunities.filter(o => o.id !== opportunityId)
    }));
    
    // Oppdatere statistikken for bedriften i tabellen
    setCompanies(companies.map(c => {
      if (c.id === companyId) {
        return { 
          ...c, 
          activeOpportunities: Math.max(0, (c.activeOpportunities || 0) - 1),
          potentialValue: Math.max(0, (c.potentialValue || 0) - opportunityToDelete.value)
        }
      }
      return c
    }));
  }

  // Lag egne kolonner med handlinger
  const columnsWithActions: ColumnDef<Company>[] = [
    ...columns,
    {
      id: "actions",
      header: () => <div className="text-xs font-medium">Handling</div>,
      cell: ({ row }) => {
        const company = row.original
        return (
          <div className="flex flex-row flex-wrap justify-end gap-1 ">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 px-1.5 text-xs py-0"
              onClick={() => openCompanyDetails(company)}
            >
              Detalj
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-6 px-1.5 text-xs py-0"
              onClick={() => openContactDialog(company)}
            >
              Kontakt
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-6 px-1.5 text-xs py-0"
              onClick={() => openSalesDialog(company)}
            >
              Salg
            </Button>
          </div>
        )
      },
      size: 110
    }
  ]

  // Oppdater handleCreateCompany-funksjonen
  const handleCreateCompany = async (company: Company) => {
    try {
      // Sjekk om bedriften allerede er registrert via API (fra new-company-dialog.tsx)
      // @ts-ignore - Ignorer TypeScript-feil for dette spesifikke tilfellet
      if (company.__skipApiCall) {
        console.log('Bedrift allerede registrert via API, oppdaterer bare UI:', company.name);
        
        // Oppdater lokale tilstander direkte uten å kalle API på nytt
        // Fjern skipApiCall-flagget før vi oppdaterer tilstand
        // @ts-ignore - Ignorer TypeScript-feil for dette spesifikke tilfellet
        const { __skipApiCall, __password, ...companyWithoutFlag } = company as any;
        
        // Sørg for at bedriften har et contacts-array og opprett en primærkontakt hvis nødvendig
        if (!companyWithoutFlag.contacts || !companyWithoutFlag.contacts.length) {
          // Opprett en kontaktarray med primærkontaktinformasjonen
          if (companyWithoutFlag.primaryContact && companyWithoutFlag.primaryEmail) {
            // Del opp primærkontaktnavnet i fornavn og etternavn
            const nameParts = companyWithoutFlag.primaryContact.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            // Opprett en ny kontakt basert på primærkontaktinformasjonen
            const primaryContact = {
              id: `contact-${Date.now()}`, // Midlertidig ID som vil bli erstattet ved neste API-kall
              firstName,
              lastName,
              email: companyWithoutFlag.primaryEmail,
              phone: companyWithoutFlag.primaryPhone || '',
              position: 'Primærkontakt',
              isPrimary: true,
              companyId: companyWithoutFlag.id
            };
            
            companyWithoutFlag.contacts = [primaryContact];
            
            // Lagre kontaktpersonen til API-et
            try {
              const contactResponse = await fetch(`/api/companies/${companyWithoutFlag.id}/contacts`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(primaryContact),
              });
              
              if (contactResponse.ok) {
                const savedContact = await contactResponse.json();
                companyWithoutFlag.contacts = [savedContact];
                console.log('Opprettet primærkontakt automatisk:', savedContact);
              } else {
                console.error('Kunne ikke opprette primærkontakt automatisk');
              }
            } catch (contactError) {
              console.error('Feil ved opprettelse av primærkontakt:', contactError);
            }
          }
        }
        
        setCompanies([...companies, companyWithoutFlag]);
        
        // Hvis dette er en prospect med salgsmuligheter, initialiser dem
        if (company.isProspect && company.salesOpportunities && company.salesOpportunities.length > 0) {
          // Bruk type assertion for å sikre at salesOpportunities er av riktig type
          setSalesOpportunities(prev => ({
            ...prev,
            // Bruk type assertion for å garantere riktig type
            [company.id]: (company.salesOpportunities as SalesOpportunity[])
          }));
        }
        
        // Send velkomstmail hvis dette er en aktiv bedrift (ikke en prospect)
        if (!company.isProspect && company.primaryEmail) {
          handleSendWelcomeEmail(company);
        }
        
        return; // Avslutt funksjonen tidlig for å unngå API-kall
      }
      
      // Definere standardmoduler
      const standardModules = [
        "HMS_HANDBOOK", 
        "DEVIATIONS", 
        "RISK_ASSESSMENT", 
        "DOCUMENTS", 
        "EMPLOYEES"
      ];
      
      // Sjekk hvilke tilleggsmoduler som er valgt
      const additionalModules = company.activeModules.filter(
        module => module === "SAFETY_ROUNDS" || module === "COMPETENCE"
      );
      
      // Kombinere standardmoduler med tilleggsmoduler (hvis noen er valgt)
      const allModules = [...standardModules, ...additionalModules];
      
      // Lage et nytt company-objekt med de riktige modulene
      const newCompany: Company = {
        ...company,
        activeModules: [...new Set(allModules)], // Fjern eventuelle duplikater
      };
      
      // Logg data som sendes til API-et for debugging
      console.log('Forsøker å opprette bedrift med data:', JSON.stringify(newCompany, null, 2));
      
      // Kall createCompany-funksjonen med det nye objektet
      await createCompany(newCompany);
    } catch (error) {
      console.error('Feil ved oppretting av bedrift:', error);
      toast.error('Kunne ikke opprette bedrift. Prøv igjen senere.');
    }
  };

  // Ny funksjon for å sende velkomstepost
  const handleSendWelcomeEmail = async (company: Company) => {
    try {
      // Hent modulnavn basert på aktive moduler
      const standardModules = [
        { key: "HMS_HANDBOOK", name: "HMS Håndbok", description: "Standard HMS håndbok med tilpasninger" },
        { key: "DEVIATIONS", name: "Avvikshåndtering", description: "System for registrering og oppfølging av avvik" },
        { key: "RISK_ASSESSMENT", name: "Risikovurdering", description: "Verktøy for risikovurdering og tiltak" },
        { key: "DOCUMENTS", name: "Dokumenthåndtering", description: "System for dokumenthåndtering og versjonskontroll" },
        { key: "EMPLOYEES", name: "Ansatthåndtering", description: "Administrasjon av ansatte og tilganger" },
      ];
      
      const additionalModules = [
        { key: "SAFETY_ROUNDS", name: "Vernerunder", description: "Gjennomføring og oppfølging av vernerunder", price: 199 },
        { key: "COMPETENCE", name: "Kompetansestyring", description: "System for registrering og oppfølging av kompetanse", price: 199 },
      ];
      
      // Beregn priser
      const basePrice = 699; // Kampanjepris
      const additionalModulesList = company.activeModules.filter(
        module => module === "SAFETY_ROUNDS" || module === "COMPETENCE"
      );
      const additionalPrice = additionalModulesList.length * 199;
      const totalPrice = basePrice + additionalPrice;
      
      // Sjekk om innloggingsinformasjon er tilgjengelig
      // @ts-ignore - Ignorer TypeScript-feil for dette spesifikke tilfellet
      const password = company.__password || "Din administrator vil gi deg passordet";
      const username = company.primaryEmail || "Din e-postadresse";
      
      // Lag en detaljert velkomstepost med prisinformasjon og innloggingsinformasjon
      const emailDetails = {
        to: company.primaryEmail,
        subject: `Velkommen til Innutio HMS, ${company.name}!`,
        name: company.primaryContact,
        company: company.name,
        message: `
          <p>Hei ${company.primaryContact},</p>
          <p>Velkommen som kunde hos Innutio HMS! Vi er glade for å ha ${company.name} med på laget.</p>
          
          <h3>Din innloggingsinformasjon:</h3>
          <p><strong>Nettside:</strong> <a href="https://app.innutio.no">https://app.innutio.no</a></p>
          <p><strong>Brukernavn:</strong> ${username}</p>
          <p><strong>Passord:</strong> ${password}</p>
          <p>Vi anbefaler at du endrer passordet ditt første gang du logger inn.</p>
          
          <h3>Ditt abonnement inkluderer:</h3>
          <ul>
            ${standardModules.map(m => `<li>${m.name} - ${m.description}</li>`).join('')}
            ${additionalModulesList.map(moduleKey => {
              const module = additionalModules.find(m => m.key === moduleKey);
              return module ? `<li>${module.name} - ${module.description}</li>` : '';
            }).join('') || ''}
          </ul>
          
          <h3>Prisdetaljer:</h3>
          <p>Grunnpakke: ${basePrice} kr/mnd</p>
          ${additionalPrice > 0 ? `<p>Tilleggsmoduler: ${additionalPrice} kr/mnd</p>` : ''}
          <p><strong>Total månedspris: ${totalPrice} kr/mnd</strong></p>
          <p>Årlig: ${totalPrice * 12} kr/år</p>
          
          <h3>Kom i gang:</h3>
          <ol>
            <li>Logg inn med informasjonen over</li>
            <li>Fyll ut din bedriftsprofil for å tilpasse systemet</li>
            <li>Legg til andre brukere fra din organisasjon</li>
            <li>Ta en titt på våre veiledningsvideoer for å komme raskt i gang</li>
          </ol>
          
          <p>Ta gjerne kontakt med oss om du har spørsmål eller trenger hjelp med å komme i gang.</p>
          <p>Vennlig hilsen,<br>Innutio-teamet</p>
        `
      };
      
      // Send epost via API
      await sendEmail(emailDetails);
      toast.success(`Velkomstepost sendt til ${company.primaryEmail}`);
    } catch (error) {
      console.error('Feil ved sending av epost:', error);
      toast.error('Kunne ikke sende velkomstepost. Sjekk konsollen for detaljer.');
    }
  }

  // Legg til en loading state i UI-en der det er relevant
  if (isLoading && companies.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-muted-foreground">Laster inn data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-1 sm:p-2 md:p-4 space-y-2">
      <div className="flex flex-col justify-between items-start gap-2">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">CRM – Kundehåndtering</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Administrer kundeinformasjon og kundeforhold</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <div className="relative w-full sm:max-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Søk etter bedrifter..."
              className="pl-7 py-1 h-8 text-xs w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            className="whitespace-nowrap py-0 h-8 text-xs"
            onClick={handleNyBedrift}
          >
            <Building2 className="mr-1.5 h-3.5 w-3.5" />
            Ny Bedrift
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 sm:gap-2">
        <Card className="p-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-2">
            <CardTitle className="text-xs font-medium">Totalt Kunder</CardTitle>
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <div className="text-sm sm:text-lg font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCompanies} aktive
            </p>
          </CardContent>
        </Card>
        <Card className="p-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-2">
            <CardTitle className="text-xs font-medium">Verifisert</CardTitle>
            <Check className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <div className="text-sm sm:text-lg font-bold">
              {verifiedCompanies}
            </div>
            <p className="text-xs text-muted-foreground">
              {verifiedPercentage}% verifisert
            </p>
          </CardContent>
        </Card>
        
        {userRole === "ADMIN" && (
          <Card className="p-0 overflow-hidden bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between p-2">
              <CardTitle className="text-xs font-medium">Månedlig inntekt</CardTitle>
              <DollarSign className="h-3.5 w-3.5 text-green-600" />
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="text-sm sm:text-lg font-bold text-green-700">
                {monthlyRevenue.toLocaleString('nb-NO')} kr
              </div>
              <p className="text-xs text-green-600">
                {(monthlyRevenue * 12).toLocaleString('nb-NO')} kr/år
              </p>
            </CardContent>
          </Card>
        )}
        
        {userRole === "ADMIN" && (
          <Card className="p-0 overflow-hidden bg-blue-50">
            <CardHeader className="flex flex-row items-center justify-between p-2">
              <CardTitle className="text-xs font-medium">Salgspotensial</CardTitle>
              <BarChart className="h-3.5 w-3.5 text-blue-600" />
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="text-sm sm:text-lg font-bold text-blue-700">
                {totalPotential.toLocaleString('nb-NO')} kr
              </div>
              <p className="text-xs text-blue-600">
                Fra {companies.filter(c => c.isProspect).length} prospects
              </p>
            </CardContent>
          </Card>
        )}
        
        {userRole !== "ADMIN" && (
          <>
            <Card className="p-0 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-2">
                <CardTitle className="text-xs font-medium">Moduler</CardTitle>
                <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-2 pt-0">
                <div className="text-sm sm:text-lg font-bold">
                  {totalModules}
                </div>
                <p className="text-xs text-muted-foreground">
                  {avgModules} pr. kunde
                </p>
              </CardContent>
            </Card>
            <Card className="p-0 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-2">
                <CardTitle className="text-xs font-medium">Nye Kunder</CardTitle>
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-2 pt-0">
                <div className="text-sm sm:text-lg font-bold">
                  {newCompanies}
                </div>
                <p className="text-xs text-muted-foreground">Siste 30 dager</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="all" className="flex-1 space-y-1">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex min-w-full">
            <TabsTrigger value="all" className="text-xs px-2 py-1 h-7">Alle bedrifter</TabsTrigger>
            <TabsTrigger value="active" className="text-xs px-2 py-1 h-7">Aktive</TabsTrigger>
            <TabsTrigger value="inactive" className="text-xs px-2 py-1 h-7">Inaktive</TabsTrigger>
            <TabsTrigger value="unverified" className="text-xs px-2 py-1 h-7">Ikke verifisert</TabsTrigger>
            <TabsTrigger value="prospects" className="text-xs px-2 py-1 h-7 flex items-center">
              <Briefcase className="mr-1.5 h-3.5 w-3.5" />
              Prospects
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="all" className="flex-1 m-0 border rounded-md">
          <div className="overflow-x-auto w-full">
            <CompactDataTable 
              columns={columnsWithActions} 
              data={filteredCompanies}
              searchQuery={searchQuery}
            />
          </div>
        </TabsContent>
        <TabsContent value="active" className="flex-1 m-0 border rounded-md">
          <div className="overflow-x-auto w-full">
            <CompactDataTable 
              columns={columnsWithActions} 
              data={filteredCompanies.filter((c) => c.isActive)}
              searchQuery={searchQuery}
            />
          </div>
        </TabsContent>
        <TabsContent value="inactive" className="flex-1 m-0 border rounded-md">
          <div className="overflow-x-auto w-full">
            <CompactDataTable 
              columns={columnsWithActions} 
              data={filteredCompanies.filter((c) => !c.isActive)}
              searchQuery={searchQuery}
            />
          </div>
        </TabsContent>
        <TabsContent value="unverified" className="flex-1 m-0 border rounded-md">
          <div className="overflow-x-auto w-full">
            <CompactDataTable 
              columns={columnsWithActions} 
              data={filteredCompanies.filter((c) => !c.isVerified)}
              searchQuery={searchQuery}
            />
          </div>
        </TabsContent>
        <TabsContent value="prospects" className="flex-1 m-0">
          <SalesProspects 
            companies={companies} 
            onUpdateCompany={updateCompany}
            onSendWelcomeEmail={handleSendWelcomeEmail} 
          />
        </TabsContent>
      </Tabs>

      {/* Dialoger */}
      <CompanyDetailsDialog 
        company={selectedCompany} 
        open={showCompanyDetails} 
        onOpenChange={setShowCompanyDetails} 
        onUpdate={updateCompany}
        onDelete={deleteCompany}
        onOpenContactDialog={openContactDialog}
        onOpenSalesDialog={openSalesDialog}
        onSendWelcomeEmail={handleSendWelcomeEmail}
      />
      
      <CustomerContactDialog 
        company={selectedCompany} 
        open={showContactDialog} 
        onOpenChange={setShowContactDialog}
        onUpdateContact={updateContactInfo}
      />
      
      <SalesOpportunityDialog 
        company={selectedCompany} 
        open={showSalesDialog} 
        onOpenChange={setShowSalesDialog} 
        opportunities={selectedCompany ? getCompanyOpportunities(selectedCompany.id) : []}
        onAddOpportunity={(opportunity) => selectedCompany && addSalesOpportunity(selectedCompany.id, opportunity)}
        onUpdateOpportunity={(opportunity) => selectedCompany && updateSalesOpportunity(selectedCompany.id, opportunity)}
        onDeleteOpportunity={(id) => selectedCompany && deleteSalesOpportunity(selectedCompany.id, id)}
        onSendProposal={sendEmail}
      />

      <NewCompanyDialog
        open={showNewCompanyDialog}
        onOpenChange={setShowNewCompanyDialog}
        onCreateCompany={handleCreateCompany}
      />
    </div>
  )
} 