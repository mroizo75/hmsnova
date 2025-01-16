"use client"

import { FareSymbol } from "@prisma/client"
import { 
  Flame, 
  Skull, 
  AlertTriangle, 
  Droplets, 
  Leaf, 
  Bomb, 
  Atom, 
  Cylinder, 
  AlertOctagon 
} from "lucide-react"
import { cn } from "@/lib/utils"

const symbolConfig: Record<FareSymbol, { icon: any; color: string; label: string }> = {
  BRANNFARLIG: { 
    icon: Flame, 
    color: "bg-red-100 text-red-800", 
    label: "Brannfarlig" 
  },
  ETSENDE: { 
    icon: Droplets, 
    color: "bg-purple-100 text-purple-800", 
    label: "Etsende" 
  },
  GIFTIG: { 
    icon: Skull, 
    color: "bg-gray-100 text-gray-800", 
    label: "Giftig" 
  },
  HELSEFARE: { 
    icon: AlertTriangle, 
    color: "bg-yellow-100 text-yellow-800", 
    label: "Helsefare" 
  },
  MILJØFARE: { 
    icon: Leaf, 
    color: "bg-green-100 text-green-800", 
    label: "Miljøfare" 
  },
  EKSPLOSJONSFARLIG: { 
    icon: Bomb, 
    color: "bg-orange-100 text-orange-800", 
    label: "Eksplosjonsfarlig" 
  },
  OKSIDERENDE: { 
    icon: Atom, 
    color: "bg-blue-100 text-blue-800", 
    label: "Oksiderende" 
  },
  GASS_UNDER_TRYKK: { 
    icon: Cylinder, 
    color: "bg-indigo-100 text-indigo-800", 
    label: "Gass under trykk" 
  },
  AKUTT_GIFTIG: { 
    icon: AlertOctagon, 
    color: "bg-rose-100 text-rose-800", 
    label: "Akutt giftig" 
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

  const Icon = config.icon

  return (
    <div 
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors",
        selected ? config.color : "bg-gray-100 text-gray-700 hover:bg-gray-200",
        "cursor-pointer"
      )}
      title={config.label}
    >
      <Icon className="h-3 w-3" />
      {showLabel && <span className="ml-1">{config.label}</span>}
    </div>
  )
} 