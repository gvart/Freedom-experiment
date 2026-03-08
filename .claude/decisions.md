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

## ADR-008: Docker Self-Hosting Architecture
**Date**: 2026-03-08
**Status**: Accepted

Single-container approach for self-hosting:
- Multi-stage Dockerfile: deps → build web → slim production image
- API serves built web assets via Hono's `serveStatic` in production
- No nginx/reverse proxy needed — Bun handles everything
- SQLite database stored in Docker volume at `/data/patchwork.db`
- Migrations run automatically on container start
- All config via environment variables with sensible defaults
- `docker compose up` is the entire self-hosting story

Why single container (not API + Web separately):
- SQLite doesn't support concurrent access from multiple processes well
- Simpler deployment for self-hosters (one container, one command)
- Bun is fast enough to serve static assets directly
- Reduces infrastructure complexity for the $0/mo self-host tier

## ADR-009: Email via Resend (Session 8)

Decision: Use Resend for transactional emails with graceful no-op when API key is absent.

Why Resend:
- Generous free tier (100 emails/day, more than enough for early growth)
- Simple API, great DX, modern service
- No complex SMTP setup needed
- Inline HTML templates (no template engine) — keeps it simple

Design decisions:
- Double opt-in: subscribers must confirm email before receiving notifications
- Fire-and-forget: notifications sent async after publish response returns
- Dev mode: when RESEND_API_KEY is empty, emails are logged to console
- Subscribe form embedded in public changelog page (no separate page needed)

## ADR-010: GitHub Releases Sync (Session 8)

Decision: Allow connecting a GitHub repo to a project and importing releases as draft entries.

Why drafts (not auto-publish):
- Users should review imported content before publishing
- Release notes may need editing for changelog format
- Prevents accidental notification spam to subscribers

Design:
- GitHub repo stored as `owner/repo` string on projects table
- Uses GitHub REST API (unauthenticated: 60 req/hr, with token: 5000/hr)
- Deduplication by entry title match
- All imported entries tagged as "new" category
- Manual "Sync Now" button in settings (no webhooks for MVP)

## ADR-011: CI/CD with GitHub Actions (Session 9)

Decision: Two-workflow CI/CD pipeline for automated quality checks and deployment.

**CI workflow** (`.github/workflows/ci.yml`):
- Triggers on PRs to `main` and pushes to `main`
- Three parallel jobs: lint, test, build
- Uses `oven-sh/setup-bun@v2` with Bun 1.3
- Ensures nothing merges without passing all checks

**Deploy workflow** (`.github/workflows/deploy.yml`):
- Triggers on push to `main` only
- Runs CI checks first (reuses ci.yml), then deploys
- Uses `superfly/flyctl-actions` for Fly.io deployment
- Concurrency group ensures only one deploy runs at a time
- Requires `FLY_API_TOKEN` secret in GitHub repo settings

**Setup required by human partner**:
1. Run `fly launch --copy-config --no-deploy` to create the app
2. Run `fly tokens create deploy` to get a deploy token
3. Add `FLY_API_TOKEN` secret in GitHub repo Settings → Secrets → Actions
