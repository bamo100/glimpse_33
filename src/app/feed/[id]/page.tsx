import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FeedItemDetail } from "./feed-item-detail"
import type { FeedItem, JSONPlaceholderPost } from "@/types/feed"
import { transformPostToFeedItem } from "@/lib/data-transformer"

interface PageProps {
  params: Promise<{ id: string }>
}

// Fetch the feed item data for metadata generation
async function getFeedItem(id: string): Promise<FeedItem | null> {
  try {
    // Use the JSONPlaceholder API directly for metadata generation
    const postResponse = await fetch(`${process.env.NEXT_PUBLIC_POST_URL}/${id}`, {
      cache: "no-store",
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (!postResponse.ok) {
      return null
    }

    const post = await postResponse.json()

    // Get the user data
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_URL}/${post.userId}`, {
      cache: "force-cache", // Cache user data
      next: { revalidate: 86400 }, // Revalidate daily
    })

    if (!userResponse.ok) {
      return null
    }

    const user = await userResponse.json()

    // Transform the data using our transformer
    return transformPostToFeedItem(post, user)
  } catch (error) {
    console.error("Error fetching feed item for metadata:", error)
    return null
  }
}

//Genearte metadata for the feed item page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const { id } = resolvedParams

  const item = await getFeedItem(id)

  if (!item) {
    return {
      title: "Article Not Found | Glimpse_33 Feed Explorer",
      description: "The requested article could not be found.",
      robots: "noindex, nofollow",
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'UNDEFINED_BASE_URL'
  const articleUrl = `${baseUrl}/feed/${id}`

  return {
    title: `${item.title} | Glimpse_33 Feed Explorer`,
    description: item.description,
    authors: [{ name: item.author.name, url: item.author.website }],
    keywords: [...item.tags, item.category, "article", "blog", "feed explorer"],
    category: item.category,
    creator: item.author.name,
    publisher: "Feed Explorer",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: item.title,
      description: item.description,
      url: articleUrl,
      siteName: "Glimpse_33 Feed Explorer",
      images: [
        {
          url: item.thumbnail,
          width: 1200,
          height: 630,
          alt: item.title,
          type: "image/jpeg",
        },
        {
          url: item.thumbnail,
          width: 800,
          height: 600,
          alt: item.title,
          type: "image/jpeg",
        },
      ],
      locale: "en_US",
      type: "article",
      publishedTime: item.date,
      authors: [item.author.name],
      section: item.category,
      tags: item.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.description,
      images: [item.thumbnail],
      creator: `@${item.author.name.replace(/\s+/g, "").toLowerCase()}`,
      site: "@feedexplorer",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
      yandex: "your-yandex-verification-code",
    },
  }
}

// Generate static params for better SEO
export async function generateStaticParams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_POST_URL}`)
    const posts = await response.json()

    return posts.slice(0, 20).map((post: JSONPlaceholderPost) => ({
      id: post.id.toString(),
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

export default async function FeedItemPage({ params }: PageProps) {
  const resolvedParams = await params
  const { id } = resolvedParams

  // Validate the ID
  const postId = Number.parseInt(id)
  if (isNaN(postId) || postId < 1 || postId > 100) {
    notFound()
  }

  return (
    <FeedItemDetail itemId={id} />
  )
}
