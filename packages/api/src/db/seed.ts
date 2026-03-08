import { ulid } from "ulid";
import { db, schema } from "./index.js";
import { nowUnix } from "@patchwork/core";

const now = nowUnix();

const projectId = ulid();
await db.insert(schema.projects).values({
  id: projectId,
  name: "Patchwork",
  slug: "patchwork",
  description: "Open-source changelog platform",
  logoUrl: null,
  primaryColor: "#6366f1",
  createdAt: now,
  updatedAt: now,
});

const entry1Id = ulid();
await db.insert(schema.entries).values({
  id: entry1Id,
  projectId,
  title: "Patchwork is live!",
  content:
    "We're excited to announce Patchwork — the open-source changelog and release notes platform.\n\n" +
    "- Beautiful, minimal changelog pages\n" +
    "- Dashboard for managing entries\n" +
    "- REST API for CI/CD integration\n" +
    "- Self-hostable with Docker",
  publishedAt: now,
  createdAt: now,
  updatedAt: now,
});

await db.insert(schema.entryCategories).values({ entryId: entry1Id, category: "new" });

const entry2Id = ulid();
await db.insert(schema.entries).values({
  id: entry2Id,
  projectId,
  title: "Markdown support in entries",
  content:
    "Changelog entries now support full Markdown formatting.\n\n" +
    "You can use **bold**, *italic*, `code`, lists, and more.",
  publishedAt: now - 86400,
  createdAt: now - 86400,
  updatedAt: now - 86400,
});

await db
  .insert(schema.entryCategories)
  .values({ entryId: entry2Id, category: "improved" });

console.log("Seed complete. Created 1 project with 2 entries.");
