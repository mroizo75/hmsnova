"use client"
import { LogIn } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { BookingModal } from "@/components/booking-modal"
import { ContactModal } from '../contact-modal'

const Navbar = () => {
const [navIsOpened, setNavIsOpened] = useState(false)
const closeNavbar = () => {
setNavIsOpened(false)
}
const toggleNavbar = () => {
setNavIsOpened(navIsOpened => !navIsOpened)
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
  }
}

return (
<>
  <div aria-hidden={true} onClick={() => {
    closeNavbar()
  }} className={
    `fixed bg-gray-800/40 inset-0 z-30 ${navIsOpened ? "lg:hidden" : "hidden lg:hidden"}`
  } />
  <div className="mx-auto lg:max-w-7xl w-full px-5 sm:px-10 md:px-12 lg:px-5">
    <div className="w-full flex justify-between h-14 items-center">
      <div className="h-full flex items-center gap-x-4 text-[#2C435F] dark:text-gray-300">
        <a href="tel:+4799112916" className="flex gap-1 text-sm" rel='noreferer'>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M14.414 7l3.293-3.293a1 1 0 00-1.414-1.414L13 5.586V4a1 1 0 10-2 0v4.003a.996.996 0 00.617.921A.997.997 0 0012 9h4a1 1 0 100-2h-1.586z" />
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          <span className="hidden sm:flex">+47 99 11 29 16</span>
        </a>
        <a href="mailto:post@kksas.no" className="flex gap-1 items-center" rel='noreferer'>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M2.106 6.447A2 2 0 001 8.237V16a2 2 0 002 2h14a2 2 0 002-2V8.236a2 2 0 00-1.106-1.789l-7-3.5a2 2 0 00-1.788 0l-7 3.5zm1.48 4.007a.75.75 0 00-.671 1.342l5.855 2.928a2.75 2.75 0 002.46 0l5.852-2.926a.75.75 0 10-.67-1.342l-5.853 2.926a1.25 1.25 0 01-1.118 0l-5.856-2.928z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="hidden sm:flex">post@kksas.no</span>
        </a>
      </div>
      {/* Social media icons */}
      {/* <div className="flex items-center gap-x-2.5 -mx-2 text-gray-700 dark:text-gray-300 children:p-2 children:border children:border-x-gray-200 dark:children:border-gray-800 children:bg-gray-100 dark:children:bg-gray-900 children:rounded-md">
        <a href="#facebook" className="transition ease-linear hover:text-pink-700" rel='noreferer'>
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
            <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
          </svg>
        </a>
        <a href="#twitter" className="transition ease-linear hover:text-pink-700" rel='noreferer'>
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" className="bi bi-twitter" viewBox="0 0 16 16">
            <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
          </svg>
        </a>
        <a href="#linkedin" className="transition ease-linear hover:text-pink-700" rel='noreferer'>
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" className="bi bi-linkedin" viewBox="0 0 16 16">
            <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
          </svg>
        </a>
        <a href="#instagram" className="transition ease-linear hover:text-pink-700" rel='noreferer'>
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" className="bi bi-instagram" viewBox="0 0 16 16">
            <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
          </svg>
        </a>
      </div> */}
    </div>
  </div>
  <header className="sticky left-0 top-0 w-full flex items-center h-20 border-b border-b-gray-100 dark:border-b-gray-900 z-40 bg-white dark:bg-gray-950 bg-opacity-80 backdrop-filter backdrop-blur-xl">
    <nav className="relative mx-auto lg:max-w-7xl w-full px-5 sm:px-10 md:px-12 lg:px-5 flex gap-x-5 justify-between items-center">
      <div className="flex items-center min-w-max">
        <Link href="#" className="text-xl font-semibold flex items-center gap-x-2">
            <Image src="/HMSNova-logo.svg" alt="logo" width={250} height={250} className="block dark:hidden"/>
            <Image src="/HMSNova-white.svg" alt="logo" width={250} height={250} className="hidden dark:block"/>
        </Link>
      </div>
      <div className={`
        absolute top-full  left-0 bg-white dark:bg-gray-950 lg:bg-transparent border-b border-gray-200 dark:border-gray-800 py-8 lg:py-0 px-5 sm:px-10 md:px-12 lg:px-0 lg:border-none w-full lg:top-0 lg:relative  lg:flex lg:justify-between duration-300 ease-linear
        ${navIsOpened ? "translate-y-0 opacity-100 visible" : "translate-y-10 opacity-0 invisible lg:visible  lg:translate-y-0 lg:opacity-100"}
      `}>
        <ul className="flex flex-col lg:flex-row gap-6 lg:items-center text-gray-700 dark:text-gray-300 lg:w-full lg:justify-center">
          <li>
            <Link href="/" className="relative py-2.5 duration-300 ease-linear hover:text-[#3F546E] after:absolute after:w-full after:left-0 after:bottom-0 after:h-px after:rounded-md after:origin-left after:ease-linear after:duration-300 after:scale-x-0 hover:after:scale-100 after:bg-[#3F546E]">
              Hjem
            </Link>
          </li>
          <li>
            <button 
              onClick={() => scrollToSection('about')}
              className="relative py-2.5 duration-300 ease-linear hover:text-[#3F546E] after:absolute after:w-full after:left-0 after:bottom-0 after:h-px after:rounded-md after:origin-left after:ease-linear after:duration-300 after:scale-x-0 hover:after:scale-100 after:bg-[#3F546E]"
            >
              Om
            </button>
          </li>
          <li>
            <button 
              onClick={() => scrollToSection('services')}
              className="relative py-2.5 duration-300 ease-linear hover:text-[#3F546E] after:absolute after:w-full after:left-0 after:bottom-0 after:h-px after:rounded-md after:origin-left after:ease-linear after:duration-300 after:scale-x-0 hover:after:scale-100 after:bg-[#3F546E]"
            >
              Tjenester
            </button>
          </li>
          <li>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="relative py-2.5 duration-300 ease-linear hover:text-[#3F546E] after:absolute after:w-full after:left-0 after:bottom-0 after:h-px after:rounded-md after:origin-left after:ease-linear after:duration-300 after:scale-x-0 hover:after:scale-100 after:bg-[#3F546E]"
            >
              Priser
            </button>
          </li>
        </ul>
        <div className="flex sm:items-center lg:min-w-max mt-10 lg:mt-0 gap-2">

          <Link href="/register" className="px-6 items-center h-12 rounded-3xl text-white border border-gray-100 dark:border-gray-800 dark:text-white bg-[#3F546E] hover:bg-[#2C435F] duration-300 ease-linear flex justify-center w-full sm:w-auto">
            Registrer
          </Link>
          <Link href="/login" className="px-6 items-center h-12 rounded-3xl text-white border border-gray-100 dark:border-gray-800 dark:text-white bg-[#3F546E] hover:bg-[#2C435F] duration-300 ease-linear flex justify-center w-full sm:w-auto gap-2">
            <LogIn className="w-5 h-5" />
            Logg inn
          </Link>
        </div>
      </div>
      <div aria-hidden="true" className="flex items-center lg:hidden">
        <button onClick={() => {
          toggleNavbar()
        }} aria-label='toggle navbar' className="outline-none border-l border-l-indigo-100 dark:border-l-gray-800 pl-3 relative py-3">
          <span aria-hidden={true} className={`
            flex h-0.5 w-6 rounded bg-gray-800 dark:bg-gray-300 transition duration-300
            ${navIsOpened ? "rotate-45 translate-y-[.324rem]" : ""}
          `} />
          <span aria-hidden={true} className={`
            mt-2 flex h-0.5 w-6 rounded bg-gray-800 dark:bg-gray-300 transition duration-300
            ${navIsOpened ? "-rotate-45 -translate-y-[.324rem]" : ""}
            `} />
        </button>
      </div>
    </nav>
  </header>
</>
)
}
 
