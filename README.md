# Country Search

A lightweight country search web application built with vanilla TypeScript and DOM APIs without bundlers.

## Features

- **Debounced live search** with automatic cancellation of outdated in-flight requests (`AbortController` + `AbortSignal.timeout`).
- **Country cards & detailed modal view** with flag, capital, region, population, area, borders, languages, and currencies.
- **In-memory response caching & request deduplication** for repeated and concurrent queries.
- **Persistent search history** stored in `localStorage` with one-click repeat and clear actions.
- **Graceful state handling** for idle, loading, empty (`404`), and network/server errors with a **Retry** action.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/evgeniia-korolova/country-search.git
cd <repository-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run checks and tests

```bash
# Run unit and integration tests
npm test

# Run TypeScript type checking (including tests)
npm run typecheck

# Run ESLint
npm run lint

# Check code formatting with Prettier
npm run format
```

### 4. Build and run locally

Compile TypeScript to the `dist/` directory:

```bash
npm run build
```

_(Optional)_ Start TypeScript compiler in watch mode during development:

```bash
npm run dev
```

Serve the root directory using any static HTTP server (for example, VS Code Live Server or `npx serve`):

```bash
npx serve .
```
