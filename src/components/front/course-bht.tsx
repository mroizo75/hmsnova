"use client"

import { motion } from "framer-motion"
import { Award, BookOpen, CheckCircle, Sparkles, BadgeCheck, GraduationCap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContactModal } from "@/components/contact-modal"
import Link from "next/link"
import Image from "next/image"

// Sertifikat-kategorier
const certifications = [
  { 
    code: "G4", 
    title: "Bro- og traverskran", 
    category: "Kraner"
  },
  { 
    code: "G8", 
    title: "Lastebilkran", 
    category: "Kraner"
  },
  { 
    code: "G11", 
    title: "Løfteredskap", 
    category: "Kraner"
  },
  { 
    code: "M1", 
    title: "Doser", 
    category: "Maskinføreropplæring"
  },
  { 
    code: "M2", 
    title: "Gravemaskin", 
    category: "Maskinføreropplæring"
  },
  { 
    code: "M3", 
    title: "Veihøvel", 
    category: "Maskinføreropplæring"
  },
  { 
    code: "M4", 
    title: "Hjullaster", 
    category: "Maskinføreropplæring"
  },
  { 
    code: "M5", 
    title: "Gravelaster", 
    category: "Maskinføreropplæring"
  },
  { 
    code: "M6", 
    title: "Dumper", 
    category: "Maskinføreropplæring"
  },
  { 
    code: "T1", 
    title: "Palletruck", 
    category: "Truckførerkurs"
  },
  { 
    code: "T2", 
    title: "Støttebeinstruck", 
    category: "Truckførerkurs"
  },
  { 
    code: "T4", 
    title: "Motvektstruck", 
    category: "Truckførerkurs"
  },
  { 
    code: "C1", 
    title: "Teleskoptruck", 
    category: "Truckførerkurs"
  },
  { 
    code: "C2", 
    title: "Rundsvingende teleskoptruck", 
    category: "Truckførerkurs"
  },
  { 
    code: "", 
    title: "Personløfter", 
    category: "Dokumentert opplæring"
  },
  { 
    code: "", 
    title: "Fallsikring", 
    category: "Dokumentert opplæring"
  },
  { 
    code: "", 
    title: "Stillaser", 
    category: "Dokumentert opplæring"
  },
  { 
    code: "",
    title: "HMS-leder",
    category: "Dokumentert opplæring"
  },
  { 
    code: "",
    title: "HMS-verneombud",
    category: "Dokumentert opplæring"
  },
  
  
]

// Grupperer sertifikater etter kategori
const groupedCertifications = certifications.reduce((groups, cert) => {
  if (!groups[cert.category]) {
    groups[cert.category] = []
  }
  groups[cert.category].push(cert)
  return groups
}, {} as Record<string, typeof certifications>)

// Varianter for animasjoner
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
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

