import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { ulid } from "ulid";
import { nowUnix, toISOString } from "@patchwork/core";
import { db, schema } from "../db/index.js";

const app = new Hono();

function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "pk_";
  for (let i = 0; i < 40; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

function serializeKey(row: typeof schema.apiKeys.$inferSelect) {
  return {
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    lastUsedAt: row.lastUsedAt ? toISOString(row.lastUsedAt) : null,
    createdAt: toISOString(row.createdAt),
  };
}

// List API keys for a project
app.get("/", async (c) => {
  const slug = c.req.param("slug");

  const project = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.slug, slug))
    .get();

  if (!project) return c.json({ error: "Project not found" }, 404);

  const keys = await db
    .select()
    .from(schema.apiKeys)
    .where(eq(schema.apiKeys.projectId, project.id))
    .all();

  return c.json({ data: keys.map(serializeKey) });
});

// Create API key
app.post("/", async (c) => {
  const slug = c.req.param("slug");
  const body = await c.req.json();
  const { name } = body as { name?: string };

  if (!name || name.length < 1) {
    return c.json({ error: "Name is required" }, 400);
  }

  const project = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.slug, slug))
    .get();

  if (!project) return c.json({ error: "Project not found" }, 404);

  const rawKey = generateApiKey();
  const keyHash = await Bun.password.hash(rawKey);
  const now = nowUnix();
  const id = ulid();

  await db.insert(schema.apiKeys).values({
    id,
    projectId: project.id,
    name,
    keyHash,
    lastUsedAt: null,
    createdAt: now,
  });

  // Return the raw key ONCE — it can never be retrieved again
  return c.json(
    {
      data: {
        id,
        projectId: project.id,
        name,
        key: rawKey,
        createdAt: toISOString(now),
      },
    },
    201
  );
});

// Delete API key
app.delete("/:keyId", async (c) => {
  const slug = c.req.param("slug");
  const keyId = c.req.param("keyId");

  const project = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.slug, slug))
    .get();

  if (!project) return c.json({ error: "Project not found" }, 404);

  const key = await db
    .select()
    .from(schema.apiKeys)
    .where(
      and(eq(schema.apiKeys.id, keyId), eq(schema.apiKeys.projectId, project.id))
    )
    .get();

  if (!key) return c.json({ error: "API key not found" }, 404);

  await db.delete(schema.apiKeys).where(eq(schema.apiKeys.id, keyId));
  return c.json({ data: { deleted: true } });
});

export default app;
