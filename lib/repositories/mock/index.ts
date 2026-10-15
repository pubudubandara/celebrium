// ────────────────────────────────────────────────────────────────────────────
// Mock Repository — In-memory implementations of all data access interfaces
// NOTE: All state is in-memory per request. Not persistent.
// In production, replace with MongoDB-backed implementations.
// ────────────────────────────────────────────────────────────────────────────

import type {
  Category,
  Subcategory,
  Template,
  TemplateVersion,
  User,
  Event,
  Guest,
  AuditLog,
  CreateCategoryInput,
  CreateSubcategoryInput,
  CreateTemplateInput,
  CreateOwnerInput,
  CreateGuestInput,
} from "@/lib/types";
import {
  mockCategories,
  mockSubcategories,
  mockTemplates,
  mockTemplateVersions,
  mockUsers,
  mockEvents,
  mockGuests,
  mockAuditLogs,
} from "@/lib/data/mock-data";
import { generateToken, buildInvitationUrl, slugify } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// In-memory stores (mutable, client-side only via useReducer/useState)
// Server-side code should import directly from mock-data.ts
// ─────────────────────────────────────────────────────────────────────────────

// We export factory functions that return fresh arrays each time,
// so Next.js Server Components always get a consistent snapshot.
export function getCategoriesSnapshot(): Category[] {
  return [...mockCategories];
}
export function getSubcategoriesSnapshot(): Subcategory[] {
  return [...mockSubcategories];
}
export function getTemplatesSnapshot(): Template[] {
  return [...mockTemplates];
}
export function getTemplateVersionsSnapshot(): TemplateVersion[] {
  return [...mockTemplateVersions];
}
export function getUsersSnapshot(): User[] {
  return [...mockUsers];
}
export function getEventsSnapshot(): Event[] {
  return [...mockEvents];
}
export function getGuestsSnapshot(): Guest[] {
  return [...mockGuests];
}
export function getAuditLogsSnapshot(): AuditLog[] {
  return [...mockAuditLogs];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers for client-side state management
// ─────────────────────────────────────────────────────────────────────────────

export function createCategory(input: CreateCategoryInput): Category {
  const now = new Date();
  return {
    id: `cat-${Date.now()}`,
    ...input,
    subcategoryCount: 0,
    templateCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function createSubcategory(
  input: CreateSubcategoryInput,
  categoryName: string
): Subcategory {
  const now = new Date();
  return {
    id: `sub-${Date.now()}`,
    ...input,
    categoryName,
    createdAt: now,
    updatedAt: now,
  };
}

export function createTemplate(input: CreateTemplateInput, categoryName: string, subcategoryName?: string): Template {
  const now = new Date();
  return {
    id: `tpl-${Date.now()}`,
    ...input,
    categoryName,
    subcategoryName,
    createdAt: now,
    updatedAt: now,
  };
}

export function createOwnerAndEvent(
  input: CreateOwnerInput,
  categoryName: string,
  subcategoryName: string | undefined,
  templateName: string
): { owner: User; event: Event } {
  const now = new Date();
  const ownerId = `user-o-${Date.now()}`;
  const eventId = `evt-${Date.now()}`;
  const eventSlug = input.event.eventSlug || slugify(input.event.title);

  const owner: User = {
    id: ownerId,
    fullName: input.fullName,
    email: input.email,
    username: input.username,
    role: "owner",
    isActive: input.isActive,
    contactDetails: input.contactDetails,
    adminNotes: input.adminNotes,
    eventId,
    createdAt: now,
    updatedAt: now,
  };

  const event: Event = {
    id: eventId,
    title: input.event.title,
    categoryId: input.event.categoryId,
    categoryName,
    subcategoryId: input.event.subcategoryId,
    subcategoryName,
    templateId: input.templateId,
    templateName,
    ownerId,
    ownerName: input.fullName,
    ownerEmail: input.email,
    eventDate: input.event.eventDate,
    eventTime: input.event.eventTime,
    timezone: input.event.timezone,
    venue: input.event.venue,
    address: input.event.address,
    message: input.event.message,
    hostNames: input.event.hostNames,
    eventConfig: input.event.eventConfig,
    themeOverrides: input.themeOverrides,
    coverImage: input.event.coverImage,
    eventSlug,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };

  return { owner, event };
}

export function createGuest(input: CreateGuestInput, eventSlug: string): Guest {
  const now = new Date();
  const token = generateToken(12);
  return {
    id: `guest-${Date.now()}`,
    eventId: input.eventId,
    name: input.name,
    token,
    invitationUrl: buildInvitationUrl(eventSlug, token),
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Lookup helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getCategoryById(id: string): Category | undefined {
  return mockCategories.find((c) => c.id === id);
}

export function getSubcategoryById(id: string): Subcategory | undefined {
  return mockSubcategories.find((s) => s.id === id);
}

export function getTemplateById(id: string): Template | undefined {
  return mockTemplates.find((t) => t.id === id);
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}

export function getEventById(id: string): Event | undefined {
  return mockEvents.find((e) => e.id === id);
}

export function getEventBySlug(slug: string): Event | undefined {
  return mockEvents.find((e) => e.eventSlug === slug);
}

export function getGuestsByEventId(eventId: string): Guest[] {
  return mockGuests.filter((g) => g.eventId === eventId);
}

export function getGuestByToken(token: string): Guest | undefined {
  return mockGuests.find((g) => g.token === token);
}

export function getSubcategoriesByCategory(categoryId: string): Subcategory[] {
  return mockSubcategories.filter((s) => s.categoryId === categoryId);
}

export function getTemplatesByCategory(categoryId: string): Template[] {
  return mockTemplates.filter((t) => t.categoryId === categoryId);
}

export function getPublishedTemplates(): Template[] {
  return mockTemplates.filter((t) => t.status === "published");
}

export function getOwnerUsers(): User[] {
  return mockUsers.filter((u) => u.role === "owner");
}

export function getInvitationData(eventSlug: string, guestToken: string) {
  const event = getEventBySlug(eventSlug);
  if (!event) return null;

  const guest = mockGuests.find(
    (g) => g.eventId === event.id && g.token === guestToken
  );
  if (!guest) return null;

  const template = getTemplateById(event.templateId);
  if (!template) return null;

  return { event, guest, template };
}
