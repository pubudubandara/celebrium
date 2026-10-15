"use client";

import React, { useState } from "react";
import { Plus, Layers, Edit2, Power, X } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Badge,
  PageHeader,
  SearchBar,
  SectionCard,
  ConfirmDialog,
  EmptyState,
} from "@/components/ui/shared";
import { createSubcategorySchema, type CreateSubcategorySchema } from "@/lib/schemas";
import {
  getCategoriesSnapshot,
  getSubcategoriesSnapshot,
  createSubcategory,
} from "@/lib/repositories/mock";
import { slugify, formatDate } from "@/lib/utils";
import type { Subcategory } from "@/lib/types";

const ICONS = ["Heart", "Home", "Gem", "Award", "Smile", "Wine", "Zap", "GraduationCap", "Trophy", "Users", "Rocket", "Building2", "Moon", "Star", "Music"];

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>(getSubcategoriesSnapshot);
  const categories = getCategoriesSnapshot().filter((c) => c.isActive);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Subcategory | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<Subcategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register, handleSubmit, reset, setValue, watch, formState: { errors },
  } = useForm<CreateSubcategorySchema>({
    resolver: zodResolver(createSubcategorySchema),
    defaultValues: { isActive: true, displayOrder: 1, icon: "Star" },
  });

  const nameValue = watch("name");
  const selectedCatId = watch("categoryId");
  const selectedIcon = watch("icon");

  React.useEffect(() => {
    if (!editTarget) setValue("slug", slugify(nameValue ?? ""));
  }, [nameValue, editTarget, setValue]);

  const filtered = subcategories.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.slug.includes(search.toLowerCase());
    const matchCat = catFilter === "all" || s.categoryId === catFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" && s.isActive) || (statusFilter === "inactive" && !s.isActive);
    return matchSearch && matchCat && matchStatus;
  });

  const openCreate = () => {
    setEditTarget(null);
    reset({ isActive: true, displayOrder: 1, icon: "Star", name: "", slug: "", description: "", categoryId: "" });
    setDialogOpen(true);
  };

  const openEdit = (sub: Subcategory) => {
    setEditTarget(sub);
    reset({ categoryId: sub.categoryId, name: sub.name, slug: sub.slug, description: sub.description, icon: sub.icon, displayOrder: sub.displayOrder, isActive: sub.isActive });
    setDialogOpen(true);
  };

  const onSubmit = async (data: CreateSubcategorySchema) => {
    const slugExists = subcategories.some((s) => s.slug === data.slug && s.categoryId === data.categoryId && s.id !== editTarget?.id);
    if (slugExists) { toast.error("A subcategory with this slug already exists in the selected category."); return; }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    const catName = categories.find((c) => c.id === data.categoryId)?.name ?? "";

    if (editTarget) {
      setSubcategories((prev) => prev.map((s) => s.id === editTarget.id ? { ...s, ...data, categoryName: catName, updatedAt: new Date() } : s));
      toast.success(`"${data.name}" updated. (Demo only)`);
    } else {
      setSubcategories((prev) => [...prev, createSubcategory(data, catName)]);
      toast.success(`"${data.name}" created. (Demo only)`);
    }

    setIsSubmitting(false);
    setDialogOpen(false);
  };

  const handleToggle = () => {
    if (!confirmToggle) return;
    setSubcategories((prev) => prev.map((s) => s.id === confirmToggle.id ? { ...s, isActive: !s.isActive, updatedAt: new Date() } : s));
    toast.success(`"${confirmToggle.name}" ${confirmToggle.isActive ? "deactivated" : "activated"}. (Demo only)`);
    setConfirmToggle(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
      <PageHeader
        title="Subcategories"
        description="Manage subcategories within each invitation category."
        actions={
          <button className="btn-primary" onClick={openCreate} id="create-subcategory-btn">
            <Plus size={15} /> New Subcategory
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search subcategories…" className="w-64" />
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="form-input h-9 w-44 text-sm"
        >
          <option value="all">All Categories</option>
          {getCategoriesSnapshot().map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all capitalize ${statusFilter === s ? "text-white" : "border"}`}
              style={statusFilter === s ? { background: "var(--accent)" } : { borderColor: "var(--border-default)", color: "var(--text-secondary)", background: "var(--bg-card)" }}>
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>{filtered.length} subcategories</span>
      </div>

      <SectionCard>
        {filtered.length === 0 ? (
          <EmptyState icon={<Layers size={24} />} title="No subcategories found" description="Create a subcategory under an existing category."
            action={<button className="btn-primary" onClick={openCreate}><Plus size={14} />Create Subcategory</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subcategory</th>
                  <th>Parent Category</th>
                  <th>Slug</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                          {sub.icon[0]}
                        </div>
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{sub.name}</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant="gold">{sub.categoryName}</Badge>
                    </td>
                    <td>
                      <code className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}>
                        {sub.slug}
                      </code>
                    </td>
                    <td><span className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>{sub.displayOrder}</span></td>
                    <td><Badge variant={sub.isActive ? "active" : "inactive"}>{sub.isActive ? "Active" : "Inactive"}</Badge></td>
                    <td><span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(sub.createdAt)}</span></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(sub)} className="p-1.5 rounded-md hover:opacity-70 transition-opacity" title="Edit">
                          <Edit2 size={14} style={{ color: "var(--text-muted)" }} />
                        </button>
                        <button onClick={() => setConfirmToggle(sub)} className="p-1.5 rounded-md hover:opacity-70 transition-opacity" title={sub.isActive ? "Deactivate" : "Activate"}>
                          <Power size={14} style={{ color: sub.isActive ? "var(--destructive)" : "var(--success)" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 dialog-overlay" onClick={() => setDialogOpen(false)} />
          <div className="relative card w-full max-w-xl p-0 z-10 animate-fade-in flex flex-col max-h-[90vh]" style={{ boxShadow: "var(--shadow-xl)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <div>
                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{editTarget ? "Edit Subcategory" : "Create Subcategory"}</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Fill in the details below</p>
              </div>
              <button onClick={() => setDialogOpen(false)} className="p-1.5 rounded-md hover:opacity-70"><X size={16} style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto">
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Parent Category *</label>
                  <select {...register("categoryId")} className="form-input" id="sub-cat-select">
                    <option value="">Select a category…</option>
                    {getCategoriesSnapshot().map((c) => (
                      <option key={c.id} value={c.id}>{c.name}{!c.isActive ? " (inactive)" : ""}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{errors.categoryId.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Name *</label>
                  <input {...register("name")} className="form-input" placeholder="e.g. Homecoming, Surprise Party…" id="sub-name-input" />
                  {errors.name && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Slug *</label>
                  <input {...register("slug")} className="form-input font-mono text-sm" placeholder="auto-generated" />
                  {errors.slug && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{errors.slug.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Description</label>
                  <textarea {...register("description")} className="form-input resize-none" rows={2} placeholder="Brief description…" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Icon *</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map((icon) => (
                      <button key={icon} type="button" onClick={() => setValue("icon", icon)}
                        className="w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-all"
                        style={selectedIcon === icon ? { background: "var(--accent)", color: "white" } : { background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
                        {icon[0]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Display Order</label>
                    <input {...register("displayOrder")} type="number" min={0} className="form-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Status</label>
                    <div className="flex items-center gap-3 h-9">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={watch("isActive") === true} onChange={() => setValue("isActive", true)} className="accent-amber-600" />
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Active</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={watch("isActive") === false} onChange={() => setValue("isActive", false)} className="accent-amber-600" />
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Inactive</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <button type="button" className="btn-ghost" onClick={() => setDialogOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting} id="save-subcategory-btn">
                  {isSubmitting ? "Saving…" : editTarget ? "Save Changes" : "Create Subcategory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!confirmToggle} onClose={() => setConfirmToggle(null)} onConfirm={handleToggle}
        title={confirmToggle?.isActive ? "Deactivate Subcategory" : "Activate Subcategory"}
        description={`This will ${confirmToggle?.isActive ? "deactivate" : "activate"} "${confirmToggle?.name}".`}
        confirmLabel={confirmToggle?.isActive ? "Deactivate" : "Activate"}
        variant={confirmToggle?.isActive ? "danger" : "default"} />
    </div>
  );
}
