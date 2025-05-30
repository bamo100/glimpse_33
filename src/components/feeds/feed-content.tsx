"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useInView } from "react-intersection-observer"
import { AlertCircle, RefreshCw, Wifi } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SearchFilters } from "@/components/search-filters"
import { FeedItemCard } from "@/components/feeds/feed-item-card"
import { FeedSkeleton, FeedItemSkeleton } from "@/components/feeds/feed-skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useFeed } from "@/hooks/use-feed"
import { toastSuccess, toastWithOptions } from "@/hooks/use-toast"
import type { SearchFilters as SearchFiltersType } from "@/types/feed"
import { PaginationControls } from "@/components/pagination-controls"
import { FeedTransition, FeedItemWrapper, FeedIsLoadingTransition, FeedIsErrorTransition, FeedCurrentPageTransition, FeedPaginationManualTransition, FeedPaginationInfiniteTransition, FeedItemEndTransition, FeedBodyTransition } from "@/components/feeds/feed-transition"

export function FeedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<SearchFiltersType>(() => ({
    query: searchParams.get("q") || "",
    category: searchParams.get("category") || "all",
    page: Number.parseInt(searchParams.get("page") || "1"),
  }))

  const [paginationMode, setPaginationMode] = useState<"infinite" | "manual">("infinite")

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error, refetch } = useFeed(filters)

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  })

  // Update URL when filters change
  const updateURL = useCallback(
    (newFilters: SearchFiltersType) => {
      const params = new URLSearchParams()
      if (newFilters.query) params.set("q", newFilters.query)
      if (newFilters.category && newFilters.category !== "all") params.set("category", newFilters.category)
      if (newFilters.page > 1) params.set("page", newFilters.page.toString())

      const newURL = params.toString() ? `/?${params.toString()}` : "/"
      router.replace(newURL, { scroll: false })
    },
    [router],
  )

  // Auto-fetch next page when scrolling (infinite scroll mode)
  useEffect(() => {
    if (paginationMode === "infinite" && inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, paginationMode])

  // Update URL when filters change
  useEffect(() => {
    updateURL(filters)
  }, [filters, updateURL])

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: SearchFiltersType) => {
    setFilters(newFilters)
  }, [])

  const handlePreviousPage = () => {
    if (filters.page > 1) {
      setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleNextPage = () => {
    if (hasNextPage) {
      setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleRetry = () => {
    refetch()
    toastWithOptions({
      title: "Retrying...",
      description: "Attempting to reload the feed",
      variant: "info",
    })
  }

  const handleRefreshPage = () => {
    window.location.reload()
    toastWithOptions({
      title: "Refreshing page...",
      description: "Reloading the entire application",
      variant: "info",
    })
  }

  const allItems = data?.pages.flatMap((page) => page.items) ?? []
  const totalResults = data?.pages[0]?.total
  const currentPageItems = paginationMode === "infinite" ? allItems : (data?.pages[0]?.items ?? [])

  // Add this useEffect to refetch when pagination mode changes or page changes in manual mode
  useEffect(() => {
    if (paginationMode === "manual") {
      refetch()
    }
  }, [paginationMode, filters.page, refetch])

  // Show success message when data loads successfully after an error
  useEffect(() => {
    if (data && !isLoading && !isError) {
      const hadError = sessionStorage.getItem("feed-had-error")
      if (hadError) {
        toastSuccess("Feed loaded successfully!", {
          description: `Found ${totalResults} articles`,
        })
        sessionStorage.removeItem("feed-had-error")
      }
    }
  }, [data, isLoading, isError, totalResults])

  // Track errors for success message
  useEffect(() => {
    if (isError) {
      sessionStorage.setItem("feed-had-error", "true")
    }
  }, [isError])

  if (isError) {
    const isNetworkError = error?.message.includes("Network Error")
    const isTimeoutError = error?.message.includes("timeout")
    const isRateLimitError = error?.message.includes("Rate limit")

    return (
      <FeedIsErrorTransition>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Feed Explorer</h1>
          <SearchFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {isNetworkError && "Connection Problem"}
            {isTimeoutError && "Request Timeout"}
            {isRateLimitError && "Rate Limit Exceeded"}
            {!isNetworkError && !isTimeoutError && !isRateLimitError && "Error Loading Feed"}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {isNetworkError && "Unable to connect to the server. Please check your internet connection and try again."}
            {isTimeoutError && "The request took too long to complete. Please try again."}
            {isRateLimitError && "Too many requests. Please wait a moment before trying again."}
            {!isNetworkError &&
              !isTimeoutError &&
              !isRateLimitError &&
              (error?.message || "Failed to load feed. Please try again.")}

            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
              {isNetworkError && (
                <Button variant="outline" size="sm" onClick={handleRefreshPage} className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Refresh Page
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </FeedIsErrorTransition>
    )
  }

  return (
    <FeedBodyTransition>
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-3xl font-bold mb-6"
        >
          Feed Explorer
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <SearchFilters filters={filters} onFiltersChange={handleFiltersChange} totalResults={totalResults} />
        </motion.div>

        {/* Pagination Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-4 mt-4"
        >
          <span className="text-sm font-medium">Pagination:</span>
          <div className="flex gap-2">
            <Button
              variant={paginationMode === "infinite" ? "default" : "outline"}
              size="sm"
              onClick={() => setPaginationMode("infinite")}
              className="transition-all duration-200"
            >
              Infinite Scroll
            </Button>
            <Button
              variant={paginationMode === "manual" ? "default" : "outline"}
              size="sm"
              onClick={() => setPaginationMode("manual")}
              className="transition-all duration-200"
            >
              Manual Pages
            </Button>
          </div>
        </motion.div>
      </div>

      {isLoading && currentPageItems.length === 0 ? (
        <FeedSkeleton />
      ) : (!isLoading && currentPageItems.length === 0) ? (
            <FeedCurrentPageTransition>
              <p className="text-muted-foreground text-lg">No articles found matching your criteria.</p>
              <p className="text-muted-foreground text-sm mt-2">Try adjusting your search or filters.</p>
            </FeedCurrentPageTransition>
      ) : (
        <>
          <FeedTransition mode={paginationMode} isLoading={isLoading}>
            {currentPageItems.map((item, index) => (
              <FeedItemWrapper key={item.id} index={index}>
                <FeedItemCard item={item} />
              </FeedItemWrapper>
            ))}
          </FeedTransition>

          {/* Manual Pagination Controls */}
          {paginationMode === "manual" && (
            <FeedPaginationManualTransition>
              <PaginationControls
                currentPage={filters.page}
                totalPages={Math.ceil((totalResults || 0) / 10)}
                hasNextPage={hasNextPage}
                isLoading={isFetchingNextPage || isLoading}
                onPreviousPage={handlePreviousPage}
                onNextPage={handleNextPage}
              />
            </FeedPaginationManualTransition>
          )}

          {/* Infinite Scroll Trigger */}
          {paginationMode === "infinite" && (
            <div ref={ref} className="mt-8">
              <AnimatePresence>
                {isFetchingNextPage && (
                  <FeedPaginationInfiniteTransition>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <FeedItemSkeleton key={i} />
                    ))}
                  </FeedPaginationInfiniteTransition>
                )}
              </AnimatePresence>
            </div>
          )}

          {!hasNextPage && currentPageItems.length > 0 && paginationMode === "infinite" && (
            <FeedItemEndTransition>
              <p className="text-muted-foreground">You have reached the end of the feed!</p>
            </FeedItemEndTransition>
          )}
        </>
      )}
    </FeedBodyTransition>
  )
}
