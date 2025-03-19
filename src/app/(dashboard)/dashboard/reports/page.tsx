import { Suspense } from "react"
import ReportsClientWrapper from "./reports-client-wrapper"

export const dynamic = 'force-static'

export default function ReportsPage() {
  return (
    <div className="space-y-6 px-6 pt-6">
      <h1 className="text-3xl font-bold tracking-tight">Rapporter og statistikk</h1>
      
      <Suspense fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
          <div className="h-96 bg-gray-100 rounded-lg"></div>
        </div>
      }>
        <ReportsClientWrapper />
      </Suspense>
    </div>
  )
} 