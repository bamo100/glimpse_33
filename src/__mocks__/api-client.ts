import type { FeedResponse, FeedItem } from "@/types/feed"
import { jest } from "@jest/globals"

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

export const apiClient = {
  getFeed: jest.fn<(params: any) => Promise<FeedResponse>>(),
  getFeedItem: jest.fn<(id: string) => Promise<FeedItem>>(),
  likeFeedItem: jest.fn<(id: string) => Promise<{ success: boolean; liked: boolean }>>(),
  bookmarkFeedItem: jest.fn<(id: string) => Promise<{ success: boolean; bookmarked: boolean }>>(),
  getComments: jest.fn<(postId: string) => Promise<any[]>>(),
}
