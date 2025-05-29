import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/providers/query-provider"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/sonner"
import { PageTransition } from "@/components/page-transition"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export const metadata: Metadata = {
  title: {
    default: "Feed Explorer - Dynamic Content Discovery",
    template: "%s | Feed Explorer",
  },
  description:
    "A dynamic feed explorer with search, filtering, and infinite scrolling powered by JSONPlaceholder. Discover articles across technology, design, business, and lifestyle categories.",
  keywords: [
    "feed explorer",
    "articles",
    "blog",
    "content discovery",
    "jsonplaceholder",
    "technology",
    "design",
    "business",
    "lifestyle",
    "search",
    "filter",
    "infinite scroll",
  ],
  authors: [{ name: "Feed Explorer Team", url: "https://feedexplorer.com" }],
  creator: "Feed Explorer Team",
  publisher: "Feed Explorer",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Feed Explorer - Dynamic Content Discovery",
    description: "A dynamic feed explorer with search, filtering, and infinite scrolling powered by JSONPlaceholder",
    siteName: "Feed Explorer",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Feed Explorer - Dynamic Content Discovery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Feed Explorer - Dynamic Content Discovery",
    description: "A dynamic feed explorer with search, filtering, and infinite scrolling",
    images: ["/og-image.png"],
    creator: "@feedexplorer",
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
  category: "technology",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <Header />
            <PageTransition>
              <main className="min-h-screen bg-background">{children}</main>
            </PageTransition>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
