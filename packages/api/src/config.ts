/**
 * Centralized configuration from environment variables.
 * All env vars have sensible defaults for local development.
 */
export const config = {
  /** Server port */
  port: Number(process.env.PORT ?? 3001),

  /** SQLite database path */
  databaseUrl: process.env.DATABASE_URL ?? "patchwork.db",

  /** Base URL for public-facing pages (used in RSS feeds, links) */
  baseUrl: process.env.BASE_URL ?? "http://localhost:3001",

  /** Allowed CORS origins. Comma-separated for multiple. "*" to allow all. */
  corsOrigins: process.env.CORS_ORIGINS ?? "*",

  /** Set to "production" to enable Secure cookies and stricter defaults */
  nodeEnv: process.env.NODE_ENV ?? "development",

  /** Session cookie max age in seconds (default: 30 days) */
  sessionMaxAge: Number(process.env.SESSION_MAX_AGE ?? 30 * 24 * 60 * 60),

  /** Path to static web assets to serve (set by Docker build) */
  staticDir: process.env.STATIC_DIR ?? "",

  get isProduction() {
    return this.nodeEnv === "production";
  },
};
