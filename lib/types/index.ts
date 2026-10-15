// ────────────────────────────────────────────────────────────────────────────
// Celebrium — Core TypeScript Types
// ────────────────────────────────────────────────────────────────────────────

export type UserRole = "super_admin" | "owner";

export type CategoryStatus = "active" | "inactive";
export type TemplateStatus = "draft" | "published";
export type EventStatus = "draft" | "published" | "archived";
export type GuestStatus = "pending" | "viewed" | "revoked";

// ── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  contactDetails?: string;
  adminNotes?: string;
  eventId?: string; // only for owners
  createdAt: Date;
  updatedAt: Date;
}

// ── Category ──────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  coverImage?: string;
  displayOrder: number;
  isActive: boolean;
  subcategoryCount?: number;
  templateCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── Subcategory ───────────────────────────────────────────────────────────────
export interface Subcategory {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Template ──────────────────────────────────────────────────────────────────
export type AnimationStyle = "elegant" | "playful" | "minimal" | "dramatic" | "corporate";
export type DefaultTheme = "gold" | "colorful" | "monochrome" | "navy" | "rose" | "forest";

export interface Template {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  sourceId: string; // identifier for the template implementation
  previewImage: string;
  supportedFields: string[];
  defaultTheme: DefaultTheme;
  animationStyle: AnimationStyle;
  version: string;
  status: TemplateStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: string;
  snapshot: Partial<Template>;
  createdBy: string;
  createdAt: Date;
}

// ── Event ─────────────────────────────────────────────────────────────────────
export interface Event {
  id: string;
  title: string;
  categoryId: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  templateId: string;
  templateName?: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  eventDate: string; // ISO date string
  eventTime: string;
  timezone: string;
  venue: string;
  address: string;
  message: string;
  eventSlug: string;
  hostNames: string; // e.g. "John & Jane" or "The Perera Family"
  eventConfig?: Record<string, string>;
  themeOverrides?: Record<string, string>;
  status: EventStatus;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Guest ─────────────────────────────────────────────────────────────────────
export interface Guest {
  id: string;
  eventId: string;
  name: string;
  token: string;
  invitationUrl: string;
  status: GuestStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ── Audit Log ─────────────────────────────────────────────────────────────────
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "archive"
  | "deactivate"
  | "activate"
  | "login"
  | "logout";

export type AuditResource =
  | "category"
  | "subcategory"
  | "template"
  | "event"
  | "guest"
  | "user"
  | "system";

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  resourceName?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────
export interface DashboardStats {
  totalCategories: number;
  activeTemplates: number;
  totalOwners: number;
  publishedEvents: number;
  totalGuests: number;
  viewedInvitations: number;
}

export interface OwnerDashboardStats {
  totalGuests: number;
  generatedLinks: number;
  viewedInvitations: number;
  pendingGuests: number;
}

// ── Form Input Types ──────────────────────────────────────────────────────────
export interface CreateCategoryInput {
  name: string;
  slug: string;
  description: string;
  icon: string;
  coverImage?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateSubcategoryInput {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateTemplateInput {
  name: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  sourceId: string;
  previewImage: string;
  supportedFields: string[];
  defaultTheme: DefaultTheme;
  animationStyle: AnimationStyle;
  version: string;
  status: TemplateStatus;
}

export interface CreateOwnerInput {
  fullName: string;
  email: string;
  username: string;
  isActive: boolean;
  contactDetails?: string;
  adminNotes?: string;
  event: {
    title: string;
    categoryId: string;
    subcategoryId?: string;
    eventDate: string;
    eventTime: string;
    timezone: string;
    venue: string;
    address: string;
    message: string;
    hostNames: string;
    coverImage?: string;
    eventSlug: string;
    eventConfig: Record<string, string>;
  };
  templateId: string;
  themeOverrides?: Record<string, string>;
}

export interface CreateGuestInput {
  name: string;
  eventId: string;
}

// ── Invitation Page Data ──────────────────────────────────────────────────────
export interface InvitationPageData {
  guest: Pick<Guest, "id" | "name" | "status">;
  event: Pick<
    Event,
    | "title"
    | "eventDate"
    | "eventTime"
    | "timezone"
    | "venue"
    | "address"
    | "message"
    | "hostNames"
    | "coverImage"
    | "categoryId"
    | "subcategoryId"
  >;
  template: Pick<
    Template,
    "sourceId" | "defaultTheme" | "animationStyle" | "name"
  >;
}
