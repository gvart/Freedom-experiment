import { Hono } from "hono";
import { eq, desc, and, isNotNull } from "drizzle-orm";
import { toISOString, markdownToHtml } from "@patchwork/core";
import type { Category } from "@patchwork/core";
import { db, schema } from "../db/index.js";

const app = new Hono();

const CATEGORY_COLORS: Record<Category, { bg: string; text: string }> = {
  new: { bg: "#dcfce7", text: "#166534" },
  improved: { bg: "#dbeafe", text: "#1e40af" },
  fixed: { bg: "#fef3c7", text: "#92400e" },
  breaking: { bg: "#fee2e2", text: "#991b1b" },
};

const CATEGORY_LABELS: Record<Category, string> = {
  new: "New",
  improved: "Improved",
  fixed: "Fixed",
  breaking: "Breaking",
};

function renderChangelogPage(
  project: typeof schema.projects.$inferSelect,
  entries: Array<{
    entry: typeof schema.entries.$inferSelect;
    categories: Category[];
  }>,
  baseUrl: string
): string {
  const primaryColor = project.primaryColor || "#6366f1";

  const entriesHtml = entries
    .map(({ entry, categories }) => {
      const date = entry.publishedAt
        ? new Date(entry.publishedAt * 1000).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "";

      const badges = categories
        .map((cat) => {
          const colors = CATEGORY_COLORS[cat];
          return `<span style="display:inline-block;padding:2px 10px;border-radius:9999px;font-size:12px;font-weight:600;background:${colors.bg};color:${colors.text};margin-right:6px">${CATEGORY_LABELS[cat]}</span>`;
        })
        .join("");

      const contentHtml = markdownToHtml(entry.content);

      return `
      <article style="margin-bottom:48px">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px">
          <time style="font-size:14px;color:#6b7280;white-space:nowrap">${date}</time>
          <div>${badges}</div>
        </div>
        <h2 style="font-size:24px;font-weight:700;color:#111827;margin:0 0 16px 0;line-height:1.3">${escapeHtml(entry.title)}</h2>
        <div class="entry-content" style="font-size:16px;color:#374151;line-height:1.7">
          ${contentHtml}
        </div>
      </article>`;
    })
    .join('<hr style="border:none;border-top:1px solid #e5e7eb;margin:48px 0" />');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(project.name)} — Changelog</title>
  <meta name="description" content="${escapeHtml(project.description || `Changelog for ${project.name}`)}" />
  <link rel="alternate" type="application/rss+xml" title="${escapeHtml(project.name)} Changelog RSS" href="/${project.slug}/feed.xml" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #fafafa;
      color: #111827;
      -webkit-font-smoothing: antialiased;
    }
    .header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 24px 0;
    }
    .container {
      max-width: 720px;
      margin: 0 auto;
      padding: 0 24px;
    }
    .entry-content h1 { font-size: 20px; font-weight: 700; margin: 24px 0 8px; }
    .entry-content h2 { font-size: 18px; font-weight: 600; margin: 20px 0 8px; }
    .entry-content h3 { font-size: 16px; font-weight: 600; margin: 16px 0 8px; }
    .entry-content p { margin: 0 0 12px; }
    .entry-content ul, .entry-content ol { margin: 0 0 12px; padding-left: 24px; }
    .entry-content li { margin-bottom: 4px; }
    .entry-content pre { background: #1f2937; color: #f9fafb; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 12px 0; font-size: 14px; }
    .entry-content code { font-family: "SF Mono", Monaco, "Cascadia Code", monospace; font-size: 0.9em; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
    .entry-content pre code { background: none; padding: 0; }
    .entry-content blockquote { border-left: 3px solid ${primaryColor}; padding-left: 16px; color: #6b7280; margin: 12px 0; }
    .entry-content a { color: ${primaryColor}; text-decoration: underline; }
    .entry-content hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .entry-content img { max-width: 100%; border-radius: 8px; margin: 12px 0; }
    .footer { text-align: center; padding: 48px 0; font-size: 13px; color: #9ca3af; }
    .footer a { color: #6b7280; text-decoration: none; }
    .footer a:hover { color: #374151; }
    .rss-link { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: #6b7280; text-decoration: none; border: 1px solid #e5e7eb; padding: 6px 12px; border-radius: 6px; }
    .rss-link:hover { color: #374151; border-color: #d1d5db; }
    .subscribe-form { display: flex; gap: 8px; margin-top: 16px; }
    .subscribe-form input[type="email"] { flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; outline: none; min-width: 0; }
    .subscribe-form input[type="email"]:focus { border-color: ${primaryColor}; box-shadow: 0 0 0 2px ${primaryColor}22; }
    .subscribe-form button { padding: 8px 16px; background: ${primaryColor}; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; white-space: nowrap; }
    .subscribe-form button:hover { opacity: 0.9; }
    .subscribe-msg { font-size: 13px; margin-top: 6px; }
    .subscribe-msg.success { color: #16a34a; }
    .subscribe-msg.error { color: #dc2626; }
  </style>
</head>
<body>
  <div class="header">
    <div class="container" style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <h1 style="font-size:24px;font-weight:800;color:${primaryColor}">${escapeHtml(project.name)}</h1>
        ${project.description ? `<p style="font-size:14px;color:#6b7280;margin-top:4px">${escapeHtml(project.description)}</p>` : ""}
      </div>
      <a class="rss-link" href="/${project.slug}/feed.xml">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="6.18" cy="17.82" r="2.18"/><path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/></svg>
        RSS
      </a>
    </div>
  </div>
  <div class="header" style="border-bottom:none;padding:0 0 8px">
    <div class="container">
      <form class="subscribe-form" id="subscribeForm" onsubmit="return false">
        <input type="email" id="subEmail" placeholder="Get notified of updates — enter your email" required />
        <button type="submit" id="subBtn">Subscribe</button>
      </form>
      <div id="subMsg" class="subscribe-msg"></div>
    </div>
  </div>
  <main class="container" style="padding-top:48px;padding-bottom:48px">
    ${entries.length === 0 ? '<p style="text-align:center;color:#9ca3af;padding:48px 0">No changelog entries published yet.</p>' : entriesHtml}
  </main>
  <div class="footer">
    Powered by <a href="https://patchwork.sh">Patchwork</a>
  </div>
  <script>
    (function(){
      var ids = ${JSON.stringify(entries.map((e) => e.entry.id))};
      var base = "${escapeHtml(baseUrl)}";
      ids.forEach(function(id){
        try { navigator.sendBeacon(base + "/api/v1/widget/track/" + id); } catch(e) {}
      });

      var form = document.getElementById("subscribeForm");
      var emailInput = document.getElementById("subEmail");
      var btn = document.getElementById("subBtn");
      var msg = document.getElementById("subMsg");
      form.addEventListener("submit", function() {
        btn.disabled = true;
        btn.textContent = "Subscribing...";
        msg.textContent = "";
        msg.className = "subscribe-msg";
        fetch(base + "/api/projects/${project.slug}/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailInput.value })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.error) {
            msg.textContent = data.error;
            msg.className = "subscribe-msg error";
          } else {
            msg.textContent = data.message || "Subscribed!";
            msg.className = "subscribe-msg success";
            emailInput.value = "";
          }
          btn.disabled = false;
          btn.textContent = "Subscribe";
        })
        .catch(function() {
          msg.textContent = "Something went wrong. Please try again.";
          msg.className = "subscribe-msg error";
          btn.disabled = false;
          btn.textContent = "Subscribe";
        });
      });
    })();
  </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Public changelog page
app.get("/", async (c) => {
  const slug = c.req.param("slug");
  if (!slug) return c.json({ error: "Slug required" }, 400);

  const project = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.slug, slug))
    .get();

  if (!project) return c.notFound();

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
    .all();

  const entries = await Promise.all(
    rows.map(async (entry) => {
      const catRows = await db
        .select()
        .from(schema.entryCategories)
        .where(eq(schema.entryCategories.entryId, entry.id))
        .all();
      return {
        entry,
        categories: catRows.map((r) => r.category as Category),
      };
    })
  );

  const url = new URL(c.req.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const html = renderChangelogPage(project, entries, baseUrl);
  return c.html(html);
});

// RSS feed
app.get("/feed.xml", async (c) => {
  const slug = c.req.param("slug");
  if (!slug) return c.json({ error: "Slug required" }, 400);

  const project = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.slug, slug))
    .get();

  if (!project) return c.notFound();

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
    .limit(50)
    .all();

  const entries = await Promise.all(
    rows.map(async (entry) => {
      const catRows = await db
        .select()
        .from(schema.entryCategories)
        .where(eq(schema.entryCategories.entryId, entry.id))
        .all();
      return {
        entry,
        categories: catRows.map((r) => r.category as Category),
      };
    })
  );

  const baseUrl = c.req.url.replace(/\/[^/]+\/feed\.xml.*$/, "");
  const lastBuildDate = rows[0]?.publishedAt
    ? new Date(rows[0].publishedAt * 1000).toUTCString()
    : new Date().toUTCString();

  const items = entries
    .map(({ entry, categories }) => {
      const pubDate = entry.publishedAt
        ? new Date(entry.publishedAt * 1000).toUTCString()
        : "";
      const contentHtml = markdownToHtml(entry.content);
      const categoryTags = categories
        .map((cat) => `<category>${cat}</category>`)
        .join("");

      return `
    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${baseUrl}/${project.slug}#${entry.id}</link>
      <guid isPermaLink="false">${entry.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(contentHtml)}</description>
      ${categoryTags}
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(project.name)} Changelog</title>
    <link>${baseUrl}/${project.slug}</link>
    <description>${escapeXml(project.description || `Changelog for ${project.name}`)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/${project.slug}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
});

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default app;
