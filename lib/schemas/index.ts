import { z } from "zod";

// ── Category Schemas ──────────────────────────────────────────────────────────
export const createCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens"),
  description: z.string().max(500).optional().default(""),
  icon: z.string().min(1, "Please select an icon"),
  coverImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;

// ── Subcategory Schemas ───────────────────────────────────────────────────────
export const createSubcategorySchema = z.object({
  categoryId: z.string().min(1, "Please select a parent category"),
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens"),
  description: z.string().max(500).optional().default(""),
  icon: z.string().min(1, "Please select an icon"),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CreateSubcategorySchema = z.infer<typeof createSubcategorySchema>;

// ── Template Schemas ──────────────────────────────────────────────────────────
export const createTemplateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(1000).optional().default(""),
  categoryId: z.string().min(1, "Please select a category"),
  subcategoryId: z.string().optional(),
  sourceId: z.string().min(1, "Template source identifier is required"),
  previewImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  supportedFields: z.array(z.string()).default([]),
  defaultTheme: z.enum(["gold", "colorful", "monochrome", "navy", "rose", "forest"]),
  animationStyle: z.enum(["elegant", "playful", "minimal", "dramatic", "corporate"]),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Version must be in format x.y.z")
    .default("1.0.0"),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type CreateTemplateSchema = z.infer<typeof createTemplateSchema>;

// ── Owner Schemas ─────────────────────────────────────────────────────────────
export const ownerDetailsSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-z0-9_-]+$/, "Username may only contain lowercase letters, numbers, underscores and hyphens"),
  isActive: z.boolean().optional(),
  contactDetails: z.string().max(300, "Contact details must be less than 300 characters").optional(),
  adminNotes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
});

export const eventConfigSchema = z.object({
  title: z.string().min(2, "Event title must be at least 2 characters").max(150),
  categoryId: z.string().min(1, "Please select a category"),
  subcategoryId: z.string().optional(),
  eventDate: z.string().min(1, "Event date is required"),
  eventTime: z.string().min(1, "Event time is required"),
  timezone: z.string().min(1, "Timezone is required"),
  venue: z.string().min(2, "Venue name is required").max(200),
  address: z.string().min(2, "Address is required").max(500),
  message: z.string().min(10, "Invitation message must be at least 10 characters").max(2000),
  hostNames: z.string().min(2, "Host names are required").max(200),
  coverImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  eventSlug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens"),
  eventConfig: z.record(z.string(), z.string()).optional(),
});

export const templateAssignmentSchema = z.object({
  templateId: z.string().min(1, "Please select a template"),
});

export type OwnerDetailsSchema = z.infer<typeof ownerDetailsSchema>;
export type EventConfigSchema = z.infer<typeof eventConfigSchema>;
export type TemplateAssignmentSchema = z.infer<typeof templateAssignmentSchema>;

// ── Guest Schema ──────────────────────────────────────────────────────────────
export const createGuestSchema = z.object({
  name: z
    .string()
    .min(1, "Guest name is required")
    .max(150, "Name must be less than 150 characters")
    .regex(
      /^[\u0020-\u007E\u0D80-\u0DFF\u00C0-\u024F\u0100-\u024F\w\s'.,-]+$/u,
      "Name contains invalid characters"
    ),
});

export type CreateGuestSchema = z.infer<typeof createGuestSchema>;

// ── Login Schema ──────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
