import { Shield, BookOpen, AlertTriangle, Users, ClipboardCheck, BarChart } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "ISO-sertifisert sikkerhet",
    description: "Følger de strengeste internasjonale standardene for HMS-arbeid med ISO9001, ISO45001 og ISO27001 sertifiseringer."
  },
  {
    icon: BookOpen,
    title: "Digital HMS-håndbok",
    description: "Alltid oppdatert med gjeldende lover og forskrifter. Skreddersydd for din bedrift med automatiske varsler om endringer."
  },
  {
    icon: AlertTriangle,
    title: "Smart avvikshåndtering",
    description: "Effektiv registrering og oppfølging av HMS-avvik i sanntid. Automatiske varsler og påminnelser sikrer at ingenting blir oversett."
  },
  {
    icon: Users,
    title: "Medarbeiderinvolvering",
    description: "Engasjer hele organisasjonen i HMS-arbeidet med brukervennlige verktøy for rapportering og oppfølging."
  },
  {
    icon: ClipboardCheck,
    title: "Risikovurdering",
    description: "Systematisk kartlegging og vurdering av risiko med intuitive verktøy. Forebygg ulykker før de skjer."
  },
  {
    icon: BarChart,
    title: "Avansert analyse",
    description: "Få verdifull innsikt i HMS-arbeidet med detaljerte rapporter og dashboards. Ta bedre beslutninger basert på data."
  }
]

export default function Features() {
  return (
    <section id="services" className="py-24">
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="p-8 rounded-2xl border border-gray-200 hover:border-[#2C435F] transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm group"
          >
            <feature.icon className="w-12 h-12 text-[#2C435F] mb-6 group-hover:scale-110 transition-transform duration-200" />
            <h3 className="text-2xl font-semibold mb-4 text-[#17304F]">{feature.title}</h3>
            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
