"use client"
import { LogIn, ChevronDown, ChevronUp, UserPlus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ContactModal } from '../contact-modal'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [navIsOpened, setNavIsOpened] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  
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
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      closeNavbar()
    }
  }
  
  // Direkte funksjoner for scroll-triggers
  const scrollToServices = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isHomePage) {
      scrollToSection('services')
    } else {
      window.location.href = '/#services'
    }
  }
  
  const scrollToPricing = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isHomePage) {
      scrollToSection('pricing')
    } else {
      window.location.href = '/#pricing'
    }
  }

  // Struktur for navigasjonsmenyen
  const menuItems = [
    { 
      title: "Tjenester", 
      action: isHomePage ? () => scrollToSection('services') : undefined,
      href: isHomePage ? "#services" : "/#services",
      scrollTarget: 'services',
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
      action: isHomePage ? () => scrollToSection('pricing') : undefined,
      href: isHomePage ? "#pricing" : "/#pricing",
      scrollTarget: 'pricing',
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
      {/* Overlay for mobile menu */}
      <div 
        aria-hidden={true} 
        onClick={closeNavbar}
        className={`fixed inset-0 bg-gray-900/60 z-30 transition-opacity duration-300 ${navIsOpened ? "opacity-100 lg:hidden" : "opacity-0 pointer-events-none lg:hidden"}`}
      />
      
      {/* Navbar Container */}
      <div className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'}`}>
        <div className="mx-auto lg:max-w-7xl w-full px-5 sm:px-10 md:px-12 lg:px-5">
          <div className="w-full flex justify-between items-center">
            {/* Logo */}
            <div className="h-full flex items-center gap-x-4 text-[#2C435F]">
              <a href="/" className="flex items-center gap-2">
                <Image src="/HMSNova-logo.svg" alt="HMSNova Logo" width={100} height={100} className="h-16 sm:h-20 w-auto" />
              </a>
            </div>
            
            {/* Mobile Action Buttons */}
            <div className="flex lg:hidden items-center gap-x-2">
              <Link href="/login" className="flex items-center justify-center p-2 text-[#2C435F] rounded-full hover:bg-gray-100">
                <LogIn className="size-5" />
                <span className="sr-only">Logg inn</span>
              </Link>
              <Link href="/register" className="flex items-center justify-center p-2 text-[#2C435F] rounded-full hover:bg-gray-100">
                <UserPlus className="size-5" />
                <span className="sr-only">Registrer deg</span>
              </Link>
              
              {/* Mobile Hamburger Button */}
              <button onClick={toggleNavbar} className="flex items-center justify-center p-2 text-[#2C435F] rounded-full hover:bg-gray-100">
                {navIsOpened ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-x-2 md:gap-x-3">
              <div className="lg:flex lg:w-auto">
                <ul className="flex lg:flex-row gap-4 items-center text-[#2C435F] font-medium">
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
                            className="flex items-center gap-1 py-2.5 duration-300 ease-linear hover:text-[#17304F]"
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
                            } transition-all duration-300 absolute top-full left-0 shadow-lg rounded-lg bg-white min-w-[200px] mt-1`}
                          >
                            <ul className="py-3 flex flex-col">
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
                      ) : item.isScrollTrigger ? (
                        <Link 
                          href={item.href}
                          onClick={idx === 0 ? scrollToServices : scrollToPricing}
                          className="relative py-2.5 duration-300 ease-linear hover:text-[#17304F] cursor-pointer after:absolute after:w-full after:left-0 after:bottom-0 after:h-0.5 after:rounded-md after:origin-left after:ease-linear after:duration-300 after:scale-x-0 hover:after:scale-x-100 after:bg-[#17304F]"
                        >
                          {item.title}
                        </Link>
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
                  className="flex items-center text-[#2C435F] gap-x-1 py-2 px-4 font-medium border border-[#2C435F] rounded-full hover:bg-[#2C435F] hover:text-white transition-colors duration-300"
                >
                  <UserPlus className="size-5" />
                  <span>Registrer deg</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu (Separate from overlay) */}
      <div 
        className={`fixed inset-x-0 top-[72px] sm:top-[88px] bottom-0 bg-white z-30 overflow-y-auto transform transition-transform duration-300 lg:hidden ${
          navIsOpened ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="p-4 pb-20">
          <div className="grid gap-6">
            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-2">Navigasjon</h3>
              <nav className="grid gap-2">
                <a 
                  href={isHomePage ? "#services" : "/#services"} 
                  onClick={scrollToServices}
                  className="py-3 px-4 flex items-center rounded-lg hover:bg-gray-50 text-[#2C435F]"
                >
                  <span className="font-medium">Tjenester</span>
                </a>
                <a 
                  href={isHomePage ? "#pricing" : "/#pricing"} 
                  onClick={scrollToPricing}
                  className="py-3 px-4 flex items-center rounded-lg hover:bg-gray-50 text-[#2C435F]"
                >
                  <span className="font-medium">Priser</span>
                </a>
                <ContactModal>
                  <button className="text-left w-full py-3 px-4 flex items-center rounded-lg hover:bg-gray-50 text-[#2C435F]">
                    <span className="font-medium">Kontakt</span>
                  </button>
                </ContactModal>
              </nav>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-2">Moduler</h3>
              <nav className="grid gap-2">
                {menuItems[1].items?.map((item, idx) => (
                  <Link 
                    key={idx}
                    href={item.href} 
                    onClick={closeNavbar}
                    className="py-2 px-4 flex items-center rounded-lg hover:bg-gray-50 text-[#2C435F]"
                  >
                    <span className="font-medium">{item.title}</span>
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="border-t pt-4 mt-2">
              <div className="flex gap-3">
                <Link 
                  href="/login"
                  className="flex-1 flex justify-center items-center gap-x-1 py-2.5 px-4 text-sm font-medium border border-[#2C435F] rounded-full hover:bg-[#2C435F] hover:text-white text-[#2C435F] transition-colors duration-300"
                >
                  <LogIn className="size-4" />
                  <span>Logg inn</span>
                </Link>
                <Link 
                  href="/register"
                  className="flex-1 flex justify-center items-center gap-x-1 py-2.5 px-4 text-sm font-medium bg-[#2C435F] text-white rounded-full hover:bg-[#17304F] transition-colors duration-300"
                >
                  <UserPlus className="size-4" />
                  <span>Registrer deg</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 