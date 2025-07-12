# EricFinance AI Coding Instructions

## Architecture Overview

This is a React + TypeScript personal finance application using **client-side SQLite** with optional encryption. The app runs entirely in the browser with no backend server - data is stored in encrypted SQLite files that users can download/upload.

### Key Technologies

- **Frontend**: React 19, TanStack Router, TanStack Query, Tailwind CSS, shadcn/ui
- **Database**: sql.js (SQLite in browser), Drizzle ORM with custom browser migration system
- **Encryption**: Web Crypto API for optional database encryption
- **Testing**: Playwright (E2E), Vitest (unit), Page Object Model pattern

## Critical Architecture Patterns

### Database Layer (3-tier pattern)

```
Routes → Services → DAOs → Drizzle Schema
```

1. **DAOs** (`src/lib/dao/`): Pure database operations, return specific result interfaces
2. **Services** (`src/lib/services/`): Business logic + TanStack Query hooks for React components
3. **Routes**: Use service hooks, never call DAOs directly

Example: Use `useListAccounts()` service hook, not `listAccounts()` DAO directly.

### Database Initialization

- Database is initialized in `DBProvider` context (`src/providers/db.tsx`)
- Uses `useDB()` hook to access the database instance
- Routes under `_sidebar` require authenticated DB state (see `src/routes/_sidebar.tsx`)
- Database state flows: File upload → Password handling → Migration → Ready

### Custom Migration System

The app uses a **custom browser migration system** instead of standard Drizzle migrations:

- Run `pnpm db:generate` to generate migrations AND update the migrations index
- Custom script at `scripts/generate-migrations-index.ts` creates `src/lib/db/migrations/index.ts`
- Browser migrator at `src/lib/db/migrator/browser-migrate.ts` handles client-side migrations
- Never use `drizzle-kit migrate` - it won't work in the browser

### File Encryption Pattern

- All database files can be optionally encrypted using Web Crypto API
- Encryption utilities in `src/lib/crypto.ts`
- Password dialogs handle create/unlock/change operations
- Files are prefixed with magic bytes to detect encryption

## Development Workflows

### Database Changes

```bash
# 1. Modify schema files in src/lib/db/schema/
# 2. Generate migration + update index
pnpm db:generate
# 3. The custom script automatically creates the migrations index
```

### Testing

```bash
pnpm test          # Vitest browser tests
pnpm test:e2e      # Playwright E2E tests
pnpm test:e2e:ui   # Playwright UI mode
```

### Building

```bash
pnpm dev           # Development server
pnpm build         # Production build
# Note: postinstall copies sql-wasm.wasm to public/
```

## Component Patterns

### Form Handling

- Uses TanStack Form with custom `FormButton` component
- Form context accessed via `useFormContext()` hook
- Form buttons automatically handle submit state and validation

### UI Components

- All UI components in `src/components/ui/` follow shadcn/ui patterns
- Custom components in `src/components/` for app-specific logic
- Icons use custom `Icon` component with `lucide-react`

### Data Fetching

- Always use service hooks (e.g., `useListAccounts()`) in components
- Services handle TanStack Query setup and database context
- Query keys follow pattern: `["entityAction", ...params]`

## File Organization

### Database

- **Schema**: `src/lib/db/schema/` - Drizzle table definitions
- **DAOs**: `src/lib/dao/` - Pure database operations by entity
- **Services**: `src/lib/services/` - Business logic + React Query hooks
- **Migrations**: `src/lib/db/migrations/` - Auto-generated, do not edit manually

### Routes

- File-based routing with TanStack Router
- `_sidebar` layout requires DB authentication
- Route files in `src/routes/` with nested folder structure

### Testing

- **E2E**: `e2e/specs/` with Page Object Model in `e2e/page-objects/`
- **Unit**: Colocated with source files or in dedicated test folders

## Important Gotchas

