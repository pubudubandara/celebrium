"use client";

import React, { useState } from "react";
import { Plus, UserCheck, Eye, X, CheckCircle, ChevronRight, ChevronLeft, Palette, Send } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge, PageHeader, SearchBar, SectionCard, EmptyState, Avatar, CopyButton } from "@/components/ui/shared";
import { ownerDetailsSchema, eventConfigSchema, type OwnerDetailsSchema, type EventConfigSchema } from "@/lib/schemas";
import { getUsersSnapshot, getEventsSnapshot, getCategoriesSnapshot, getSubcategoriesSnapshot, getPublishedTemplates, createOwnerAndEvent } from "@/lib/repositories/mock";
import { formatDate } from "@/lib/utils";
import type { User, Event, Template } from "@/lib/types";
import Link from "next/link";

type WizardStep = 1 | 2 | 3 | 4;

const CATEGORY_FIELDS: Record<string, { key: string; label: string; placeholder: string }[]> = {
  "cat-1": [
    { key: "coupleNames", label: "Couple names", placeholder: "John & Jane" },
    { key: "ceremonyDetails", label: "Ceremony details", placeholder: "Saturday ceremony at 4:00 PM" },
    { key: "receptionDetails", label: "Reception details", placeholder: "Reception follows at the Grand Hall" },
  ],
  "cat-2": [
    { key: "celebrantName", label: "Celebrant name", placeholder: "Priya Sharma" },
    { key: "birthdayMessage", label: "Additional message", placeholder: "Come celebrate this special milestone..." },
  ],
  "cat-4": [
    { key: "organizationName", label: "Organization name", placeholder: "TechCorp" },
    { key: "registrationUrl", label: "Registration or information URL", placeholder: "https://example.com/register" },
  ],
};

interface OwnerCreationResult {
  owner: User;
  event: Event;
  template: Template;
}

