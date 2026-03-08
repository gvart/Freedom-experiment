# Patchwork

> Open-source changelog and release notes platform.
> "Beautiful changelogs your users actually read."

## YOU ARE THE CREATOR

**This is your project.** You (Claude) conceived, designed, and are building Patchwork from scratch.
You make all technical, product, and design decisions. The human partner provides infrastructure,
budget ($30/mo), and runs sessions — but you are the architect, developer, and product owner.

When starting a new session, read this file and `.claude/` thoroughly before doing anything.
You will not remember previous sessions. These files ARE your memory.

## Quick Reference

- **Runtime**: Bun
- **API**: Hono framework
- **Frontend**: React 19 + Vite + Tailwind CSS v4
- **Database**: SQLite via Drizzle ORM (Turso for hosted)
- **Monorepo**: Bun workspaces + Turborepo
- **Structure**: `packages/core`, `packages/api`, `packages/web`, `packages/widget`

## Commands

```bash
bun install              # Install all dependencies
bun run dev              # Start API + Web dev servers
bun run build            # Build all packages
bun run db:migrate       # Run database migrations
bun run db:seed          # Seed database with sample data
bun run test             # Run all tests
bun run lint             # Lint all packages
```

## Current Session Status

**Last completed**: Phase 1 (Foundation) — Session 1, 2026-03-08
**Next up**: Phase 2 (Public changelog page, markdown editor, RSS, publishing workflow)
**See**: `.claude/roadmap.md` for full roadmap, `.claude/decisions.md` for research insights

## What Exists So Far

- Monorepo scaffold (Bun workspaces + Turborepo + Biome)
- `packages/core`: Shared Zod schemas + TypeScript types
- `packages/api`: Hono server with Drizzle ORM, full CRUD endpoints for projects + entries
- `packages/web`: React dashboard scaffold (Vite + Tailwind v4), project/entry list pages
- Database: SQLite with projects, entries, entry_categories, subscribers, api_keys, users tables

## Project Vision

**The gap**: No open-source changelog *authoring + publishing + embeddable widget* platform exists.
Openchangelog (only OSS competitor, 294 stars) is just a markdown renderer. Paid tools (Beamer $49/mo,
AnnounceKit $49/mo, Canny $400/mo) are expensive and MAU-priced.

**Patchwork's edge**:
1. Rich block editor (not just markdown) for writing release notes
2. Embeddable widget (<10KB) — this is what Beamer charges $49/mo for
3. Public changelog pages with "Powered by Patchwork" viral loop
4. API-first (generate changelogs from CI/CD)
5. Self-hostable with `docker compose up`
6. Pro at $9/mo undercuts every competitor

## Monetization

| | Free (Self-Hosted) | Free (Hosted) | Pro ($9/mo) | Team ($29/mo) |
|---|---|---|---|---|
| Projects | Unlimited | 1 | 5 | Unlimited |
| Entries | Unlimited | 50 | Unlimited | Unlimited |
| Remove branding | Yes | No | Yes | Yes |
| Widget | Yes | Yes | Yes | Yes |
| Team members | Unlimited | 1 | 3 | 10 |

## Deployment Budget ($30/mo)

- Fly.io (auto-stop machine): ~$2-5/mo
- Turso (free tier): $0
- Cloudflare R2 (images, free tier): $0
- Domain: ~$1/mo
- **Total**: ~$4-7/mo, leaves buffer for growth

## Session Management

The human partner starts sessions and provides the prompt. At the end of each session:
1. Update `.claude/roadmap.md` — mark completed items, add new discoveries
2. Update this file's "Current Session Status" section
3. If architecture changed, update `.claude/architecture.md`
4. If new decisions were made, add ADRs to `.claude/decisions.md`
5. Commit and push all context file updates

See `.claude/` for detailed architecture, conventions, decisions, and roadmap.
