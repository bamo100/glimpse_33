import type { FeedItem, FeedResponse, JSONPlaceholderPost, JSONPlaceholderUser } from "@/types/feed"
import { transformPostToFeedItem, simulateNetworkDelay, simulateAPIError } from "@/lib/data-transformer"

export class NetworkError extends Error {
  constructor(
    message: string,
    public originalError?: Error,
  ) {
    super(message)
    this.name = "NetworkError"
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: string,
  ) {
    super(message)
    this.name = "APIError"
    this.code = code
    this.status = status
    this.details = details
  }
}

interface RequestConfig {
  timeout?: number
  retries?: number
  retryDelay?: number
}

class APIClient {
  private baseURL = "https://jsonplaceholder.typicode.com"
  private defaultTimeout = 10000 // 10 seconds
  private defaultRetries = 3
  private defaultRetryDelay = 1000 // 1 second
  private usersCache = new Map<number, JSONPlaceholderUser>()

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new NetworkError("Request timeout")
        }
        throw new NetworkError("Network error", error)
      }
      throw error
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}, config: RequestConfig = {}): Promise<T> {
    const { timeout = this.defaultTimeout, retries = this.defaultRetries, retryDelay = this.defaultRetryDelay } = config

    const url = `${this.baseURL}${endpoint}`

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Simulate network delay and potential errors
        await simulateNetworkDelay()
        simulateAPIError()

        const response = await this.fetchWithTimeout(url, options, timeout)

        // Handle different HTTP status codes
        if (!response.ok) {
          let errorData: any = {}
          try {
            errorData = await response.json()
          } catch {
            // Ignore JSON parsing errors
          }

          switch (response.status) {
            case 404:
              throw new APIError(
                "Resource not found",
                "NOT_FOUND",
                response.status,
                "The requested item does not exist",
              )
            case 429:
              throw new APIError(
                "Rate limit exceeded",
                "RATE_LIMIT",
                response.status,
                "Too many requests, please try again later",
              )
            case 500:
              throw new APIError(
                "Internal server error",
                "INTERNAL_ERROR",
                response.status,
                "Server encountered an error",
              )
            default:
              throw new APIError(
                `HTTP ${response.status}`,
                "UNKNOWN_ERROR",
                response.status,
                "An unexpected error occurred",
              )
          }
        }

        const data = await response.json()
        return data
      } catch (error) {
        // Don't retry on client errors (4xx) except for timeouts
        if (error instanceof APIError && error.status >= 400 && error.status < 500 && error.status !== 408) {
          throw error
        }

        // If this is the last attempt, throw the error
        if (attempt === retries) {
          throw error
        }

        // Wait before retrying (exponential backoff)
        const delay = retryDelay * Math.pow(2, attempt)
        console.warn(`Request failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms...`, error)
        await this.delay(delay)
      }
    }

    throw new Error("Max retries exceeded")
  }

  private async getUser(userId: number): Promise<JSONPlaceholderUser> {
    if (this.usersCache.has(userId)) {
      return this.usersCache.get(userId)!
    }

    const user = await this.makeRequest<JSONPlaceholderUser>(`/users/${userId}`)
    this.usersCache.set(userId, user)
    return user
  }

  async getFeed(params: {
    query?: string
    category?: string
    page?: number
    limit?: number
  }): Promise<FeedResponse> {
    const { query, category, page = 1, limit = 10 } = params

    // Fetch posts from JSONPlaceholder
    const posts = await this.makeRequest<JSONPlaceholderPost[]>("/posts")

    // Fetch all users to avoid multiple requests
    const users = await this.makeRequest<JSONPlaceholderUser[]>("/users")
    const usersMap = new Map(users.map((user) => [user.id, user]))

    // Transform posts to feed items
    let feedItems = posts.map((post) => {
      const user = usersMap.get(post.userId)!
      return transformPostToFeedItem(post, user)
    })

    // Apply search filter
    if (query) {
      const searchTerm = query.toLowerCase()
      feedItems = feedItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.content.toLowerCase().includes(searchTerm) ||
          item.author.name.toLowerCase().includes(searchTerm) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
      )
    }

    // Apply category filter
    if (category && category !== "all") {
      feedItems = feedItems.filter((item) => item.category === category)
    }

    // Sort by date (newest first)
    feedItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Calculate total before pagination
    const total = feedItems.length

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedItems = feedItems.slice(startIndex, endIndex)

    return {
      items: paginatedItems,
      hasMore: endIndex < feedItems.length,
      total: total,
    }
  }

  async getFeedItem(id: string): Promise<FeedItem> {
    const postId = Number.parseInt(id)

    // Validate ID range for JSONPlaceholder
    if (isNaN(postId) || postId < 1 || postId > 100) {
      throw new APIError("Invalid post ID", "INVALID_ID", 400, "Post ID must be between 1 and 100")
    }

    try {
      const post = await this.makeRequest<JSONPlaceholderPost>(`/posts/${postId}`)
      const user = await this.getUser(post.userId)

      return transformPostToFeedItem(post, user)
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        throw new APIError("Feed item not found", "NOT_FOUND", 404, `Post with ID ${postId} does not exist`)
      }
      throw error
    }
  }

  async likeFeedItem(id: string): Promise<{ success: boolean; liked: boolean }> {
    // Validate ID first
    const postId = Number.parseInt(id)
    if (isNaN(postId) || postId < 1 || postId > 100) {
      throw new APIError("Invalid post ID", "INVALID_ID", 400)
    }

    // Simulate API call
    await simulateNetworkDelay()
    simulateAPIError()

    // In a real app, this would make an actual API call
    return { success: true, liked: true }
  }

  async bookmarkFeedItem(id: string): Promise<{ success: boolean; bookmarked: boolean }> {
    // Validate ID first
    const postId = Number.parseInt(id)
    if (isNaN(postId) || postId < 1 || postId > 100) {
      throw new APIError("Invalid post ID", "INVALID_ID", 400)
    }

    // Simulate API call
    await simulateNetworkDelay()
    simulateAPIError()

    // In a real app, this would make an actual API call
    return { success: true, bookmarked: true }
  }

  async getComments(postId: string): Promise<any[]> {
    const id = Number.parseInt(postId)
    if (isNaN(id) || id < 1 || id > 100) {
      throw new APIError("Invalid post ID", "INVALID_ID", 400)
    }

    const comments = await this.makeRequest<any[]>(`/posts/${postId}/comments`)
    return comments
  }
}

export const apiClient = new APIClient()
