import { PPESymbol } from "@prisma/client"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface PPESymbolBadgeProps {
  symbol: PPESymbol
  showLabel?: boolean
  selected?: boolean
}

const PPE_SYMBOLS: Record<string, { label: string; image: string }> = {
  M001_GENERAL_MANDATORY: {
    label: "Generelt påbud",
    image: "/ppe/ISO_7010_M001.svg.png"
  },
  M002_READ_INSTRUCTIONS: {
    label: "Les instruksjoner",
    image: "/ppe/ISO_7010_M002.svg.png"
  },
  M003_WEAR_EAR_PROTECTION: {
    label: "Bruk hørselvern",
    image: "/ppe/ISO_7010_M003.svg.png"
  },
  M004_WEAR_EYE_PROTECTION: {
    label: "Bruk vernebriller",
    image: "/ppe/ISO_7010_M004.svg.png"
  },
  M007_WEAR_OPAQUE_EYE_PROTECTION: {
    label: "Bruk lystett øyebeskyttelse",
    image: "/ppe/ISO_7010_M007.svg.png"
  },
  M008_WEAR_FOOT_PROTECTION: {
    label: "Bruk vernesko",
    image: "/ppe/ISO_7010_M008.svg.png"
  },
  M009_WEAR_PROTECTIVE_GLOVES: {
    label: "Bruk vernehansker",
    image: "/ppe/ISO_7010_M009.svg.png"
  },
  M010_WEAR_PROTECTIVE_CLOTHING: {
    label: "Bruk verneklær",
    image: "/ppe/ISO_7010_M010.svg.png"
  },
  M011_WASH_HANDS: {
    label: "Vask hendene",
    image: "/ppe/ISO_7010_M011.svg.png"
  },
  M013_WEAR_FACE_SHIELD: {
    label: "Bruk ansiktsskjerm",
    image: "/ppe/ISO_7010_M013.svg.png"
  },
  M014_WEAR_HEAD_PROTECTION: {
    label: "Bruk hjelm",
    image: "/ppe/ISO_7010_M014.svg.png"
  },
  M015_WEAR_HIGH_VISIBILITY: {
    label: "Bruk høysynlighetsklær",
    image: "/ppe/ISO_7010_M015.svg.png"
  },
  M016_WEAR_MASK: {
    label: "Bruk maske",
    image: "/ppe/ISO_7010_M016.svg.png"
  },
  M017_WEAR_RESPIRATORY_PROTECTION: {
    label: "Bruk åndedrettsvern",
    image: "/ppe/ISO_7010_M017.svg.png"
  },
  M018_WEAR_SAFETY_HARNESS: {
    label: "Bruk fallsikring",
    image: "/ppe/ISO_7010_M018.svg.png"
  },
  M022_USE_BARRIER_CREAM: {
    label: "Bruk beskyttelseskrem",
    image: "/ppe/ISO_7010_M022.svg.png"
  },
  M026_USE_PROTECTIVE_APRON: {
    label: "Bruk verneforkle",
    image: "/ppe/ISO_7010_M026.svg.png"
  },
  M047_USE_BREATHING_EQUIPMENT: {
    label: "Bruk pusteapparat",
    image: "/ppe/ISO_7010_M047.svg.png"
  },
  M059_WEAR_LAB_COAT: {
    label: "Bruk labfrakk",
    image: "/ppe/ISO_7010_M059.svg.png"
  }
} as const

export function PPESymbolBadge({ symbol, showLabel, selected }: PPESymbolBadgeProps) {
  console.log("PPESymbolBadge rendering with symbol:", symbol) // Debug
  
  const symbolData = PPE_SYMBOLS[symbol]
  if (!symbolData) {
    console.error("Missing symbol data for:", symbol, "Available symbols:", Object.keys(PPE_SYMBOLS))
    return null
  }

  return (
    <div className={cn(
      "flex items-center gap-2",
      selected && "text-primary"
    )}>
      <div className="relative w-8 h-8">
        <Image
          src={symbolData.image}
          alt={symbolData.label}
          fill
          className="object-contain"
        />
      </div>
      {showLabel && (
        <span className="text-sm">{symbolData.label}</span>
      )}
    </div>
  )
} 