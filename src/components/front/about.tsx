"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export default function About() {
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Bakgrunnselementer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-20 top-1/3 w-[500px] h-[500px] bg-[#2C435F]/5 rounded-full blur-3xl"></div>
        <div className="absolute -right-20 bottom-0 w-[600px] h-[600px] bg-[#17304F]/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl">
              <Image 
                src="/team.jpg" 
                alt="Vårt team" 
                width={600} 
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute -bottom-10 -right-10 bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-xs"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#2C435F] rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#17304F]">HMS-eksperter</h3>
              </div>
              <p className="text-gray-600">
                Vårt team har over 15 års erfaring med HMS-arbeid i en rekke bransjer
              </p>
            </motion.div>
            
            <div className="absolute top-0 left-0 w-full h-full -z-10">
              <div className="absolute -top-6 -left-6 w-40 h-40 bg-[#17304F] rounded-lg rotate-12 opacity-10"></div>
              <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#2C435F] rounded-full opacity-20"></div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6"
          >
            <span className="px-4 py-1.5 rounded-full border border-[#2C435F] text-[#2C435F] w-max text-sm font-medium">
              Om oss
            </span>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#17304F] leading-tight">
              Vi gjør HMS enkelt og forståelig
            </h2>
            
            <p className="text-lg text-gray-600">
              Innutio startet med en enkel visjon: å gjøre HMS-arbeid tilgjengelig for alle bedrifter, uavhengig av størrelse og ressurser. Vi forstår at HMS-krav kan være kompliserte, og det er her vi kommer inn.
            </p>
            
            <p className="text-lg text-gray-600">
              Vår løsning er utviklet av norske HMS-eksperter som kjenner både lovkrav og praktiske utfordringer. Vi kombinerer vår ekspertise med moderne teknologi for å levere en løsning som er enkel å bruke, men kraftfull nok til å dekke alle behov.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6 mt-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-[#2C435F]/5 p-6 rounded-xl"
              >
                <h3 className="text-xl font-semibold mb-2 text-[#17304F]">Vår misjon</h3>
                <p className="text-gray-700">
                  Å gjøre HMS-arbeid enkelt og effektivt for alle bedrifter, uansett størrelse eller bransje.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-[#17304F]/5 p-6 rounded-xl"
              >
                <h3 className="text-xl font-semibold mb-2 text-[#17304F]">Våre verdier</h3>
                <p className="text-gray-700">
                  Brukervennlighet, ekspertise, pålitelighet og kontinuerlig forbedring.
                </p>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap gap-4 mt-8"
            >
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-[#2C435F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-gray-700">500+ fornøyde kunder</span>
              </div>
              
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-[#2C435F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-gray-700">15+ års erfaring</span>
              </div>
              
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-[#2C435F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-gray-700">24/7 kundestøtte</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
