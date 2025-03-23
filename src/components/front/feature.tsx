"use client"

import { Shield, BookOpen, AlertTriangle, Users, ClipboardCheck, BarChart, Link } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "../ui/button"
import NextLink from "next/link"

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
}

export default function Features() {
  return (
    <section id="services" className="py-24 relative overflow-hidden">
      {/* Bakgrunnselementer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-1/4 w-[800px] h-[800px] bg-[#2C435F]/5 rounded-full blur-3xl -translate-x-1/2"></div>
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-[#17304F]/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="px-4 py-1.5 text-[#2C435F] text-md font-medium inline-block mb-4">
            Våre tjenester
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#17304F] mb-6">
            En komplett HMS-løsning
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-8">
            Vi har alt du trenger for å sikre at din virksomhet oppfyller alle HMS-krav og skaper et trygt arbeidsmiljø.
          </p>
          <NextLink href="/tjenester">
            <button className="bg-[#2C435F] text-white font-medium py-3 px-8 rounded-full hover:bg-[#17304F] transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform">
              Utforsk alle tjenester
            </button>
          </NextLink>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="p-8 rounded-2xl border border-gray-100 hover:border-[#2C435F] transition-all duration-300 hover:shadow-xl bg-white/80 backdrop-blur-sm group"
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="relative w-16 h-16 bg-[#2C435F]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#17304F]/10 transition-colors duration-300">
                <feature.icon className="w-8 h-8 text-[#2C435F] group-hover:text-[#17304F] transition-colors duration-300" />
                
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#17304F] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <h3 className="text-xl font-semibold mb-4 text-[#17304F] group-hover:text-[#2C435F] transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 bg-gradient-to-r from-[#2C435F] to-[#17304F] rounded-2xl p-10 text-white text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Vi hjelper deg med å holde oversikt over alle dine HMS-krav
          </h3>
          <p className="max-w-2xl mx-auto mb-8 text-white/90">
            Vårt team av HMS-eksperter er alltid oppdatert på lovverk og forskrifter, og sikrer at du og din bedrift er et steg foran.
          </p>
          <NextLink href="/tjenester">
            <button className="bg-white text-[#17304F] font-medium py-3 px-8 rounded-full hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform">
              Alle tjenester
            </button>
          </NextLink>
        </motion.div>
      </div>
    </section>
  )
}
