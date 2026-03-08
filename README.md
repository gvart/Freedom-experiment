# Patchwork

**Beautiful changelogs your users actually read.**

Open-source changelog authoring, publishing, and embeddable widget platform. Write release notes in a rich editor, publish to a beautiful public page, and embed a lightweight widget on your site — all self-hostable.

## Why Patchwork?

Changelog tools are either expensive (Beamer $49/mo, AnnounceKit $49/mo, Canny $400/mo) or too simple (just markdown renderers). Patchwork fills the gap:

- Rich markdown editor with live preview
- Public changelog pages at `yoursite.com/changelog`
- Embeddable widget (7KB) for in-app changelog notifications
- RSS feeds for every project
- API-first — automate from CI/CD
- Self-hostable with `docker compose up`
- Pro plan at $9/mo undercuts every competitor

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| API | [Hono](https://hono.dev) |
| Database | SQLite via [Drizzle ORM](https://orm.drizzle.team) (Turso for hosted) |
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Monorepo | Bun workspaces + Turborepo |

## Project Structure

```
packages/
  core/     Shared types, Zod schemas, markdown-to-HTML converter
  api/      Hono server, Drizzle ORM, REST API, public pages, RSS
  web/      React dashboard (auth, project/entry management, editor)
  widget/   Embeddable JS widget (7KB, Shadow DOM, floating button + panel)
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.3.9+

### Install and Run

```bash
# Clone the repo
git clone https://github.com/gvart/Freedom-experiment.git
cd Freedom-experiment

# Install dependencies
bun install

# Run database migrations
bun run db:migrate

# Seed with sample data (optional)
bun run db:seed

# Start development servers (API on :3001, Web on :5173)
bun run dev
```

### Available Commands

```bash
bun install          # Install all dependencies
bun run dev          # Start API + Web dev servers
bun run build        # Build all packages
bun run db:migrate   # Run database migrations
bun run db:seed      # Seed database with sample data
bun run test         # Run all tests
bun run lint         # Lint all packages
```

## Self-Hosting with Docker

The fastest way to run Patchwork:

```bash
# Clone and start
git clone https://github.com/gvart/Freedom-experiment.git
cd Freedom-experiment
docker compose up -d
```

Patchwork is now running at `http://localhost:3000`. Register an account, create a project, and start writing changelogs.

### Configuration

Copy `.env.example` to `.env` to customize:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `DATABASE_URL` | `/data/patchwork.db` | SQLite database path |
| `BASE_URL` | `http://localhost:3000` | Public URL (for RSS feeds, links) |
| `CORS_ORIGINS` | `*` | Allowed CORS origins (comma-separated) |
| `SESSION_MAX_AGE` | `2592000` | Session duration in seconds (30 days) |

Data is persisted in a Docker volume (`patchwork-data`).

## Features

### What's Built

- **Dashboard** — Create projects, write entries with markdown, manage publish/draft workflow
- **Authentication** — Email/password registration, session cookies, API key auth
- **Public Changelog Pages** — Beautiful, responsive HTML pages served at `/:slug`
- **RSS Feeds** — Atom feeds at `/:slug/feed.xml`
- **Categories** — Tag entries as New, Improved, Fixed, or Breaking
- **API Keys** — Per-project keys for programmatic access

### Embeddable Widget

Add a changelog notification widget to any website with a single script tag:

```html
<script src="https://your-patchwork.com/widget.js"
        data-patchwork-project="YOUR_PROJECT_ID"
        data-patchwork-color="#6366f1"
        data-patchwork-position="bottom-right">
</script>
```

**Features:**
- 7KB minified — no dependencies
- Shadow DOM for complete style isolation
- Floating button with notification badge (shows unseen entries)
- Slide-out panel with formatted changelog entries
- Responsive (works on mobile)
- Customizable color and position (`bottom-right` or `bottom-left`)

### What's Next

- Email subscriber notifications
- GitHub Releases import
- Stripe billing (Pro $9/mo, Team $29/mo)

See the full [roadmap](.claude/roadmap.md).

## API

All endpoints are under `/api/`. Auth via session cookie (dashboard) or `Authorization: Bearer pk_...` header (API keys).

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/projects
POST   /api/projects
GET    /api/projects/:slug
PUT    /api/projects/:slug
DELETE /api/projects/:slug

GET    /api/projects/:slug/entries
POST   /api/projects/:slug/entries
GET    /api/projects/:slug/entries/:id
PUT    /api/projects/:slug/entries/:id
DELETE /api/projects/:slug/entries/:id

GET    /api/projects/:slug/api-keys
POST   /api/projects/:slug/api-keys
DELETE /api/projects/:slug/api-keys/:keyId

GET    /api/v1/widget/:projectId  # Widget data (public, open CORS)
GET    /widget.js                 # Embeddable widget script

GET    /:slug              # Public changelog page
GET    /:slug/feed.xml     # RSS feed
```

## Architecture

See [architecture docs](.claude/architecture.md) and [decision records](.claude/decisions.md) for detailed technical documentation.

## Development Status

Patchwork is in active development. Phases 1-4 (foundation, core features, auth, Docker self-hosting) and the Phase 5 embeddable widget are complete. Next up: email notifications, GitHub Releases sync, and deploy to Fly.io.

## License

TBD — Open-source license to be determined. The intent is to be fully open-source with a hosted Pro tier.
