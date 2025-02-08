"use client"

import { diffWords, Change } from 'diff'
import { ScrollArea } from "./ui/scroll-area"
import { Badge } from "./ui/badge"
import { useState } from "react"

interface Props {
  oldText: string
  newText: string
  showLineNumbers?: boolean
  maxHeight?: string
  title?: string
}

export function Diff({ 
  oldText, 
  newText, 
  showLineNumbers = true,
  maxHeight = "300px",
  title 
}: Props) {
  const [showOriginal, setShowOriginal] = useState(false)
  const differences = diffWords(oldText, newText)
  
  // Del teksten inn i linjer for linjenummerering
  const lines = differences.reduce<{text: string, type?: string}[]>((acc: {text: string, type?: string}[], part: Change) => {
    const partLines = part.value.split('\n')
    return acc.concat(partLines.map((line: string) => ({
      text: line,
      type: part.added ? 'added' : part.removed ? 'removed' : undefined
    })))
  }, [])

  // Beregn statistikk
  const stats = differences.reduce((acc: { additions: number, removals: number }, part: Change) => {
    if (part.added) acc.additions++
    if (part.removed) acc.removals++
    return acc
  }, { additions: 0, removals: 0 })

  return (
    <div className="border rounded-lg">
      {/* Header med statistikk */}
      <div className="p-2 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {title && <span className="font-medium">{title}</span>}
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            +{stats.additions} tilføyelser
          </Badge>
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            -{stats.removals} fjerninger
          </Badge>
        </div>
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Vis {showOriginal ? 'endringer' : 'original'}
        </button>
      </div>

      {/* Diff innhold */}
      <ScrollArea className={`relative ${maxHeight ? `max-h-[${maxHeight}]` : ''}`}>
        <div className="p-4 font-mono text-sm">
          {showOriginal ? (
            <pre className="whitespace-pre-wrap">{oldText}</pre>
          ) : (
            <div className="flex">
              {showLineNumbers && (
                <div className="pr-4 text-right text-muted-foreground select-none">
                  {lines.map((_: {text: string, type?: string}, i: number) => (
                    <div key={i} className="leading-6">
                      {i + 1}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex-1">
                {differences.map((part: Change, i: number) => (
                  <span
                    key={i}
                    className={`
                      ${part.added ? 'bg-green-100 text-green-800' : ''}
                      ${part.removed ? 'bg-red-100 text-red-800' : ''}
                      ${part.added || part.removed ? 'px-1 rounded' : ''}
                    `}
                  >
                    {part.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
} 