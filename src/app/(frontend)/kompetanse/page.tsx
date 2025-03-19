import React from "react";
import Link from "next/link";
import { Award, CheckCircle, Calendar, FileText, Shield, Users, Sliders, BarChart, ListChecks, BadgeCheck, AlertCircle, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/front/page-header";
import { ContactModal } from "@/components/contact-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function KompetansePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Kompetansehåndtering" 
        description="Systematisk oversikt og kontroll på ansattes kompetanse, sertifikater og opplæring" 
      />
      
      <main className="flex-grow">
        {/* Introduksjon */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-[#17304F]">Ta kontroll over bedriftens kompetanse</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Effektiv kompetansestyring er avgjørende for å sikre at ansatte har den nødvendige kunnskapen og 
                  sertifiseringene for å utføre jobben sikkert og effektivt. Med vår kompetansestyringsmodul får du:
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Oversikt over alle kompetanser, sertifikater og kurs",
                    "Automatiske påminnelser om utløpende sertifiseringer",
                    "Dokumentasjon på gjennomført opplæring",
                    "Integrasjon med HMS-systemet",
                    "Rapportering og analyser",
                    "Verifisering av kompetanser",
                    "Digitalt arkiv for sertifikater og kursbevis"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-[#17304F] hover:bg-[#2C435F]">
                    <Award className="mr-2 h-4 w-4" />
                    Kom i gang med kompetansestyring
                  </Button>
                  <ContactModal>
                    <Button variant="outline">
                      Bestill en demo
                    </Button>
                  </ContactModal>
                </div>
              </div>
              
              <div className="relative rounded-xl overflow-hidden shadow-xl">
                {/* Designelement som visualiserer kompetansestyringsmodulen */}
                <div className="bg-gradient-to-br from-[#17304F] to-[#2C5282] p-8 h-[400px] w-full flex flex-col">
                  {/* Topplinje med navigasjon */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-t-lg p-4 flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 text-white">
                      <Award className="h-5 w-5" />
                      <span className="font-semibold">Kompetanseoversikt</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-400/80 text-white hover:bg-blue-500/80">Sertifikater</Badge>
                      <Badge className="bg-white/20 text-white hover:bg-white/30">Statistikk</Badge>
                    </div>
                  </div>
                  
                  {/* Kompetanseinnhold */}
                  <div className="flex-grow grid grid-cols-3 gap-4">
                    {/* Kompetansekort */}
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="bg-white/5 backdrop-blur-sm rounded-lg p-4 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{
                              index === 0 ? "Truck sertifikat" : 
                              index === 1 ? "Varmt arbeid" : 
                              "Fallsikring"
                            }</span>
                            <span className="text-white/70 text-xs">
                              {index === 0 ? "Per Hansen" : index === 1 ? "Kari Olsen" : "Ola Nordmann"}
                            </span>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            index === 0 ? "bg-green-500/20 text-green-100" : 
                            index === 1 ? "bg-yellow-500/20 text-yellow-100" : 
                            "bg-red-500/20 text-red-100"
                          }`}>
                            {index === 0 ? "Gyldig" : index === 1 ? "Utløper snart" : "Utløpt"}
                          </div>
                        </div>
                        
                        <div className="space-y-2 mt-2 flex-grow">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/70">Oppnådd:</span>
                            <span className="text-white">
                              {index === 0 ? "15.03.2023" : index === 1 ? "05.09.2022" : "10.12.2021"}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/70">Utløper:</span>
                            <span className="text-white">
                              {index === 0 ? "15.03.2026" : index === 1 ? "05.09.2024" : "10.12.2023"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-white/10 flex justify-end">
                          <div className="text-white/80 text-xs px-2 py-1 rounded bg-white/10 flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            <span>Se sertifikat</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Bunntekst med informasjon */}
                  <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-3 flex justify-between items-center">
                    <div className="text-white/80 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>3 sertifikater utløper innen 30 dager</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-blue-600 text-white rounded-lg px-3 py-2 text-xs flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Forny</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Fordeler */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-12 text-center text-[#17304F]">
              Fordeler med digital kompetansestyring
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Calendar className="h-10 w-10 text-[#17304F]" />,
                  title: "Automatiske påminnelser",
                  description: "Få varsler når sertifikater nærmer seg utløpsdato, slik at du aldri risikerer å ha utløpte sertifiseringer."
                },
                {
                  icon: <Shield className="h-10 w-10 text-[#17304F]" />,
                  title: "Lovpålagt dokumentasjon",
                  description: "Oppfyll kravene til dokumentasjon på opplæring og sertifisering som kreves av Arbeidsmiljøloven."
                },
                {
                  icon: <BarChart className="h-10 w-10 text-[#17304F]" />,
                  title: "Kompetanseoversikt",
                  description: "Full oversikt over all kompetanse i bedriften, med mulighet for rapportering og planlegging av opplæring."
                }
              ].map((feature, index) => (
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
        
        {/* Kompetansetyper */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-8 text-center text-[#17304F]">
              Håndter alle typer kompetanse
            </h2>
            <p className="text-center text-lg text-gray-700 max-w-3xl mx-auto mb-12">
              HMS Nova sin kompetansestyringsmodul er fleksibel og kan tilpasses ulike bransjer og kompetansetyper, fra lovpålagte sertifikater til interne opplæringsprogrammer.
            </p>
            
            <Tabs defaultValue="certificates" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="certificates">Sertifikater</TabsTrigger>
                <TabsTrigger value="courses">Kurs og opplæring</TabsTrigger>
                <TabsTrigger value="internal">Intern kompetanse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="certificates">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 text-[#17304F]">Lovpålagte sertifikater og godkjenninger</h3>
                  <p className="text-gray-700 mb-6">
                    Hold styr på sertifikater som er påkrevd av lover og forskrifter, og sikre at alle ansatte har gyldig dokumentasjon:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      "Maskinførerbevis", "Varmt arbeid", "Stillasbygger", 
                      "Fallsikring", "Truck/kran", "Elektrofag", 
                      "FSE", "Førerkort", "Dykkerbevis"
                    ].map((cert, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white p-3 rounded-md shadow-sm border border-gray-200">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="courses">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 text-[#17304F]">Kurs og opplæringsprogrammer</h3>
                  <p className="text-gray-700 mb-6">
                    Dokumenter gjennomført opplæring og kurs, og sørg for at ansatte får nødvendig påfyll av kunnskap:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "HMS Grunnkurs", duration: "8 timer" },
                      { name: "Førstehjelp", duration: "16 timer" },
                      { name: "Brannvern", duration: "4 timer" },
                      { name: "Sikker jobbanalyse", duration: "4 timer" },
                      { name: "Stoffkartotek", duration: "2 timer" },
                      { name: "Risikovurdering", duration: "8 timer" }
                    ].map((course, index) => (
                      <div key={index} className="flex justify-between items-center bg-white p-4 rounded-md shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-green-600" />
                          <span>{course.name}</span>
                        </div>
                        <Badge variant="outline">{course.duration}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="internal">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 text-[#17304F]">Intern kompetanseutvikling</h3>
                  <p className="text-gray-700 mb-6">
                    Registrer og følg opp interne opplæringsprogrammer, mentorordninger og kompetanseoverføring:
                  </p>
                  
                  <div className="space-y-4">
                    {[
                      { name: "Sidemannsopplæring", category: "Produksjon", status: "Pågående" },
                      { name: "Kvalitetssystem", category: "Administrasjon", status: "Fullført" },
                      { name: "Prosjektledelse", category: "Ledelse", status: "Planlagt" },
                      { name: "Kundehåndtering", category: "Salg", status: "Fullført" }
                    ].map((program, index) => (
                      <div key={index} className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{program.name}</h4>
                            <p className="text-sm text-gray-500">Kategori: {program.category}</p>
                          </div>
                          <Badge className={`${
                            program.status === "Fullført" ? "bg-green-100 text-green-800" :
                            program.status === "Pågående" ? "bg-blue-100 text-blue-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {program.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* Integrasjon med HMS */}
        <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl font-bold mb-6 text-[#17304F]">Integrert med HMS-systemet</h2>
                <p className="text-lg text-gray-700 mb-6">
                  Kompetansestyringsmodulen er fullt integrert med resten av HMS-systemet, noe som gir en rekke fordeler:
                </p>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="bg-[#17304F]/10 p-3 rounded-lg">
                        <Sliders className="h-6 w-6 text-[#17304F]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Tilgang til nødvendig dokumentasjon</h3>
                      <p className="text-gray-600">Knytt lovpålagte sertifiseringer direkte til arbeidsoppgaver i risikovurderinger, sikre jobbanalyser og aktivitetsplaner.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="bg-[#17304F]/10 p-3 rounded-lg">
                        <Users className="h-6 w-6 text-[#17304F]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Kompetansekrav per rolle</h3>
                      <p className="text-gray-600">Definer nødvendig kompetanse for ulike roller og få automatisk varsling når ansatte mangler påkrevd opplæring.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="bg-[#17304F]/10 p-3 rounded-lg">
                        <BadgeCheck className="h-6 w-6 text-[#17304F]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Kompetanse ved avvik</h3>
                      <p className="text-gray-600">Ved registrering av avvik kan systemet automatisk sjekke om involvert personell hadde nødvendig kompetanse for oppgaven.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 md:order-2">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
                  <div className="bg-[#17304F] text-white p-5">
                    <h3 className="text-xl font-bold mb-2 flex items-center">
                      <ListChecks className="h-5 w-5 mr-2" />
                      HMS Nova integrasjoner
                    </h3>
                    <p className="text-sm text-white/80">
                      Kompetansestyring integrert med HMS-systemets moduler
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { name: "Avviksbehandling", color: "border-red-200 bg-red-50" },
                        { name: "Risikovurdering", color: "border-orange-200 bg-orange-50" },
                        { name: "Sikker jobbanalyse", color: "border-green-200 bg-green-50" },
                        { name: "HMS-handbok", color: "border-blue-200 bg-blue-50" },
                        { name: "Vernerunde", color: "border-purple-200 bg-purple-50" },
                        { name: "Kompetansestyring", color: "border-indigo-200 bg-indigo-50 font-semibold" }
                      ].map((module, index) => (
                        <div 
                          key={index} 
                          className={`border ${module.color} rounded-lg p-4 flex items-center gap-2`}
                        >
                          <div className={`w-3 h-3 rounded-full ${module.name === "Kompetansestyring" ? "bg-indigo-500" : "bg-gray-300"}`}></div>
                          <span>{module.name}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-start">
                        <div className="bg-indigo-100 p-2 rounded-full mr-4">
                          <Award className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Kompetansestyring aktivert</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Modulen er integrert med hele HMS-systemet og deler data med andre moduler
                          </p>
                        </div>
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
            <h2 className="text-3xl font-bold mb-6">Klar til å ta kontroll over kompetansestyringen?</h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Få full oversikt over ansattes kompetanse, sertifikater og opplæringsbehov. 
              Prøv HMS Nova gratis i 14 dager.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#17304F] hover:bg-white/90">
                Kom i gang nå
              </Button>
              <ContactModal>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Kontakt oss
                </Button>
              </ContactModal>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
