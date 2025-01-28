import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"
import { CookieConsent } from "@/components/cookie-consent"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HMS Nova - Fremtidens HMS-system',
  description: 'HMS-system for små og mellomstore bedrifter',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nb" suppressHydrationWarning>
      <body className={cn(
        inter.className,
        "min-h-screen bg-background dark:bg-neutral-900 dark:text-neutral-50"
      )}>
        <Providers>
          {children}
        </Providers>
        <CookieConsent />
      </body>
    </html>
  )
}
