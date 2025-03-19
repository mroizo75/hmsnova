'use client'

import { useEffect, useState } from 'react'
import { ReportsClient, StatsItem } from './reports-client'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { ExportDialog } from './export-dialog'

export default function ReportsClientWrapper() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<[StatsItem[], StatsItem[], any[]]>([[], [], []])
  const [trends, setTrends] = useState<any[]>([])
  const [auditData, setAuditData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    }

    if (status === 'authenticated' && session?.user?.companyId) {
      fetchReportData()
    }
  }, [status, session])

  async function fetchReportData() {
    try {
      setLoading(true)
      const response = await fetch('/api/reports/stats')
      
      if (!response.ok) {
        throw new Error('Kunne ikke hente rapportdata')
      }
      
      const data = await response.json()
      
      setStats(data.stats)
      setTrends(data.trends)
      setAuditData(data.auditData)
    } catch (err: any) {
      console.error('Feil ved henting av rapportdata:', err)
      setError(err.message || 'Det oppstod en feil under lasting av rapporter')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
        <div className="h-96 bg-gray-100 rounded-lg"></div>
      </div>
    )
  }

  if (error) {
    return <div className="py-4">{error}</div>
  }

  if (!auditData) {
    return <div className="py-4">Laster data...</div>
  }

  return (
    <ReportsClient 
      stats={stats} 
      trends={trends} 
      auditData={auditData} 
    />
  )
} 