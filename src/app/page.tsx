import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, BookOpen, AlertTriangle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <div className="w-full mx-auto px-4 py-8">
        <nav className="flex justify-between items-center py-6 px-8 mb-20">
          
          <div className="text-3xl font-bold bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent">
            <Link href="/">
              <Image src="/logo_innut.png" alt="innut.io" width={150} height={150} />
            </Link>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" size="lg" className="text-green-700 hover:text-green-800" asChild>
              <Link href="/login">Logg inn</Link>
            </Button>
            <Button 
              size="lg"
              className="bg-green-700 hover:bg-green-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5" 
              asChild
            >
              <Link href="/register">Registrer bedrift</Link>
            </Button>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto">
          <div className="text-center mb-24 space-y-8">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-green-700 via-green-600 to-green-500 bg-clip-text text-transparent animate-fade-in">
              HMS-system for fremtiden
            </h1>
            <p className="text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Effektiv HMS-håndtering for moderne bedrifter som ønsker full kontroll
            </p>
            <Button 
              size="lg" 
              className="bg-green-700 hover:bg-green-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 text-lg px-8 py-6 h-auto" 
              asChild
            >
              <Link href="/register">
                Kom i gang <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <FeatureCard
              icon={Shield}
              title="ISO-sertifisert"
              description="Følger ISO9001, ISO45001 og ISO27001 standardene for maksimal kvalitetssikring"
            />
            <FeatureCard
              icon={BookOpen}
              title="Digital HMS-håndbok"
              description="Alltid oppdatert med siste forskrifter og krav fra myndighetene"
            />
            <FeatureCard
              icon={AlertTriangle}
              title="Avvikshåndtering"
              description="Effektiv registrering og oppfølging av HMS-avvik i sanntid"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 px-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm">
            <StatCard number="99.9%" text="Oppetid" />
            <StatCard number="5000+" text="Aktive brukere" />
            <StatCard number="150+" text="Bedrifter" />
            <StatCard number="24/7" text="Support" />
          </div>
        </main>
      </div>
    </div>
  )
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 rounded-2xl border border-gray-200 hover:border-green-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm group">
      <Icon className="w-12 h-12 text-green-700 mb-6 group-hover:scale-110 transition-transform duration-200" />
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

function StatCard({ number, text }: { number: string; text: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-green-700 mb-2">{number}</div>
      <div className="text-gray-600">{text}</div>
    </div>
  )
}
