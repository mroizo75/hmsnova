"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, TrendingUp, AlertTriangle, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface InsightType {
  id: string
  category: string
  description: string
  severity: "low" | "medium" | "high"
  recommendation: string
  confidence: number
  affectedCompanies: number
  trend: "increasing" | "decreasing" | "stable"
}

interface AIInsightsProps {
  insights?: InsightType[]
  totalDeviations?: number
}

export function AIInsights({ insights = [], totalDeviations = 0 }: AIInsightsProps) {
  if (!insights || insights.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-medium">
              AI Innsikt og Anbefalinger
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Analyserer avvik...
            </p>
          </div>
          <Brain className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Genererer innsikt fra avviksdata...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg font-medium">
            AI Innsikt og Anbefalinger
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Basert på analyse av {totalDeviations} avvik
          </p>
        </div>
        <Brain className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="rounded-lg border p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`h-5 w-5 ${
                    insight.severity === "high" 
                      ? "text-destructive" 
                      : insight.severity === "medium"
                      ? "text-yellow-500"
                      : "text-muted-foreground"
                  }`} />
                  <h4 className="font-medium">{insight.category}</h4>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <TrendingUp className={`h-4 w-4 ${
                    insight.trend === "increasing"
                      ? "text-destructive"
                      : insight.trend === "decreasing"
                      ? "text-green-500"
                      : "text-muted-foreground"
                  }`} />
                  <span className="text-muted-foreground">
                    {insight.affectedCompanies} bedrifter berørt
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm">{insight.description}</p>
                <div className="flex items-center space-x-2">
                  <Progress value={insight.confidence * 100} className="h-2" />
                  <span className="text-xs text-muted-foreground w-12">
                    {Math.round(insight.confidence * 100)}% sikker
                  </span>
                </div>
              </div>

              <div className="bg-muted/50 rounded-md p-3 text-sm">
                <p className="font-medium mb-1">Anbefalt tiltak:</p>
                <p className="text-muted-foreground">
                  {insight.recommendation}
                </p>
              </div>

              <Link href={`/admin/dashboard/${encodeURIComponent(insight.category)}`}>
                <Button variant="outline" size="sm" className="w-full">
                  Se detaljert analyse
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 