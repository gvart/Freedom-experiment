import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import projects from "./routes/projects.js";
import entries from "./routes/entries.js";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.route("/api/projects", projects);
app.route("/api/projects/:slug/entries", entries);

const port = Number(process.env.PORT ?? 3001);
console.log(`Patchwork API running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
