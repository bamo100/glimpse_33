"use client"

import "@testing-library/jest-dom"
import { jest } from "@jest/globals"
import { beforeAll, afterAll } from "@jest/globals" // Import beforeAll and afterAll

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return "/"
  },
}))

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
    resolvedTheme: "light",
  }),
  ThemeProvider: ({ children }) => children,
}))

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => children,
}))

// Mock intersection observer
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock date-fns to avoid timezone issues in tests
jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn(() => "2 days ago"),
}))

// Increase timeout for async operations
jest.setTimeout(10000)

// Suppress console warnings during tests
const originalWarn = console.warn
const originalError = console.error

beforeAll(() => {
  console.warn = jest.fn()
  console.error = jest.fn()
})

afterAll(() => {
  console.warn = originalWarn
  console.error = originalError
})
