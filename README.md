# Glimpse_33 Feed Explorer

A modern, responsive feed explorer application built with Next.js 15, featuring authentication, search, filtering, and infinite scrolling. Powered by JSONPlaceholder API for demo content.

## ✨ Features

<!-- - 🔐 **Authentication System** - Login, registration, and profile management -->
- 🔍 **Advanced Search** - Real-time search with history and filters
- 📱 **Responsive Design** - Mobile-first design with dark/light themes
- ♾️ **Infinite Scroll** - Seamless content loading with manual pagination option
- 🏷️ **Category Filtering** - Filter by technology, design, business, lifestyle
<!-- - 👤 **User Profiles** - Customizable profiles with preferences -->
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- ⚡ **Performance** - Optimized with React Query and Next.js 15

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone and install dependencies:**
\`\`\`bash
git clone <repository-url>
cd feed-explorer
npm install
\`\`\`

2. **Set environment variables:**
\`\`\`bash
# Create .env.local file
echo "NEXT_PUBLIC_BASE_URL=http://localhost:3000" > .env.local
\`\`\`

3. **Run the development server:**
\`\`\`bash
npm run dev
\`\`\`

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

<!-- ## 🔑 Demo Accounts

\`\`\`
User Account:
Email: demo@example.com
Password: password123

Admin Account:
Email: admin@example.com
Password: password123
\`\`\` -->

## 📁 Project Structure

\`\`\`
glimpse_33/
├── app/                    # Next.js 15 App Route
pages
│   ├── feed/              # Feed detail pages
│   └── profile/           # User profile pages
├── components/            # Reusable UI  components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API clients
├── types/                # TypeScript type definitions
└── __tests__/            # Test files
\`\`\`

## 🛠️ Available Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
\`\`\`

## 🧪 Testing

The project includes comprehensive tests using Jest and React Testing Library:

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
\`\`\`

## 🎨 Customization

### Themes
- Light/Dark mode toggle in header
- System theme detection
- Customizable via Tailwind CSS

### Categories
Edit categories in `components/search-filters.tsx`:
\`\`\`typescript
const categories = [
  { value: "technology", label: "Technology" },
  { value: "design", label: "Design" },
  // Add more categories
]
\`\`\`

## 🔧 Configuration

### Environment Variables
\`\`\`bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Required for metadata
\`\`\`

### API Integration
Replace mock authentication in `lib/auth-client.ts` with your backend API endpoints.

## 📦 Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** React Query + React Context
- **Authentication:** Custom mock system (production-ready)
- **Testing:** Jest + React Testing Library
- **Icons:** Lucide React
- **Animations:** Framer Motion
