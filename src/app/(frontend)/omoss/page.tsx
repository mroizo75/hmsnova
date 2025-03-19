import React from "react";
import Image from "next/image";
import { Award, CheckCircle, Heart, HeartHandshake, LightbulbIcon, ShieldCheck, Star, Target, Users, UserPlus, FileCheck, BookOpen, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/front/page-header";
import Footer from "@/components/front/footer";
import { ContactModal } from "@/components/contact-modal";

export default function OmOssPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Om oss" 
        description="Vi gjør HMS-arbeid enkelt og effektivt for norske bedrifter" 
      />
      
      <main className="flex-grow">
        {/* Vår historie */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block px-4 py-2 bg-blue-50 text-[#17304F] font-medium rounded-full mb-6">
                  Vår historie
                </div>
                <h2 className="text-3xl font-bold mb-6 text-[#17304F]">
                  Vi startet med en visjon om å gjøre HMS-arbeid enklere
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  HMSNova ble startet i oktober 2024 av en gruppe erfarne HMS-rådgivere og teknologer som så et behov for bedre digitale verktøy i HMS-arbeidet.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  Etter å ha jobbet med tradisjonelle HMS-systemer i mange år, var vi frustrert over komplekse og tungvinte løsninger som tok for mye tid og ressurser å bruke. 
                </p>
                <p className="text-lg text-gray-700">
                  Vi bestemte oss for å skape en plattform som kombinerer lovpålagte krav med moderne teknologi og brukervennlighet, slik at alle virksomheter kan jobbe effektivt med HMS uavhengig av størrelse og ressurser.
                </p>
              </div>
              <div className="relative">
                <div className="bg-[#17304F] absolute -bottom-6 -right-6 w-full h-full rounded-2xl -z-10"></div>
                <Image 
                  src="/images/about-company.jpg" 
                  alt="HMS Nova team" 
                  width={600} 
                  height={400}
                  className="rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Verdier */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-blue-50 text-[#17304F] font-medium rounded-full mb-6">
                Våre verdier
              </div>
              <h2 className="text-3xl font-bold mb-6 text-[#17304F]">
                Prinsipper som styrer alt vi gjør
              </h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Våre kjerneverdier definerer hvem vi er som selskap og hvordan vi jobber for å skape verdi for våre kunder.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <ShieldCheck className="h-12 w-12 text-[#17304F]" />,
                  title: "Sikkerhet først",
                  description: "Vi tror på at alle har rett til en trygg arbeidsplass. Vårt mål er å hjelpe bedrifter å skape sikrere arbeidsmiljøer."
                },
                {
                  icon: <Users className="h-12 w-12 text-[#17304F]" />,
                  title: "Brukerorientert",
                  description: "Vi utvikler alltid med brukeren i fokus. Verktøy som er enkle å bruke blir faktisk brukt i hverdagen."
                },
                {
                  icon: <LightbulbIcon className="h-12 w-12 text-[#17304F]" />,
                  title: "Innovasjon",
                  description: "Vi søker stadig nye løsninger og teknologier for å forbedre HMS-arbeidet og ligge i forkant av utviklingen."
                },
                {
                  icon: <HeartHandshake className="h-12 w-12 text-[#17304F]" />,
                  title: "Partnerskap",
                  description: "Vi ser på våre kunder som partnere og jobber tett med dem for å skape de beste løsningene."
                },
                {
                  icon: <CheckCircle className="h-12 w-12 text-[#17304F]" />,
                  title: "Kvalitet",
                  description: "Vi leverer gjennomtenkte og robuste løsninger som våre kunder kan stole på hver eneste dag."
                },
                {
                  icon: <Target className="h-12 w-12 text-[#17304F]" />,
                  title: "Målrettet",
                  description: "Vi har alltid et klart mål: å gjøre HMS-arbeidet enklere, mer effektivt og bedre for alle parter."
                }
              ].map((value, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-md">
                  <div className="mb-5">{value.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Kundefokusert utvikling og totalpakke - nytt innhold som erstatter Team-seksjonen */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-blue-50 text-[#17304F] font-medium rounded-full mb-6">
                Vår tilnærming
              </div>
              <h2 className="text-3xl font-bold mb-6 text-[#17304F]">
                Et levende HMS-system som utvikles sammen med våre kunder
              </h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Vi tror på at de beste løsningene skapes i samarbeid med brukerne. Derfor inviterer vi kundene våre til å være med på å forme fremtiden til HMS Nova.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16">
              <div className="order-2 md:order-1">
                <h3 className="text-2xl font-bold mb-4 text-[#17304F]">Kundestyrt utvikling</h3>
                <p className="text-lg text-gray-700 mb-6">
                  Siden oppstarten i oktober 2024 har vi utviklet et solid HMS-system basert på vår erfaring og kunnskap. Men vi vet at det er våre kunder som bruker systemet daglig og har de beste innsiktene for hvordan det kan forbedres.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  Derfor inviterer vi alle våre kunder til å være med på å påvirke utviklingen av HMS Nova. Gjennom jevnlige tilbakemeldinger, brukerundersøkelser og direkte dialog sikrer vi at systemet alltid møter de faktiske behovene i markedet.
                </p>
                <div className="space-y-4">
                  {[
                    {
                      icon: <UserPlus className="h-6 w-6 text-[#17304F]" />,
                      title: "Kundeinvolvering",
                      desc: "Vi arrangerer regelmessige brukerforumer hvor kunder kan dele sine erfaringer og ønsker."
                    },
                    {
                      icon: <RefreshCw className="h-6 w-6 text-[#17304F]" />,
                      title: "Kontinuerlig forbedring",
                      desc: "Systemet oppdateres jevnlig basert på kundetilbakemeldinger og nye lovkrav."
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="bg-blue-50 p-3 rounded-full">{item.icon}</div>
                      <div>
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <p className="text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 md:order-2 bg-gradient-to-br from-[#17304F] to-[#2C5282] p-8 rounded-xl text-white">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <Zap className="h-7 w-7 mr-3" /> Vår unike tilnærming
                </h3>
                <ul className="space-y-4">
                  {[
                    "Brukervennlig system som er enkelt å sette seg inn i",
                    "Ferdig HMS-håndbok som tilfredsstiller alle lovkrav",
                    "Skreddersydd for norske forhold og regelverk",
                    "Kontinuerlig oppdatering basert på kundetilbakemeldinger",
                    "Sporing gjennom hele HMS-prosessen"
                  ].map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="bg-[#17304F]/10 absolute -bottom-6 -left-6 w-full h-full rounded-2xl -z-10"></div>
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="text-2xl font-bold mb-6 text-[#17304F] flex items-center">
                    <FileCheck className="h-8 w-8 mr-3 text-[#17304F]" /> Total HMS-løsning
                  </h3>
                  <p className="text-lg text-gray-700 mb-6">
                    HMS Nova er mer enn bare et digitalt system. Vi tilbyr en helhetlig tilnærming til HMS-arbeid som inkluderer både programvare, opplæring og faglig støtte.
                  </p>
                  <div className="space-y-5 mb-6">
                    {[
                      {
                        title: "Sertifisert og dokumentert opplæring",
                        desc: "Komplette kurs innen alle viktige HMS-områder med sertifisering."
                      },
                      {
                        title: "Sporbarhet i hele prosessen",
                        desc: "Fullt dokumentert og sporbar HMS-prosess fra start til slutt."
                      },
                      {
                        title: "Komplett HMS-håndbok",
                        desc: "Ferdig utarbeidet og fullstendig HMS-håndbok som oppfyller alle lovkrav."
                      }
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <p className="text-gray-600">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-[#17304F]">Enkelt, men komplett</h3>
                <p className="text-lg text-gray-700 mb-6">
                  Vi har designet HMS Nova for å være brukervennlig og intuitivt, men samtidig kraftfullt nok til å dekke alle lovkrav og behov for moderne HMS-arbeid.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  Systemet kommer med en komplett HMS-håndbok som er ferdig utarbeidet for å tilfredsstille alle krav, men som enkelt kan tilpasses din virksomhet. Dette sparer deg for hundrevis av timer med arbeid.
                </p>
                <div className="space-y-4">
                  {[
                    {
                      icon: <BookOpen className="h-6 w-6 text-[#17304F]" />,
                      title: "Komplett løsning",
                      desc: "Alt du trenger for et forskriftsmessig HMS-arbeid i én brukervennlig pakke."
                    },
                    {
                      icon: <Zap className="h-6 w-6 text-[#17304F]" />,
                      title: "Effektiv implementering",
                      desc: "Kom i gang på timer i stedet for uker med vårt ferdig oppsatte system."
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="bg-blue-50 p-3 rounded-full">{item.icon}</div>
                      <div>
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <p className="text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Milepæler */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-blue-50 text-[#17304F] font-medium rounded-full mb-6">
                Vår reise
              </div>
              <h2 className="text-3xl font-bold mb-6 text-[#17304F]">
                Viktige milepæler
              </h2>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-12">
              {[
                {
                  year: "Okt 2024",
                  title: "Etableringen av HMSNova",
                  desc: "Selskapet ble grunnlagt med en visjon om å revolusjonere HMS-arbeidet."
                },
                {
                  year: "Des 2024",
                  title: "Lansering av første versjon",
                  desc: "Første versjon av plattformen med grunnleggende HMS-moduler ble lansert."
                },
                {
                  year: "Jan 2025",
                  title: "Kursmoduler integrert",
                  desc: "Komplett system for sertifisert og dokumentert opplæring ble integrert i plattformen."
                },
                {
                  year: "Feb 2025",
                  title: "Mobil-app lansering",
                  desc: "Lanserte vår mobile app for enklere rapportering og tilgang i felt."
                },
                {
                  year: "Mars 2025",
                  title: "Kundestyrt utviklingsmodell",
                  desc: "Etablerte formell struktur for kundeinvolvering i produktutviklingen."
                },
                {
                  year: "Pågående",
                  title: "Kontinuerlig forbedring",
                  desc: "Jevnlige oppdateringer basert på kundetilbakemeldinger og nye lovkrav."
                }
              ].map((milestone, index) => (
                <div key={index} className="flex gap-8 items-start">
                  <div className="py-2 px-4 bg-[#17304F] text-white font-bold rounded-lg flex-shrink-0">
                    {milestone.year}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-16 px-4 bg-[#17304F] text-white">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-6">Bli en del av vår reise</h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Vi inviterer deg til å bli med på å forme fremtidens HMS-arbeid. Sammen kan vi skape sikrere og bedre arbeidsplasser for alle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#17304F] hover:bg-white/90">
                Våre løsninger
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
