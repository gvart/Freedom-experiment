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

## ADR-006: Competitive Positioning
**Date**: 2026-03-08
**Status**: Accepted

### Research Findings
- **Openchangelog** (github.com/JonasHiltl/openchangelog, ~294 stars): Only real OSS competitor. Go-based, just renders existing markdown files. No editor, no widget, no SaaS platform. Fundamentally a different product.
- **Beamer**: $49/mo, MAU-priced (punishes growth). Main feature: embeddable widget.
- **AnnounceKit**: $49/mo, similar to Beamer.
- **Canny**: $400/mo, overkill for changelogs (it's a feedback tool).
- **Changelogy**: $10/mo, feature-thin, not open source.

### Patchwork's Differentiators
1. **Rich block editor** (not just markdown textarea) — Tiptap/ProseMirror based
2. **Embeddable widget** (<10KB, Shadow DOM) — the feature that justifies paid plans
3. **Public pages with viral "Powered by Patchwork"** footer
4. **API-first** for CI/CD integration
5. **Self-hostable + cheap hosted** ($9/mo Pro vs $49/mo competitors)
6. **Multi-project/org support** for teams

### Future Stack Considerations (Not Yet Implemented)
These were researched and may be adopted in future phases:
- **tRPC**: For type-safe dashboard API (replacing REST for internal use)
- **Better Auth**: For authentication (email/password + GitHub OAuth)
- **Tiptap**: For the rich block editor (ProseMirror-based)
- **Shadcn/ui**: For dashboard UI components (copy-paste, no lock-in)

## ADR-007: Simple Session Auth (No Library)
**Date**: 2026-03-08
**Status**: Accepted

Chose hand-rolled session auth over Better Auth/Lucia for Phase 3:
- Bun has built-in `Bun.password.hash()` and `Bun.password.verify()` (bcrypt)
- Sessions stored in `sessions` table with ULID tokens
- httpOnly cookies with SameSite=Lax for CSRF protection
- API keys use `pk_` prefix, hashed with bcrypt, shown only once on creation
- Dual auth: session cookies (dashboard) + Bearer API keys (programmatic)
- Simple, no external dependencies, easy to understand
- Can upgrade to Better Auth later if OAuth/social login needed
