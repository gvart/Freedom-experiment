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
import widgetApi from "./routes/widget.js";
import landing from "./routes/landing.js";

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

// Widget data API (public, no auth, open CORS for embeds)
app.use(
  "/api/v1/widget/*",
  cors({ origin: "*" })
);
app.route("/api/v1/widget", widgetApi);

// Serve widget.js (the embeddable script)
app.get("/widget.js", async (c) => {
  const widgetPath = new URL("../../widget/dist/index.js", import.meta.url).pathname;
  try {
    const file = Bun.file(widgetPath);
    if (await file.exists()) {
      return new Response(file, {
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  } catch {}
  return c.text("// Widget not built. Run: bun run --filter @patchwork/widget build", 404, {
    "Content-Type": "application/javascript",
  });
});

// In production, serve the built web dashboard as static files
if (config.staticDir) {
  app.use("/assets/*", serveStatic({ root: config.staticDir }));
  app.get("/favicon.ico", serveStatic({ path: `${config.staticDir}/favicon.ico` }));
}

// Landing page (marketing)
app.route("", landing);

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
