"use client"

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, APIError, NetworkError } from "@/lib/api-client"
import type { FeedItem, SearchFilters } from "@/types/feed"

// Update the useFeed function to better handle manual pagination
export function useFeed(filters: SearchFilters) {
  return useInfiniteQuery({
    queryKey: ["feed", filters.query, filters.category, filters.page],
    queryFn: async ({ pageParam = filters.page }) => {
      try {
        return await apiClient.getFeed({
          page: pageParam,
          limit: 10,
          ...(filters.query && { query: filters.query }),
          ...(filters.category && filters.category !== "all" && { category: filters.category }),
        })
      } catch (error) {
        if (error instanceof APIError) {
          throw new Error(`API Error: ${error.message} (${error.code})`)
        }
        if (error instanceof NetworkError) {
          throw new Error(`Network Error: ${error.message}`)
        }
        throw error
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined
    },
    initialPageParam: filters.page,
    getPreviousPageParam: (firstPage, allPages) => {
      return allPages.length > 1 ? allPages.length - 1 : undefined
    },
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors except timeouts
      if (error.message.includes("API Error") && !error.message.includes("timeout")) {
        return false
      }
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useFeedItem(id: string) {
  return useQuery({
    queryKey: ["feed-item", id],
    queryFn: async () => {
      try {
        return await apiClient.getFeedItem(id)
      } catch (error) {
        if (error instanceof APIError) {
          throw new Error(`${error.message}`)
        }
        if (error instanceof NetworkError) {
          throw new Error(`Network Error: ${error.message}`)
        }
        throw error
      }
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error.message.includes("not found")) {
        return false
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 5000),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useLikeFeedItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.likeFeedItem(id)
    },
    onSuccess: (data, id) => {
      // Optimistically update the cache
      queryClient.setQueryData(["feed-item", id], (old: FeedItem | undefined) => {
        if (old) {
          return { ...old, liked: data.liked }
        }
        return old
      })
    },
    onError: (error) => {
      console.error("Failed to like item:", error)
    },
  })
}

export function useBookmarkFeedItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.bookmarkFeedItem(id)
    },
    onSuccess: (data, id) => {
      // Optimistically update the cache
      queryClient.setQueryData(["feed-item", id], (old: FeedItem | undefined) => {
        if (old) {
          return { ...old, bookmarked: data.bookmarked }
        }
        return old
      })
    },
    onError: (error) => {
      console.error("Failed to bookmark item:", error)
    },
  })
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      return await apiClient.getComments(postId)
    },
    enabled: !!postId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