export default function HeroSection() {
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    const offset = 80 // Juster denne verdien basert på navbar høyde
    const bodyRect = document.body.getBoundingClientRect().top
    const elementRect = element.getBoundingClientRect().top
    const elementPosition = elementRect - bodyRect
    const offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}
return (
<>
  <Navbar />
  <section className="py-4 mt-14 sm:mt16 lg:mt-0">
    <div className="mx-auto lg:max-w-7xl w-full px-5 sm:px-10 md:px-12 lg:px-5 grid lg:grid-cols-2 lg:items-center gap-10">
      <div className="flex flex-col space-y-8 sm:space-y-10 lg:items-center text-center lg:text-left max-w-2xl md:max-w-3xl mx-auto">
        <h1 className=" font-semibold leading-tight text-teal-950 dark:text-white text-4xl sm:text-5xl lg:text-6xl">
        En enklere vei til trygghet  <span className="text-transparent bg-clip-text bg-gradient-to-tr from-pink-700 to-orange-800">og kvalitet.</span>
        </h1>
        <p className=" flex text-gray-700 dark:text-gray-300 tracking-tight md:font-normal max-w-xl mx-auto lg:max-w-none">
        Med HMS Nova får du et brukervennlig og profesjonelt system som hjelper din bedrift å oppfylle alle krav til helse, miljø og sikkerhet. Perfekt for små og mellomstore bedrifter som vil ha full kontroll – uansett bransje.
        </p>
        <p className=" flex text-gray-700 dark:text-gray-300 tracking-tight md:font-normal max-w-xl mx-auto lg:max-w-none">
        Kom i gang i dag – Gjør HMS enklere!Kontakt oss for en gratis demo og opplev forskjellen.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
          <ContactModal defaultMessage="Jeg ønsker å komme i gang med HMS Nova">
            <Link href="#" className="px-6 items-center h-12 rounded-3xl bg-[#3F546E] text-white hover:bg-gray-100 hover:text-[#3F546E] duration-300 ease-linear flex justify-center w-full sm:w-auto">
              Start i dag
            </Link>
          </ContactModal>
          <BookingModal>
            <Link href="#" className="px-6 items-center h-12 rounded-3xl text-[#17304F] border border-gray-100 hover:bg-[#3F546E] hover:text-white dark:border-gray-800 dark:text-white bg-gray-100 dark:bg-gray-900 duration-300 ease-linear flex justify-center w-full sm:w-auto">
              Book et møte
            </Link>
          </BookingModal>
        </div>

      </div>
      <div className="flex aspect-square lg:aspect-auto lg:h-[35rem] relative">
        <div className="w-3/5 h-[80%] rounded-3xl overflow-clip border-8 border-gray-200 dark:border-gray-950 z-30">
          <Image src="/buildingImg.jpg" alt="buildind plan image" width={1300} height={1300} className="w-full h-full object-cover z-30" />
        </div>
        <div className="absolute right-0 bottom-0 h-[calc(100%-50px)] w-4/5 rounded-3xl overflow-clip border-4 border-gray-200 dark:border-gray-800 z-10">
          <Image src="/working-on-housing-project.jpg" alt="working-on-housing-project" height={1300} width={1300} className="z-10 w-full h-full object-cover" />
        </div>
      </div>
    </div>
  </section>
</>
)
}