"use client"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import Link from "next/link"
import { SidebarNav } from "./sidebar-nav"

interface SidebarProps {
  modules: {
    key: string
    label: string
    isActive: boolean
  }[]
}

export function Sidebar({ modules }: SidebarProps) {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col dark:border-r dark:border-neutral-800">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 dark:bg-neutral-900">
        <div className="flex h-16 shrink-0 items-center">
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
              width={200}
              height={200}
              className="hidden dark:block"
            />
          </Link>
        </div>
        <nav className="flex flex-1">
          <SidebarNav modules={modules} />
        </nav>
      </div>
    </div>
  )
}