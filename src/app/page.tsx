"use client"

import { ErrorBoundary } from "@/components/error-boundary"
import { NetworkStatus } from "@/components/network-status"

import { FeedContent } from "@/components/feeds/feed-content"

export default function FeedPage() {
  return (
    <ErrorBoundary>
      <NetworkStatus />
      <FeedContent />
    </ErrorBoundary>
  )
}
