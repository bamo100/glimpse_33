"use client"

import { formatDistanceToNow } from "date-fns"
import { Clock, User, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { FeedItem } from "@/types/feed"

interface FeedItemCardProps {
  item: FeedItem
}

export function FeedItemCard({ item }: FeedItemCardProps) {
  const categoryColors = {
    technology: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    design: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    business: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    lifestyle: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  }

  // Ensure the ID is valid for navigation
  const isValidId = !isNaN(Number.parseInt(item.id)) && Number.parseInt(item.id) >= 1 && Number.parseInt(item.id) <= 100

  if (!isValidId) {
    console.warn(`Invalid feed item ID: ${item.id}`)
    return null
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <Link href={`/feed/${item.id}`}>
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={item.thumbnail || "/placeholder.svg"}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <Badge className={`absolute top-3 left-3 ${categoryColors[item.category]}`}>{item.category}</Badge>
        </div>
      </Link>

      <CardHeader className="pb-3">
        <Link href={`/feed/${item.id}`}>
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm line-clamp-3 mt-2">{item.description}</p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={item.author.avatar || "/placeholder.svg"} alt={item.author.name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{item.author.name}</p>
              {item.author.website && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault()
                    window.open(item.author.website, "_blank")
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDistanceToNow(new Date(item.date), { addSuffix: true })}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{item.readTime} min read</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {item.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{item.tags.length - 3} more
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
