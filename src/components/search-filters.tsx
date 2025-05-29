"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Filter, X, History } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { SearchFilters as FeedSearchFilters } from "@/types/feed"

interface SearchFiltersProps {
  filters: FeedSearchFilters
  onFiltersChange: (filters: FeedSearchFilters) => void
  totalResults?: number
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "technology", label: "Technology" },
  { value: "design", label: "Design" },
  { value: "business", label: "Business" },
  { value: "lifestyle", label: "Lifestyle" },
]

// Search history management
const SEARCH_HISTORY_KEY = "feed-search-history"
const MAX_HISTORY_ITEMS = 10

function getSearchHistory(): string[] {
  if (typeof window === "undefined") return []
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY)
    return history ? JSON.parse(history) : []
  } catch {
    return []
  }
}

function addToSearchHistory(query: string) {
  if (!query.trim()) return

  const history = getSearchHistory()
  const newHistory = [query, ...history.filter((item) => item !== query)].slice(0, MAX_HISTORY_ITEMS)

  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
  } catch {
    // Ignore localStorage errors
  }
}

function clearSearchHistory() {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  } catch {
    // Ignore localStorage errors
  }
}

export function SearchFilters({ filters, onFiltersChange, totalResults }: SearchFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.query)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Load search history on mount
  useEffect(() => {
    setSearchHistory(getSearchHistory())
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.query) {
        onFiltersChange({ ...filters, query: searchInput, page: 1 })
        if (searchInput.trim()) {
          addToSearchHistory(searchInput.trim())
          setSearchHistory(getSearchHistory())
        }
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, filters, onFiltersChange])

  const handleCategoryChange = useCallback(
    (category: string) => {
      onFiltersChange({ ...filters, category, page: 1 })
    },
    [filters, onFiltersChange],
  )

  const handleSearchFromHistory = useCallback(
    (query: string) => {
      setSearchInput(query)
      setShowHistory(false)
      onFiltersChange({ ...filters, query, page: 1 })
    },
    [filters, onFiltersChange],
  )

  const clearFilters = useCallback(() => {
    setSearchInput("")
    onFiltersChange({ query: "", category: "all", page: 1 })
  }, [onFiltersChange])

  const handleClearHistory = useCallback(() => {
    clearSearchHistory()
    setSearchHistory([])
  }, [])

  const hasActiveFilters = filters.query || filters.category !== "all"

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search articles, authors, or topics..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-10"
            onFocus={() => setShowHistory(searchHistory.length > 0)}
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setSearchInput("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* Search History Dropdown */}
          {showHistory && searchHistory.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50">
              <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Recent Searches</span>
                  <Button variant="ghost" size="sm" onClick={handleClearHistory} className="h-6 text-xs">
                    Clear
                  </Button>
                </div>
                <div className="space-y-1">
                  {searchHistory.map((query, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded flex items-center gap-2"
                      onClick={() => handleSearchFromHistory(query)}
                    >
                      <History className="h-3 w-3 text-muted-foreground" />
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <Select value={filters.category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {hasActiveFilters && (
            <>
              {filters.query && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {`"${filters.query}"`}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => {
                      setSearchInput("")
                      onFiltersChange({ ...filters, query: "", page: 1 })
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.category !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {categories.find((c) => c.value === filters.category)?.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => onFiltersChange({ ...filters, category: "all", page: 1 })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all filters
              </Button>
            </>
          )}
        </div>
        {totalResults !== undefined && (
          <p className="text-sm text-muted-foreground">
            {totalResults} result{totalResults !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      {/* Filter State Indicator */}
      {filters.page > 1 && (
        <div className="text-xs text-muted-foreground">
          Viewing page {filters.page} • Filters will be maintained when navigating
        </div>
      )}
    </div>
  )
}
