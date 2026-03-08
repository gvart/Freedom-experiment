import { Hono } from "hono";
import { eq, desc, and, isNotNull } from "drizzle-orm";
import { markdownToHtml } from "@patchwork/core";
import type { Category } from "@patchwork/core";
import { db, schema } from "../db/index.js";

const app = new Hono();

// Widget data endpoint — public, no auth required
// Returns recent published entries for a project (by project ID)
app.get("/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const limit = Math.min(Number(c.req.query("limit") ?? 20), 50);

  const project = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, projectId))
    .get();

  if (!project) return c.json({ error: "Project not found" }, 404);

  const rows = await db
    .select()
    .from(schema.entries)
    .where(
      and(
        eq(schema.entries.projectId, project.id),
        isNotNull(schema.entries.publishedAt)
      )
    )
    .orderBy(desc(schema.entries.publishedAt))
    .limit(limit)
    .all();

  const entries = await Promise.all(
    rows.map(async (entry) => {
      const catRows = await db
        .select()
        .from(schema.entryCategories)
        .where(eq(schema.entryCategories.entryId, entry.id))
        .all();

      return {
        id: entry.id,
        title: entry.title,
        content: markdownToHtml(entry.content),
        categories: catRows.map((r) => r.category as Category),
        publishedAt: entry.publishedAt
          ? new Date(entry.publishedAt * 1000).toISOString()
          : null,
      };
    })
  );

  return c.json({
    project: {
      name: project.name,
      slug: project.slug,
      primaryColor: project.primaryColor,
    },
    entries,
  });
});

export default app;
