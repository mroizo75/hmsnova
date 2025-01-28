"use client"

import { cn } from "@/lib/utils"

interface RiskMatrixProps {
  data: number[][]
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

export function RiskMatrix({ data }: RiskMatrixProps) {
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
              {data[4 - severity].map((count, probability) => (
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