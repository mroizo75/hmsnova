'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, FileText, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface HMSHandbookClientProps {
  documents: any[] // Type dette bedre basert på Prisma-modellen
}

export function HMSHandbookClient({ documents }: HMSHandbookClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center px-4 py-3">
          <button 
            onClick={() => router.back()}
            className="mr-3"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">HMS Håndbok</h1>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søk i HMS dokumenter..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="space-y-3">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Ingen dokumenter funnet
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <Link key={doc.id} href={`/employee/hms-handbook/${doc.id}`}>
                <Card className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{doc.title}</h3>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {doc.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Oppdatert: {new Date(doc.updatedAt).toLocaleDateString('nb-NO')}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 