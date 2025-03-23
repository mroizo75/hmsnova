import Features from "@/components/front/feature"
import Footer from "@/components/front/footer"
import Hero from "@/components/front/hero"
import PricingSection from "@/components/front/pricing"
import StoffkartotekPreview from "@/components/front/stoffkartotek-preview"
import WeatherPreview from "@/components/front/weather-preview"
import CourseBHT from "@/components/front/course-bht"
import Link from "next/link"
import { Metadata } from "next"
import dynamic from "next/dynamic"
import { MobileOptimizedSection } from "@/components/mobile-optimized-section"

export const metadata: Metadata = {
  title: 'HMS Nova | Norges ledende HMS-system for bedrifter i alle bransjer',
  description: 'HMS Nova gir deg et komplett og brukervennlig HMS-system med avviksbehandling, risikovurdering, digitalt stoffkartotek, sikker jobbanalyse og kompetansestyring. Prøv gratis i 14 dager!',
  keywords: 'HMS-system, avviksbehandling, risikovurdering, stoffkartotek, internkontroll, sikker jobbanalyse, kompetansestyring, HMS-løsning, HMS-programvare, HMS-verktøy, digitalt HMS-system, vernerunde',
}

// Statisk generering med revalidering hver 24. time
export const revalidate = 86400;

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section - Kritisk over bretten */}
      <section className="bg-gradient-to-b from-white via-gray-50 to-gray-100">
        <div className="w-full mx-auto px-4">
          <header>
            <Hero />
          </header>
          <main className="max-w-6xl mx-auto">
            <section aria-labelledby="features-heading" className="py-6">
              <h2 id="features-heading" className="sr-only">Våre funksjoner</h2>
              <div className="flex justify-center"> 
                <Features />
              </div>
            </section>
          </main>
        </div>
      </section>

      {/* Innovative Features Section - Optimalisert for mobil under bretten */}
      <MobileOptimizedSection className="py-20 bg-gradient-to-b from-gray-100 to-white" aria-labelledby="innovative-heading">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 id="innovative-heading" className="text-3xl font-bold mb-4 text-[#17304F]">Fremtidsrettet HMS-løsning</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Vår plattform integrerer innovative moduler som stoffkartotek og værdata for å gi deg en komplett og fremtidsrettet HMS-løsning. Med HMS Nova får du alle verktøyene du trenger for å sikre et trygt arbeidsmiljø og oppfylle lovkrav.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <StoffkartotekPreview />
            <WeatherPreview />
          </div>
        </div>
      </MobileOptimizedSection>

      {/* Fordeler med HMS Nova - Optimalisert for mobil under bretten */}
      <MobileOptimizedSection className="py-16 bg-white" aria-labelledby="benefits-heading">
        <div className="max-w-6xl mx-auto px-4">
          <h2 id="benefits-heading" className="text-3xl font-bold mb-8 text-center text-[#17304F]">Fordelene med HMS Nova</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <article className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-[#17304F]">Spar tid og ressurser</h3>
              <p className="text-gray-700">
                Automatiser HMS-arbeidet og reduser administrasjonstiden med opptil 70%. Vårt intuitive system gjør at du bruker mindre tid på papirarbeid og mer tid på verdiskapende aktiviteter.
              </p>
            </article>
            
            <article className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-[#17304F]">Oppfyll lovkrav enkelt</h3>
              <p className="text-gray-700">
                HMS Nova hjelper deg å oppfylle kravene i arbeidsmiljøloven og internkontrollforskriften. Våre maler og verktøy er utviklet i samarbeid med HMS-eksperter og oppdateres kontinuerlig.
              </p>
            </article>
            
            <article className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-[#17304F]">Forbedre sikkerheten</h3>
              <p className="text-gray-700">
                Reduser uønskede hendelser og skader med systematisk risikovurdering, avviksbehandling og oppfølging. Dokumenter HMS-arbeidet enkelt og bygg en sterk sikkerhetskultur.
              </p>
            </article>
          </div>
        </div>
      </MobileOptimizedSection>

      {/* Testimonials
      <section className="py-16 bg-gray-50" aria-labelledby="testimonials-heading">
        <div className="max-w-6xl mx-auto px-4">
          <h2 id="testimonials-heading" className="text-3xl font-bold mb-10 text-center text-[#17304F]">Det våre kunder sier</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <blockquote className="bg-white p-6 rounded-lg shadow-sm">
              <p className="italic text-gray-700 mb-4">
                "HMS Nova har revolusjonert måten vi jobber med HMS på. Systemet er utrolig brukervennlig og har spart oss for mange timer med administrasjon hver måned."
              </p>
              <footer className="font-semibold">
                — Morten Hansen, HMS-leder, Byggmester AS
              </footer>
            </blockquote>
            
            <blockquote className="bg-white p-6 rounded-lg shadow-sm">
              <p className="italic text-gray-700 mb-4">
                "Vi har prøvd flere HMS-systemer tidligere, men HMS Nova er det første som hele organisasjonen faktisk bruker. Fantastisk grensesnitt og kundeservice."
              </p>
              <footer className="font-semibold">
                — Kari Olsen, Daglig leder, Teknisk Service Norge
              </footer>
            </blockquote>
          </div>
        </div>
      </section> */}

      {/* Pricing Section - Optimalisert for mobil under bretten */}
      <MobileOptimizedSection id="priser" aria-labelledby="pricing-heading">
        <h2 id="pricing-heading" className="sr-only">Våre priser</h2>
        <PricingSection />
      </MobileOptimizedSection>
      
      {/* Course and BHT Section - Optimalisert for mobil under bretten */}
      <MobileOptimizedSection aria-labelledby="course-heading">
        <h2 id="course-heading" className="sr-only">Kurs og BHT-tjenester</h2>
        <CourseBHT />
      </MobileOptimizedSection>

      {/* FAQ Section - Optimalisert for mobil under bretten */}
      <MobileOptimizedSection className="py-16 bg-white" aria-labelledby="faq-heading">
        <div className="max-w-4xl mx-auto px-4">
          <h2 id="faq-heading" className="text-3xl font-bold mb-8 text-center text-[#17304F]">Ofte stilte spørsmål</h2>
          
          <dl className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <dt className="text-lg font-semibold text-[#17304F]">Hvor lang tid tar det å komme i gang med HMS Nova?</dt>
              <dd className="mt-2 text-gray-700">
                Du kan være i gang på under en time. Registrer deg, velg din plan, og få umiddelbar tilgang til systemet. Vår innebygde oppstartsveiviser hjelper deg å sette opp systemet raskt og effektivt.
              </dd>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <dt className="text-lg font-semibold text-[#17304F]">Hvordan hjelper HMS Nova oss med å oppfylle lovkrav?</dt>
              <dd className="mt-2 text-gray-700">
                HMS Nova er utviklet for å dekke alle krav i arbeidsmiljøloven og internkontrollforskriften. Systemet inkluderer maler, sjekklister og veiledninger som hjelper deg å dokumentere HMS-arbeidet på en lovlig og effektiv måte.
              </dd>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <dt className="text-lg font-semibold text-[#17304F]">Kan vi prøve HMS Nova før vi bestemmer oss?</dt>
              <dd className="mt-2 text-gray-700">
                Ja, vi tilbyr en 14-dagers gratis prøveperiode med full tilgang til alle funksjoner. Ingen betalingsinformasjon kreves for å starte prøveperioden.
              </dd>
            </div>
          </dl>
          
          <div className="mt-12 text-center">
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#2C435F] hover:bg-[#1A2A40] shadow-sm"
            >
              Start gratis prøveperiode
            </Link>
            <p className="mt-3 text-sm text-gray-500">Ingen kredittkort nødvendig. Avbryt når som helst.</p>
          </div>
        </div>
      </MobileOptimizedSection>

      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  )
}
