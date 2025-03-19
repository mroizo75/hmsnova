import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, CalendarCheck, CheckCircle, LayoutGrid, LineChart, ListChecks, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/front/page-header";
import Footer from "@/components/front/footer";
import { ContactModal } from "@/components/contact-modal";

export default function RisikovurderingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Risikovurdering" 
        description="Identifiser, vurder og håndter risiko systematisk og effektivt" 
      />
      
      <main className="flex-grow">
        {/* Intro */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-[#17304F]">Lovpålagt risikovurdering gjort enkelt</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Alle virksomheter er pålagt å gjennomføre risikovurderinger. Vår digitale løsning gjør det enkelt å:
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Identifisere farer og problemer",
                    "Vurdere sannsynlighet og konsekvens",
                    "Dokumentere eksisterende tiltak",
                    "Planlegge nye tiltak",
                    "Følge opp og evaluere effekten"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-[#17304F] hover:bg-[#2C435F]">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <Link href="/register">Prøv gratis</Link>
                  </Button>
                  <ContactModal>
                    <Button variant="outline">
                      Få en demonstrasjon
                    </Button>
                  </ContactModal>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden shadow-xl">
                <Image 
                  src="/images/risk-assessment.jpg" 
                  alt="Risikovurdering" 
                  width={600} 
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Risikomatrise */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6 text-[#17304F]">Risikomatrise og risikoanalyse</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
                Bruk vår intuitive risikomatrise for å klassifisere og prioritere risikoer basert på sannsynlighet og konsekvens.
              </p>
              
              <div className="bg-white p-8 rounded-xl shadow-lg inline-block">
                <div className="grid grid-cols-6 gap-1">
                  <div className="p-3 bg-gray-200 font-bold text-center">S/K</div>
                  <div className="p-3 bg-gray-200 font-bold text-center">Ubetydelig</div>
                  <div className="p-3 bg-gray-200 font-bold text-center">Lav</div>
                  <div className="p-3 bg-gray-200 font-bold text-center">Moderat</div>
                  <div className="p-3 bg-gray-200 font-bold text-center">Alvorlig</div>
                  <div className="p-3 bg-gray-200 font-bold text-center">Kritisk</div>
                  
                  <div className="p-3 bg-gray-200 font-bold text-center">Svært sannsynlig</div>
                  <div className="p-3 bg-yellow-100 text-center">5</div>
                  <div className="p-3 bg-orange-100 text-center">10</div>
                  <div className="p-3 bg-red-200 text-center">15</div>
                  <div className="p-3 bg-red-400 text-center text-white">20</div>
                  <div className="p-3 bg-red-600 text-center text-white">25</div>
                  
                  <div className="p-3 bg-gray-200 font-bold text-center">Sannsynlig</div>
                  <div className="p-3 bg-green-100 text-center">4</div>
                  <div className="p-3 bg-yellow-100 text-center">8</div>
                  <div className="p-3 bg-orange-100 text-center">12</div>
                  <div className="p-3 bg-red-200 text-center">16</div>
                  <div className="p-3 bg-red-400 text-center text-white">20</div>
                  
                  <div className="p-3 bg-gray-200 font-bold text-center">Mulig</div>
                  <div className="p-3 bg-green-100 text-center">3</div>
                  <div className="p-3 bg-green-100 text-center">6</div>
                  <div className="p-3 bg-yellow-100 text-center">9</div>
                  <div className="p-3 bg-orange-100 text-center">12</div>
                  <div className="p-3 bg-red-200 text-center">15</div>
                  
                  <div className="p-3 bg-gray-200 font-bold text-center">Mindre sannsynlig</div>
                  <div className="p-3 bg-green-100 text-center">2</div>
                  <div className="p-3 bg-green-100 text-center">4</div>
                  <div className="p-3 bg-green-100 text-center">6</div>
                  <div className="p-3 bg-yellow-100 text-center">8</div>
                  <div className="p-3 bg-orange-100 text-center">10</div>
                  
                  <div className="p-3 bg-gray-200 font-bold text-center">Usannsynlig</div>
                  <div className="p-3 bg-green-100 text-center">1</div>
                  <div className="p-3 bg-green-100 text-center">2</div>
                  <div className="p-3 bg-green-100 text-center">3</div>
                  <div className="p-3 bg-green-100 text-center">4</div>
                  <div className="p-3 bg-yellow-100 text-center">5</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Funksjoner */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-12 text-center text-[#17304F]">
              Funksjoner i vår risikovurderingsmodul
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <LayoutGrid className="h-10 w-10 text-[#17304F]" />,
                  title: "Bransjespesifikke maler",
                  description: "Kom raskt i gang med forhåndsdefinerte maler tilpasset din bransje og aktiviteter."
                },
                {
                  icon: <ListChecks className="h-10 w-10 text-[#17304F]" />,
                  title: "Handlingsplaner",
                  description: "Automatisk opprettelse av handlingsplaner fra risikovurderingen med tydelig ansvarsfordeling."
                },
                {
                  icon: <AlertTriangle className="h-10 w-10 text-[#17304F]" />,
                  title: "Farebibliotek",
                  description: "Omfattende bibliotek med vanlige farer og risikoer for ulike arbeidssituasjoner."
                },
                {
                  icon: <CalendarCheck className="h-10 w-10 text-[#17304F]" />,
                  title: "Revisjonshistorikk",
                  description: "Hold oversikt over alle endringer og oppdateringer i risikovurderingen over tid."
                },
                {
                  icon: <LineChart className="h-10 w-10 text-[#17304F]" />,
                  title: "Risikoanalyse",
                  description: "Visualiser risikotrender og se effekten av implementerte tiltak over tid."
                },
                {
                  icon: <ShieldCheck className="h-10 w-10 text-[#17304F]" />,
                  title: "Tilgangskontroll",
                  description: "Definer roller og tilganger for hvem som kan se og redigere risikovurderinger."
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
        
        {/* Stegvis prosess */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-12 text-center text-[#17304F]">
              Risikovurdering i fem enkle steg
            </h2>
            
            <div className="max-w-4xl mx-auto space-y-12">
              {[
                {
                  num: "01",
                  title: "Planlegging",
                  desc: "Definer området risikovurderingen skal dekke og velg passende mal."
                },
                {
                  num: "02",
                  title: "Identifisering av farer",
                  desc: "Kartlegg potensielle farer og problemer som kan oppstå."
                },
                {
                  num: "03",
                  title: "Risikoanalyse",
                  desc: "Vurder sannsynlighet og konsekvens for hver fare."
                },
                {
                  num: "04",
                  title: "Tiltak og handlingsplan",
                  desc: "Planlegg risikoreduserende tiltak og tildel ansvar."
                },
                {
                  num: "05",
                  title: "Oppfølging og revidering",
                  desc: "Evaluér effekten av tiltak og oppdatér vurderingen jevnlig."
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
        
        {/* CTA */}
        <section className="py-16 px-4 bg-[#17304F] text-white">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-6">Ta kontroll over risikoene i din virksomhet</h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Start med systematisk risikovurdering i dag og skap en tryggere arbeidsplass for alle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#17304F] hover:bg-white/90">
                Prøv gratis i 14 dager
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
