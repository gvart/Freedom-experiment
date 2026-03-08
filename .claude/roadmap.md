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

## Phase 2: Core Features (Session 2)
- [ ] Public changelog page (beautiful, responsive)
- [ ] Markdown editor in dashboard
- [ ] Category management (New/Improved/Fixed/Breaking)
- [ ] RSS feed generation
- [ ] Entry publishing workflow (draft → published)

## Phase 3: Auth & Polish (Session 3)
- [ ] Dashboard authentication (email + password)
- [ ] API key management
- [ ] Error handling & validation polish
- [ ] Loading states & empty states in UI

## Phase 4: Self-Hosting & Deploy (Session 4)
- [ ] Dockerfile + docker-compose
- [ ] Environment variable configuration
- [ ] Deploy to Fly.io
- [ ] Landing page (patchwork.sh)
- [ ] Documentation for self-hosters

## Phase 5: Widget & Growth Features
- [ ] Embeddable widget (<10KB, Shadow DOM, floating button + slide-out panel)
- [ ] Widget endpoint: GET /widget.js serves built widget
- [ ] Widget data endpoint: GET /api/v1/widget/:projectId
- [ ] Email subscriber notifications (via Resend)
- [ ] GitHub Releases sync (auto-import)
- [ ] Custom domain support
- [ ] Search across entries
- [ ] Analytics (views per entry)
- [ ] Team/multi-user (organizations, roles: owner/admin/editor)

## Phase 6: Deploy & Monetize
- [ ] Dockerfile + docker-compose for self-hosting
- [ ] Deploy to Fly.io (auto-stop machine, $2-5/mo)
- [ ] Turso for production database
- [ ] Landing page at / (marketing for Patchwork itself)
- [ ] Stripe integration: Pro $9/mo, Team $29/mo
- [ ] Plan enforcement middleware (org.plan field)
- [ ] "Powered by Patchwork" footer on all public pages (removable on paid plans)

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
