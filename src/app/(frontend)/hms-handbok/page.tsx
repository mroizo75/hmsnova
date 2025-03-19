import React from "react";
import Link from "next/link";
import { Book, BookOpen, CheckCircle, Download, FileText, Shield, History, GitBranch, Link2, AlertCircle, Clock, FileCheck, GitPullRequest, ChevronRight, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/front/page-header";
import { ContactModal } from "@/components/contact-modal";
import { Badge } from "@/components/ui/badge";

export default function HMSHandbokPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="HMS-håndbok" 
        description="En profesjonell og tilpasset HMS-håndbok er grunnlaget for godt HMS-arbeid" 
      />
      
      <main className="flex-grow">
        {/* Introduksjon */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-[#17304F]">Alt du trenger for lovpålagt HMS-dokumentasjon</h2>
                <p className="text-lg text-gray-700 mb-4">
                  HMS-håndboken er bedriftens viktigste dokument for systematisk HMS-arbeid. Med vår digitale løsning får du:
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Ferdig malverk tilpasset din bransje",
                    "Automatisk oppdateringer ved regelverksendringer",
                    "Tilgangsstyring for alle ansatte",
                    "Integrasjon med andre HMS-moduler",
                    "Dokumentbibliotek med søkefunksjon",
                    "Versjonskontroll med historisk data på endringer",
                    "Kobling mellom avvik/risikovurderinger og dokumentendringer"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-[#17304F] hover:bg-[#2C435F]">
                    <FileText className="mr-2 h-4 w-4" />
                    Få digital håndbok nå
                  </Button>
                  <ContactModal>
                    <Button variant="outline">
                      Bestill en demo
                    </Button>
                  </ContactModal>
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden shadow-xl">
                {/* Designelement som erstatter bildet */}
                <div className="bg-gradient-to-br from-[#17304F] to-[#2C5282] p-8 h-[400px] w-full flex flex-col">
                  {/* Topplinje med tittel og versjon */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-t-lg p-4 flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 text-white">
                      <Book className="h-5 w-5" />
                      <span className="font-semibold">HMS Nova Håndbok</span>
                    </div>
                    <Badge className="bg-blue-400/80 text-white hover:bg-blue-500/80">v3.2</Badge>
                  </div>
                  
                  {/* Innhold i håndboken */}
                  <div className="flex-grow flex gap-4">
                    {/* Venstre kolonne - innholdsfortegnelse */}
                    <div className="w-1/3 bg-white/5 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-white/70 text-sm font-medium mb-3">INNHOLD</div>
                      <div className="space-y-2">
                        <div className="bg-white/20 text-white rounded px-3 py-2 text-sm">Generelt</div>
                        <div className="text-white/80 px-3 py-2 text-sm">HMS-mål</div>
                        <div className="text-white/80 px-3 py-2 text-sm">Organisering</div>
                        <div className="text-white/80 px-3 py-2 text-sm">Rutiner</div>
                        <div className="text-white/80 px-3 py-2 text-sm">Beredskap</div>
                      </div>
                    </div>
                    
                    {/* Høyre kolonne - hovedinnhold */}
                    <div className="w-2/3 bg-white rounded-lg p-4 flex flex-col">
                      <div className="border-b pb-2 mb-3 flex justify-between items-center">
                        <h3 className="font-bold text-[#17304F]">HMS-håndbok</h3>
                        <div className="flex items-center text-xs text-gray-500 gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Oppdatert: 15.06.2023</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 flex-grow">
                        <p>Denne håndboken inneholder bedriftens retningslinjer og rutiner for systematisk HMS-arbeid.</p>
                        <p>Håndboken er et levende dokument som oppdateres jevnlig basert på erfaringer og endringer i lover og forskrifter.</p>
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <div className="flex gap-2">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Godkjent
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md flex items-center">
                            <History className="h-3 w-3 mr-1" /> 12 revisjoner
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bunntekst med handlingsknapper */}
                  <div className="mt-6 flex justify-between">
                    <div className="flex gap-2">
                      <div className="bg-white/10 backdrop-blur-sm text-white rounded-lg px-3 py-2 text-sm flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        Last ned
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm text-white rounded-lg px-3 py-2 text-sm flex items-center">
                        <History className="h-4 w-4 mr-2" />
                        Historikk
                      </div>
                    </div>
                    <div className="bg-white text-[#17304F] rounded-lg px-3 py-2 text-sm font-medium flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Rediger
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
              Fordeler med digital HMS-håndbok
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Shield className="h-10 w-10 text-[#17304F]" />,
                  title: "Alltid oppdatert",
                  description: "Vi holder håndboken din oppdatert med gjeldende lover og forskrifter, så du alltid er på den sikre siden."
                },
                {
                  icon: <BookOpen className="h-10 w-10 text-[#17304F]" />,
                  title: "Tilgjengelig overalt",
                  description: "Håndboken kan nås fra alle enheter, slik at ansatte alltid har tilgang til viktig HMS-informasjon."
                },
                {
                  icon: <Download className="h-10 w-10 text-[#17304F]" />,
                  title: "Eksport og deling",
                  description: "Eksporter hele eller deler av håndboken til PDF eller del direkte med ansatte og samarbeidspartnere."
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
        
        {/* Versjonskontroll seksjon */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl font-bold mb-6 text-[#17304F]">Full versjonskontroll og sporbarhet</h2>
                <p className="text-lg text-gray-700 mb-6">
                  Hold oversikt over alle endringer i HMS-dokumentasjonen med vår kraftige versjonskontroll:
                </p>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="bg-[#17304F]/10 p-3 rounded-lg">
                        <History className="h-6 w-6 text-[#17304F]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Historisk data</h3>
                      <p className="text-gray-600">Se nøyaktig hvem som gjorde hvilke endringer, når endringen ble gjort, og hvorfor. Sammenlign tidligere versjoner og gjenopprett om nødvendig.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="bg-[#17304F]/10 p-3 rounded-lg">
                        <Link2 className="h-6 w-6 text-[#17304F]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Kobling til avvik og risikovurderinger</h3>
                      <p className="text-gray-600">Spor endringer i håndboken direkte til avvik eller risikovurderinger som utløste endringen, og dokumenter effektivt hvordan HMS-arbeidet forbedrer seg over tid.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="bg-[#17304F]/10 p-3 rounded-lg">
                        <AlertCircle className="h-6 w-6 text-[#17304F]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Revisjonsvarsler</h3>
                      <p className="text-gray-600">Automatiske varsler når dokumenter må revideres, med tydelig historikk over tidligere revisjoner og hvilke hendelser som utløste dem.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                {/* HMS-håndbok dummy versjon med versjonskontroll */}
                <div className="bg-white border rounded-lg shadow-xl overflow-hidden">
                  {/* Topbar med tittel og versjonskontroll */}
                  <div className="bg-[#17304F] text-white p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <span className="font-semibold">HMS-håndbok</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-500 hover:bg-blue-600">Versjon 3.2</Badge>
                      <History className="h-4 w-4" />
                    </div>
                  </div>
                  
                  {/* Innholdsfortegnelse og hovedinnhold */}
                  <div className="flex">
                    {/* Sidebar/ToC */}
                    <div className="w-1/3 bg-gray-50 p-3 border-r">
                      <div className="text-sm font-medium mb-3 text-gray-500">INNHOLD</div>
                      <ul className="space-y-2 text-sm">
                        <li className="p-2 bg-blue-50 text-blue-700 rounded font-medium">Generelt</li>
                        <li className="p-2 hover:bg-gray-100 rounded">Ansvar og roller</li>
                        <li className="p-2 hover:bg-gray-100 rounded">Rutiner</li>
                        <li className="p-2 hover:bg-gray-100 rounded">Beredskap</li>
                        <li className="p-2 hover:bg-gray-100 rounded">Dokumentasjon</li>
                      </ul>
                    </div>
                    
                    {/* Hovedinnhold */}
                    <div className="w-2/3 p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Generelt</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>Oppdatert 12.06.2023</span>
                        </div>
                      </div>
                      
                      {/* Dummy innhold */}
                      <div className="space-y-3 text-sm">
                        <p className="text-gray-700">
                          Denne håndboken beskriver HMS-systemet for vår virksomhet i henhold til Internkontrollforskriften.
                        </p>
                        <p className="text-gray-700">
                          Håndboken inkluderer alle nødvendige rutiner, prosedyrer og dokumentasjon.
                        </p>
                      </div>
                      
                      {/* Endringshistorikk panel */}
                      <div className="mt-8 border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-sm">Endringshistorikk</h4>
                          <GitCompare className="h-4 w-4 text-gray-500" />
                        </div>
                        
                        <div className="space-y-3">
                          {/* Endringsoppføringer */}
                          <div className="bg-gray-50 p-3 rounded-md text-sm border">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">Oppdatert prosedyre for fallsikring</div>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Implementert</Badge>
                            </div>
                            <div className="text-gray-500 text-xs mt-1">Basert på avvik #237 - Manglende rutiner for arbeid i høyden</div>
                            <div className="mt-2 text-xs flex items-center text-blue-600">
                              <FileCheck className="h-3 w-3 mr-1" />
                              <span>Koblet til risikovurdering "Arbeid i høyden"</span>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-md text-sm border">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">Revidert nødprosedyrer</div>
                              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Under arbeid</Badge>
                            </div>
                            <div className="text-gray-500 text-xs mt-1">Endring utløst av risikovurdering #185</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-sm text-blue-600 flex items-center justify-end">
                          <span>Se alle endringer</span>
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Prosess */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-12 text-center text-[#17304F]">
              Slik fungerer det
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { num: "01", title: "Velg bransje", desc: "Start med en ferdig mal tilpasset din bransje" },
                { num: "02", title: "Tilpass innhold", desc: "Rediger og legg til det som er spesifikt for din bedrift" },
                { num: "03", title: "Publiser", desc: "Gjør håndboken tilgjengelig for alle ansatte" },
                { num: "04", title: "Vedlikehold", desc: "Hold dokumentasjonen oppdatert med automatiske varsler" }
              ].map((step, index) => (
                <div key={index} className="relative p-6 border border-gray-200 rounded-lg">
                  <div className="text-3xl font-bold text-[#17304F] mb-4">{step.num}</div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-16 px-4 bg-[#17304F] text-white">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-6">Klar til å forbedre HMS-arbeidet?</h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Start med en profesjonell HMS-håndbok som legger grunnlaget for systematisk HMS-arbeid i din bedrift.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#17304F] hover:bg-white/90">
                Kom i gang nå
              </Button>
              <ContactModal>
                <Button size="lg" variant="outline" className="border-white text-[#17304F] hover:text-white hover:bg-white/10">
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
