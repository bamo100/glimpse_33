// Suppress specific console warnings during tests
const originalWarn = console.warn
const originalError = console.error

console.warn = (...args) => {
  // Suppress specific warnings that are expected in tests
  if (
    args[0] &&
    typeof args[0] === "string" &&
    (args[0].includes("Invalid feed item ID") || args[0].includes("Request failed") || args[0].includes("Warning:"))
  ) {
    return
  }
  originalWarn.apply(console, args)
}

console.error = (...args) => {
  // Suppress React warnings about missing act() wrapper in tests
  if (
    args[0] &&
    typeof args[0] === "string" &&
    (args[0].includes("Warning: ReactDOM.render is no longer supported") ||
      args[0].includes("Warning: An invalid form control") ||
      args[0].includes("Error caught by boundary"))
  ) {
    return
  }
  originalError.apply(console, args)
}
