import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { 
  BookOpen, 
  AlertTriangle, 
  ShieldAlert, 
  Briefcase, 
  Leaf, 
  HardHat, 
  Award, 
  Users, 
  Lightbulb, 
  Pen, 
  ArrowRight
} from "lucide-react"

export const metadata: Metadata = {
  title: "HMS Nova | Våre Tjenester og Moduler",
  description: "Utforsk våre komplette HMS-tjenester og moduler. Alt du trenger for et trygt arbeidsmiljø og lovlig HMS-håndtering i din bedrift.",
  keywords: "HMS-tjenester, HMS-moduler, avviksbehandling, risikovurdering, stoffkartotek, vernerunde, sikker jobbanalyse, HMS-håndbok, kompetansestyring",
}

const services = [
  {
    title: "HMS-håndbok",
    description: "Digital HMS-håndbok med automatiske oppdateringer og tilpassede rutiner for din bedrift. Enkelt å holde oppdatert og alltid tilgjengelig.",
    icon: <BookOpen className="h-10 w-10 text-[#2C435F]" />,
    href: "/hms-handbok",
    color: "bg-blue-50",
  },
  {
    title: "Avvikshåndtering",
    description: "Effektiv registrering, behandling og oppfølging av avvik. Statistikk og trendanalyser gir verdifull innsikt for kontinuerlig forbedring.",
    icon: <AlertTriangle className="h-10 w-10 text-[#2C435F]" />,
    href: "/avvikshandtering",
    color: "bg-red-50",
  },
  {
    title: "Risikovurdering",
    description: "Identifiser, vurder og kontroller risiko på arbeidsplassen. Systematisk tilnærming til risikoreduksjon som følger beste praksis.",
    icon: <ShieldAlert className="h-10 w-10 text-[#2C435F]" />,
    href: "/risikovurdering",
    color: "bg-orange-50",
  },
  {
    title: "Sikker Jobb Analyse",
    description: "Planlegg arbeidsoppgaver systematisk og identifiser risiko før arbeidet starter. Skaper en felles forståelse for sikker gjennomføring.",
    icon: <Briefcase className="h-10 w-10 text-[#2C435F]" />,
    href: "/sikkerjobbanalyse",
    color: "bg-green-50",
  },
  {
    title: "Stoffkartotek",
    description: "Digitalt stoffkartotek med alle sikkerhetsdatablader lett tilgjengelig. Automatiske varsler om oppdateringer og utløpsdatoer.",
    icon: <Leaf className="h-10 w-10 text-[#2C435F]" />,
    href: "/stoffkartotek",
    color: "bg-teal-50",
  },
  {
    title: "Vernerunde",
    description: "Digitale sjekklister for vernerunder som kan tilpasses ulike avdelinger. Dokumenter funn med bilder og tildel ansvarsoppgaver direkte.",
    icon: <HardHat className="h-10 w-10 text-[#2C435F]" />,
    href: "/vernerunde",
    color: "bg-yellow-50",
  },
  {
    title: "Kompetansestyring",
    description: "Full oversikt over ansattes kompetanse, kurs og sertifiseringer. Automatiske påminnelser om fornyelse og opplæringsbehov.",
    icon: <Award className="h-10 w-10 text-[#2C435F]" />,
    href: "/kompetanse",
    color: "bg-purple-50",
  },
]

const additionalServices = [
  {
    title: "HMS-kurs",
    description: "Skreddersydde HMS-kurs for ledere, verneombud og ansatte. Praktisk og relevant opplæring som gir resultater.",
    icon: <Lightbulb />,
  },
  {
    title: "Bedriftshelsetjeneste",
    description: "Tett samarbeid med godkjente BHT-leverandører som sikrer lovpålagt oppfølging og helsefremmende tiltak.",
    icon: <Users />,
  },
  {
    title: "Konsulenttjenester",
    description: "Faglig bistand til spesifikke HMS-utfordringer, revisjoner, eller implementering av styringssystemer.",
    icon: <Pen />,
  },
]

