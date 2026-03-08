# Architecture

## System Overview

Patchwork is a monorepo with 4 packages:

```
┌─────────────┐     ┌─────────────┐
│   web       │────▶│   api       │──▶ SQLite/Turso
│ (dashboard) │     │  (Hono)     │
└─────────────┘     └──────┬──────┘
                           │
┌─────────────┐            │
│  widget     │────────────┘
│ (embed JS)  │
└─────────────┘
        ▲
        │
┌─────────────┐
│   core      │  ← shared types, validation, utils
└─────────────┘
```

## Package Responsibilities

### `packages/core`
- TypeScript type definitions shared across all packages
- Zod validation schemas (used by API for input validation, web for forms)
- Utility functions (slug generation, date formatting, markdown helpers)

### `packages/api`
- Hono HTTP server running on Bun
- RESTful API endpoints under `/api/`
- Drizzle ORM for database access
- SQLite database (local file for self-hosted, Turso for cloud)
- Serves the public changelog pages (SSR or pre-rendered)
- Default port: 3001

### `packages/web`
- Vite + React SPA for the admin dashboard
- Communicates with API via fetch
- Protected by authentication
- Default port: 5173 (dev)

### `packages/widget`
- Lightweight JavaScript snippet (<10KB)
- Embeddable via `<script>` tag
- Shows changelog entries in a popup/sidebar on any website

## Database Schema

### Core Tables

**projects**
- id (text, ULID primary key)
- name (text)
- slug (text, unique, used in URLs)
- description (text, nullable)
- logo_url (text, nullable)
- primary_color (text, default "#6366f1")
- created_at, updated_at (integer, unix timestamps)

**entries**
- id (text, ULID)
- project_id (text, FK → projects)
- title (text)
- content (text, markdown)
- published_at (integer, nullable — null = draft)
- created_at, updated_at (integer)

**entry_categories** (junction table)
- entry_id (text, FK → entries)
- category (text, enum: "new" | "improved" | "fixed" | "breaking")

**subscribers**
- id (text, ULID)
- project_id (text, FK → projects)
- email (text)
- confirmed (integer, boolean)
- token (text, for confirm/unsubscribe)
- created_at (integer)

**api_keys**
- id (text, ULID)
- project_id (text, FK → projects)
- name (text)
- key_hash (text)
- last_used_at (integer, nullable)
- created_at (integer)

**users**
- id (text, ULID)
- email (text, unique)
- password_hash (text)
- created_at (integer)

## API Routes

```
GET    /api/health
POST   /api/projects
GET    /api/projects
GET    /api/projects/:slug
PUT    /api/projects/:slug
DELETE /api/projects/:slug

POST   /api/projects/:slug/entries
GET    /api/projects/:slug/entries
GET    /api/projects/:slug/entries/:id
PUT    /api/projects/:slug/entries/:id
DELETE /api/projects/:slug/entries/:id

POST   /api/projects/:slug/subscribers
DELETE /api/projects/:slug/subscribers/:token

GET    /:slug                            (Public changelog page - HTML)
GET    /:slug/feed.xml                   (RSS feed - XML)
```

## Data Flow

1. User creates project in dashboard → POST /api/projects
2. User writes changelog entry in markdown editor → POST /api/projects/:slug/entries
3. Entry is saved as draft (published_at = null) or published immediately
4. Public page at /:slug renders all published entries
5. RSS feed auto-generated at /:slug/feed.xml
6. Widget fetches latest entries via API and renders in popup
