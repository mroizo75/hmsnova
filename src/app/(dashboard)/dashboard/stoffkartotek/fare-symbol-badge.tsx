"use client"

import { FareSymbol } from "@prisma/client"
import Image from "next/image"
import { cn } from "@/lib/utils"

const symbolConfig: Record<FareSymbol, { image: string; label: string }> = {
  BRANNFARLIG: { 
    image: "/faremerker/brannfarlig.webp", 
    label: "Brannfarlig" 
  },
  ETSENDE: { 
    image: "/faremerker/etsende.webp", 
    label: "Etsende" 
  },

  GIFTIG: { 
    image: "/faremerker/giftig.webp", 
    label: "Giftig" 
  },

  HELSEFARE: { 
    image: "/faremerker/helserisiko.webp", 
    label: "Helsefare" 
  },

  MILJØFARE: { 
    image: "/faremerker/miljofare.webp", 
    label: "Miljøfare" 
  },

  EKSPLOSJONSFARLIG: { 
    image: "/faremerker/explosive.webp", 
    label: "Eksplosjonsfarlig" 
  },

  OKSIDERENDE: { 
    image: "/faremerker/oksiderende.webp", 
    label: "Oksiderende" 
  },

  GASS_UNDER_TRYKK: { 
    image: "/faremerker/gass_under_trykk.webp", 
    label: "Gass under trykk" 
  },


  AKUTT_GIFTIG: { 
    image: "/faremerker/kronisk_helsefarlig.webp", 
    label: "Kronisk helsefare" 
  },
}


interface FareSymbolBadgeProps {
  symbol: FareSymbol
  showLabel?: boolean
  selected?: boolean
}

export function FareSymbolBadge({ symbol, showLabel = false, selected = false }: FareSymbolBadgeProps) {
  const config = symbolConfig[symbol]
  if (!config) return null

  return (
    <div className={cn(
      "flex items-center gap-2",
      selected && "text-primary"
    )}>
      <div className="relative w-8 h-8">
        <Image
          src={config.image}
          alt={config.label}
          fill
          className="object-contain"
        />
      </div>
      {showLabel && (
        <span className="text-sm">{config.label}</span>
      )}
    </div>
  )
} 