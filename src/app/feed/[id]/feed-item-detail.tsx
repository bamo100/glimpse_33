"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowLeft,
  Clock,
  User,
  Share2,
  Bookmark,
  Heart,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Mail,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useFeedItem, useLikeFeedItem, useBookmarkFeedItem, useComments } from "@/hooks/use-feed"
import { toastSuccess, toastError, toastWithOptions } from "@/hooks/use-toast"

interface FeedItemDetailProps {
  itemId: string
}

export function FeedItemDetail({ itemId }: FeedItemDetailProps) {
  const { data: item, isLoading, isError, error, refetch } = useFeedItem(itemId)
  const { data: comments, isLoading: commentsLoading } = useComments(itemId)
  const likeMutation = useLikeFeedItem()
  const bookmarkMutation = useBookmarkFeedItem()

  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const handleLike = async () => {
    try {
      await likeMutation.mutateAsync(itemId)
      setIsLiked(!isLiked)

      if (isLiked) {
        toastWithOptions({
          title: "Removed like",
          description: "Article removed from your likes",
          variant: "default",
        })
      } else {
        toastSuccess("Article liked!", {
          description: "Added to your liked articles",
        })
      }
    } catch (error) {
      toastError("Failed to like article", {
        description: "Please try again later",
      })
    }
  }

  const handleBookmark = async () => {
    try {
      await bookmarkMutation.mutateAsync(itemId)
      setIsBookmarked(!isBookmarked)

      if (isBookmarked) {
        toastWithOptions({
          title: "Removed bookmark",
          description: "Article removed from your bookmarks",
          variant: "default",
        })
      } else {
        toastSuccess("Article bookmarked!", {
          description: "Saved to your reading list",
        })
      }
    } catch (error) {
      toastError("Failed to bookmark article", {
        description: "Please try again later",
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share && item) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: window.location.href,
        })
        toastSuccess("Article shared successfully!")
      } catch (error) {
        // User cancelled sharing or sharing failed
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    toastSuccess("Link copied to clipboard!", {
      description: "You can now paste it anywhere",
    })
  }

  const handleEmailAuthor = () => {
    if (item?.author.email) {
      window.open(`mailto:${item.author.email}?subject=Regarding: ${item.title}`, "_blank")
      toastWithOptions({
        title: "Opening email client",
        description: `Composing email to ${item.author.name}`,
        variant: "info",
      })
    }
  }

  const handleVisitWebsite = () => {
    if (item?.author.website) {
      window.open(item.author.website, "_blank")
      toastWithOptions({
        title: "Opening website",
        description: `Visiting ${item.author.name}'s website`,
        variant: "info",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="aspect-video w-full" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !item) {
    const isNetworkError = error?.message.includes("Network Error")
    const isNotFound = error?.message.includes("not found")

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Feed
            </Button>
          </Link>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {isNotFound && "Article Not Found"}
            {isNetworkError && "Connection Problem"}
            {!isNotFound && !isNetworkError && "Error Loading Article"}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {isNotFound && "The article you're looking for doesn't exist or has been removed."}
            {isNetworkError && "Unable to connect to the server. Please check your internet connection."}
            {!isNotFound && !isNetworkError && (error?.message || "Failed to load article. Please try again.")}

            {!isNotFound && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    refetch()
                    toastWithOptions({
                      title: "Retrying...",
                      description: "Attempting to reload the article",
                      variant: "info",
                    })
                  }}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const categoryColors = {
    technology: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    design: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    business: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    lifestyle: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Navigation */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Button>
        </Link>
      </div>

      {/* Article Header */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Badge className={categoryColors[item.category]}>{item.category}</Badge>

          <h1 className="text-4xl font-bold leading-tight">{item.title}</h1>

          <p className="text-xl text-muted-foreground leading-relaxed">{item.description}</p>
        </div>

        {/* Author and Meta Info */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={item.author.avatar || "/placeholder.svg"} alt={item.author.name} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{item.author.name}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground hover:text-primary"
                  onClick={handleEmailAuthor}
                >
                  <Mail className="h-4 w-4" />
                </Button>
                {item.author.website && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-primary"
                    onClick={handleVisitWebsite}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDistanceToNow(new Date(item.date), { addSuffix: true })}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{item.readTime} min read</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant={isLiked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              disabled={likeMutation.isPending}
            >
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
              {likeMutation.isPending ? "..." : "Like"}
            </Button>
            <Button
              variant={isBookmarked ? "default" : "outline"}
              size="sm"
              onClick={handleBookmark}
              disabled={bookmarkMutation.isPending}
            >
              <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
              {bookmarkMutation.isPending ? "..." : "Save"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <Image
            src={item.thumbnail || "/placeholder.svg"}
            alt={item.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        </div>

        {/* Article Content */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Article Content</h2>
          </CardHeader>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none">
            {item.content.split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </CardContent>
        </Card>

        {/* Tags */}
        <div className="space-y-2">
          <h3 className="font-semibold">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Comments Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Comments {comments && `(${comments.length})`}</h3>
          </div>

          {commentsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{comment.name}</p>
                        <span className="text-sm text-muted-foreground">({comment.email})</span>
                      </div>
                      <p className="text-sm leading-relaxed">{comment.body}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
