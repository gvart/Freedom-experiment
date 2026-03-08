import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { ulid } from "ulid";
import { nowUnix, toISOString, subscribeSchema } from "@patchwork/core";
import { db, schema } from "../db/index.js";
import { config } from "../config.js";
import { sendConfirmationEmail } from "../services/email.js";

// --- Public routes (no auth) ---

const publicApp = new Hono();

// Subscribe to a project's changelog
publicApp.post("/:slug/subscribe", async (c) => {
  const slug = c.req.param("slug");

  const project = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.slug, slug))
    .get();
  if (!project) return c.json({ error: "Project not found" }, 404);

  const body = await c.req.json();
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid email" }, 400);
  }

  const { email } = parsed.data;

  // Check for existing subscription
  const existing = await db
    .select()
    .from(schema.subscribers)
    .where(
      and(
        eq(schema.subscribers.projectId, project.id),
        eq(schema.subscribers.email, email)
      )
    )
    .get();

  if (existing?.confirmed) {
    return c.json({ message: "Already subscribed" });
  }

  // Reuse existing unconfirmed subscriber or create new
  const token = existing?.token ?? crypto.randomUUID();
  if (!existing) {
    await db.insert(schema.subscribers).values({
      id: ulid(),
      projectId: project.id,
      email,
      confirmed: 0,
      token,
      createdAt: nowUnix(),
    });
  }

  const confirmUrl = `${config.baseUrl}/api/subscribe/confirm/${token}`;
  await sendConfirmationEmail(email, project.name, confirmUrl);

  return c.json({ message: "Confirmation email sent. Please check your inbox." });
});

// Confirm subscription
publicApp.get("/confirm/:token", async (c) => {
  const token = c.req.param("token");

  const subscriber = await db
    .select()
    .from(schema.subscribers)
    .where(eq(schema.subscribers.token, token))
    .get();

  if (!subscriber) {
    return c.html(simplePage("Subscription Not Found", "This confirmation link is invalid or expired."));
  }

  await db
    .update(schema.subscribers)
    .set({ confirmed: 1 })
    .where(eq(schema.subscribers.id, subscriber.id));

  const project = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, subscriber.projectId))
    .get();

  const changelogUrl = `${config.baseUrl}/${project?.slug ?? ""}`;

  return c.html(
    simplePage(
      "Subscription Confirmed!",
      `You'll now receive changelog updates from <strong>${escapeHtml(project?.name ?? "")}</strong>.`,
      `<a href="${escapeHtml(changelogUrl)}" style="display:inline-block;background:#6366f1;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;margin-top:16px;">View Changelog</a>`
    )
  );
});

// Unsubscribe
publicApp.get("/unsubscribe/:token", async (c) => {
  const token = c.req.param("token");

  const subscriber = await db
    .select()
    .from(schema.subscribers)
    .where(eq(schema.subscribers.token, token))
    .get();

  if (!subscriber) {
    return c.html(simplePage("Not Found", "This unsubscribe link is invalid or already used."));
  }

  await db.delete(schema.subscribers).where(eq(schema.subscribers.id, subscriber.id));

  return c.html(simplePage("Unsubscribed", "You've been unsubscribed and won't receive further emails."));
});

// --- Protected routes (require auth, mounted under /api/projects/:slug/subscribers) ---

const protectedApp = new Hono();

// List subscribers for a project
protectedApp.get("/", async (c) => {
  const slug = c.req.param("slug");

  const project = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.slug, slug))
    .get();
  if (!project) return c.json({ error: "Project not found" }, 404);

  const rows = await db
    .select()
    .from(schema.subscribers)
    .where(eq(schema.subscribers.projectId, project.id))
    .orderBy(desc(schema.subscribers.createdAt))
    .all();

  return c.json({
    data: rows.map((r) => ({
      id: r.id,
      email: r.email,
      confirmed: !!r.confirmed,
      createdAt: toISOString(r.createdAt),
    })),
    meta: { total: rows.length },
  });
});

export { publicApp as subscriberPublicRoutes, protectedApp as subscriberProtectedRoutes };

// --- Helpers ---

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function simplePage(title: string, message: string, extra = ""): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} — Patchwork</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fafafa;color:#111}
.card{background:#fff;border-radius:12px;padding:48px;max-width:420px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.1)}
h1{font-size:24px;margin:0 0 12px}p{color:#555;line-height:1.6;margin:0}</style>
</head><body><div class="card"><h1>${escapeHtml(title)}</h1><p>${message}</p>${extra}</div></body></html>`;
}
