import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { config } from "./config.js";
import { requireAuth } from "./middleware/auth.js";
import auth from "./routes/auth.js";
import projects from "./routes/projects.js";
import entries from "./routes/entries.js";
import apiKeys from "./routes/api-keys.js";
import publicPages from "./routes/public.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "/api/*",
  cors({
    origin: (origin) => {
      if (config.corsOrigins === "*") return origin ?? "*";
      const allowed = config.corsOrigins.split(",").map((s) => s.trim());
      return origin && allowed.includes(origin) ? origin : allowed[0];
    },
    credentials: true,
  })
);

app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Public auth routes (no auth required)
app.route("/api/auth", auth);

// Protected dashboard API routes (session cookie or API key)
app.use("/api/projects/*", requireAuth);
app.use("/api/projects", requireAuth);
app.route("/api/projects", projects);
app.route("/api/projects/:slug/entries", entries);
app.route("/api/projects/:slug/api-keys", apiKeys);

// In production, serve the built web dashboard as static files
if (config.staticDir) {
  app.use("/assets/*", serveStatic({ root: config.staticDir }));
  app.get("/favicon.ico", serveStatic({ path: `${config.staticDir}/favicon.ico` }));
}

// Public changelog pages (no auth)
app.route("/:slug", publicPages);

// In production, serve the SPA index.html for unmatched routes (dashboard navigation)
if (config.staticDir) {
  app.get("*", serveStatic({ path: `${config.staticDir}/index.html` }));
}

console.log(`Patchwork running on http://localhost:${config.port} (${config.nodeEnv})`);

export default {
  port: config.port,
  fetch: app.fetch,
};
