"use client"
import { LogIn, ChevronDown, ChevronUp, Award } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ContactModal } from '../contact-modal'

export default function Navbar() {
  const [navIsOpened, setNavIsOpened] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeNavbar = () => {
    setNavIsOpened(false)
    setActiveDropdown(null)
  }
  
  const toggleNavbar = () => {
    setNavIsOpened(navIsOpened => !navIsOpened)
    if (activeDropdown) setActiveDropdown(null)
  }

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      closeNavbar()
    }
  }

  // Struktur for navigasjonsmenyen
  const menuItems = [
    { 
      title: "Tjenester", 
      action: () => scrollToSection('services'),
      isScrollTrigger: true
    },
    { 
      title: "Moduler", 
      dropdown: true,
      items: [
        { title: "HMS-håndbok", href: "/hms-handbok" },
        { title: "Avvikshåndtering", href: "/avvikshandtering" },
        { title: "Risikovurdering", href: "/risikovurdering" },
        { title: "Sikker Jobb Analyse", href: "/sikkerjobbanalyse" },
        { title: "Stoffkartotek", href: "/stoffkartotek" },
        { title: "Vernerunde", href: "/vernerunde" },
        { title: "Kompetanse", href: "/kompetanse" }
      ]
    },
    { 
      title: "Priser", 
      action: () => scrollToSection('pricing'),
      isScrollTrigger: true
    },
    { 
      title: "Om oss", 
      dropdown: true,
      items: [
        { title: "Om HMS Nova", href: "/omoss" },
        { title: "Teamet", href: "/team" },
        { title: "Karriere", href: "/karriere" }
      ]
    },
    { 
      title: "Kontakt", 
      modal: true
    }
  ]

  return (
    <>
      <div aria-hidden={true} onClick={closeNavbar} className={
        `fixed bg-gray-900/60 inset-0 z-30 backdrop-blur-sm transition-opacity duration-300 ${navIsOpened ? "opacity-100 lg:hidden" : "opacity-0 hidden"}`
      } />
      <div className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'}`}>
        <div className="mx-auto lg:max-w-7xl w-full px-5 sm:px-10 md:px-12 lg:px-5">
          <div className="w-full flex justify-between items-center">
            <div className="h-full flex items-center gap-x-4 text-[#2C435F]">
              <a href="/" className="flex items-center gap-2">
                <Image src="/HMSNova-logo.svg" alt="HMSNova Logo" width={100} height={100} className="h-20 w-auto" />
              </a>
              {/* <a href="tel:+4799112916" className="hidden sm:flex gap-1 text-sm items-center hover:text-[#17304F] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>+47 99 11 29 16</span>
              </a> */}
            </div>
            <div className="flex items-center gap-x-2">
              <div className={`absolute lg:static lg:flex lg:w-auto w-full top-14 left-0 bg-white lg:bg-transparent border-b border-gray-200 lg:border-0 ${!navIsOpened ? "hidden" : ""}`}>
                {/* Desktop og Mobil meny */}
                <ul className="flex flex-col lg:flex-row gap-4 lg:items-center text-[#2C435F] font-medium lg:static p-6 lg:p-0">
                  {menuItems.map((item, idx) => (
                    <li key={idx} className="relative">
                      {item.modal ? (
                        <ContactModal>
                          <button className="relative py-2.5 duration-300 ease-linear hover:text-[#17304F] after:absolute after:w-full after:left-0 after:bottom-0 after:h-0.5 after:rounded-md after:origin-left after:ease-linear after:duration-300 after:scale-x-0 hover:after:scale-x-100 after:bg-[#17304F]">{item.title}</button>
                        </ContactModal>
                      ) : item.dropdown ? (
                        <div>
                          <button 
                            onClick={() => toggleDropdown(item.title)}
                            className="flex items-center gap-1 py-2.5 w-full lg:w-auto duration-300 ease-linear hover:text-[#17304F]"
                          >
                            {item.title}
                            {activeDropdown === item.title ? 
                              <ChevronUp className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />
                            }
                          </button>
                          {/* Dropdown meny for desktop */}
                          <div 
                            className={`${
                              activeDropdown === item.title ? "opacity-100 visible" : "opacity-0 invisible"
                            } transition-all duration-300 lg:absolute lg:top-full lg:left-0 lg:shadow-lg lg:rounded-lg lg:bg-white lg:min-w-[200px] lg:mt-1 static bg-gray-50 rounded-md mt-1`}
                          >
                            <ul className="py-2 lg:py-3 flex flex-col">
                              {item.items?.map((subItem, subIdx) => (
                                <li key={subIdx}>
                                  <Link 
                                    href={subItem.href} 
                                    onClick={closeNavbar}
                                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#17304F] transition-colors"
                                  >
                                    {subItem.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={item.action} 
                          className="relative py-2.5 duration-300 ease-linear hover:text-[#17304F] after:absolute after:w-full after:left-0 after:bottom-0 after:h-0.5 after:rounded-md after:origin-left after:ease-linear after:duration-300 after:scale-x-0 hover:after:scale-x-100 after:bg-[#17304F]"
                        >
                          {item.title}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-x-3">
                <Link 
                  href="/login"
                  className="flex items-center text-[#2C435F] gap-x-1 py-2 px-4 font-medium border border-[#2C435F] rounded-full hover:bg-[#2C435F] hover:text-white transition-colors duration-300"
                >
                  <LogIn className="size-5" />
                  <span>Logg inn</span>
                </Link>
                <Link 
                  href="/register"
                  className="flex items-center text-[#2C435F] gap-x-1 py-2 px-4 font-medium border border-[#2C435F] rounded-full hover:bg-[#2C435F] hover:text-white transition-colors duration-300 hidden sm:flex"
                >
                  <Award className="size-5" />
                  <span>Kom i gang</span>
                </Link>
                <button onClick={toggleNavbar} className="block lg:hidden text-[#2C435F] p-1.5 rounded-full hover:bg-gray-100">
                  {
                    navIsOpened ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                      </svg>
                    )
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 