export default function OwnersPage() {
  const [owners, setOwners] = useState<User[]>(getUsersSnapshot().filter((u) => u.role === "owner"));
  const [events, setEvents] = useState<Event[]>(getEventsSnapshot());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);
  const [ownerData, setOwnerData] = useState<OwnerDetailsSchema | null>(null);
  const [eventData, setEventData] = useState<EventConfigSchema | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [result, setResult] = useState<OwnerCreationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewOwner, setPreviewOwner] = useState<User | null>(null);
  const [eventConfig, setEventConfig] = useState<Record<string, string>>({});
  const [theme, setTheme] = useState<string>("gold");
  const [sampleGuest, setSampleGuest] = useState("Alex Morgan");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const categories = getCategoriesSnapshot();
  const subcategories = getSubcategoriesSnapshot();
  const publishedTemplates = getPublishedTemplates();

  const ownerForm = useForm<OwnerDetailsSchema>({ resolver: zodResolver(ownerDetailsSchema) });
  const eventForm = useForm<EventConfigSchema>({ resolver: zodResolver(eventConfigSchema) });

  const filteredOwners = owners.filter((o) => {
    const matchSearch = o.fullName.toLowerCase().includes(search.toLowerCase()) || o.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || (statusFilter === "active" && o.isActive) || (statusFilter === "inactive" && !o.isActive);
    return matchSearch && matchStatus;
  });

  const getOwnerEvent = (ownerId: string) => events.find((e) => e.ownerId === ownerId);

  const openWizard = () => {
    setStep(1);
    setOwnerData(null);
    setEventData(null);
    setSelectedTemplateId("");
    setEventConfig({});
    setTheme("gold");
    setSampleGuest("Alex Morgan");
    setPreviewTemplate(null);
    setResult(null);
    ownerForm.reset();
    eventForm.reset();
    setWizardOpen(true);
  };

  const onStep1Submit = (data: OwnerDetailsSchema) => {
    const duplicate = owners.some((owner) => owner.email.toLowerCase() === data.email.toLowerCase() || owner.username.toLowerCase() === data.username.toLowerCase());
    if (duplicate) {
      toast.error("An owner with this email or username already exists.");
      return;
    }
    setOwnerData(data);
    setStep(2);
  };

  const onStep2Submit = (data: EventConfigSchema) => {
    setEventData(data);
    setStep(3);
  };

  const onConfirm = async (publish = false) => {
    if (!ownerData || !eventData || !selectedTemplateId) { toast.error("Please complete all steps."); return; }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));

    const template = publishedTemplates.find((t) => t.id === selectedTemplateId)!;
    const catName = categories.find((c) => c.id === eventData.categoryId)?.name ?? "";
    const subName = subcategories.find((s) => s.id === eventData.subcategoryId)?.name;

    const { owner, event } = createOwnerAndEvent({ ...ownerData, isActive: ownerData.isActive ?? true, event: { ...eventData, eventConfig }, templateId: selectedTemplateId, themeOverrides: { theme } }, catName, subName, template.name);
    event.status = publish ? "published" : "draft";

    setOwners((prev) => [...prev, owner]);
    setEvents((prev) => [...prev, event]);
    setResult({ owner, event, template });
    setStep(4);
    setIsSubmitting(false);
    toast.success(`Owner "${owner.fullName}" created successfully. (Demo only)`);
  };

  const watchCatId = eventForm.watch("categoryId");
  const watchEventTitle = eventForm.watch("title");

  const compatibleTemplates = publishedTemplates.filter((t) => !watchCatId || t.categoryId === watchCatId);
  const categoryFields = CATEGORY_FIELDS[watchCatId] ?? [
    { key: "additionalDetails", label: "Additional event details", placeholder: "Add any category-specific information..." },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
      <PageHeader
        title="Invitation Owners"
        description="Manage owner accounts. Each owner is linked to one event and can manage their guest list."
        actions={
          <button className="btn-primary" onClick={openWizard} id="add-owner-btn">
            <Plus size={15} /> Add Owner
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search owners…" className="w-64" />
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all capitalize ${statusFilter === s ? "text-white" : "border"}`}
              style={statusFilter === s ? { background: "var(--accent)" } : { borderColor: "var(--border-default)", color: "var(--text-secondary)", background: "var(--bg-card)" }}>
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>{filteredOwners.length} owners</span>
      </div>

      {/* Table */}
      <SectionCard>
        {filteredOwners.length === 0 ? (
          <EmptyState icon={<UserCheck size={24} />} title="No owners found" description="Add the first invitation owner to get started."
            action={<button className="btn-primary" onClick={openWizard}><Plus size={14} />Add Owner</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Owner</th><th>Event</th><th>Category</th><th>Status</th><th>Created</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredOwners.map((owner) => {
                  const ev = getOwnerEvent(owner.id);
                  return (
                    <tr key={owner.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={owner.fullName} size="sm" />
                          <div>
                            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{owner.fullName}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{owner.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="text-sm truncate max-w-xs" style={{ color: "var(--text-primary)" }}>{ev?.title ?? "—"}</p>
                        {ev && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(ev.eventDate)}</p>}
                      </td>
                      <td>
                        {ev?.categoryName && <Badge variant="gold">{ev.categoryName}</Badge>}
                      </td>
                      <td><Badge variant={owner.isActive ? "active" : "inactive"}>{owner.isActive ? "Active" : "Inactive"}</Badge></td>
                      <td><span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(owner.createdAt)}</span></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setPreviewOwner(owner)} className="p-1.5 rounded-md hover:opacity-70" title="View Details">
                            <Eye size={14} style={{ color: "var(--text-muted)" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* ─── Add Owner Wizard ────────────────────────────────────────────── */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 dialog-overlay" onClick={() => step !== 4 && setWizardOpen(false)} />
          <div className="relative card w-full max-w-2xl z-10 animate-fade-in flex flex-col max-h-[90vh]" style={{ boxShadow: "var(--shadow-xl)" }}>

            {/* Wizard Header */}
            {step !== 4 && (
              <div className="px-6 py-5 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Add Invitation Owner</h3>
                  <button onClick={() => setWizardOpen(false)} className="p-1.5 rounded-md hover:opacity-70"><X size={16} style={{ color: "var(--text-muted)" }} /></button>
                </div>
                {/* Step indicators */}
                <div className="flex items-center gap-2">
                  {([1, 2, 3] as const).map((s) => (
                    <React.Fragment key={s}>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all`}
                          style={step >= s ? { background: "var(--accent)", color: "white" } : { background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border-default)" }}>
                          {step > s ? "✓" : s}
                        </div>
                        <span className="text-xs font-medium hidden sm:block" style={{ color: step === s ? "var(--text-primary)" : "var(--text-muted)" }}>
                          {["Owner Details", "Event Config", "Template"][s - 1]}
                        </span>
                      </div>
                      {s < 3 && <div className="flex-1 h-0.5" style={{ background: step > s ? "var(--accent)" : "var(--border-default)" }} />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Owner Details */}
            {step === 1 && (
              <form onSubmit={ownerForm.handleSubmit(onStep1Submit)} className="overflow-y-auto">
                <div className="px-6 py-5 space-y-4">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Step 1 — Owner Account Details</p>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Full Name *</label>
                    <input {...ownerForm.register("fullName")} className="form-input" placeholder="John Perera" id="owner-fullname" />
                    {ownerForm.formState.errors.fullName && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{ownerForm.formState.errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Email Address *</label>
                    <input {...ownerForm.register("email")} type="email" className="form-input" placeholder="john@example.com" id="owner-email" />
                    {ownerForm.formState.errors.email && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{ownerForm.formState.errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Username *</label>
                    <input {...ownerForm.register("username")} className="form-input font-mono text-sm" placeholder="john_perera" id="owner-username" />
                    {ownerForm.formState.errors.username && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{ownerForm.formState.errors.username.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Account status</label>
                      <select {...ownerForm.register("isActive", { setValueAs: (value) => value === "true" })} className="form-input">
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Contact details</label>
                      <input {...ownerForm.register("contactDetails")} className="form-input" placeholder="Phone or preferred contact" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Internal administrative notes</label>
                    <textarea {...ownerForm.register("adminNotes")} rows={2} className="form-input resize-none" placeholder="Notes visible only to Super Admins" />
                  </div>
                  <div className="rounded-lg p-3 text-xs" style={{ background: "var(--info-light)", color: "var(--info)" }}>
                    No password or reusable passcode is stored. Authentication should send a one-time account activation link.
                  </div>
                </div>
                <div className="flex justify-end px-6 py-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <button type="submit" className="btn-primary" id="wizard-step1-next">Next: Event Configuration <ChevronRight size={14} /></button>
                </div>
              </form>
            )}

            {/* Step 2: Event Config */}
            {step === 2 && (
              <form onSubmit={eventForm.handleSubmit(onStep2Submit)} className="overflow-y-auto">
                <div className="px-6 py-5 space-y-4">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Step 2 — Event Configuration</p>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Event Title *</label>
                    <input {...eventForm.register("title")} className="form-input" placeholder="John & Jane Wedding Homecoming" id="event-title" />
                    {eventForm.formState.errors.title && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{eventForm.formState.errors.title.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Event slug *</label>
                    <input {...eventForm.register("eventSlug")} className="form-input font-mono text-sm" placeholder="john-jane-wedding" />
                    {eventForm.formState.errors.eventSlug && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{eventForm.formState.errors.eventSlug.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Category *</label>
                      <select {...eventForm.register("categoryId")} className="form-input" id="event-category">
                        <option value="">Select…</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      {eventForm.formState.errors.categoryId && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{eventForm.formState.errors.categoryId.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Subcategory</label>
                      <select {...eventForm.register("subcategoryId")} className="form-input">
                        <option value="">None</option>
                        {subcategories.filter((s) => s.categoryId === watchCatId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Event Date *</label>
                      <input {...eventForm.register("eventDate")} type="date" className="form-input" id="event-date" />
                      {eventForm.formState.errors.eventDate && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{eventForm.formState.errors.eventDate.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Time *</label>
                      <input {...eventForm.register("eventTime")} type="time" className="form-input" id="event-time" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Timezone *</label>
                      <select {...eventForm.register("timezone")} className="form-input">
                        <option value="Asia/Colombo">Asia/Colombo (IST)</option>
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                        <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Host Names *</label>
                    <input {...eventForm.register("hostNames")} className="form-input" placeholder="John & Jane, The Perera Family, TechCorp…" id="event-hosts" />
                    {eventForm.formState.errors.hostNames && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{eventForm.formState.errors.hostNames.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Venue *</label>
                    <input {...eventForm.register("venue")} className="form-input" placeholder="The Grand Hall" id="event-venue" />
                    {eventForm.formState.errors.venue && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{eventForm.formState.errors.venue.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Address *</label>
                    <input {...eventForm.register("address")} className="form-input" placeholder="123 Main St, City" id="event-address" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Invitation Message *</label>
                    <textarea {...eventForm.register("message")} rows={3} className="form-input resize-none" placeholder="With great joy we invite you…" id="event-message" />
                    {eventForm.formState.errors.message && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{eventForm.formState.errors.message.message}</p>}
                  </div>
                  <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Category-specific configuration</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>These flexible fields change with the selected category and are stored with the event.</p>
                    </div>
                    {categoryFields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>{field.label}</label>
                        <input value={eventConfig[field.key] ?? ""} onChange={(e) => setEventConfig((current) => ({ ...current, [field.key]: e.target.value }))} className="form-input" placeholder={field.placeholder} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between px-6 py-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <button type="button" className="btn-ghost" onClick={() => setStep(1)}><ChevronLeft size={14} /> Back</button>
                  <button type="submit" className="btn-primary" id="wizard-step2-next">Next: Select Template <ChevronRight size={14} /></button>
                </div>
              </form>
            )}

            {/* Step 3: Template */}
            {step === 3 && (
              <div className="overflow-y-auto flex flex-col flex-1">
                <div className="px-6 py-5 space-y-4 flex-1 overflow-y-auto">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Step 3 — Assign Template</p>
                  {compatibleTemplates.length === 0 ? (
                    <div className="rounded-lg p-4 text-center text-sm" style={{ background: "var(--warning-light)", color: "var(--warning)" }}>
                      No published templates for the selected category. Please publish a template first.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {compatibleTemplates.map((tpl) => (
                        <div key={tpl.id}
                          className="w-full flex items-center gap-3 p-3 rounded-xl transition-all border-2"
                          style={selectedTemplateId === tpl.id
                            ? { borderColor: "var(--accent)", background: "var(--accent-light)" }
                            : { borderColor: "var(--border-subtle)", background: "var(--bg-card)" }}
                          id={`select-tpl-${tpl.id}`}>
                          <button type="button" onClick={() => setSelectedTemplateId(tpl.id)} className="flex items-center gap-3 flex-1 text-left">
                            {tpl.previewImage && <img src={tpl.previewImage} alt={tpl.name} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{tpl.name}</p>
                              {selectedTemplateId === tpl.id && <CheckCircle size={14} style={{ color: "var(--accent)" }} />}
                            </div>
                            <div className="flex gap-1.5 mt-0.5 flex-wrap">
                              <Badge variant="gold" className="text-[10px]">{tpl.categoryName}</Badge>
                              <span className="badge badge-inactive text-[10px] capitalize">{tpl.animationStyle}</span>
                            </div>
                            <p className="text-xs mt-1 line-clamp-1" style={{ color: "var(--text-muted)" }}>{tpl.description}</p>
                            </div>
                          </button>
                          <button type="button" className="btn-ghost text-xs" onClick={() => setPreviewTemplate(tpl)}><Eye size={13} /> Preview</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}><Palette size={12} className="inline mr-1" />Theme option</label>
                      <select value={theme} onChange={(e) => setTheme(e.target.value)} className="form-input">
                        {["gold", "colorful", "monochrome", "navy", "rose", "forest"].map((option) => <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Sample guest for preview</label>
                      <input value={sampleGuest} onChange={(e) => setSampleGuest(e.target.value)} className="form-input" placeholder="Alex Morgan" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between px-6 py-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <button className="btn-ghost" onClick={() => setStep(2)}><ChevronLeft size={14} /> Back</button>
                  <button className="btn-primary" disabled={!selectedTemplateId} onClick={() => setStep(4)} id="wizard-step3-next">
                    Review & Create <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review (pre-submit) or Confirmation (post-submit) */}
            {step === 4 && !result && (
              <div className="overflow-y-auto flex flex-col flex-1">
                <div className="px-6 py-5 space-y-4 flex-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Step 4 — Review & Confirm</p>
                  <div className="space-y-3 text-sm">
                    <div className="rounded-lg p-4 space-y-2" style={{ background: "var(--bg-surface)" }}>
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Owner Details</p>
                      <p><span className="font-medium">Name:</span> {ownerData?.fullName}</p>
                      <p><span className="font-medium">Email:</span> {ownerData?.email}</p>
                      <p><span className="font-medium">Username:</span> {ownerData?.username}</p>
                      <p><span className="font-medium">Status:</span> {ownerData?.isActive ? "Active" : "Inactive"}</p>
                    </div>
                    <div className="rounded-lg p-4 space-y-2" style={{ background: "var(--bg-surface)" }}>
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Event Details</p>
                      <p><span className="font-medium">Title:</span> {eventData?.title}</p>
                      <p><span className="font-medium">Date:</span> {eventData?.eventDate} at {eventData?.eventTime}</p>
                      <p><span className="font-medium">Venue:</span> {eventData?.venue}</p>
                      <p><span className="font-medium">Hosts:</span> {eventData?.hostNames}</p>
                      <p><span className="font-medium">Slug:</span> {eventData?.eventSlug}</p>
                      <p><span className="font-medium">Theme:</span> {theme}</p>
                    </div>
                    <div className="rounded-lg p-4 space-y-2" style={{ background: "var(--bg-surface)" }}>
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Template</p>
                      <p>{publishedTemplates.find((t) => t.id === selectedTemplateId)?.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Preview guest: {sampleGuest}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between px-6 py-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <button className="btn-ghost" onClick={() => setStep(3)}><ChevronLeft size={14} /> Back</button>
                  <div className="flex gap-2">
                    <button className="btn-ghost" onClick={() => onConfirm(false)} disabled={isSubmitting} id="wizard-save-draft-btn">
                      {isSubmitting ? "Saving…" : "Save Draft"}
                    </button>
                    <button className="btn-primary" onClick={() => onConfirm(true)} disabled={isSubmitting} id="wizard-confirm-btn">
                      <Send size={14} /> {isSubmitting ? "Publishing…" : "Publish Invitation"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Screen */}
            {step === 4 && result && (
              <div className="p-8 space-y-5 overflow-y-auto">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "var(--success-light)" }}>
                    <CheckCircle size={28} style={{ color: "var(--success)" }} />
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Owner Created Successfully!</h3>
                  <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    This is a demo — data is held in memory only and not persisted to a database.
                  </p>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg p-4 space-y-2" style={{ background: "var(--bg-surface)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Account Information</p>
                    <p><span className="font-medium">Name:</span> {result.owner.fullName}</p>
                    <p><span className="font-medium">Email:</span> {result.owner.email}</p>
                    <p><span className="font-medium">Event:</span> {result.event.title}</p>
                    <p><span className="font-medium">Template:</span> {result.template.name}</p>
                  </div>
                  <div className="rounded-lg p-4 space-y-2" style={{ background: "var(--bg-surface)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Owner Login URL</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs flex-1 truncate font-mono" style={{ color: "var(--text-secondary)" }}>
                        {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/login
                      </code>
                      <CopyButton text={`${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/login`} />
                    </div>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      ⚠ Password setup link will be sent via email when authentication is configured.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link href="/dashboard" className="btn-primary flex-1 text-center justify-center text-sm">
                    Open Owner Dashboard
                  </Link>
                  <button className="btn-ghost flex-1" onClick={() => { setWizardOpen(false); }}>
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {previewTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 dialog-overlay" onClick={() => setPreviewTemplate(null)} />
          <div className="relative card w-full max-w-lg z-10 overflow-hidden">
            <div className="relative h-56" style={{ background: "var(--bg-surface)" }}>
              {previewTemplate.previewImage && <img src={previewTemplate.previewImage} alt={previewTemplate.name} className="w-full h-full object-cover" />}
              <button onClick={() => setPreviewTemplate(null)} className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-2">
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Sample guest: {sampleGuest}</p>
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{previewTemplate.name}</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{watchCatId ? categories.find((c) => c.id === watchCatId)?.name : ""} · {theme} theme</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{previewTemplate.description}</p>
              {watchEventTitle && <p className="text-sm font-medium pt-2" style={{ color: "var(--text-primary)" }}>{watchEventTitle}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Owner Detail Panel */}
      {previewOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0">
          <div className="absolute inset-0 dialog-overlay" onClick={() => setPreviewOwner(null)} />
          <div className="relative card w-full max-w-sm h-full z-10 rounded-none rounded-l-2xl overflow-y-auto animate-slide-left" style={{ boxShadow: "var(--shadow-xl)" }}>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Owner Details</h3>
                <button onClick={() => setPreviewOwner(null)} className="p-1.5 rounded-md hover:opacity-70"><X size={16} style={{ color: "var(--text-muted)" }} /></button>
              </div>
              <div className="flex items-center gap-3">
                <Avatar name={previewOwner.fullName} size="lg" />
                <div>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{previewOwner.fullName}</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{previewOwner.email}</p>
                  <Badge variant={previewOwner.isActive ? "active" : "inactive"} className="mt-1">{previewOwner.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              </div>
              {(() => { const ev = getOwnerEvent(previewOwner.id); return ev ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Assigned Event</p>
                  <div className="rounded-lg p-3 space-y-2 text-sm" style={{ background: "var(--bg-surface)" }}>
                    <p className="font-medium" style={{ color: "var(--text-primary)" }}>{ev.title}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge variant="gold">{ev.categoryName}</Badge>
                      <Badge variant={ev.status}>{ev.status}</Badge>
                    </div>
                    <p style={{ color: "var(--text-muted)" }}>{formatDate(ev.eventDate)} · {ev.eventTime}</p>
                    <p style={{ color: "var(--text-muted)" }}>{ev.venue}</p>
                  </div>
                </div>
              ) : null; })()}
              <div className="pt-2">
                <Link href="/dashboard" className="btn-primary w-full text-center justify-center text-sm">Open Owner Dashboard</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
