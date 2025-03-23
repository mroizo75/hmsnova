"use client"
import { LogIn } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { BookingModal } from "@/components/booking-modal"
import { ContactModal } from '../contact-modal'
import { motion } from 'framer-motion'
import Navbar from './navbar'

export default function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="relative pt-8 bg-white w-screen -ml-[1px] box-border">
      <Navbar />
      
      <div className="relative mx-auto lg:max-w-7xl w-full px-5 sm:px-10 md:px-12 lg:px-5 py-16 lg:py-28 z-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="px-4 py-1.5 rounded-full border border-[#2C435F] text-[#2C435F] w-max text-sm font-medium"
            >
              Din partner for HMS-arbeid
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#17304F] leading-tight"
            >
              Enklere, Sikrere <br />
              <span className="relative mt-3 inline-block">
                <span className="relative z-10">HMS-håndtering</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-[#2C435F]/20 z-0"></span>
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-lg text-gray-600 md:text-xl max-w-lg"
            >
              Norges mest brukervennlige HMS-system som sikrer at din bedrift følger alle lovkrav på en enkel og effektiv måte.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <BookingModal>
                <button className="px-6 py-3 rounded-full bg-[#17304F] text-white font-medium hover:bg-[#2C435F] transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform">
                  Bestill demo
                </button>
              </BookingModal>
              <button 
                onClick={() => scrollToSection('pricing')} 
                className="px-6 py-3 rounded-full border border-[#2C435F] text-[#2C435F] font-medium hover:bg-[#2C435F] hover:text-white transition-colors duration-300"
              >
                Se priser
              </button>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="flex items-center gap-5 pt-6 flex-wrap"
            >
              <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                <div className="bg-blue-50 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-[#17304F]">GDPR-kompatibel</p>
                  <p className="text-xs text-gray-500">Sikker databehandling</p>
                </div>
              </div>
              
              <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                <div className="bg-green-50 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-[#17304F]">Norsk lovverk</p>
                  <p className="text-xs text-gray-500">Alltid oppdatert</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative"
          >
            <div className="relative z-10 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-6 bg-white">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#17304F]">HMS Nova Dashboard</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-[#2C435F]/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2C435F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#2C435F]/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2C435F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 mb-6">
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-500">Ansatte</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="text-xl font-bold">14</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-500">Avvik</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="text-xl font-bold">7</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-500">Risikovurderinger</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="text-xl font-bold">12</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-500">SJA</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="text-xl font-bold">3</div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-6">
                  <h4 className="text-sm font-semibold mb-4">Avviksstatus</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Åpne</div>
                        <div className="text-lg font-bold">3</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="h-7 w-7 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Under arbeid</div>
                        <div className="text-lg font-bold">4</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Lukket</div>
                        <div className="text-lg font-bold">24</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Totalt</div>
                        <div className="text-lg font-bold">31</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <h4 className="text-sm font-semibold mb-3">Siste aktivitet</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      <span className="text-gray-600">Nytt avvik registrert: </span>
                      <span className="ml-1 font-medium">Manglende verneutstyr</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      <span className="text-gray-600">Risikovurdering oppdatert: </span>
                      <span className="ml-1 font-medium">Brannrisiko verksted</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <span className="text-gray-600">Avvik lukket: </span>
                      <span className="ml-1 font-medium">Manglende brannslukkere</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#17304F]/30 to-transparent pointer-events-none"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-md max-h-80 rounded-full bg-[#2C435F]/30 blur-3xl -z-10"></div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute -bottom-5 -left-10 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 border border-gray-100 z-20"
            >
              <div className="bg-green-100 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-[#17304F]">100% Lovkrav</p>
                <p className="text-sm text-gray-500">Sikrer etterlevelse</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="absolute -top-5 right-10 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 border border-gray-100 z-20"
            >
              <div className="bg-blue-100 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-[#17304F]">Følger ISO-standardene</p>
                <p className="text-sm text-gray-500">Trygg behandling</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}