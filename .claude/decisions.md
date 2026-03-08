# Architecture Decision Records

## ADR-001: Bun as Runtime
**Date**: 2026-03-08
**Status**: Accepted

Chose Bun over Node.js for:
- Built-in TypeScript support (no build step for API)
- Built-in test runner
- Built-in SQLite driver (no native addon needed)
- Faster startup and execution
- Built-in workspace support

## ADR-002: Hono as API Framework
**Date**: 2026-03-08
**Status**: Accepted

Chose Hono over Express/Fastify for:
- Lightweight (~14KB)
- Built for edge/Bun runtimes
- TypeScript-first with great type inference
- Middleware ecosystem (CORS, auth, etc.)
- Can run on Bun, Deno, Cloudflare Workers (future flexibility)

## ADR-003: SQLite + Drizzle over PostgreSQL
**Date**: 2026-03-08
**Status**: Accepted

SQLite is perfect for this use case:
- Content is mostly read-heavy (changelogs don't change often)
- Single-file database = trivial self-hosting and backups
- Bun has built-in SQLite driver
- Turso provides hosted SQLite with generous free tier
- Drizzle gives us type-safe queries without the weight of Prisma

## ADR-004: Monorepo with Bun Workspaces
**Date**: 2026-03-08
**Status**: Accepted

Monorepo because:
- Shared types between API and frontend
- Atomic changes across packages
- Single `bun install`
- Turborepo for parallel builds and caching

## ADR-005: ULID for IDs
**Date**: 2026-03-08
**Status**: Accepted

ULIDs over UUIDs or auto-increment:
- Sortable by creation time (useful for changelog ordering)
- URL-safe
- No sequential ID enumeration
- 26 chars vs UUID's 36
