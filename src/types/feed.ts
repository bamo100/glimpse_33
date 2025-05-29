export interface FeedItem {
    id: string
    title: string
    description: string
    content: string
    author: {
    name: string
    avatar: string
    email: string
    website: string
    }
    category: "technology" | "design" | "business" | "lifestyle"
    date: string
    thumbnail: string
    readTime: number
    tags: string[]
}

export interface FeedResponse {
    items: FeedItem[]
    hasMore: boolean
    total: number
}
  
export interface SearchFilters {
    query: string
    category: string
    page: number
}
  
export interface APIError {
    error: string
    code: string
    details?: string
}
  
// JSONPlaceholder types
export interface JSONPlaceholderPost {
    userId: number
    id: number
    title: string
    body: string
}
  
export interface JSONPlaceholderUser {
    id: number
    name: string
    username: string
    email: string
    address: {
        street: string
        suite: string
        city: string
        zipcode: string
        geo: {
        lat: string
        lng: string
        }
    }
    phone: string
    website: string
    company: {
        name: string
        catchPhrase: string
        bs: string
    }
}
  
export interface JSONPlaceholderComment {
    postId: number
    id: number
    name: string
    email: string
    body: string
}
  