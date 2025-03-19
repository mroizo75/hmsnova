import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisiblePages?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null

  // Beregn hvilke sider som skal vises
  const getVisiblePageNumbers = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const sidePageCount = Math.floor(maxVisiblePages / 2)
    let startPage = Math.max(currentPage - sidePageCount, 1)
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1)
    }

    const pages = []
    
    // Alltid vis side 1
    if (startPage > 1) {
      pages.push(1)
      
      // Legg til ellipse hvis det er gap
      if (startPage > 2) {
        pages.push('ellipsis-start')
      }
    }

    // Legg til sider i midten
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i)
      }
    }

    // Alltid vis siste side
    if (endPage < totalPages) {
      // Legg til ellipse hvis det er gap
      if (endPage < totalPages - 1) {
        pages.push('ellipsis-end')
      }
      
      pages.push(totalPages)
    }

    return pages
  }

  const visiblePageNumbers = getVisiblePageNumbers()

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Forrige side</span>
      </Button>
      
      {visiblePageNumbers.map((page, index) => {
        if (page === 'ellipsis-start' || page === 'ellipsis-end') {
          return (
            <Button 
              key={`ellipsis-${index}`} 
              variant="outline" 
              size="icon" 
              disabled
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Flere sider</span>
            </Button>
          )
        }
        
        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </Button>
        )
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Neste side</span>
      </Button>
    </div>
  )
}
