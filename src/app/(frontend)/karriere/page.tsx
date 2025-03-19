import React from "react";
import Image from "next/image";
import { Award, Briefcase, CheckCircle, Coffee, GraduationCap, Heart, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/front/page-header";
import Footer from "@/components/front/footer";
import { ContactModal } from "@/components/contact-modal";

export default function KarrierePage() {
  // Aktive stillinger
  const jobListings = [
    {
      title: "Senior HMS-rådgiver",
      location: "Oslo",
      type: "Fulltid",
      description: "Vi søker en erfaren HMS-rådgiver med minst 5 års erfaring fra HMS-arbeid i bygg- og anleggsbransjen. Du vil jobbe tett med våre kunder og hjelpe dem med implementering av HMS-systemer og risikovurderinger.",
      requirements: [
        "Utdanning innen HMS, ingeniørfag eller tilsvarende",
        "Minimum 5 års erfaring med HMS-arbeid",
        "Gode kommunikasjonsevner",
        "Erfaring med risikovurderinger og internkontroll"
      ]
    },
    {
      title: "Frontendutvikler",
      location: "Oslo / Remote",
      type: "Fulltid",
      description: "Vi utvider vårt tekniske team og søker en dyktig frontendutvikler med erfaring fra moderne webrammeverk. Du vil jobbe med å videreutvikle våre brukergrensesnitt og skape gode brukeropplevelser.",
      requirements: [
        "Erfaring med React, Next.js og TypeScript",
        "God forståelse av UX/UI-prinsipper",
        "Erfaring med responsive design og tilgjengelighet",
        "Teamplayer med gode samarbeidsevner"
      ]
    },
    {
      title: "Salgskonsulent",
      location: "Landsdekkende",
      type: "Fulltid",
      description: "Er du en resultatorientert selger med interesse for digitale løsninger? Vi søker en salgskonsulent som kan hjelpe oss med å vokse kundebasen og presentere våre HMS-løsninger for potensielle kunder.",
      requirements: [
        "Dokumentert erfaring fra B2B-salg",
        "Forståelse for HMS-arbeid er en fordel",
        "Selvstendig og resultatorientert",
        "Gode relasjonsbyggende egenskaper"
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Karriere" 
        description="Bli med på teamet vårt og gjør norske arbeidsplasser tryggere" 
      />
      
      <main className="flex-grow">
        {/* Intro */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-[#17304F]">Bli en del av fremtidens HMS-løsninger</h2>
                <p className="text-lg text-gray-700 mb-6">
                  Hos HMSNova jobber vi for å gjøre norske arbeidsplasser tryggere gjennom innovative digitale løsninger. Vi er et teknologidrevet selskap med stor fagkompetanse innen HMS.
                </p>
                <p className="text-lg text-gray-700 mb-8">
                  Vi søker alltid etter dyktige medarbeidere som ønsker å være med på å forme fremtidens HMS-arbeid. Ønsker du å jobbe i et innovativt miljø med høyt faglig nivå og gode utviklingsmuligheter?
                </p>
                <Button className="bg-[#17304F] hover:bg-[#2C435F]">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Se ledige stillinger
                </Button>
              </div>
              <div className="rounded-xl overflow-hidden shadow-xl">
                <Image 
                  src="/images/team-working.jpg" 
                  alt="HMS-team som jobber sammen" 
                  width={600} 
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Fordeler */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-12 text-center text-[#17304F]">
              Fordeler ved å jobbe hos oss
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Coffee className="h-10 w-10 text-[#17304F]" />,
                  title: "Fleksibel arbeidstid",
                  description: "Vi tror på balanse mellom jobb og fritid. Fleksibel arbeidstid og mulighet for hjemmekontor gir deg friheten til å arbeide når og hvor du er mest produktiv."
                },
                {
                  icon: <GraduationCap className="h-10 w-10 text-[#17304F]" />,
                  title: "Faglig utvikling",
                  description: "Vi investerer i våre ansattes utvikling gjennom kurs, sertifiseringer og konferanser. Du får også jobbe med de nyeste teknologiene og metodene."
                },
                {
                  icon: <Heart className="h-10 w-10 text-[#17304F]" />,
                  title: "Helsefordeler",
                  description: "Vi tilbyr helseforsikring, treningsbidrag og regelmessige sosiale arrangementer for å sikre at vårt team trives både fysisk og mentalt."
                },
                {
                  icon: <Users className="h-10 w-10 text-[#17304F]" />,
                  title: "Inspirerende kolleger",
                  description: "Hos oss blir du en del av et tverrfaglig team med dyktige kolleger som brenner for HMS og teknologi."
                },
                {
                  icon: <Award className="h-10 w-10 text-[#17304F]" />,
                  title: "Konkurransedyktige betingelser",
                  description: "Vi tilbyr konkurransedyktig lønn, bonus for gode prestasjoner og mulighet for medeierskap for langsiktige ansatte."
                },
                {
                  icon: <CheckCircle className="h-10 w-10 text-[#17304F]" />,
                  title: "Meningsfylt arbeid",
                  description: "Vårt arbeid bidrar til tryggere arbeidsplasser. Hos oss får du muligheten til å gjøre en reell forskjell for tusenvis av arbeidstakere."
                }
              ].map((benefit, index) => (
                <Card key={index} className="border-none shadow-lg">
                  <CardContent className="pt-6">
                    <div className="mb-5">{benefit.icon}</div>
                    <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Ledige stillinger */}
        <section className="py-16 px-4 bg-white" id="ledige-stillinger">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-12 text-center text-[#17304F]">
              Ledige stillinger
            </h2>
            
            <div className="space-y-8">
              {jobListings.map((job, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-[#17304F]">{job.title}</h3>
                    <div className="flex items-center gap-4 mt-2 md:mt-0">
                      <span className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {job.type}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{job.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Kvalifikasjoner:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {job.requirements.map((req, idx) => (
                        <li key={idx} className="text-gray-700">{req}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button className="mt-2 bg-[#17304F] hover:bg-[#2C435F]">
                    Søk på stillingen
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <p className="text-xl mb-6">Finner du ikke en stilling som passer deg?</p>
              <ContactModal>
                <Button variant="outline">
                  Send åpen søknad
                </Button>
              </ContactModal>
            </div>
          </div>
        </section>
        
        {/* Arbeidsmiljø */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl font-bold mb-6 text-[#17304F]">Vår arbeidskultur</h2>
                <p className="text-lg text-gray-700 mb-4">
                  I HMSNova har vi bygget en kultur basert på tillit, samarbeid og kontinuerlig læring. Vi tror på:
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Åpen kommunikasjon og ærlighet",
                    "Balanse mellom jobb og privatliv",
                    "Faglig utvikling og vekst",
                    "Tverrfaglig samarbeid",
                    "Feiring av suksesser, store som små"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-lg text-gray-700">
                  Vi jobber hardt, men har det også gøy sammen. Regelmessige sosiale arrangementer, teambuilding og faglige samlinger er en viktig del av vår kultur.
                </p>
              </div>
              <div className="order-1 md:order-2 grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Image 
                    src="/images/work-culture-1.jpg" 
                    alt="HMSNova arbeidskultur" 
                    width={300} 
                    height={400}
                    className="rounded-lg shadow-lg h-auto"
                  />
                  <Image 
                    src="/images/work-culture-3.jpg" 
                    alt="HMSNova arbeidskultur" 
                    width={300} 
                    height={200}
                    className="rounded-lg shadow-lg h-auto"
                  />
                </div>
                <div className="pt-8">
                  <Image 
                    src="/images/work-culture-2.jpg" 
                    alt="HMSNova arbeidskultur" 
                    width={300} 
                    height={400}
                    className="rounded-lg shadow-lg h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-16 px-4 bg-[#17304F] text-white">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-6">Bli en del av teamet</h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Ønsker du å være med på å forme fremtidens HMS-arbeid i et innovativt og kompetent miljø? Vi ser frem til å høre fra deg!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#17304F] hover:bg-white/90">
                Se ledige stillinger
              </Button>
              <ContactModal>
                <Button size="lg" variant="outline" className="border-white text-[#17304F] hover:text-white hover:bg-white/10">
                  Send åpen søknad
                </Button>
              </ContactModal>
            </div>
          </div>
        </section>
      </main>
      
    </div>
  );
}
