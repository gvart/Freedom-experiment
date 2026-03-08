import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { nowUnix } from "@patchwork/core";
import { db, schema } from "../db/index.js";
import { getSessionUser } from "../middleware/auth.js";

const app = new Hono();

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

function sessionCookie(sessionId: string, maxAge: number): string {
  return `session=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

// Register
app.post("/register", async (c) => {
  const body = await c.req.json();
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  if (password.length < 8) {
    return c.json({ error: "Password must be at least 8 characters" }, 400);
  }

  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()))
    .get();

  if (existing) {
    return c.json({ error: "An account with this email already exists" }, 400);
  }

  const passwordHash = await Bun.password.hash(password);
  const now = nowUnix();
  const userId = ulid();

  await db.insert(schema.users).values({
    id: userId,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: now,
  });

  // Create session
  const sessionId = ulid();
  await db.insert(schema.sessions).values({
    id: sessionId,
    userId,
    expiresAt: now + SESSION_MAX_AGE,
    createdAt: now,
  });

  c.header("Set-Cookie", sessionCookie(sessionId, SESSION_MAX_AGE));

  return c.json(
    {
      data: {
        id: userId,
        email: email.toLowerCase(),
      },
    },
    201
  );
});

// Login
app.post("/login", async (c) => {
  const body = await c.req.json();
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  const user = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()))
    .get();

  if (!user) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const valid = await Bun.password.verify(password, user.passwordHash);
  if (!valid) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const now = nowUnix();
  const sessionId = ulid();
  await db.insert(schema.sessions).values({
    id: sessionId,
    userId: user.id,
    expiresAt: now + SESSION_MAX_AGE,
    createdAt: now,
  });

  c.header("Set-Cookie", sessionCookie(sessionId, SESSION_MAX_AGE));

  return c.json({
    data: {
      id: user.id,
      email: user.email,
    },
  });
});

// Logout
app.post("/logout", async (c) => {
  const cookie = c.req.header("Cookie") ?? "";
  const match = cookie.match(/session=([^\s;]+)/);
  const sessionId = match?.[1];

  if (sessionId) {
    await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
  }

  c.header("Set-Cookie", sessionCookie("", 0));
  return c.json({ data: { ok: true } });
});

// Get current user
app.get("/me", async (c) => {
  const user = await getSessionUser(c);
  if (!user) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  return c.json({
    data: {
      id: user.id,
      email: user.email,
    },
  });
});

export default app;
