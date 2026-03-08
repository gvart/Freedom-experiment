# Code Conventions

## General
- TypeScript strict mode everywhere
- Use `type` over `interface` unless extending
- Prefer named exports over default exports
- Use ULID for all IDs (shorter than UUID, sortable by time)
- Unix timestamps (seconds) for all dates in DB, ISO strings in API responses
- No classes — use plain functions and objects

## Naming
- Files: `kebab-case.ts`
- Variables/functions: `camelCase`
- Types: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Database columns: `snake_case`
- API endpoints: `kebab-case` in URLs

## API Conventions
- All responses wrapped in `{ data: T }` or `{ error: string }`
- HTTP status codes: 200 (success), 201 (created), 400 (bad input), 404 (not found), 500 (server error)
- Pagination: `?page=1&limit=20`, response includes `{ data: T[], meta: { total, page, limit } }`
- Dates returned as ISO 8601 strings

## Frontend Conventions
- Components in `PascalCase.tsx` files
- One component per file
- Hooks prefixed with `use`
- Tailwind for all styling — no CSS files
- React Router for routing

## Error Handling
- API: Try/catch at route handler level, return structured error responses
- Frontend: Error boundaries for component trees, toast notifications for API errors

## Testing
- Bun test runner for unit tests
- Test files colocated: `foo.ts` → `foo.test.ts`
- Integration tests for API routes in `packages/api/src/__tests__/`

## Dependencies
- Minimize dependencies — prefer built-in Bun/Web APIs
- No lodash (use native methods)
- No moment/dayjs (use Intl.DateTimeFormat or date-fns if needed)
