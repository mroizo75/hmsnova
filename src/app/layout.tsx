import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'innut.io',
  description: 'HMS-system for norske bedrifter',
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
      </body>
    </html>
  )
}
