import { Metadata } from 'next'
import Link from "next/link"
import { CheckCircle, ClipboardCheck, Users, CalendarCheck, ListChecks, BarChart3, Camera, Shield, ChevronRight, Clock, Image as ImageIcon, AlertCircle, Search, Calendar, Check, User, MapPin, X, Eye, FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/front/page-header"
import { ContactModal } from "@/components/contact-modal"
import { Badge } from "@/components/ui/badge"
import ModuleSEO from "@/components/seo/module-seo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: 'HMS Vernerunde | Digital løsning for vernerunder | HMS Nova',
  description: 'Gjennomfør effektive vernerunder digitalt med HMS Nova. Ta bilder, registrer avvik, tildel tiltak og følg opp - alt i én brukervennlig app.',
  keywords: 'vernerunde, digital vernerunde, HMS vernerunder, elektronisk vernerunde, vernerundeskjema, HMS-vernerunde, arbeidsmiljø, sjekkpunkter, arbeidstilsynet, internkontroll, systematisk HMS-arbeid',
}

const featuresData = [
  {
    title: 'Digitale sjekklister',
    description: 'Velg mellom ferdige maler eller lag dine egne tilpassede sjekklister for vernerunder.',
    icon: <ClipboardCheck className="h-10 w-10 text-[#17304F]" />
  },
  {
    title: 'Fotoregistrering',
    description: 'Ta bilder direkte i appen for å dokumentere avvik eller forbedringspunkter.',
    icon: <Camera className="h-10 w-10 text-[#17304F]" />
  },
  {
    title: 'Tiltaksoppfølging',
    description: 'Automatisk opprettelse av tiltak med ansvarlig person og tidsfrist.',
    icon: <ListChecks className="h-10 w-10 text-[#17304F]" />
  },
  {
    title: 'Verneombudsverktøy',
    description: 'Spesialutviklede funksjoner som støtter verneombudets viktige rolle.',
    icon: <Shield className="h-10 w-10 text-[#17304F]" />
  },
  {
    title: 'Statistikk og rapporter',
    description: 'Få oversikt over trender og utviklingstrekk i HMS-arbeidet over tid.',
    icon: <BarChart3 className="h-10 w-10 text-[#17304F]" />
  },
  {
    title: 'Teamsamarbeid',
    description: 'Involvér flere deltakere i vernerunden med tydelige roller og ansvar.',
    icon: <Users className="h-10 w-10 text-[#17304F]" />
  }
]

// Eksempeldata for vernerunder
const exampleSafetyRounds = [
  {
    id: "1",
    title: "Hovedkontor - Q1 vernerunde",
    status: "COMPLETED",
    location: "Hovedkontor - 3. etasje",
    dueDate: "2023-03-15",
    completedDate: "2023-03-10",
    assignedUser: { name: "Anne Hansen", initials: "AH" },
    participants: [
      { name: "Per Olsen", initials: "PO", role: "VERNEOMBUD" },
      { name: "Mari Svendsen", initials: "MS", role: "HMS_ANSVARLIG" }
    ],
    findings: [
      { id: "f1", description: "Blokkert nødutgang", severity: "HIGH", status: "RESOLVED" },
      { id: "f2", description: "Manglende førstehjelpsutstyr", severity: "MEDIUM", status: "RESOLVED" }
    ],
    totalImages: 4,
    template: "Standard kontorvernerunde"
  },
  {
    id: "2",
    title: "Lager - månedlig sjekk",
    status: "IN_PROGRESS",
    location: "Varelager A",
    dueDate: "2023-05-20",
    completedDate: null,
    assignedUser: { name: "Tor Eriksen", initials: "TE" },
    participants: [
      { name: "Lise Jørgensen", initials: "LJ", role: "VERNEOMBUD" }
    ],
    findings: [
      { id: "f3", description: "Skadede paller", severity: "MEDIUM", status: "OPEN" },
      { id: "f4", description: "Dårlig belysning", severity: "LOW", status: "IN_PROGRESS" }
    ],
    totalImages: 2,
    template: "Ukentlig lagersjekk"
  },
  {
    id: "3",
    title: "Produksjonsområde - HMS-runde",
    status: "SCHEDULED",
    location: "Produksjonshall B",
    dueDate: "2023-06-05",
    completedDate: null,
    assignedUser: { name: "Kari Olsen", initials: "KO" },
    participants: [
      { name: "John Doe", initials: "JD", role: "VERNEOMBUD" },
      { name: "Trond Nilsen", initials: "TN", role: "ANSATT" }
    ],
    findings: [],
    totalImages: 0,
    template: "Produksjon HMS-sjekk"
  }
]