export default function ServicesPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#17304F] to-[#2C435F] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/services-pattern.svg')] bg-repeat bg-center"></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 sm:py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Komplette HMS-tjenester for din bedrift</h1>
            <p className="text-xl opacity-90 mb-8">
              HMS Nova tilbyr en komplett portefølje av digitale verktøy og tjenester 
              som gjør HMS-arbeidet enklere, mer effektivt og mer verdiskapende.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/register" 
                className="px-6 py-3 bg-white text-[#17304F] font-medium rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Kom i gang
              </Link>
              <Link 
                href="#moduler" 
                className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-full hover:bg-white/10 transition-colors duration-300"
              >
                Utforsk modulene
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Services Section */}
      <section id="moduler" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#17304F] mb-4">
              Våre HMS-moduler
            </h2>
            <p className="text-lg text-gray-600">
              Våre digitale HMS-moduler er bygget på mange års erfaring og beste praksis innen HMS-arbeid. 
              Hver modul kan brukes selvstendig eller som del av en komplett HMS-løsning.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`p-8 ${service.color}`}>
                  <div className="flex justify-between items-center">
                    {service.icon}
                    <ArrowRight className="h-5 w-5 text-[#2C435F] opacity-60" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#17304F] mt-6">{service.title}</h3>
                </div>
                
                <div className="p-8">
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  <Link 
                    href={service.href}
                    className="inline-flex items-center text-[#2C435F] font-medium hover:text-[#17304F]"
                  >
                    <span>Les mer</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Value Proposition */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#2C435F]/10 rounded-full"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#2C435F]/10 rounded-full"></div>
              
              <div className="relative bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
                <Image 
                  src="/dashboard-preview.jpg" 
                  alt="HMS Nova Dashboard" 
                  width={600} 
                  height={400} 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#17304F]/30 to-transparent"></div>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#17304F] mb-6">
                Hvorfor velge HMS Nova?
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#2C435F]/10 rounded-full flex items-center justify-center text-[#2C435F]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#17304F] mb-2">Brukervennlig og intuitiv</h3>
                    <p className="text-gray-600">
                      Våre løsninger er utviklet med fokus på brukervennlighet. Du trenger ingen spesialkompetanse 
                      for å komme i gang - vi guider deg gjennom hele prosessen.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#2C435F]/10 rounded-full flex items-center justify-center text-[#2C435F]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#17304F] mb-2">Alltid oppdatert lovverk</h3>
                    <p className="text-gray-600">
                      Vi følger endringer i lover og forskrifter, og oppdaterer systemet automatisk. 
                      Du kan være trygg på at du alltid oppfyller gjeldende lovkrav.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#2C435F]/10 rounded-full flex items-center justify-center text-[#2C435F]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#17304F] mb-2">Kontinuerlig utvikling</h3>
                    <p className="text-gray-600">
                      Vi utvikler kontinuerlig nye funksjoner og forbedringer basert på kundenes tilbakemeldinger 
                      og behov. Du får automatisk tilgang til alle oppdateringer.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Link 
                  href="#pricing" 
                  className="inline-flex items-center px-6 py-3 bg-[#2C435F] text-white font-medium rounded-full hover:bg-[#17304F] transition-colors duration-300"
                >
                  <span>Se våre priser</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Additional Services */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#17304F] mb-4">
              Tilleggstjenester
            </h2>
            <p className="text-lg text-gray-600">
              I tillegg til våre digitale moduler tilbyr vi et utvalg av tjenester som 
              støtter opp under HMS-arbeidet i din bedrift.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {additionalServices.map((service, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-[#2C435F]/10 rounded-full flex items-center justify-center text-[#2C435F] mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-[#17304F] mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-lg text-gray-600 mb-6">
              Trenger du hjelp med andre HMS-relaterte oppgaver? Vi tilbyr skreddersydde løsninger 
              for din bedrifts spesifikke behov.
            </p>
            <ContactModal>
              <button className="inline-flex items-center px-6 py-3 bg-[#2C435F] text-white font-medium rounded-full hover:bg-[#17304F] transition-colors duration-300">
                <span>Kontakt oss</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </ContactModal>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#17304F] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Klar til å forbedre HMS-arbeidet?</h2>
            <p className="text-xl opacity-90 mb-8">
              Start med en gratis prøveperiode på 14 dager og opplev hvordan HMS Nova kan 
              hjelpe din bedrift med å oppfylle lovkrav og skape et tryggere arbeidsmiljø.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/register" 
                className="px-8 py-4 bg-white text-[#17304F] font-medium rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Start gratis prøveperiode
              </Link>
              <ContactModal>
                <button className="px-8 py-4 bg-transparent border border-white text-white font-medium rounded-full hover:bg-white/10 transition-colors duration-300">
                  Be om demo
                </button>
              </ContactModal>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Midlertidig ContactModal komponent - erstatt med din faktiske ContactModal
function ContactModal({ children }: { children: React.ReactNode }) {
  return (
    <Link href="/kontakt" className="inline-block">
      {children}
    </Link>
  )
}
