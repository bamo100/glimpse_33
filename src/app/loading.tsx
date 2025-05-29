// "use client"

// import { useState, useEffect, useCallback } from "react"
// import { useInView } from "react-intersection-observer"
// import { AlertCircle, RefreshCw, Wifi } from "lucide-react"
// import { SearchFilters } from "@/components/search-filters"
// import { FeedItemCard } from "@/components/feed-item-card"
// import { FeedSkeleton, FeedItemSkeleton } from "@/components/feed-skeleton"
// import { ErrorBoundary } from "@/components/error-boundary"
// import { NetworkStatus } from "@/components/network-status"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { Button } from "@/components/ui/button"
// import { useFeed } from "@/hooks/use-feed"
// import type { SearchFilters as SearchFiltersType } from "@/types/feed"

// function FeedContent() {
//   const [filters, setFilters] = useState<SearchFiltersType>({
//     query: "",
//     category: "all",
//     page: 1,
//   })

//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error, refetch } = useFeed(filters)

//   const { ref, inView } = useInView({
//     threshold: 0,
//     rootMargin: "100px",
//   })

//   // Auto-fetch next page when scrolling
//   useEffect(() => {
//     if (inView && hasNextPage && !isFetchingNextPage) {
//       fetchNextPage()
//     }
//   }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

//   const handleFiltersChange = useCallback((newFilters: SearchFiltersType) => {
//     setFilters(newFilters)
//   }, [])

//   const allItems = data?.pages.flatMap((page) => page.items) ?? []
//   const totalResults = data?.pages[0]?.total

//   if (isLoading) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold mb-6">Feed Explorer</h1>
//           <SearchFilters filters={filters} onFiltersChange={handleFiltersChange} />
//         </div>
//         <FeedSkeleton />
//       </div>
//     )
//   }

//   if (isError) {
//     const isNetworkError = error?.message.includes("Network Error")
//     const isTimeoutError = error?.message.includes("timeout")
//     const isRateLimitError = error?.message.includes("Rate limit")

//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold mb-6">Feed Explorer</h1>
//           <SearchFilters filters={filters} onFiltersChange={handleFiltersChange} />
//         </div>

//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertTitle>
//             {isNetworkError && "Connection Problem"}
//             {isTimeoutError && "Request Timeout"}
//             {isRateLimitError && "Rate Limit Exceeded"}
//             {!isNetworkError && !isTimeoutError && !isRateLimitError && "Error Loading Feed"}
//           </AlertTitle>
//           <AlertDescription className="mt-2">
//             {isNetworkError && "Unable to connect to the server. Please check your internet connection and try again."}
//             {isTimeoutError && "The request took too long to complete. Please try again."}
//             {isRateLimitError && "Too many requests. Please wait a moment before trying again."}
//             {!isNetworkError &&
//               !isTimeoutError &&
//               !isRateLimitError &&
//               (error?.message || "Failed to load feed. Please try again.")}

//             <div className="flex gap-2 mt-4">
//               <Button variant="outline" size="sm" onClick={() => refetch()} className="flex items-center gap-2">
//                 <RefreshCw className="h-4 w-4" />
//                 Retry
//               </Button>
//               {isNetworkError && (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => window.location.reload()}
//                   className="flex items-center gap-2"
//                 >
//                   <Wifi className="h-4 w-4" />
//                   Refresh Page
//                 </Button>
//               )}
//             </div>
//           </AlertDescription>
//         </Alert>
//       </div>
//     )
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold mb-6">Feed Explorer</h1>
//         <SearchFilters filters={filters} onFiltersChange={handleFiltersChange} totalResults={totalResults} />
//       </div>

//       {allItems.length === 0 ? (
//         <div className="text-center py-12">
//           <p className="text-muted-foreground text-lg">No articles found matching your criteria.</p>
//           <p className="text-muted-foreground text-sm mt-2">Try adjusting your search or filters.</p>
//         </div>
//       ) : (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {allItems.map((item) => (
//               <FeedItemCard key={item.id} item={item} />
//             ))}
//           </div>

//           {/* Infinite scroll trigger */}
//           <div ref={ref} className="mt-8">
//             {isFetchingNextPage && (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {Array.from({ length: 3 }).map((_, i) => (
//                   <FeedItemSkeleton key={i} />
//                 ))}
//               </div>
//             )}
//           </div>

//           {!hasNextPage && allItems.length > 0 && (
//             <div className="text-center py-8">
//               <p className="text-muted-foreground">You've reached the end of the feed!</p>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   )
// }

// export default function FeedPage() {
//   return (
//     <ErrorBoundary>
//       <NetworkStatus />
//       <FeedContent />
//     </ErrorBoundary>
//   )
// }
export default function Loading() {
  return null
}

