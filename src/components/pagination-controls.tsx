"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  isLoading: boolean
  onPreviousPage: () => void
  onNextPage: () => void
}

export function PaginationControls({
  currentPage,
  totalPages,
  hasNextPage,
  isLoading,
  onPreviousPage,
  onNextPage,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-between mt-8">
      <Button
        variant="outline"
        onClick={onPreviousPage}
        disabled={currentPage <= 1 || isLoading}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages || 1}
        </span>
        {isLoading && <span className="text-xs text-muted-foreground animate-pulse">Loading...</span>}
      </div>

      <Button
        variant="outline"
        onClick={onNextPage}
        disabled={!hasNextPage || isLoading}
        className="flex items-center gap-2"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
