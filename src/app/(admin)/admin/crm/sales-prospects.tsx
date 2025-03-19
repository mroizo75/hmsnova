"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Company } from "./columns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  BarChart, 
  Check,
  History,
  AlertCircle,
  CheckCircle,
  ArrowRightCircle,
  Briefcase,
  ArrowUpRightSquare
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/utils/date"
import { CompanyDetailsDialog } from "./company-details-dialog"
import { toast } from "sonner"

export interface SalesProspectsProps {
  companies: Company[]
  onUpdateCompany: (updatedCompany: Company) => void
  onSendWelcomeEmail: (company: Company) => void
}

type ProspectStage = 'LEAD' | 'CONTACT' | 'OPPORTUNITY' | 'NEGOTIATION' | 'ALL';

// Definer tydelige stadier for prospects
const prospectStages = [
  { value: 'LEAD', label: 'Lead', description: 'Første kontakt, potensiell interesse', color: 'blue' },
  { value: 'CONTACT', label: 'Kontaktet', description: 'Har hatt første dialog', color: 'yellow' },
  { value: 'OPPORTUNITY', label: 'Mulighet', description: 'Diskuterer løsning og pris', color: 'orange' },
  { value: 'NEGOTIATION', label: 'Forhandling', description: 'Forhandler kontrakt', color: 'green' },
];

// Hjelpefunksjon for å formatere penger
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(amount);
};

