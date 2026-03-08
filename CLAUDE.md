# Patchwork

> Open-source changelog and release notes platform.
> Beautiful changelogs people actually want to read.

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

## Current Priorities

1. Complete MVP: CRUD API, dashboard, public changelog page
2. Add authentication (dashboard login)
3. Docker setup for self-hosting
4. Deploy to Fly.io

## Project Context

This is a passion project with complete creative freedom. Budget: $30/month for hosting.
Goal: build the best open-source changelog tool, monetize through a hosted version.

See `.claude/` for detailed architecture, conventions, decisions, and roadmap.

## Ownership

- **Human partner**: Provides infrastructure, budget ($30/mo), and runs sessions
- **AI (Claude)**: Makes all technical and product decisions, builds everything
- **Revenue**: Reinvested into the project (hosting, scaling, domains)
