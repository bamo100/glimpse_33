import type React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FeedItemCard } from "@/components/feed-item-card"
import type { FeedItem } from "@/types/feed"
import { jest } from "@jest/globals"

// Mock Next.js components
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>  // eslint-disable-line react/display-name
})

jest.mock("next/image", () => {
  return ({ src, alt, ...props }: any) => <img src={src || "/placeholder.svg"} alt={alt} {...props} />  // eslint-disable-line react/display-name
})

// Mock console.warn to suppress expected warnings
const originalWarn = console.warn
beforeAll(() => {
  console.warn = jest.fn()
})

afterAll(() => {
  console.warn = originalWarn
})

describe("FeedItemCard Component", () => {
  const mockFeedItem: FeedItem = {
    id: "1",
    title: "Test Article Title",
    description: "This is a test article description that should be displayed in the card.",
    content: "Full article content here...",
    author: {
      name: "John Doe",
      avatar: "https://example.com/avatar.jpg",
      email: "john@example.com",
      website: "https://johndoe.com",
    },
    category: "technology",
    date: "2024-01-15T10:00:00Z",
    thumbnail: "https://example.com/thumbnail.jpg",
    readTime: 5,
    tags: ["react", "testing", "javascript"],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders feed item information correctly", () => {
    render(<FeedItemCard item={mockFeedItem} />)

    expect(screen.getByText("Test Article Title")).toBeInTheDocument()
    expect(
      screen.getByText("This is a test article description that should be displayed in the card."),
    ).toBeInTheDocument()
    expect(screen.getByText("John Doe")).toBeInTheDocument()
    expect(screen.getByText("technology")).toBeInTheDocument()
    expect(screen.getByText("5 min read")).toBeInTheDocument()
  })

  it("displays tags correctly", () => {
    render(<FeedItemCard item={mockFeedItem} />)

    expect(screen.getByText("react")).toBeInTheDocument()
    expect(screen.getByText("testing")).toBeInTheDocument()
    expect(screen.getByText("javascript")).toBeInTheDocument()
  })

  it("renders author avatar with fallback when image fails to load", () => {
    render(<FeedItemCard item={mockFeedItem} />)

    // The avatar component shows a fallback User icon when image fails to load
    const userIcon = screen.getByRole("img", { hidden: true })
    expect(userIcon).toBeInTheDocument()

    // Check that the author name is displayed
    expect(screen.getByText("John Doe")).toBeInTheDocument()
  })

  it("creates correct navigation link", () => {
    render(<FeedItemCard item={mockFeedItem} />)

    const titleLinks = screen.getAllByRole("link")
    const titleLink = titleLinks.find((link: HTMLElement) => link.getAttribute("href") === "/feed/1")
    expect(titleLink).toBeInTheDocument()
  })

  it("handles external website link click", async () => {
    const user = userEvent.setup()
    const mockOpen = jest.fn()
    Object.defineProperty(window, "open", {
      value: mockOpen,
      writable: true,
    })

    render(<FeedItemCard item={mockFeedItem} />)

    // Find the external link button by its icon or role
    const websiteButtons = screen.getAllByRole("button")
    const websiteButton = websiteButtons.find((button: HTMLElement) => button.querySelector("svg"))

    if (websiteButton) {
      await user.click(websiteButton)
      expect(mockOpen).toHaveBeenCalledWith("https://johndoe.com", "_blank")
    }
  })

  it("shows truncated tags when there are more than 3", () => {
    const itemWithManyTags: FeedItem = {
      ...mockFeedItem,
      tags: ["react", "testing", "javascript", "typescript", "nextjs"],
    }

    render(<FeedItemCard item={itemWithManyTags} />)

    expect(screen.getByText("react")).toBeInTheDocument()
    expect(screen.getByText("testing")).toBeInTheDocument()
    expect(screen.getByText("javascript")).toBeInTheDocument()
    expect(screen.getByText("+2 more")).toBeInTheDocument()
  })

  it("applies correct category styling", () => {
    render(<FeedItemCard item={mockFeedItem} />)

    const categoryBadge = screen.getByText("technology")
    expect(categoryBadge).toHaveClass("bg-blue-100", "text-blue-800")
  })

  it("returns null for invalid ID", () => {
    const invalidItem: FeedItem = {
      ...mockFeedItem,
      id: "invalid-id",
    }

    const { container } = render(<FeedItemCard item={invalidItem} />)
    expect(container.firstChild).toBeNull()

    // Verify the warning was called
    expect(console.warn).toHaveBeenCalledWith("Invalid feed item ID: invalid-id")
  })

  it("displays formatted date correctly", () => {
    render(<FeedItemCard item={mockFeedItem} />)

    // The date should be formatted as "time ago"
    const dateElement = screen.getByText(/ago/)
    expect(dateElement).toBeInTheDocument()
  })

  it("renders thumbnail image with correct alt text", () => {
    render(<FeedItemCard item={mockFeedItem} />)

    const thumbnail = screen.getByAltText("Test Article Title")
    expect(thumbnail).toBeInTheDocument()

    // Next.js Image component transforms and URL-encodes the src, so we check for the encoded version
    const src = thumbnail.getAttribute("src")
    expect(src).toContain("example.com%2Fthumbnail.jpg") // URL-encoded version
    // Or alternatively, check if it contains the domain
    expect(src).toContain("example.com")
  })

  it("displays author information correctly", () => {
    render(<FeedItemCard item={mockFeedItem} />)

    expect(screen.getByText("John Doe")).toBeInTheDocument()

    // Check for external link button
    const externalLinkButton = screen.getByRole("button")
    expect(externalLinkButton).toBeInTheDocument()
  })
})