1. **Never bypass the service layer** - Components should use service hooks, not DAO functions directly
2. **Always run the full migration command** - `pnpm db:generate` includes the custom index generation
3. **Database context is required** - Most operations need `useDB()` hook with null checks
4. **Encryption is optional** - Handle both encrypted and unencrypted database files
5. **Client-side only** - No server API calls, everything runs in the browser
6. **Page reloads reset auth state** - After `page.reload()` in tests, navigate back to intended page
7. **Strict mode violations** - When multiple elements match, be more specific with selectors
8. **Transaction table selectors** - Use `getByRole("row").filter({ hasText: payee })` pattern for transactions

## Key Files to Reference

- `src/providers/db.tsx` - Database initialization and context
- `src/lib/db/schema/index.ts` - Schema exports
- `scripts/generate-migrations-index.ts` - Custom migration indexing
- `src/routes/_sidebar.tsx` - Authenticated route layout
- `src/lib/services/*/` - Service layer patterns
- `e2e/specs/account-detail.spec.ts` - Reference for account detail page testing patterns
- `e2e/page-objects/AccountPage.ts` - Page object patterns for account operations

## Testing Command Reference

```bash
# Run specific test file
pnpm test:e2e e2e/specs/account-detail.spec.ts

# Run specific test by grep pattern
pnpm test:e2e --grep "allows assigning categories"

# Run tests in UI mode for debugging
pnpm test:e2e:ui

# Show last test report
pnpm exec playwright show-report
```

## Testing Patterns

### Playwright E2E Tests

The project uses Page Object Model pattern for E2E tests with specific conventions:

#### Page Object Guidelines

- Store page objects in `e2e/page-objects/`
- Each page object represents a logical page or feature area
- Methods should be atomic actions (e.g., `createAccount()`, `assignCategoryToTransaction()`)
- Use descriptive method names that reflect user actions
- Prefer specific selectors over generic ones (e.g., `getByRole("combobox")` for dropdowns)

#### Test Structure Patterns

```typescript
test.describe("Feature Name", () => {
  const testData = {
    /* test constants */
  };
  const databasePassword = "testpassword";

  test.beforeEach(async ({ page, databasePage, featurePage }) => {
    await page.goto("/");
    await databasePage.createEncryptedDatabase(databasePassword);
    // Setup feature-specific state
  });

  test("should do something", async ({ page, featurePage }) => {
    // Test implementation
  });
});
```

#### Element Selection Best Practices

- Use semantic roles: `getByRole("button", { name: "Create Account" })`
- Filter table rows: `page.getByRole("row").filter({ hasText: payee })`
- Target specific cells: `page.getByRole("cell", { name: totalAmount })`
- For dropdowns/selects: `getByRole("combobox")` then `getByRole("option")`

#### Transaction Table Testing

When testing the transactions table (used in account detail pages):

- Transactions are grouped by date with date headers as table cells
- Each transaction row contains: payee, category dropdown, amount
- Category assignment uses a combobox that opens option list
- Date headers show totals for that day's transactions
- Always verify both transaction existence and correct amounts

#### Database State Testing

- Always test data persistence through export/import cycles
- Use `databasePage.exportDatabase()` and `databasePage.importDatabase()`
- Verify data survives page reloads and database operations
- Test both encrypted and unencrypted scenarios where applicable

#### Common Anti-Patterns to Avoid

- Don't use `waitForTimeout()` excessively - prefer waiting for specific elements
- Avoid generic text selectors when semantic roles are available
- Don't test implementation details - focus on user-visible behavior
- Avoid calling multiple page objects in parallel for the same test

## Component Testing Insights

### TransactionsTable Component

- Displays transactions grouped by date in table format
- Each date group has a header row with date and daily total
- Individual transaction rows have: payee, category selector, amount
- Category selector is a combobox with "Uncategorized" as default
- Supports infinite scroll loading with intersection observer

### Account Detail Page Structure

- Route: `/accounts/{accountId}`
- Contains: Account header, NetWorthChart, TransactionsTable
- Edit dropdown provides account management actions
- Transactions table allows real-time category assignment
- Shows running totals and date-grouped transaction history
