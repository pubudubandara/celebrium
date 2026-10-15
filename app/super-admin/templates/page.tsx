"use client";

import React, { useState } from "react";
import { Plus, FileImage, Eye, Edit2, ToggleLeft, ToggleRight, X, History, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge, PageHeader, SearchBar, SectionCard, EmptyState, ConfirmDialog } from "@/components/ui/shared";
import { createTemplateSchema, type CreateTemplateSchema } from "@/lib/schemas";
import { getTemplatesSnapshot, getCategoriesSnapshot, getSubcategoriesSnapshot, createTemplate, getTemplateVersionsSnapshot } from "@/lib/repositories/mock";
import { formatDate } from "@/lib/utils";
import type { Template, TemplateVersion } from "@/lib/types";
import Link from "next/link";

const ANIMATION_STYLES = ["elegant", "playful", "minimal", "dramatic", "corporate"] as const;
const THEMES = ["gold", "colorful", "monochrome", "navy", "rose", "forest"] as const;
const SUPPORTED_FIELDS = ["eventTitle", "hostNames", "eventDate", "eventTime", "venue", "address", "message", "guestName", "coverImage", "mapLink"];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(getTemplatesSnapshot);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [versionTemplate, setVersionTemplate] = useState<Template | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<Template | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>(["eventTitle", "hostNames", "eventDate", "venue", "guestName"]);

  const categories = getCategoriesSnapshot();
  const subcategories = getSubcategoriesSnapshot();
  const versions = getTemplateVersionsSnapshot();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateTemplateSchema>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: { status: "draft", defaultTheme: "gold", animationStyle: "elegant", version: "1.0.0", supportedFields: selectedFields },
  });

  const watchCatId = watch("categoryId");

  const filtered = templates.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || t.categoryId === catFilter;
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const toggleField = (field: string) => {
    setSelectedFields((prev) => {
      const next = prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field];
      setValue("supportedFields", next);
      return next;
    });
  };

  const onSubmit = async (data: CreateTemplateSchema) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    const catName = categories.find((c) => c.id === data.categoryId)?.name ?? "";
    const subName = subcategories.find((s) => s.id === data.subcategoryId)?.name;
    const newTpl = createTemplate({ ...data, supportedFields: selectedFields }, catName, subName);
    setTemplates((prev) => [...prev, newTpl]);
    toast.success(`Template "${data.name}" registered. (Demo only)`);
    setIsSubmitting(false);
    setDialogOpen(false);
    reset();
    setSelectedFields(["eventTitle", "hostNames", "eventDate", "venue", "guestName"]);
  };

  const handleToggleStatus = () => {
    if (!confirmToggle) return;
    const newStatus = confirmToggle.status === "published" ? "draft" : "published";
    setTemplates((prev) => prev.map((t) => t.id === confirmToggle.id ? { ...t, status: newStatus, updatedAt: new Date() } : t));
    toast.success(`Template ${newStatus === "published" ? "published" : "unpublished"}. (Demo only)`);
    setConfirmToggle(null);
  };

  const getVersions = (tplId: string): TemplateVersion[] => versions.filter((v) => v.templateId === tplId);

  const themeColors: Record<string, string> = {
    gold: "#B8962E", colorful: "#e83e8c", monochrome: "#6c757d", navy: "#003380", rose: "#c2185b", forest: "#2e7d32",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
      <PageHeader
        title="Templates"
        description="Manage invitation templates. Each template defines the visual style and animation for an event category."
        actions={
          <button className="btn-primary" onClick={() => { reset(); setDialogOpen(true); }} id="register-template-btn">
            <Plus size={15} /> Register Template
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search templates…" className="w-56" />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="form-input h-9 w-40 text-sm">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all capitalize ${statusFilter === s ? "text-white" : "border"}`}
              style={statusFilter === s ? { background: "var(--accent)" } : { borderColor: "var(--border-default)", color: "var(--text-secondary)", background: "var(--bg-card)" }}>
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>{filtered.length} templates</span>
      </div>

      {/* Template Cards Grid */}
      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={<FileImage size={24} />} title="No templates found" description="Register a new template to get started." /></div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((tpl) => (
            <div key={tpl.id} className="card overflow-hidden flex flex-col group">
              {/* Preview Image */}
              <div className="relative h-44 overflow-hidden" style={{ background: "var(--bg-surface)" }}>
                {tpl.previewImage ? (
                  <img src={tpl.previewImage} alt={tpl.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileImage size={36} style={{ color: "var(--text-disabled)" }} />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge variant={tpl.status}>{tpl.status}</Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.6)", color: "white" }}>
                    v{tpl.version}
                  </span>
                </div>
                {/* Theme swatch */}
                <div className="absolute bottom-3 left-3 w-4 h-4 rounded-full border-2 border-white" style={{ background: themeColors[tpl.defaultTheme] ?? "#999" }} title={`Theme: ${tpl.defaultTheme}`} />
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col gap-3">
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{tpl.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <Badge variant="gold" className="text-[10px]">{tpl.categoryName}</Badge>
                    {tpl.subcategoryName && <Badge variant="inactive" className="text-[10px]">{tpl.subcategoryName}</Badge>}
                    <span className="text-[10px] capitalize" style={{ color: "var(--text-muted)" }}>✦ {tpl.animationStyle}</span>
                  </div>
                  <p className="text-xs mt-2 leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>{tpl.description}</p>
                </div>

                <p className="text-[11px] mt-auto" style={{ color: "var(--text-muted)" }}>
                  Updated {formatDate(tpl.updatedAt)}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <button onClick={() => setPreviewTemplate(tpl)} className="btn-ghost flex-1 text-xs h-8 flex items-center justify-center gap-1.5" id={`preview-tpl-${tpl.id}`}>
                    <Eye size={13} /> Preview
                  </button>
                  <button onClick={() => setVersionTemplate(tpl)} className="p-2 rounded-md hover:opacity-70 transition-opacity" title="Version History">
                    <History size={14} style={{ color: "var(--text-muted)" }} />
                  </button>
                  <button onClick={() => setConfirmToggle(tpl)} className="p-2 rounded-md hover:opacity-70 transition-opacity" title={tpl.status === "published" ? "Unpublish" : "Publish"} id={`toggle-tpl-${tpl.id}`}>
                    {tpl.status === "published"
                      ? <ToggleRight size={18} style={{ color: "var(--success)" }} />
                      : <ToggleLeft size={18} style={{ color: "var(--text-muted)" }} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Register Template Dialog ───────────────────────────────────── */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 dialog-overlay" onClick={() => setDialogOpen(false)} />
          <div className="relative card w-full max-w-2xl z-10 animate-fade-in flex flex-col max-h-[90vh]" style={{ boxShadow: "var(--shadow-xl)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <div>
                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Register Template</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Register a new invitation template by providing its source identifier and metadata</p>
              </div>
              <button onClick={() => setDialogOpen(false)} className="p-1.5 rounded-md hover:opacity-70"><X size={16} style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto">
              <div className="px-6 py-5 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Template Name *</label>
                  <input {...register("name")} className="form-input" placeholder="e.g. Classic Gold, Birthday Bash…" id="tpl-name-input" />
                  {errors.name && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{errors.name.message}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Description</label>
                  <textarea {...register("description")} className="form-input resize-none" rows={2} placeholder="Describe this template…" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Category *</label>
                  <select {...register("categoryId")} className="form-input" id="tpl-cat-select">
                    <option value="">Select category…</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.categoryId && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{errors.categoryId.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Subcategory <span style={{ color: "var(--text-muted)" }}>(optional)</span></label>
                  <select {...register("subcategoryId")} className="form-input">
                    <option value="">None</option>
                    {subcategories.filter((s) => s.categoryId === watchCatId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Source Identifier *</label>
                  <input {...register("sourceId")} className="form-input font-mono text-sm" placeholder="classic-gold-v2" />
                  {errors.sourceId && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{errors.sourceId.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Version *</label>
                  <input {...register("version")} className="form-input font-mono text-sm" placeholder="1.0.0" />
                  {errors.version && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{errors.version.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Default Theme</label>
                  <select {...register("defaultTheme")} className="form-input">
                    {THEMES.map((t) => <option key={t} value={t} style={{ color: themeColors[t] }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Animation Style</label>
                  <select {...register("animationStyle")} className="form-input">
                    {ANIMATION_STYLES.map((a) => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Initial Status</label>
                  <select {...register("status")} className="form-input">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Preview Image URL</label>
                  <input {...register("previewImage")} className="form-input" placeholder="https://…" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Supported Event Fields</label>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORTED_FIELDS.map((f) => (
                      <button key={f} type="button" onClick={() => toggleField(f)}
                        className="text-xs px-3 py-1.5 rounded-full transition-all font-medium"
                        style={selectedFields.includes(f) ? { background: "var(--accent)", color: "white" } : { background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <button type="button" className="btn-ghost" onClick={() => setDialogOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting} id="save-template-btn">
                  {isSubmitting ? "Registering…" : "Register Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Preview Dialog ─────────────────────────────────────────────── */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 dialog-overlay" onClick={() => setPreviewTemplate(null)} />
          <div className="relative card w-full max-w-lg z-10 animate-fade-in overflow-hidden" style={{ boxShadow: "var(--shadow-xl)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Template Preview — {previewTemplate.name}</h3>
              <button onClick={() => setPreviewTemplate(null)} className="p-1.5 rounded-md hover:opacity-70"><X size={16} style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="p-6 space-y-4">
              {previewTemplate.previewImage && (
                <img src={previewTemplate.previewImage} alt="Preview" className="w-full h-52 object-cover rounded-lg" />
              )}
              <div className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={previewTemplate.status}>{previewTemplate.status}</Badge>
                  <Badge variant="gold">{previewTemplate.categoryName}</Badge>
                  <span className="badge badge-inactive capitalize">{previewTemplate.animationStyle} animation</span>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{previewTemplate.description}</p>
                <div className="rounded-lg p-4 space-y-2" style={{ background: "var(--bg-surface)" }}>
                  <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>SAMPLE INVITATION PREVIEW</p>
                  <div className="text-center space-y-1 py-3">
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>You are invited to</p>
                    <p className="text-lg font-bold font-serif" style={{ color: "var(--accent)" }}>Sample Event Title</p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Hosted by the Sample Family</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>January 1, 2026 · 6:00 PM · Sample Venue</p>
                  </div>
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Source: <code className="font-mono">{previewTemplate.sourceId}</code> · v{previewTemplate.version}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/i/kasun-kavindya-homecoming/Kd7mNqPxR2vL`} target="_blank" className="btn-primary flex-1 text-center text-sm justify-center">
                  <Eye size={14} /> View Live Preview
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Version History Dialog ─────────────────────────────────────── */}
      {versionTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 dialog-overlay" onClick={() => setVersionTemplate(null)} />
          <div className="relative card w-full max-w-md z-10 animate-fade-in" style={{ boxShadow: "var(--shadow-xl)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Version History — {versionTemplate.name}</h3>
              <button onClick={() => setVersionTemplate(null)} className="p-1.5 rounded-md hover:opacity-70"><X size={16} style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="p-5 space-y-3">
              {getVersions(versionTemplate.id).length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>No version history available for this template.</p>
              ) : (
                getVersions(versionTemplate.id).reverse().map((v, idx) => (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: idx === 0 ? "var(--accent-light)" : "var(--bg-surface)" }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-semibold" style={{ color: idx === 0 ? "var(--accent-dark)" : "var(--text-primary)" }}>v{v.version}</span>
                        {idx === 0 && <Badge variant="gold" className="text-[10px]">Current</Badge>}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{formatDate(v.createdAt)} by {v.createdBy}</p>
                    </div>
                    {idx > 0 && (
                      <button className="btn-ghost text-xs h-7 px-2.5" onClick={() => toast.info("Rollback requires backend implementation.")}>
                        <ArrowLeft size={12} /> Rollback
                      </button>
                    )}
                  </div>
                ))
              )}
              <div className="rounded-lg p-3 text-xs" style={{ background: "var(--info-light)", color: "var(--info)" }}>
                Rollback functionality requires backend implementation to persist version snapshots.
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!confirmToggle} onClose={() => setConfirmToggle(null)} onConfirm={handleToggleStatus}
        title={confirmToggle?.status === "published" ? "Unpublish Template" : "Publish Template"}
        description={confirmToggle?.status === "published" ? `Unpublishing "${confirmToggle?.name}" will prevent it from being assigned to new events.` : `Publishing "${confirmToggle?.name}" will make it available for event assignment.`}
        confirmLabel={confirmToggle?.status === "published" ? "Unpublish" : "Publish"}
        variant={confirmToggle?.status === "published" ? "warning" : "default"} />
    </div>
  );
}
