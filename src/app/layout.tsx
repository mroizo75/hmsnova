import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"
import { CookieConsent } from "@/components/cookie-consent"
import Script from 'next/script'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Optimalisert font-visning
})

export const metadata: Metadata = {
  title: 'HMS Nova | Markedsledende HMS-system for norske bedrifter',
  description: 'HMS Nova er Norges mest brukervennlige og komplette HMS-system for små og mellomstore bedrifter. Forbedre HMS-arbeidet, reduser risiko og oppfyll lovkrav.',
  keywords: 'HMS-system, HMS-løsning, HMS-programvare, HMS-verktøy, internkontroll, avviksbehandling, risikovurdering, sikker jobbanalyse, digitalt stoffkartotek, kompetansestyring, vernerunder',
  authors: [{ name: 'HMS Nova' }],
  creator: 'HMS Nova',
  publisher: 'HMS Nova',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.hmsnova.no'),
  alternates: {
    canonical: '/',
    languages: {
      'no': '/',
      'en-US': '/en',
    },
  },
  openGraph: {
    title: 'HMS Nova | Komplett HMS-system for norske bedrifter',
    description: 'Norges mest brukervennlige og komplette HMS-system. Alt du trenger for å sikre et trygt arbeidsmiljø og oppfylle lovkrav.',
    url: 'https://www.hmsnova.no',
    siteName: 'HMS Nova',
    images: [
      {
        url: '/images/hmsnova-preview.jpg',
        width: 1200,
        height: 630,
        alt: 'HMS Nova - Komplett HMS-system',
      },
    ],
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HMS Nova | Markedsledende HMS-system',
    description: 'Forbedre HMS-arbeidet, reduser risiko og oppfyll lovkrav med Norges mest brukervennlige HMS-system.',
    images: ['/images/hmsnova-twitter.jpg'],
    creator: '@hmsnova',
    site: '@hmsnova',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '6C8icnT3rCUTplUkuMIMJoq7t2HC7MrTGQ6ViQIM9Jc',
  },
  category: 'HMS Software',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#2C435F" />
        
        {/* Preconnect til eksterne ressurser */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
        
        {/* Optimalisert critical CSS som reduserer CLS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Reduserer Content Layout Shift */
            body { font-family: var(--font-sans); overflow-x: hidden; }
            @media (max-width: 640px) {
              .mobile-optimized { content-visibility: auto; }
            }
          `
        }} />
      </head>
      <body
        className={`${inter.className} overflow-x-hidden bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900 antialiased min-h-screen`}
      >
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
        
        {/* Script for å gjenopprette cookie-samtykke fra cookies til localStorage */}
        <Script
          id="restore-cookie-consent"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Denne kjører FØR React-applikasjonen starter
                  console.log("========== COOKIE RESTORE SCRIPT ==========");
                  
                  // Hjelpefunksjon for å finne cookies
                  function getCookie(name) {
                    try {
                      const value = \`; \${document.cookie}\`;
                      const parts = value.split(\`; \${name}=\`);
                      if (parts.length === 2) {
                        const cookieValue = parts.pop().split(';').shift();
                        return cookieValue;
                      }
                      return null;
                    } catch (e) {
                      console.error("Feil ved lesing av cookie:", e);
                      return null;
                    }
                  }
                  
                  // Finn cookie
                  const consentCookie = getCookie('cookieConsent');
                  console.log("Cookie consent funnet i cookie:", consentCookie ? "ja" : "nei");
                  
                  // Finn localStorage
                  let localConsent = null;
                  try {
                    localConsent = localStorage.getItem('cookieConsent');
                    console.log("Cookie consent funnet i localStorage:", localConsent ? "ja" : "nei");
                  } catch (e) {
                    console.error("Feil ved lesing av localStorage:", e);
                  }
                  
                  // Finn sessionStorage
                  let sessionConsent = null;
                  try {
                    sessionConsent = sessionStorage.getItem('cookieConsent');
                    console.log("Cookie consent funnet i sessionStorage:", sessionConsent ? "ja" : "nei");
                  } catch (e) {
                    console.error("Feil ved lesing av sessionStorage:", e);
                  }
                  
                  // Gjenopprett fra cookie til localStorage hvis nødvendig
                  if (consentCookie && !localConsent) {
                    try {
                      const decodedValue = decodeURIComponent(consentCookie);
                      console.log("Gjenoppretter cookie-samtykke fra cookie til localStorage");
                      localStorage.setItem('cookieConsent', decodedValue);
                      
                      // Verifiser at det ble lagret
                      const verifyConsent = localStorage.getItem('cookieConsent');
                      console.log("Verifisering - Gjenopprettet localStorage:", verifyConsent ? "ja" : "nei");
                    } catch(e) {
                      console.error("Kunne ikke gjenopprette cookie-samtykke:", e);
                    }
                  }
                  
                  // Gjenopprett fra sessionStorage hvis nødvendig
                  if (sessionConsent && !localConsent && !consentCookie) {
                    try {
                      console.log("Gjenoppretter cookie-samtykke fra sessionStorage");
                      localStorage.setItem('cookieConsent', sessionConsent);
                      
                      // Sett også som cookie
                      const expiryDate = new Date();
                      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                      document.cookie = \`cookieConsent=\${encodeURIComponent(sessionConsent)};expires=\${expiryDate.toUTCString()};path=/;SameSite=Lax\`;
                      
                      console.log("Gjenopprettet fra sessionStorage til både localStorage og cookie");
                    } catch(e) {
                      console.error("Kunne ikke gjenopprette fra sessionStorage:", e);
                    }
                  }
                  
                  // Hvis vi har localStorage men ikke cookie, gjenopprett cookie
                  if (localConsent && !consentCookie) {
                    try {
                      const expiryDate = new Date();
                      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                      document.cookie = \`cookieConsent=\${encodeURIComponent(localConsent)};expires=\${expiryDate.toUTCString()};path=/;SameSite=Lax\`;
                      console.log("Gjenoppretter cookie-samtykke fra localStorage til cookie");
                      
                      // Verifiser at cookie ble lagret
                      const verifyCookie = getCookie('cookieConsent');
                      console.log("Verifisering - Gjenopprettet cookie:", verifyCookie ? "ja" : "nei");
                    } catch(e) {
                      console.error("Kunne ikke gjenopprette cookie:", e);
                    }
                  }
                } catch(e) {
                  console.error("Feil i cookie-restore script:", e);
                }
              })();
            `
          }}
        />
        
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "HMS Nova",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "699.00",
                "priceCurrency": "NOK",
                "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
              },
              "description": "HMS Nova er Norges mest brukervennlige og komplette HMS-system for små og mellomstore bedrifter. Forbedre HMS-arbeidet, reduser risiko og oppfyll lovkrav.",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "127"
              }
            })
          }}
        />
        
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"
        />
        <Script
          id="google-analytics-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXX', { 'anonymize_ip': true });
            `
          }}
        />
      </body>
    </html>
  )
}
