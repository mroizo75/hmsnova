"use client"

import Link from "next/link"
import Image from "next/image"
import { ContactModal } from "@/components/contact-modal"
import { BookingModal } from "@/components/booking-modal"
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-[#17304F] text-white relative overflow-hidden">
      {/* Bakgrunnselement */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-40 -top-40 w-[400px] h-[400px] bg-[#2C435F] rounded-full opacity-20"></div>
        <div className="absolute left-0 top-1/2 w-[600px] h-[600px] bg-[#2C435F] rounded-full opacity-10"></div>
      </div>
      
      <div className="container mx-auto px-4 pt-16 pb-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Image src="/HMSNova-white.svg" alt="HMSNova Logo" width={200} height={200} className="h-20 w-auto" />
            </div>
            <p className="text-white/80 max-w-xs">
              Vi gjør HMS-arbeid enkelt og effektivt for norske bedrifter med vår innovative og brukervennlige plattform.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-300">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Våre tjenester</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/hms-handbok" className="text-white/70 hover:text-white transition-colors duration-200">HMS-håndbok</Link>
              </li>
              <li>
                <Link href="/avvikshandtering" className="text-white/70 hover:text-white transition-colors duration-200">Avvikshåndtering</Link>
              </li>
              <li>
                <Link href="/risikovurdering" className="text-white/70 hover:text-white transition-colors duration-200">Risikovurdering</Link>
              </li>
              <li>
                <Link href="/vernerunde" className="text-white/70 hover:text-white transition-colors duration-200">Vernerunder</Link>
              </li>
              <li>
                <Link href="/stoffkartotek" className="text-white/70 hover:text-white transition-colors duration-200">Stoffkartotek</Link>
              </li>
              <li>
                <Link href="/sikkerjobbanalyse" className="text-white/70 hover:text-white transition-colors duration-200">Sikker Jobb Analyse</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Om oss</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/omoss" className="text-white/70 hover:text-white transition-colors duration-200">Vår historie</Link>
              </li>
              <li>
                <Link href="/team" className="text-white/70 hover:text-white transition-colors duration-200">Team</Link>
              </li>
              <li>
                <Link href="/karriere" className="text-white/70 hover:text-white transition-colors duration-200">Karriere</Link>
              </li>
              <li>
                <Link href="/personvern" className="text-white/70 hover:text-white transition-colors duration-200">Personvern</Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/70 hover:text-white transition-colors duration-200">Vilkår</Link>
              </li>
              <li>
                <Link href="/cookies" className="text-white/70 hover:text-white transition-colors duration-200">Cookies</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Kontakt oss</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-white/80 mt-1 flex-shrink-0" />
                <a href="tel:+4799112916" className="text-white/70 hover:text-white transition-colors duration-200">
                  +47 99 11 29 16
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-white/80 mt-1 flex-shrink-0" />
                <a href="mailto:kenneth@kksas.no" className="text-white/70 hover:text-white transition-colors duration-200">
                  kenneth@kksas.no
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-white/80 mt-1 flex-shrink-0" />
                <span className="text-white/70">
                  Peckels Gate 12B, 3616 Kongsberg
                </span>
              </li>
            </ul>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <ContactModal>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors duration-300">
                  Kontakt oss
                </button>
              </ContactModal>
              
              <BookingModal>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors duration-300">
                  Book demo
                </button>
              </BookingModal>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between gap-4">
          <p className="text-white/60 text-sm">
            © {currentYear} KKS AS. Alle rettigheter forbeholdt.
          </p>
          <div className="flex gap-6">
            <Link href="/personvern" className="text-white/60 hover:text-white text-sm transition-colors duration-200">
              Personvern
            </Link>
            <Link href="/terms" className="text-white/60 hover:text-white text-sm transition-colors duration-200">
              Vilkår
            </Link>
            <Link href="/cookies" className="text-white/60 hover:text-white text-sm transition-colors duration-200">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}