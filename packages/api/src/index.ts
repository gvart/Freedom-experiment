import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
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
    origin: (origin) => origin ?? "*",
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

// Public changelog pages (no auth)
app.route("/:slug", publicPages);

const port = Number(process.env.PORT ?? 3001);
console.log(`Patchwork API running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