export default function CourseBHT() {
  return (
    <section id="course-bht" className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Bakgrunnselementer */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-40 w-[600px] h-[600px] bg-[#2C435F]/5 rounded-full blur-3xl"></div>
        <div className="absolute -right-20 bottom-40 w-[500px] h-[500px] bg-[#17304F]/5 rounded-full blur-3xl"></div>
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
            Ekstra tjenester
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#17304F] mb-6">
            BHT-tjenester og kursvirksomhet
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Vi tilbyr både BHT-tjenester og sertifisert opplæring innen en rekke områder. 
            Som kunde hos HMS Nova får du 20% rabatt på alle våre kurs.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* BHT-tjenester */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#2C435F] to-[#17304F] p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-white" />
                <h3 className="text-2xl font-bold text-white">BHT-tjenester</h3>
              </div>
              <p className="text-white/90 mt-2">
                Lovpålagt bedriftshelsetjeneste for bedrifter i utsatte bransjer
              </p>
            </div>
            
            <div className="p-8">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-4"
              >
                <motion.div variants={itemVariants} className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#17304F]">Arbeidsplassvurderinger</h4>
                    <p className="text-gray-600">Ergonomiske undersøkelser og tilpasning av arbeidsplasser</p>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#17304F]">Helseundersøkelser</h4>
                    <p className="text-gray-600">Periodiske helsekontroller og oppfølging</p>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#17304F]">Risikovurderinger</h4>
                    <p className="text-gray-600">Kartlegging av risikofaktorer og forebyggende tiltak</p>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#17304F]">Arbeidsmiljøundersøkelser</h4>
                    <p className="text-gray-600">Kartlegging og forbedring av psykososialt arbeidsmiljø</p>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#17304F]">Eksponeringskartlegging</h4>
                    <p className="text-gray-600">Måling og vurdering av kjemisk, fysisk og biologisk eksponering</p>
                  </div>
                </motion.div>
              </motion.div>
              
              <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex gap-3">
                  <Sparkles className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  <p className="text-blue-800">
                    <span className="font-medium">HMS Nova-fordel:</span> BHT-tjenesten er noe vi kan tilby til alle kunder som trenger dette.
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <ContactModal defaultMessage="Jeg ønsker mer informasjon om BHT-tjenester">
                  <Button className="w-full bg-[#2C435F] hover:bg-[#17304F]">
                    Kontakt for BHT-tilbud
                  </Button>
                </ContactModal>
              </div>
            </div>
          </motion.div>
          
          {/* Kursvirksomhet */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#17304F] to-[#2C435F] p-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-white" />
                <h3 className="text-2xl font-bold text-white">Kursvirksomhet</h3>
              </div>
              <p className="text-white/90 mt-2">
                Sertifisert og dokumentert opplæring innen en rekke områder
              </p>
            </div>
            
            <div className="p-8">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-2"
              >
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                  <div className="bg-[#17304F]/5 p-4 rounded-lg">
                    <h4 className="font-semibold text-[#17304F] mb-2 flex items-center gap-1">
                      <Award className="h-4 w-4" /> Kraner
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {groupedCertifications['Kraner'].map(cert => (
                        <li key={cert.code} className="flex items-center gap-1">
                          <BadgeCheck className="h-4 w-4 text-green-500" />
                          <span><span className="font-medium">{cert.code}</span> - {cert.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-[#17304F]/5 p-4 rounded-lg">
                    <h4 className="font-semibold text-[#17304F] mb-2 flex items-center gap-1">
                      <Award className="h-4 w-4" /> Maskinfører
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {groupedCertifications['Maskinføreropplæring'].map(cert => (
                        <li key={cert.code} className="flex items-center gap-1">
                          <BadgeCheck className="h-4 w-4 text-green-500" />
                          <span><span className="font-medium">{cert.code}</span> - {cert.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-[#17304F]/5 p-4 rounded-lg">
                    <h4 className="font-semibold text-[#17304F] mb-2 flex items-center gap-1">
                      <Award className="h-4 w-4" /> Truckfører
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {groupedCertifications['Truckførerkurs'].map(cert => (
                        <li key={cert.code} className="flex items-center gap-1">
                          <BadgeCheck className="h-4 w-4 text-green-500" />
                          <span><span className="font-medium">{cert.code}</span> - {cert.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-[#17304F]/5 p-4 rounded-lg">
                    <h4 className="font-semibold text-[#17304F] mb-2 flex items-center gap-1">
                      <Award className="h-4 w-4" /> Dokumentert opplæring
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {groupedCertifications['Dokumentert opplæring'].map(cert => (
                        <li key={cert.code} className="flex items-center gap-1">
                          <BadgeCheck className="h-4 w-4 text-green-500" />
                          <span><span className="font-medium">{cert.code}</span> - {cert.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </motion.div>
              
              <div className="mt-8 bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex gap-3">
                  <Sparkles className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <p className="text-green-800">
                    <span className="font-medium">Kundebonus:</span> Alle som benytter HMS Nova får 20% rabatt på alle våre sertifiseringskurs.
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <ContactModal defaultMessage="Jeg ønsker mer informasjon om kurs og sertifiseringer">
                  <Button className="w-full bg-[#2C435F] hover:bg-[#17304F]">
                    Be om kurskatalog
                  </Button>
                </ContactModal>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Call to action */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-r from-[#2C435F] to-[#17304F] rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="grid md:grid-cols-2 items-center">
            <div className="p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Komplett HMS-løsning med sertifisert opplæring
              </h3>
              <p className="text-white/90 mb-6">
                Kombiner HMS Nova med våre BHT-tjenester og sertifiseringskurs for en helhetlig tilnærming til sikkerhet og kompetanse i din virksomhet.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register">
                  <Button className="bg-white text-[#17304F] hover:bg-gray-100">
                    Kom i gang med HMS Nova
                  </Button>
                </Link>
                <ContactModal defaultMessage="Jeg ønsker et kombinert tilbud med HMS Nova, BHT og kurs">
                  <Button variant="outline" className="text-[#17304F] border-white hover:bg-white/10 hover:text-white">
                    Kontakt for komplett tilbud
                  </Button>
                </ContactModal>
              </div>
            </div>
            <div className="relative h-full min-h-[300px] bg-[#17304F] hidden md:block">
              <div className="absolute inset-0 overflow-hidden">
                <Image 
                  src="/working-on-housing-project.jpg" 
                  alt="HMS-opplæring i praksis" 
                  fill
                  className="object-cover opacity-30 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#17304F]/0 to-[#17304F]/90"></div>
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-xs">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <span className="text-5xl font-bold text-white">20%</span>
                  <p className="text-white/90 mt-2">rabatt på alle kurs for HMS Nova-kunder</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 