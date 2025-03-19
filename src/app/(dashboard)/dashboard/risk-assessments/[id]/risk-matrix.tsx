"use client"

import { cn } from "@/lib/utils"

interface Hazard {
  id: string
  description: string
  probability: number
  severity: number
  riskLevel: number
  [key: string]: any
}

interface RiskMatrixProps {
  hazards?: Hazard[]
  data?: (number | string)[][]  // Ny prop for å støtte format: [[probability, severity, id], ...]
}

const probabilityLabels = [
  "Svært lite sannsynlig",
  "Lite sannsynlig",
  "Sannsynlig",
  "Meget sannsynlig",
  "Svært sannsynlig"
]

const severityLabels = [
  "Svært alvorlig",
  "Alvorlig",
  "Moderat",
  "Lav",
  "Ubetydelig"
]

export function RiskMatrix({ hazards, data }: RiskMatrixProps) {
  // Beregn matrise-data fra hazards
  const calculateMatrixData = () => {
    // Initialiser en 5x5 matrise med nuller
    const matrix = Array(5).fill(null).map(() => Array(5).fill(0));
    
    // Hvis hazards sendes inn, bruker vi det formatet
    if (hazards && hazards.length > 0) {
      // Teller forekomster av hver kombinasjon
      hazards.forEach(hazard => {
        if (hazard.probability >= 1 && hazard.probability <= 5 && 
            hazard.severity >= 1 && hazard.severity <= 5) {
          // Juster indekser (0-basert array)
          const probIndex = hazard.probability - 1;
          const sevIndex = hazard.severity - 1;
          matrix[sevIndex][probIndex] += 1;
        }
      });
    } 
    // Ellers sjekker vi om data sendes inn i alternativt format
    else if (data && data.length > 0) {
      data.forEach(item => {
        if (item.length >= 2) {
          const probability = Number(item[0]);
          const severity = Number(item[1]);
          
          if (probability >= 1 && probability <= 5 && 
              severity >= 1 && severity <= 5) {
            // Juster indekser (0-basert array)
            const probIndex = probability - 1;
            const sevIndex = severity - 1;
            matrix[sevIndex][probIndex] += 1;
          }
        }
      });
    }
    
    return matrix;
  };
  
  const matrixData = calculateMatrixData();
  
  // Funksjon for å bestemme farge basert på risikonivå
  const getRiskColor = (severity: number, probability: number) => {
    const risk = (severity + 1) * (probability + 1)
    if (risk > 15) return "bg-red-100 hover:bg-red-200"
    if (risk > 8) return "bg-yellow-100 hover:bg-yellow-200"
    return "bg-green-100 hover:bg-green-200"
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-32" />
            {probabilityLabels.map((label, i) => (
              <th 
                key={label}
                className="p-2 text-sm font-medium text-center border"
              >
                {i + 1}. {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {severityLabels.map((label, severity) => (
            <tr key={label}>
              <th className="p-2 text-sm font-medium text-left border">
                {5 - severity}. {label}
              </th>
              {matrixData[4 - severity].map((count, probability) => (
                <td
                  key={probability}
                  className={cn(
                    "p-2 text-center border transition-colors",
                    getRiskColor(4 - severity, probability),
                    count > 0 ? "font-bold" : "text-muted-foreground"
                  )}
                >
                  {count || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100" />
          <span>Lav risiko (≤8)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100" />
          <span>Middels risiko (9-15)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100" />
          <span>Høy risiko ({">"}15)</span>
        </div>
      </div>
    </div>
  )
} 