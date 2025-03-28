"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"
import { SidebarClient } from "./sidebar-client"
import { MobileSidebar } from "./mobile-sidebar"

interface SidebarProps {
  modules: {
    key: string
    label: string
    isActive: boolean
  }[]
}

export function Sidebar({ modules }: SidebarProps) {
  const [open, setOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 dark:bg-black">
      <div className="flex h-[65px] shrink-0 items-center border-b">
        <Link href="/dashboard" className="flex items-center" onClick={() => setOpen(false)}>
          <Image
            src="/HMSNova-logo.svg"
            alt="HMS Nova"
            width={200}
            height={200}
            className="block dark:hidden"
          />
          <Image
            src="/HMSNova-white.svg"
            alt="HMS Nova"
            width={200}
            height={200}
            className="hidden dark:block"
          />
        </Link>
      </div>
      <nav className="flex flex-1">
        <SidebarClient modules={modules} onItemClick={() => setOpen(false)} />
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobil meny-knapp */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-60">
            <div className="flex flex-col h-full">
              <div className="flex h-[65px] shrink-0 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center" onClick={() => setOpen(false)}>
                  <Image
                    src="/HMSNova-logo.svg"
                    alt="HMS Nova"
                    width={150}
                    height={150}
                    className="block dark:hidden"
                  />
                  <Image
                    src="/HMSNova-white.svg"
                    alt="HMS Nova"
                    width={150}
                    height={150}
                    className="hidden dark:block"
                  />
                </Link>
              </div>
              <MobileSidebar modules={modules} onCloseAction={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-60 lg:flex-col dark:border-r dark:border-neutral-800">
        <SidebarContent />
      </div>

      {/* Mobil header med logo */}
      <div className="fixed top-0 left-0 right-0 h-16 border-b bg-white px-4 flex items-center justify-center lg:hidden">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/HMSNova-logo.svg"
            alt="HMS Nova"
            width={200}
            height={200}
            className="block dark:hidden"
          />
          <Image
            src="/HMSNova-white.svg"
            alt="HMS Nova"
            width={150}
            height={150}
            className="hidden dark:block"
          />
        </Link>
        
      </div>

      {/* Main content spacing */}
      <div className="lg:pl-60">
        <div className="h-16 lg:hidden" />
      </div>
    </>
  )
}