// Eksempeldata for sjekklisten
const exampleChecklistItems = [
  { id: "c1", category: "Rømningsveier", question: "Er alle rømningsveier tydelig merket?", checked: true },
  { id: "c2", category: "Rømningsveier", question: "Er rømningsveier fri for hindringer?", checked: true },
  { id: "c3", category: "Brannvern", question: "Er brannslukningsapparater lett tilgjengelige?", checked: false },
  { id: "c4", category: "Brannvern", question: "Er branninstruks synlig?", checked: true },
  { id: "c5", category: "Førstehjelpsutstyr", question: "Er førstehjelpsutstyr komplett?", checked: false },
  { id: "c6", category: "Førstehjelpsutstyr", question: "Er førstehjelpsutstyr lett tilgjengelig?", checked: true },
  { id: "c7", category: "Ergonomi", question: "Er arbeidsplassene ergonomisk tilrettelagt?", checked: true },
  { id: "c8", category: "Renhold", question: "Er det generelt god orden?", checked: true }
]

export default function VernerundePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Strukturerte data for SEO */}
      <ModuleSEO 
        title={metadata.title as string}
        description={metadata.description as string}
        moduleName="Vernerunde"
        moduleSlug="vernerunde"
        features={featuresData.map(f => f.title)}
      />
      
      <PageHeader 
        title="Vernerunder" 
        description="Digitale vernerunder for systematisk kartlegging av arbeidsmiljøet" 
      />
      
      <main className="flex-grow">
        {/* Intro */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-[#17304F]">Effektive vernerunder gjort enkelt</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Lovpålagte vernerunder er et viktig verktøy for å kartlegge og forbedre arbeidsmiljøet. Med vår digitale løsning kan du:
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Planlegge og gjennomføre vernerunder effektivt",
                    "Dokumentere avvik med bilder direkte i appen",
                    "Opprette og følge opp tiltak automatisk",
                    "Involvere verneombud og andre relevante deltakere",
                    "Generere detaljerte rapporter for dokumentasjon"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-[#17304F] hover:bg-[#2C435F]">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    <Link href="/register">Prøv gratis</Link>
                  </Button>
                  <ContactModal>
                    <Button variant="outline">
                      Få en demonstrasjon
                    </Button>
                  </ContactModal>
                </div>
              </div>
              
              {/* Designelement som viser vernerunder i appen - erstatter bilde */}
              <div className="rounded-xl overflow-hidden shadow-xl">
                <div className="bg-gradient-to-br from-[#17304F] to-[#2C5282] p-4">
                  <div className="flex items-center justify-between text-white mb-3">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5" />
                      <span className="font-semibold">HMS Nova Vernerunder</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="h-8 text-white hover:bg-white/20">
                        <Plus className="h-4 w-4 mr-1" />
                        Ny vernerunde
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-3 border-b flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8">
                          <Search className="h-3.5 w-3.5 mr-1" />
                          Søk
                        </Button>
                        <Button size="sm" variant="outline" className="h-8">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          Filter
                        </Button>
                      </div>
                      <div className="text-sm text-gray-500">Viser 3 av 12 vernerunder</div>
                    </div>
                    
                    <div className="max-h-[280px] overflow-y-auto">
                      {exampleSafetyRounds.map((round) => (
                        <div key={round.id} className="p-4 border-b hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{round.title}</h3>
                                <Badge className={`
                                  ${round.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                    round.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 
                                    round.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : 
                                    'bg-gray-100 text-gray-800'}
                                `}>
                                  {round.status === 'COMPLETED' ? 'Fullført' : 
                                   round.status === 'IN_PROGRESS' ? 'Pågår' : 
                                   round.status === 'SCHEDULED' ? 'Planlagt' : 'Utkast'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  <span>{round.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>Frist: {round.dueDate}</span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                          
                          <div className="flex gap-4 mt-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Users className="h-4 w-4 text-gray-400" />
                              <div className="flex -space-x-2">
                                {round.participants.map((p, i) => (
                                  <Avatar key={i} className="h-6 w-6 border-2 border-white">
                                    <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                                      {p.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              <span>{round.participants.length}</span>
                            </div>
                            
                            {round.findings.length > 0 && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <AlertCircle className="h-4 w-4 text-gray-400" />
                                <span>{round.findings.length} funn</span>
                              </div>
                            )}
                            
                            {round.totalImages > 0 && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <ImageIcon className="h-4 w-4 text-gray-400" />
                                <span>{round.totalImages}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Lovkrav */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6 text-[#17304F]">Oppfyll lovkrav med dokumenterte vernerunder</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Arbeidsmiljøloven og internkontrollforskriften stiller krav til regelmessige vernerunder. Med HMS Nova sikrer du at disse gjennomføres systematisk og dokumenteres forskriftsmessig.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
              <h3 className="text-xl font-semibold mb-4 text-center">Forskriftskrav om vernerunder</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#17304F] rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">§</div>
                    <div>
                      <h4 className="font-medium">Arbeidsmiljøloven § 3-1</h4>
                      <p className="text-gray-600 text-sm">Krav om systematisk HMS-arbeid og kartlegging av arbeidsmiljøet</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#17304F] rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">§</div>
                    <div>
                      <h4 className="font-medium">Internkontrollforskriften § 5</h4>
                      <p className="text-gray-600 text-sm">Krav om kartlegging av farer og problemer i virksomheten</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#17304F] rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">§</div>
                    <div>
                      <h4 className="font-medium">Arbeidsmiljøloven § 6-2</h4>
                      <p className="text-gray-600 text-sm">Verneombudets rett til medvirkning i kartlegging og kontroll</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#17304F] rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">§</div>
                    <div>
                      <h4 className="font-medium">Forskrift om organisering § 2-4</h4>
                      <p className="text-gray-600 text-sm">AMU-deltakelse i undersøkelser av arbeidsmiljøet</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Funksjoner */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-12 text-center text-[#17304F]">
              Funksjoner i vår vernerundemodul
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuresData.map((feature, index) => (
                <Card key={index} className="border-none shadow-lg">
                  <CardContent className="pt-6">
                    <div className="mb-5">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Stegvis prosess */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-12 text-center text-[#17304F]">
              Vernerunder i fire enkle steg
            </h2>
            
            <div className="max-w-4xl mx-auto space-y-12">
              {[
                {
                  num: "01",
                  title: "Planlegging",
                  desc: "Velg deltakere, områder som skal gjennomgås og tilpass sjekklister til din virksomhet."
                },
                {
                  num: "02",
                  title: "Gjennomføring",
                  desc: "Bruk appen til å registrere observasjoner, ta bilder og notere avvik underveis."
                },
                {
                  num: "03",
                  title: "Oppfølging",
                  desc: "Oppsummer funn, opprett tiltak og fordel ansvar med tidsfrister."
                },
                {
                  num: "04",
                  title: "Dokumentasjon",
                  desc: "Generer automatisk rapport og evaluer fremgang før neste vernerunde."
                }
              ].map((step, index) => (
                <div key={index} className="flex gap-8 items-start">
                  <div className="w-16 h-16 bg-[#17304F] rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Fordeler */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl font-bold mb-6 text-[#17304F]">Fordeler med digitale vernerunder</h2>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2 flex items-center">
                      <CalendarCheck className="h-6 w-6 mr-2 text-[#17304F]" /> Spar tid og ressurser
                    </h3>
                    <p className="text-gray-700">
                      Reduser tidsbruken på vernerunder med opptil 50% ved å bruke digitale skjemaer i stedet for papir. Unngå dobbeltarbeid med registrering.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2 flex items-center">
                      <ListChecks className="h-6 w-6 mr-2 text-[#17304F]" /> Bedre kvalitet og oppfølging
                    </h3>
                    <p className="text-gray-700">
                      Strukturerte sjekklister og automatisk oppfølging sikrer at ingenting blir glemt og at alle tiltak gjennomføres som planlagt.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2 flex items-center">
                      <BarChart3 className="h-6 w-6 mr-2 text-[#17304F]" /> Se trender over tid
                    </h3>
                    <p className="text-gray-700">
                      Få innsikt i utviklingen av arbeidsmiljøet med statistikk og rapporter som viser fremgang og forbedringer.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Designelement som viser vernerunde-app på mobil - erstatter bilde */}
              <div className="order-1 md:order-2 rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-br from-[#17304F] to-[#2C5282] p-4 pt-8 pb-12">
                  <div className="mx-auto w-[280px] h-[500px] bg-white rounded-3xl overflow-hidden shadow-xl border-8 border-gray-800 relative">
                    {/* Mobil-header med tid og ikoner */}
                    <div className="h-6 bg-gray-800 w-full flex justify-between items-center px-4">
                      <div className="text-white text-[10px]">09:41</div>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* App innhold */}
                    <div className="flex flex-col h-full">
                      <div className="p-3 border-b flex items-center justify-between bg-gray-50">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="h-5 w-5 text-[#17304F]" />
                          <div className="font-semibold text-sm">HMS Nova</div>
                        </div>
                        <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Vernerunde</div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-medium text-sm mb-1">Hovedkontor - Q1 vernerunde</h3>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs h-5">Pågår</Badge>
                          <div className="text-xs text-gray-500">10 av 24 punkter</div>
                        </div>
                        
                        <Tabs defaultValue="checklist" className="mt-4">
                          <TabsList className="grid w-full grid-cols-2 h-8">
                            <TabsTrigger value="checklist" className="text-xs py-1">Sjekkliste</TabsTrigger>
                            <TabsTrigger value="findings" className="text-xs py-1">Funn (2)</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="checklist" className="mt-2">
                            <div className="space-y-3">
                              <div className="text-xs font-medium text-gray-500 mt-2">Rømningsveier</div>
                              {exampleChecklistItems.slice(0, 4).map((item) => (
                                <div key={item.id} className="flex items-center gap-3 border p-2 rounded bg-gray-50">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                    {item.checked && <Check className="h-3 w-3 text-white" />}
                                  </div>
                                  <div className="text-xs">{item.question}</div>
                                </div>
                              ))}
                              
                              <div className="text-xs font-medium text-gray-500 mt-3">Førstehjelpsutstyr</div>
                              {exampleChecklistItems.slice(4, 6).map((item) => (
                                <div key={item.id} className="flex items-center gap-3 border p-2 rounded bg-gray-50">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                    {item.checked && <Check className="h-3 w-3 text-white" />}
                                  </div>
                                  <div className="text-xs">{item.question}</div>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="findings" className="mt-2">
                            <div className="space-y-3">
                              {exampleSafetyRounds[0].findings.map((finding) => (
                                <div key={finding.id} className="border rounded p-3 bg-gray-50">
                                  <div className="flex justify-between items-start">
                                    <div className="text-xs font-medium">{finding.description}</div>
                                    <Badge className={`
                                      ${finding.severity === 'HIGH' ? 'bg-red-100 text-red-800' : 
                                        finding.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-800' : 
                                        'bg-yellow-100 text-yellow-800'}
                                    `}>
                                      {finding.severity === 'HIGH' ? 'Høy' : 
                                       finding.severity === 'MEDIUM' ? 'Middels' : 'Lav'}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between mt-2">
                                    <div className="text-[10px] text-gray-500">Registrert: 10.03.2023</div>
                                    <Badge className={`
                                      ${finding.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 
                                        finding.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                                        'bg-gray-100 text-gray-800'}
                                    `}>
                                      {finding.status === 'RESOLVED' ? 'Løst' : 
                                       finding.status === 'IN_PROGRESS' ? 'Under arbeid' : 'Åpen'}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                              
                              <button className="w-full py-2 text-xs border border-dashed border-gray-300 rounded-md text-gray-500 flex items-center justify-center mt-2">
                                <Plus className="h-3 w-3 mr-1" />
                                Legg til nytt funn
                              </button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                      
                      <div className="mt-auto border-t p-3 bg-gray-50 flex justify-between">
                        <Button size="sm" variant="outline" className="text-xs h-8 px-2">
                          <X className="h-3 w-3 mr-1" />
                          Avbryt
                        </Button>
                        <Button size="sm" className="text-xs h-8 px-3 bg-[#17304F]">
                          <FileText className="h-3 w-3 mr-1" />
                          Fullfør
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-16 px-4 bg-[#17304F] text-white">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-6">Kom i gang med digitale vernerunder i dag</h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Effektiviser HMS-arbeidet, involvér flere i vernerundene og få bedre resultater med HMS Nova.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#17304F] hover:bg-white/90">
                <Link href="/register">Prøv gratis i 14 dager</Link>
              </Button>
              <ContactModal>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Kontakt oss
                </Button>
              </ContactModal>
            </div>
            <p className="mt-4 text-sm text-white/60">Ingen kredittkort nødvendig. Avbryt når som helst.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
