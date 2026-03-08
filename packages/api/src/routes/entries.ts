import { Hono } from "hono";
import { eq, desc, and, isNotNull } from "drizzle-orm";
import { ulid } from "ulid";
import {
  createEntrySchema,
  updateEntrySchema,
  paginationSchema,
  nowUnix,
  toISOString,
  toUnixSeconds,
} from "@patchwork/core";
import type { Category } from "@patchwork/core";
import { db, schema } from "../db/index.js";

const app = new Hono();

async function getProjectBySlug(slug: string | undefined) {
  if (!slug) return undefined;
  return db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.slug, slug))
    .get();
}

async function getCategoriesForEntry(entryId: string): Promise<Category[]> {
  const rows = await db
    .select()
    .from(schema.entryCategories)
    .where(eq(schema.entryCategories.entryId, entryId))
    .all();
  return rows.map((r) => r.category as Category);
}

function serializeEntry(
  row: typeof schema.entries.$inferSelect,
  categories: Category[]
) {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    content: row.content,
    categories,
    publishedAt: row.publishedAt ? toISOString(row.publishedAt) : null,
    createdAt: toISOString(row.createdAt),
    updatedAt: toISOString(row.updatedAt),
  };
}

// List entries for a project
app.get("/", async (c) => {
  const slug = c.req.param("slug");
  const project = await getProjectBySlug(slug);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const query = c.req.query();
  const { page, limit } = paginationSchema.parse(query);
  const offset = (page - 1) * limit;

  const publishedOnly = query.published === "true";

  let condition = eq(schema.entries.projectId, project.id);
  if (publishedOnly) {
    condition = and(condition, isNotNull(schema.entries.publishedAt))!;
  }

  const rows = await db
    .select()
    .from(schema.entries)
    .where(condition)
    .orderBy(desc(schema.entries.createdAt))
    .limit(limit)
    .offset(offset)
    .all();

  const allRows = await db
    .select({ id: schema.entries.id })
    .from(schema.entries)
    .where(condition)
    .all();

  const entriesWithCategories = await Promise.all(
    rows.map(async (row) => {
      const categories = await getCategoriesForEntry(row.id);
      return serializeEntry(row, categories);
    })
  );

  return c.json({
    data: entriesWithCategories,
    meta: { total: allRows.length, page, limit },
  });
});

// Get single entry
app.get("/:id", async (c) => {
  const slug = c.req.param("slug");
  const id = c.req.param("id");

  const project = await getProjectBySlug(slug);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const row = await db
    .select()
    .from(schema.entries)
    .where(and(eq(schema.entries.id, id), eq(schema.entries.projectId, project.id)))
    .get();

  if (!row) return c.json({ error: "Entry not found" }, 404);

  const categories = await getCategoriesForEntry(row.id);
  return c.json({ data: serializeEntry(row, categories) });
});

// Create entry
app.post("/", async (c) => {
  const slug = c.req.param("slug");
  const project = await getProjectBySlug(slug);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const body = await c.req.json();
  const parsed = createEntrySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
  }

  const now = nowUnix();
  const entryId = ulid();

  const entry = {
    id: entryId,
    projectId: project.id,
    title: parsed.data.title,
    content: parsed.data.content,
    publishedAt: parsed.data.publishedAt ? toUnixSeconds(parsed.data.publishedAt) : null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(schema.entries).values(entry);

  for (const category of parsed.data.categories) {
    await db.insert(schema.entryCategories).values({
      entryId,
      category,
    });
  }

  const categories = await getCategoriesForEntry(entryId);
  return c.json({ data: serializeEntry(entry, categories) }, 201);
});

// Update entry
app.put("/:id", async (c) => {
  const slug = c.req.param("slug");
  const id = c.req.param("id");

  const project = await getProjectBySlug(slug);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const existing = await db
    .select()
    .from(schema.entries)
    .where(and(eq(schema.entries.id, id), eq(schema.entries.projectId, project.id)))
    .get();

  if (!existing) return c.json({ error: "Entry not found" }, 404);

  const body = await c.req.json();
  const parsed = updateEntrySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
  }

  const updates: Record<string, unknown> = { updatedAt: nowUnix() };
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.content !== undefined) updates.content = parsed.data.content;
  if ("publishedAt" in (body as Record<string, unknown>)) {
    updates.publishedAt = parsed.data.publishedAt
      ? toUnixSeconds(parsed.data.publishedAt)
      : null;
  }

  await db.update(schema.entries).set(updates).where(eq(schema.entries.id, id));

  if (parsed.data.categories !== undefined) {
    await db
      .delete(schema.entryCategories)
      .where(eq(schema.entryCategories.entryId, id));
    for (const category of parsed.data.categories) {
      await db.insert(schema.entryCategories).values({ entryId: id, category });
    }
  }

  const updated = await db
    .select()
    .from(schema.entries)
    .where(eq(schema.entries.id, id))
    .get();
  const categories = await getCategoriesForEntry(id);
  return c.json({ data: serializeEntry(updated!, categories) });
});

// Delete entry
app.delete("/:id", async (c) => {
  const slug = c.req.param("slug");
  const id = c.req.param("id");

  const project = await getProjectBySlug(slug);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const existing = await db
    .select()
    .from(schema.entries)
    .where(and(eq(schema.entries.id, id), eq(schema.entries.projectId, project.id)))
    .get();

  if (!existing) return c.json({ error: "Entry not found" }, 404);

  await db.delete(schema.entries).where(eq(schema.entries.id, id));
  return c.json({ data: { deleted: true } });
});

export default app;
