import { z } from "zod";

export const CATEGORIES = ["new", "improved", "fixed", "breaking"] as const;

const slug = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Must be lowercase alphanumeric with hyphens");

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  slug: slug,
  description: z.string().max(500).optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createEntrySchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  categories: z.array(z.enum(CATEGORIES)).min(1),
  publishedAt: z.string().datetime().optional(),
});

export const updateEntrySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  categories: z.array(z.enum(CATEGORIES)).min(1).optional(),
  publishedAt: z.string().datetime().nullable().optional(),
});

export const subscribeSchema = z.object({
  email: z.string().email(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
