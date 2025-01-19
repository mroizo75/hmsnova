import { Button } from "@/components/ui/button"
import { 
  Cloud, Lock, Zap, Smartphone,
  ListCheck
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Features from "@/components/front/feature"
import Footer from "@/components/front/footer"
import Hero from "@/components/front/hero"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white via-gray-50 to-gray-100">
        <div className="w-full mx-auto px-4">
          <Hero />
          <main className="max-w-6xl mx-auto">
            <div className="flex justify-center py-6"> 
              <Features />
            </div>
          </main>
        </div>
      </div>

      {/* Integrasjoner - Dark Section med Glassmorphism */}
      <section className="bg-[#17304F] py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          {/* [BILDE PLASSERING 2: Abstrakt bakgrunnsmønster] */}
          <div className="absolute inset-0 bg-[#17304F]/90" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Sømløse integrasjoner</h2>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              HMS Nova integrerer seg enkelt med dine eksisterende systemer
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300">
                <integration.icon className="w-12 h-12 text-white mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-white">{integration.title}</h3>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-[#17304F] mb-6">Klar til å forbedre HMS-arbeidet?</h2>
          <p className="text-xl text-[#17304F] mb-12 max-w-2xl mx-auto">
            Kom i gang med HMS Nova i dag og opplev hvordan moderne teknologi kan forenkle HMS-arbeidet
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-[#2C435F] text-white hover:bg-[#17304F] shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 text-lg px-8 py-6 h-auto" 
              asChild
            >
              <Link href="/register">
                Prøv gratis i 30 dager
              </Link>
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-[#2C435F] text-[#2C435F] hover:bg-[#2C435F] hover:text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 text-lg px-8 py-6 h-auto" 
              asChild
            >
              <Link href="/contact">
                Kontakt oss
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

const integrations = [
  {
    icon: Cloud,
    title: "Skybasert lagring"
  },
  {
    icon: ListCheck,
    title: "Vernerunder"
  },
  {
    icon: Zap,
    title: "Automatisering"
  },
  {
    icon: Smartphone,
    title: "Mobil HMS"
  }
]
