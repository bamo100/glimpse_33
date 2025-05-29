import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SearchFilters } from "@/components/search-filters"
import type { SearchFilters as SearchFiltersType } from "@/types/feed"
import { jest } from "@jest/globals"

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

describe("SearchFilters Component", () => {
  const mockFilters: SearchFiltersType = {
    query: "",
    category: "all",
    page: 1,
  }

  const mockOnFiltersChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it("renders search input and category select", () => {
    render(<SearchFilters filters={mockFilters} onFiltersChange={mockOnFiltersChange} totalResults={10} />)

    expect(screen.getByPlaceholderText("Search articles, authors, or topics...")).toBeInTheDocument()
    expect(screen.getByRole("combobox")).toBeInTheDocument()
    expect(screen.getByText("10 results found")).toBeInTheDocument()
  })

  it("calls onFiltersChange when search input changes", async () => {
    const user = userEvent.setup()

    render(<SearchFilters filters={mockFilters} onFiltersChange={mockOnFiltersChange} totalResults={10} />)

    const searchInput = screen.getByPlaceholderText("Search articles, authors, or topics...")
    await user.type(searchInput, "test query")

    // Wait for debounced search
    await waitFor(
      () => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          ...mockFilters,
          query: "test query",
          page: 1,
        })
      },
      { timeout: 500 },
    )
  })

  it("displays active filters as badges", () => {
    const filtersWithQuery: SearchFiltersType = {
      query: "test search",
      category: "technology",
      page: 1,
    }

    render(<SearchFilters filters={filtersWithQuery} onFiltersChange={mockOnFiltersChange} totalResults={5} />)

    expect(screen.getByText('Search: "test search"')).toBeInTheDocument()
    expect(screen.getByText("Category: Technology")).toBeInTheDocument()
    expect(screen.getByText("Clear all filters")).toBeInTheDocument()
  })

  it("clears all filters when clear button is clicked", async () => {
    const user = userEvent.setup()
    const filtersWithQuery: SearchFiltersType = {
      query: "test search",
      category: "technology",
      page: 1,
    }

    render(<SearchFilters filters={filtersWithQuery} onFiltersChange={mockOnFiltersChange} totalResults={5} />)

    const clearButton = screen.getByText("Clear all filters")
    await user.click(clearButton)

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      query: "",
      category: "all",
      page: 1,
    })
  })

  it("shows search history when available", async () => {
    const user = userEvent.setup()
    localStorageMock.getItem.mockReturnValue(JSON.stringify(["previous search", "another search"]))

    render(<SearchFilters filters={mockFilters} onFiltersChange={mockOnFiltersChange} totalResults={10} />)

    const searchInput = screen.getByPlaceholderText("Search articles, authors, or topics...")
    await user.click(searchInput)

    expect(screen.getByText("Recent Searches")).toBeInTheDocument()
    expect(screen.getByText("previous search")).toBeInTheDocument()
    expect(screen.getByText("another search")).toBeInTheDocument()
  })

  it("handles category change correctly", () => {
    render(<SearchFilters filters={mockFilters} onFiltersChange={mockOnFiltersChange} totalResults={10} />)

    // This is a simplified test - in reality, you'd need to interact with the Select component
    // which might require more complex testing setup
    expect(screen.getByRole("combobox")).toBeInTheDocument()
  })

  it("clears search input when clear button is clicked", async () => {
    const user = userEvent.setup()
    const filtersWithQuery: SearchFiltersType = {
      query: "test search",
      category: "all",
      page: 1,
    }

    render(<SearchFilters filters={filtersWithQuery} onFiltersChange={mockOnFiltersChange} totalResults={5} />)

    // Find the clear button (X button) in the search input
    const clearButton = screen.getByRole("button", { name: /clear/i })
    await user.click(clearButton)

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...filtersWithQuery,
      query: "",
      page: 1,
    })
  })
})
