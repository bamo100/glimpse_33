import type { FeedItem, JSONPlaceholderPost, JSONPlaceholderUser } from "@/types/feed"

const categories = ["technology", "design", "business", "lifestyle"] as const
const techKeywords = ["data", "system", "digital", "network", "software", "code", "tech", "computer", "algorithm"]
const designKeywords = ["design", "visual", "creative", "art", "aesthetic", "beautiful", "style", "interface"]
const businessKeywords = ["business", "market", "strategy", "profit", "company", "corporate", "management", "finance"]
const lifestyleKeywords = ["life", "health", "travel", "food", "personal", "wellness", "home", "family"]

function categorizePost(title: string, body: string): (typeof categories)[number] {
  const text = (title + " " + body).toLowerCase()

  const techScore = techKeywords.reduce((score, keyword) => score + (text.includes(keyword) ? 1 : 0), 0)
  const designScore = designKeywords.reduce((score, keyword) => score + (text.includes(keyword) ? 1 : 0), 0)
  const businessScore = businessKeywords.reduce((score, keyword) => score + (text.includes(keyword) ? 1 : 0), 0)
  const lifestyleScore = lifestyleKeywords.reduce((score, keyword) => score + (text.includes(keyword) ? 1 : 0), 0)

  const scores = [
    { category: "technology", score: techScore },
    { category: "design", score: designScore },
    { category: "business", score: businessScore },
    { category: "lifestyle", score: lifestyleScore },
  ]

  const maxScore = Math.max(...scores.map((s) => s.score))
  if (maxScore === 0) {
    // Random category if no keywords match
    return categories[Math.floor(Math.random() * categories.length)]
  }

  const topCategory = scores.find((s) => s.score === maxScore)
  return (topCategory?.category as (typeof categories)[number]) || "technology"
}

function generateTags(title: string, body: string, category: string): string[] {
  const text = (title + " " + body).toLowerCase()
  const words = text.split(/\s+/).filter((word) => word.length > 4)
  const uniqueWords = [...new Set(words)]

  // Add category-specific tags
  const categoryTags = {
    technology: ["tech", "innovation", "digital"],
    design: ["design", "creative", "visual"],
    business: ["business", "strategy", "growth"],
    lifestyle: ["lifestyle", "personal", "wellness"],
  }

  const tags = [...categoryTags[category as keyof typeof categoryTags], ...uniqueWords.slice(0, 3)]

  return [...new Set(tags)].slice(0, 5)
}

function generateReadTime(body: string): number {
  const wordCount = body.split(/\s+/).length
  const wordsPerMinute = 200
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

function generateDescription(body: string): string {
  const sentences = body.split(".").filter((s) => s.trim().length > 0)
  const firstSentence = sentences[0]?.trim() + "."

  if (firstSentence.length > 150) {
    return firstSentence.substring(0, 147) + "..."
  }

  if (sentences.length > 1) {
    const twoSentences = sentences.slice(0, 2).join(". ") + "."
    if (twoSentences.length <= 200) {
      return twoSentences
    }
  }

  return firstSentence
}

export function transformPostToFeedItem(post: JSONPlaceholderPost, user: JSONPlaceholderUser): FeedItem {
  const category = categorizePost(post.title, post.body)
  const tags = generateTags(post.title, post.body, category)
  const readTime = generateReadTime(post.body)
  const description = generateDescription(post.body)

  // Generate a consistent date based on post ID
  const baseDate = new Date("2024-01-01")
  const dayOffset = (post.id * 7) % 365 // Spread posts across the year
  const postDate = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000)

  return {
    id: post.id.toString(),
    title: post.title.charAt(0).toUpperCase() + post.title.slice(1),
    description,
    content: post.body.charAt(0).toUpperCase() + post.body.slice(1),
    author: {
      name: user.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
      email: user.email,
      website: user.website.startsWith("http") ? user.website : `https://${user.website}`,
    },
    category,
    date: postDate.toISOString(),
    thumbnail: `https://picsum.photos/600/400?random=${post.id}`,
    readTime,
    tags,
  }
}

export function simulateNetworkDelay(): Promise<void> {
  const delay = 300 + Math.random() * 1200 // 300ms to 1.5s
  return new Promise((resolve) => setTimeout(resolve, delay))
}

export function simulateAPIError(): void {
  const random = Math.random()

  // 3% chance of server error
  if (random < 0.03) {
    throw new Error("Internal server error")
  }

  // 2% chance of network timeout
  if (random < 0.05) {
    throw new Error("Request timeout")
  }

  // 1% chance of rate limiting
  if (random < 0.06) {
    throw new Error("Rate limit exceeded")
  }
}
