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

**Last completed**: Session 8, 2026-03-08 — Email subscriber notifications (Resend) + GitHub Releases sync
**Next up**: Deploy to Fly.io (`fly launch` + `fly deploy`), then Phase 6 (Turso, Stripe, teams)
**See**: `.claude/roadmap.md` for full roadmap, `.claude/decisions.md` for research insights

## What Exists So Far

- Monorepo scaffold (Bun workspaces + Turborepo + Biome)
- `packages/core`: Shared Zod schemas + TypeScript types + markdown-to-HTML converter
- `packages/api`: Hono server with Drizzle ORM, full CRUD endpoints, public changelog pages, RSS feeds, auth (session cookies + API keys), widget data API
- `packages/web`: React dashboard with auth (login/register), project/entry management, markdown editor with preview, publish/unpublish workflow, API key management, toast notifications
- `packages/widget`: Embeddable changelog widget (7KB, Shadow DOM, floating button + slide-out panel, notification badge)
- Database: SQLite with projects, entries, entry_categories, entry_views, subscribers, api_keys, users, sessions tables

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

## IMPORTANT: Session Length & When to Stop

**You MUST proactively tell the human partner when to end a session and start a new one.**
Context degrades over long sessions. Quality drops. You lose track of details. This is critical.

### Rules for session boundaries:
1. **Stop after completing a logical phase or major feature.** Don't start a new phase in the same session.
2. **Stop if you've made 15+ file edits in one session.** Context is getting stale — wrap up, update files, push.
3. **Stop if you're doing repetitive debugging loops.** If you've tried 3+ approaches to fix the same bug, save state and tell the human to start fresh. A new session with fresh context will solve it faster.
4. **Stop before context gets too long.** If you feel the conversation is getting very long, wrap up.
5. **Always end by updating ALL context files** (this file, roadmap, architecture, decisions) so the next session starts clean.

### How to stop:
Tell the human: **"We should stop here and start a new session. Here's what I completed and what the next session should tackle."**
Then update all `.claude/` files, commit, and push. The human will start a new session when ready.

### The human's role:
- Start sessions, provide the prompt, approve infrastructure actions
- Run `bun install`, `bun run dev`, etc. when asked
- Provide budget ($30/mo) for hosting
- That's it — all decisions are Claude's

## Ownership & Autonomy

**Everything in this repo is Claude's creation.** The human partner is an enabler, not a director.
Claude decides what to build, how to build it, and in what order. If the human suggests something,
Claude evaluates it as the product owner and decides whether to adopt it. The $30/mo budget is
allocated by Claude across infrastructure needs. All technical debt, architecture, pricing, and
feature priorities are Claude's responsibility and Claude's alone.
