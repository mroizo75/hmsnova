import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, BarChart, CheckCircle, ClipboardList, Database, Search, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/front/page-header";
import Footer from "@/components/front/footer";
import { ContactModal } from "@/components/contact-modal";
import { BookingModal } from "@/components/booking-modal";

export default function AvvikshandteringPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Avvikshåndtering" 
        description="Effektiv registrering, behandling og oppfølging av avvik og forbedringsforslag" 
      />
      
      <main className="flex-grow">
        {/* Hovedfunksjonalitet */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6 text-[#17304F]">Komplett løsning for avvikshåndtering</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Vår moderne avvikssystem hjelper din bedrift med å registrere, behandle og følge opp avvik i henhold til forskrift om systematisk HMS-arbeid.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Smartphone className="h-12 w-12 text-[#17304F]" />,
                  title: "Enkel registrering",
                  description: "Registrer avvik fra hvor som helst på mobil, nettbrett eller PC med vår brukervennlige design."
                },
                {
                  icon: <ClipboardList className="h-12 w-12 text-[#17304F]" />,
                  title: "Arbeidsflyt og oppfølging",
                  description: "Automatisk varsling, ansvarsfordeling og oppfølging sikrer at avvik lukkes på en god måte."
                },
                {
                  icon: <AlertCircle className="h-12 w-12 text-[#17304F]" />,
                  title: "Prioritering og risikovurdering",
                  description: "Klassifiser avvik etter alvorlighetsgrad for å prioritere riktig og iverksette korrigerende tiltak."
                },
                {
                  icon: <Database className="h-12 w-12 text-[#17304F]" />,
                  title: "Dokumentasjon",
                  description: "Sentral lagring av all informasjon gir dokumentasjon på avvikshåndtering for myndighetskontroll."
                },
                {
                  icon: <BarChart className="h-12 w-12 text-[#17304F]" />,
                  title: "Statistikk og analyse",
                  description: "Visualiser trender og mønstre for å identifisere systemfeil og iverksette forebyggende tiltak."
                },
                {
                  icon: <Search className="h-12 w-12 text-[#17304F]" />,
                  title: "Søkefunksjon",
                  description: "Kraftig søkemotor for å finne tidligere avvik og lære av erfaringer over tid."
                }
              ].map((feature, index) => (
                <div key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="mb-5">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* App-demo */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl font-bold mb-6 text-[#17304F]">Avviksregistrering på farten</h2>
                <p className="text-lg text-gray-700 mb-6">
                  Med vår mobile app kan ansatte enkelt registrere avvik når og hvor det oppstår:
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Ta bilde direkte i appen",
                    "Velg avvikskategori og alvorlighetsgrad",
                    "Registrer avvik også når du er offline",
                    "Få varsler om framdrift på avvik du har meldt",
                    "Følg opp tiltak som er tildelt deg"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-[#17304F] hover:bg-[#2C435F]">
                    <Link href="/register">Prøv nå</Link>
                  </Button>
                  <BookingModal>
                    <Button variant="outline">
                      Se demo
                    </Button>
                  </BookingModal>
                </div>
              </div>
              <div className="order-1 md:order-2 relative mx-auto md:mx-0 max-w-xs">
                <div className="bg-[#17304F] absolute -bottom-6 -right-6 w-full h-full rounded-3xl -z-10"></div>
                <Image 
                  src="/images/avvik-app.png" 
                  alt="Avvikshåndtering app" 
                  width={300} 
                  height={600}
                  className="rounded-3xl shadow-xl z-10 relative"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonial
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="max-w-4xl mx-auto bg-gray-50 p-8 md:p-12 rounded-xl shadow-lg">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                  <Image 
                    src="/images/testimonial-person.jpg" 
                    alt="Kundetestimonial" 
                    width={96} 
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xl italic text-gray-700 mb-6">
                    "Etter at vi tok i bruk HMSNova sin avvikshåndtering har vi sett en markant forbedring i antall registrerte avvik og tiden det tar å lukke dem. Verktøyet har gjort det enkelt for alle ansatte å bidra til kontinuerlig forbedring."
                  </p>
                  <div>
                    <p className="font-bold">Anne Johansen</p>
                    <p className="text-gray-600">HMS-ansvarlig, Byggmester AS</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section> */}
        
        {/* CTA */}
        <section className="py-16 px-4 bg-[#17304F] text-white">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-6">Få kontroll på dine avvik</h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Moderne avvikshåndtering er nøkkelen til kontinuerlig forbedring. Start reisen mot en sikrere arbeidsplass i dag.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#17304F] hover:bg-white/90">
                <Link href="/register">Kom i gang nå</Link>
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
