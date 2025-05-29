"use client"

import Link from "next/link"
import { ArrowLeft, FileX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-center">
          <FileX className="h-24 w-24 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Article Not Found</h1>
          <p className="text-muted-foreground">
            The article you're looking for doesn't exist or has been removed. JSONPlaceholder only has posts with IDs
            1-100.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Feed
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