// Hjelpefunksjon for å beregne hvor lenge kunden har vært prospect
const calculateDaysAsProspect = (createdAt: string) => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export function SalesProspects({ companies, onUpdateCompany, onSendWelcomeEmail }: SalesProspectsProps) {
  // Filtrere ut bare prospects
  const prospects = companies.filter(company => company.isProspect);

  // State-variabler
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProspects, setFilteredProspects] = useState<Company[]>(prospects);
  const [selectedStage, setSelectedStage] = useState<ProspectStage>('ALL');
  const [selectedProspect, setSelectedProspect] = useState<Company | null>(null);
  const [showProspectDetails, setShowProspectDetails] = useState(false);

  // Beregn statistikker
  const totalProspects = prospects.length;
  const totalPotentialValue = prospects.reduce((sum, p) => sum + (p.potentialValue || 0), 0);
  
  // Fordel på stadier
  const prospectsByStage = prospectStages.map(stage => ({
    ...stage,
    count: prospects.filter(p => p.prospectStage === stage.value).length,
    totalValue: prospects.filter(p => p.prospectStage === stage.value)
      .reduce((sum, p) => sum + (p.potentialValue || 0), 0)
  }));
  
  // Oppdater filtrerte prospects når søk eller filter endres
  useEffect(() => {
    let filtered = [...prospects];
    
    // Filtrer basert på søk
    if (searchQuery) {
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.primaryContact?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.primaryEmail?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filtrer basert på stadium
    if (selectedStage !== 'ALL') {
      filtered = filtered.filter(p => p.prospectStage === selectedStage);
    }
    
    setFilteredProspects(filtered);
  }, [searchQuery, selectedStage, prospects]);

  // Funksjoner for å håndtere handlinger
  const openProspectDetails = (prospect: Company) => {
    setSelectedProspect(prospect);
    setShowProspectDetails(true);
  };

  const handleActivateProspect = (prospect: Company, sendWelcomeEmail: boolean = false) => {
    const updatedCompany: Company = {
      ...prospect,
      isActive: true,
      isProspect: false,
      paymentStatus: 'PENDING'
    };
    
    onUpdateCompany(updatedCompany);
    
    if (sendWelcomeEmail) {
      onSendWelcomeEmail(updatedCompany);
      toast.success(`${prospect.name} har blitt aktivert som kunde og velkomstepost er sendt!`);
    } else {
      toast.success(`${prospect.name} har blitt aktivert som kunde!`);
    }
  };

  const handleUpdateStage = (prospect: Company, newStage: string) => {
    const updatedCompany: Company = {
      ...prospect,
      prospectStage: newStage as 'LEAD' | 'CONTACT' | 'OPPORTUNITY' | 'NEGOTIATION'
    };
    
    onUpdateCompany(updatedCompany);
    toast.success(`Status for ${prospect.name} er oppdatert til ${newStage}!`);
  };

  // Prospekttabell-kolonner
  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: "name",
      header: () => <div className="text-xs font-medium">Bedrift</div>,
      cell: ({ row }) => {
        const company = row.original;
        return (
          <div className="flex flex-col">
            <div className="font-medium text-xs">{company.name}</div>
            <div className="text-[10px] text-muted-foreground">{company.orgNumber}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "primaryContact",
      header: () => <div className="text-xs font-medium">Kontaktperson</div>,
      cell: ({ row }) => {
        const company = row.original;
        return (
          <div className="flex flex-col">
            <div className="text-xs">{company.primaryContact}</div>
            {company.primaryEmail && (
              <div className="flex items-center text-[10px] text-muted-foreground truncate max-w-[150px]">
                <Mail className="mr-1 h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{company.primaryEmail}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "prospectStage",
      header: () => <div className="text-xs font-medium">Status</div>,
      cell: ({ row }) => {
        const stage = row.getValue("prospectStage") as string;
        const stageInfo = prospectStages.find(s => s.value === stage) || prospectStages[0];
        
        // Vis statusmerke med riktig farge
        return (
          <div className="flex flex-col">
            <Badge 
              variant="outline" 
              className={`text-[10px] px-1 py-0 bg-${stageInfo.color}-50 text-${stageInfo.color}-700 border-${stageInfo.color}-200`}
            >
              {stageInfo.label}
            </Badge>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {stageInfo.description}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "potentialValue",
      header: () => <div className="text-xs font-medium">Potensiell verdi</div>,
      cell: ({ row }) => {
        const value = row.getValue("potentialValue") as number;
        return (
          <div className="flex items-center">
            <DollarSign className="h-3 w-3 mr-1 text-green-600" />
            <span className="text-xs font-medium">{formatMoney(value)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => <div className="text-xs font-medium">Registrert</div>,
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        const days = calculateDaysAsProspect(createdAt);
        
        return (
          <div className="flex flex-col">
            <div className="text-xs">{formatDate(createdAt)}</div>
            <div className="text-[10px] text-muted-foreground">
              {days} {days === 1 ? 'dag' : 'dager'} siden
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-xs font-medium text-right">Handlinger</div>,
      cell: ({ row }) => {
        const prospect = row.original;
        
        return (
          <div className="flex justify-end gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={() => openProspectDetails(prospect)}
            >
              <ArrowUpRightSquare className="h-3.5 w-3.5 mr-1" />
              Detaljer
            </Button>
            
            <Select
              onValueChange={(value) => handleUpdateStage(prospect, value)}
              defaultValue={prospect.prospectStage || 'LEAD'}
            >
              <SelectTrigger className="h-7 px-2 text-xs w-24">
                <ArrowRightCircle className="h-3.5 w-3.5 mr-1" />
                <span>Endre</span>
              </SelectTrigger>
              <SelectContent>
                {prospectStages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value} className="text-xs">
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="default" 
              size="sm" 
              className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
              onClick={() => handleActivateProspect(prospect, true)}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Aktiver
            </Button>
          </div>
        )
      }
    }
  ];

  // Tabell-oppsett  
  const table = useReactTable({
    data: filteredProspects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold">Prospects</h2>
          <p className="text-sm text-muted-foreground">
            Håndter potensielle kunder og konverter dem til aktive kunder
          </p>
        </div>
        
        <div className="flex gap-2">
          <Input 
            placeholder="Søk i prospects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 h-9 text-xs"
          />
          
          <Select 
            value={selectedStage} 
            onValueChange={(value) => setSelectedStage(value as ProspectStage)}
          >
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">Alle statuser</SelectItem>
              {prospectStages.map(stage => (
                <SelectItem key={stage.value} value={stage.value} className="text-xs">
                  {stage.label} ({prospectsByStage.find(s => s.value === stage.value)?.count || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Statistikk-kort */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-2">
            <CardTitle className="text-xs font-medium">Totalt</CardTitle>
            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <div className="text-sm sm:text-lg font-bold">{totalProspects}</div>
            <p className="text-xs text-muted-foreground">potensielle kunder</p>
          </CardContent>
        </Card>
        
        <Card className="p-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-2">
            <CardTitle className="text-xs font-medium">Potensiell verdi</CardTitle>
            <BarChart className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <div className="text-sm sm:text-lg font-bold">{formatMoney(totalPotentialValue)}</div>
            <p className="text-xs text-muted-foreground">total verdi</p>
          </CardContent>
        </Card>
        
        {prospectsByStage.slice(0, 3).map(stage => (
          <Card key={stage.value} className="p-0 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-2">
              <CardTitle className="text-xs font-medium">{stage.label}</CardTitle>
              <div className={`h-3.5 w-3.5 rounded-full bg-${stage.color}-500`}></div>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="text-sm sm:text-lg font-bold">{stage.count}</div>
              <p className="text-xs text-muted-foreground">{formatMoney(stage.totalValue)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Prospekt-tabell */}
      <div className="border rounded-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-xs py-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2">
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
                    className="h-24 text-center"
                  >
                    Ingen prospects funnet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Paginering */}
        <div className="flex items-center justify-end space-x-2 p-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Forrige
          </Button>
          <div className="text-xs">
            Side {table.getState().pagination.pageIndex + 1} av{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Neste
          </Button>
        </div>
      </div>
      
      {/* Dialog for prospect-detaljer */}
      <CompanyDetailsDialog 
        company={selectedProspect} 
        open={showProspectDetails} 
        onOpenChange={setShowProspectDetails} 
        onUpdate={onUpdateCompany}
        onSendWelcomeEmail={onSendWelcomeEmail}
      />
    </div>
  )
} 