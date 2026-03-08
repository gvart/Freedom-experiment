import type { Context, Next } from "hono";
import { eq, and, gt } from "drizzle-orm";
import { nowUnix } from "@patchwork/core";
import { db, schema } from "../db/index.js";

type User = typeof schema.users.$inferSelect;

/**
 * Extract session user from cookie. Returns null if not authenticated.
 */
export async function getSessionUser(c: Context): Promise<User | null> {
  const cookie = c.req.header("Cookie") ?? "";
  const match = cookie.match(/session=([^\s;]+)/);
  const sessionId = match?.[1];
  if (!sessionId) return null;

  const session = await db
    .select()
    .from(schema.sessions)
    .where(
      and(
        eq(schema.sessions.id, sessionId),
        gt(schema.sessions.expiresAt, nowUnix())
      )
    )
    .get();

  if (!session) return null;

  const user = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, session.userId))
    .get();

  return user ?? null;
}

/**
 * Extract API key from Authorization header. Returns project ID if valid.
 */
async function getApiKeyProject(c: Context): Promise<string | null> {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer pk_")) return null;

  const rawKey = authHeader.slice(7); // Remove "Bearer "

  // Find all API keys and verify against hash
  const keys = await db.select().from(schema.apiKeys).all();
  for (const key of keys) {
    const valid = await Bun.password.verify(rawKey, key.keyHash);
    if (valid) {
      // Update last used timestamp
      await db
        .update(schema.apiKeys)
        .set({ lastUsedAt: nowUnix() })
        .where(eq(schema.apiKeys.id, key.id));
      return key.projectId;
    }
  }

  return null;
}

/**
 * Middleware: require authentication via session cookie or API key.
 */
export async function requireAuth(c: Context, next: Next) {
  // Try session cookie first
  const user = await getSessionUser(c);
  if (user) {
    c.set("userId", user.id);
    return next();
  }

  // Try API key
  const projectId = await getApiKeyProject(c);
  if (projectId) {
    c.set("apiKeyProjectId", projectId);
    return next();
  }

  return c.json({ error: "Authentication required" }, 401);
}
