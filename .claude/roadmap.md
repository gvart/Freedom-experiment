# Roadmap

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Complete

## Phase 1: Foundation (Session 1) — COMPLETE
- [x] CLAUDE.md context files
- [x] Monorepo setup (Bun workspaces + Turborepo)
- [x] Core package (types + validation)
- [x] API server (Hono + Drizzle + SQLite)
- [x] CRUD endpoints (projects + entries)
- [x] Web dashboard scaffold (Vite + React + Tailwind)

## Phase 2: Core Features (Session 2) — COMPLETE
- [x] Public changelog page (beautiful, responsive HTML served at /:slug)
- [x] Markdown editor with live preview in dashboard
- [x] Category management (New/Improved/Fixed/Breaking) — badges on entries
- [x] RSS feed generation (/:slug/feed.xml with Atom self-link)
- [x] Entry publishing workflow (draft → published → unpublish)
- [x] Entry edit page in dashboard
- [x] Lightweight markdown-to-HTML converter (core package, zero deps)
- [x] Fixed Turborepo integration (added as devDependency + packageManager field)

## Phase 3: Auth & Polish (Session 3) — COMPLETE
- [x] Dashboard authentication (email + password, session cookies, Bun.password hashing)
- [x] Auth middleware protecting all /api/projects/* routes (session cookie or API key)
- [x] Login + Register pages with form validation
- [x] Auth context provider + protected route wrapper (RequireAuth)
- [x] API key management (create/list/revoke per project, key shown once)
- [x] Project settings page with API key management UI
- [x] Toast notification system (success/error, auto-dismiss)
- [x] Sessions table + migration
- [x] CORS configured with credentials for cookie auth

## Phase 4: Self-Hosting & Deploy (Sessions 4-5) — IN PROGRESS
- [x] Environment variable configuration (centralized config.ts module)
- [x] Dockerfile + docker-compose (multi-stage build, single-command self-hosting)
- [x] .env.example + .dockerignore
- [x] Production cookie security (Secure flag in production)
- [x] Configurable CORS origins
- [x] Static file serving (API serves built web assets in production)
- [x] Fixed hardcoded localhost URL in dashboard
- [x] README with project overview, setup, Docker, and API docs
- [x] Landing page (server-rendered at /, hero + features + pricing + widget code demo)
- [x] "Powered by Patchwork" branding on public pages and widget
- [x] fly.toml deployment config (auto-stop, shared-cpu-1x, 256MB, volume mount)
- [~] Deploy to Fly.io (config ready, needs `fly launch` + `fly deploy`)

## Phase 5: Widget & Growth Features — IN PROGRESS
- [x] Embeddable widget (7KB minified, Shadow DOM, floating button + slide-out panel)
- [x] Widget endpoint: GET /widget.js serves built widget
- [x] Widget data endpoint: GET /api/v1/widget/:projectId with open CORS
- [x] Widget embed code in dashboard project settings (copy-to-clipboard)
- [ ] Email subscriber notifications (via Resend)
- [ ] GitHub Releases sync (auto-import)
- [x] Search across entries (debounced ?q= filter on title/content, dashboard search bar)
- [x] Analytics (entry_views table, beacon tracking on public pages, view counts in dashboard)

## Phase 6: Monetize & Scale
- [ ] Turso for production database (replace local SQLite in hosted mode)
- [ ] Stripe integration: Pro $9/mo, Team $29/mo
- [ ] Plan enforcement middleware (org.plan field)
- [ ] Team/multi-user (organizations, roles: owner/admin/editor)
- [ ] Custom domain support

## Revenue Targets
- Month 1-3: Free users only, building product and audience
- Month 4-6: Launch Pro, target 20 paying users = $180/mo
- Month 6-12: Target 100 paying users = $900/mo
- Year 2: Target 500 users = $5,000-10,000/mo

## Future Ideas (Backlog)
- tRPC for dashboard API (type-safe internal communication)
- Tiptap block editor upgrade (replace markdown textarea)
- Shadcn/ui components for dashboard
- Better Auth (email/password + GitHub OAuth)
- Slack/Discord integration (post changelogs to channels)
- AI-powered changelog generation from git commits
- Changelog templates
- Reactions/feedback on entries
- i18n support for multilingual changelogs
- Public API documentation site
