import { Hono } from "hono";
import { eq, and, like } from "drizzle-orm";
import { ulid } from "ulid";
import {
  createProjectSchema,
  updateProjectSchema,
  nowUnix,
  toISOString,
} from "@patchwork/core";
import { db, schema } from "../db/index.js";
import { fetchReleases, parseGithubRepo } from "../services/github.js";

const app = new Hono();

function serializeProject(row: typeof schema.projects.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    logoUrl: row.logoUrl,
    primaryColor: row.primaryColor,
    githubRepo: row.githubRepo,
    createdAt: toISOString(row.createdAt),
    updatedAt: toISOString(row.updatedAt),
  };
}

// List projects
app.get("/", async (c) => {
  const rows = await db.select().from(schema.projects).all();
  return c.json({ data: rows.map(serializeProject) });
});

// Get project by slug
app.get("/:slug", async (c) => {
  const { slug } = c.req.param();
  const row = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.slug, slug))
    .get();

  if (!row) return c.json({ error: "Project not found" }, 404);
  return c.json({ data: serializeProject(row) });
});

// Create project
app.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
  }

  const now = nowUnix();
  const project = {
    id: ulid(),
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    logoUrl: null,
    primaryColor: parsed.data.primaryColor ?? "#6366f1",
    githubRepo: parsed.data.githubRepo ?? null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await db.insert(schema.projects).values(project);
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("UNIQUE")) {
      return c.json({ error: "A project with this slug already exists" }, 400);
    }
    throw e;
  }

  return c.json({ data: serializeProject(project) }, 201);
});

// Update project
app.put("/:slug", async (c) => {
  const { slug } = c.req.param();
  const body = await c.req.json();
  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
  }

  const existing = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.slug, slug))
    .get();

  if (!existing) return c.json({ error: "Project not found" }, 404);

  const updates = {
    ...parsed.data,
    updatedAt: nowUnix(),
  };

  await db
    .update(schema.projects)
    .set(updates)
    .where(eq(schema.projects.id, existing.id));

  const updated = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, existing.id))
    .get();

  return c.json({ data: serializeProject(updated!) });
});

// Sync GitHub releases
app.post("/:slug/sync-github", async (c) => {
  const { slug } = c.req.param();
  const project = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.slug, slug))
    .get();

  if (!project) return c.json({ error: "Project not found" }, 404);
  if (!project.githubRepo) {
    return c.json({ error: "No GitHub repository configured for this project" }, 400);
  }

  const parsed = parseGithubRepo(project.githubRepo);
  if (!parsed) {
    return c.json({ error: "Invalid GitHub repository format" }, 400);
  }

  const releases = await fetchReleases(parsed.owner, parsed.repo);
  let imported = 0;

  for (const release of releases) {
    // Skip if an entry with this title already exists
    const existing = await db
      .select()
      .from(schema.entries)
      .where(
        and(
          eq(schema.entries.projectId, project.id),
          eq(schema.entries.title, release.title)
        )
      )
      .get();

    if (existing) continue;

    const now = nowUnix();
    const entryId = ulid();
    const content = release.body || `Release ${release.tag}`;

    await db.insert(schema.entries).values({
      id: entryId,
      projectId: project.id,
      title: release.title,
      content,
      publishedAt: null, // Draft — user reviews before publishing
      createdAt: now,
      updatedAt: now,
    });

    // Auto-categorize as "new"
    await db.insert(schema.entryCategories).values({
      entryId,
      category: "new",
    });

    imported++;
  }

  return c.json({
    data: { imported, total: releases.length, skipped: releases.length - imported },
  });
});

// Delete project
app.delete("/:slug", async (c) => {
  const { slug } = c.req.param();
  const existing = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.slug, slug))
    .get();

  if (!existing) return c.json({ error: "Project not found" }, 404);

  await db.delete(schema.projects).where(eq(schema.projects.id, existing.id));
  return c.json({ data: { deleted: true } });
});

export default app;
