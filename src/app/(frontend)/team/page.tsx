import React from "react";
import Image from "next/image";
import { Facebook, Github, Linkedin, Mail, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/front/page-header";
import Footer from "@/components/front/footer";
import { ContactModal } from "@/components/contact-modal";

export default function TeamPage() {
  // Teammedlemmer data
  const teamMembers = [
    {
      name: "Kenneth Kristiansen",
      role: "Daglig leder / CEO",
      image: "/images/team/kenneth.jpg",
      bio: "Kenneth har over 15 års erfaring fra HMS-arbeid i ulike bransjer og var med på å utvikle HMS Nova i slutten av 2024. Han er utdannet ingeniør og prosjektleder med spesialisering innen HMS-ledelse.",
      social: {
        linkedin: "https://linkedin.com/in/kennethkristiansen",
        twitter: "https://twitter.com/kennethkristiansen",
        email: "kenneth@kksas.no"
      }
    },
    {
      name: "Kai Arne Ødegård",
      role: "Salgsansvarlig",
      image: "/images/team/kai.jpg",
      bio: "Kai Arne har over 30 års erfaring fra salg og markedsføring i ulike bransjer og var med på å utvikle HMS Nova i slutten av 2024. Han har drevet eget salg og markedsføring i 15 år, og har hatt flere kunder i bygg- og anleggsbransjen.",
      social: {
        linkedin: "https://linkedin.com/in/kaiarneodegard",
        email: "kai@kksas.no",
        github: undefined,
        twitter: undefined
      }
    },
    {
      name: "Tommy Kristiansen",
      role: "Faglig Leder",
      image: "/images/team/tommy.jpg",
      bio: "Tommy har over 15 års erfaring som lærer og spesialpedagog, utdannet bilingeniør og har spesialisert seg innen å gi kurs bedre innhold og læring.",
      social: {
        linkedin: "https://linkedin.com/in/tommykristiansen",
        github: "https://github.com/tommykristiansen",
        email: "post@kksas.no",
        twitter: undefined
      }
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Møt teamet" 
        description="Menneskene bak HMSNova" 
      />
      
      <main className="flex-grow">
        {/* Intro */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-6 text-[#17304F]">Vårt dedikerte team</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
              I HMSNova har vi samlet et tverrfaglig team av HMS-eksperter, teknologer og designere som sammen skaper fremtidens HMS-løsninger. Vi kombinerer fagkunnskap med teknisk kompetanse for å møte morgendagens utfordringer.
            </p>
          </div>
        </section>
        
        {/* Team grid */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative h-80 w-full overflow-hidden">
                    <Image
                      src={member.image} 
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#17304F]">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                    <p className="text-gray-600 mb-4">{member.bio}</p>
                    <div className="flex gap-3">
                      {member.social.linkedin && (
                        <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" 
                           className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {member.social.twitter && (
                        <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" 
                           className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      {member.social.github && (
                        <a href={member.social.github} target="_blank" rel="noopener noreferrer" 
                           className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                      <a href={`mailto:${member.social.email}`} 
                         className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <Mail className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Verdier */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-12 text-center text-[#17304F]">
              Våre kjerneverdier
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Innovasjon",
                  description: "Vi søker alltid nye og bedre løsninger på HMS-utfordringer gjennom bruk av moderne teknologi og kreativ tenkning."
                },
                {
                  title: "Fagkompetanse",
                  description: "Solid fagkunnskap danner grunnlaget for alt vi gjør. Vi holder oss oppdatert på regelverk og beste praksis innen HMS."
                },
                {
                  title: "Brukervennlighet",
                  description: "Vi tror at HMS-verktøy må være enkle å bruke for å bli brukt. Derfor setter vi brukeropplevelsen i sentrum."
                },
                {
                  title: "Samarbeid",
                  description: "Vi jobber tett med våre kunder og hverandre for å skape de beste løsningene. Sammen er vi sterkere."
                },
                {
                  title: "Integritet",
                  description: "Ærlighet og åpenhet preger alt vi gjør, fra hvordan vi kommuniserer til hvordan vi utvikler produktene våre."
                },
                {
                  title: "Fremtidsrettet",
                  description: "Vi tenker langsiktig og bygger løsninger som ikke bare løser dagens problemer, men også morgendagens utfordringer."
                }
              ].map((value, index) => (
                <div key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold mb-3 text-[#17304F]">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Bli en del av teamet */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-6 text-[#17304F]">Bli en del av teamet</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
              Er du interessert i å jobbe med HMS og teknologi? Vi er alltid på utkikk etter talentfulle og engasjerte folk som vil være med på å forme fremtidens HMS-løsninger.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#17304F] hover:bg-[#2C435F]">
                Se ledige stillinger
              </Button>
              <ContactModal>
                <Button variant="outline">
                  Kontakt oss
                </Button>
              </ContactModal>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-16 px-4 bg-[#17304F] text-white">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-6">La oss hjelpe deg med HMS-arbeidet</h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Vårt dedikerte team står klare til å hjelpe din virksomhet med å forbedre HMS-arbeidet og oppfylle lovkrav på en enkel og effektiv måte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#17304F] hover:bg-white/90">
                Prøv HMSNova gratis
              </Button>
              <ContactModal>
                <Button size="lg" variant="outline" className="border-white text-[#17304F] hover:text-white hover:bg-white/10">
                  Be om en demo
                </Button>
              </ContactModal>
            </div>
          </div>
        </section>
      </main>
      
    </div>
  );
}
