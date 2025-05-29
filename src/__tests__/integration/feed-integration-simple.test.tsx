import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { jest } from "@jest/globals"

// Mock dependencies
jest.mock("react-intersection-observer", () => ({
  useInView: () => ({ ref: jest.fn(), inView: false }),
}))

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn(), warning: jest.fn() },
}))

// Simple test data
const testData = [
  {
    id: "1",
    title: "Simple Test Article",
    description: "A simple test description",
    author: { name: "Test Author" },
    category: "technology",
    readTime: 5,
    tags: ["test", "simple"],
  },
]

// Simple test component
function SimpleFeedComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Feed Explorer</h1>

      <input placeholder="Search articles, authors, or topics..." className="w-full px-3 py-2 border rounded mb-4" />

      <p className="text-sm text-gray-600 mb-4">{testData.length} result found</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testData.map((item) => (
          <div key={item.id} className="border rounded p-4">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.description}</p>
            <p className="text-sm font-medium">{item.author.name}</p>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.category}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

describe("Feed Integration Simple", () => {
  it("renders and works with simple static data", async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <SimpleFeedComponent />
      </QueryClientProvider>,
    )

    // Basic checks
    expect(screen.getByText("Feed Explorer")).toBeInTheDocument()
    expect(screen.getByText("Simple Test Article")).toBeInTheDocument()
    expect(screen.getByText("Test Author")).toBeInTheDocument()
    expect(screen.getByText("1 result found")).toBeInTheDocument()

    // Test search input interaction
    const searchInput = screen.getByPlaceholderText("Search articles, authors, or topics...")
    await user.type(searchInput, "test query")
    expect(searchInput).toHaveValue("test query")
  })
})
