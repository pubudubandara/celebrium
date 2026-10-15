"use client";

import React, { useState } from "react";
import type { Metadata } from "next";
import {
  Plus,
  Tag,
  Edit2,
  Power,
  Search,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
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
import { createCategorySchema, type CreateCategorySchema } from "@/lib/schemas";
import {
  getCategoriesSnapshot,
  createCategory,
} from "@/lib/repositories/mock";
import { slugify, formatDate } from "@/lib/utils";
import type { Category } from "@/lib/types";

const ICONS = ["Heart", "Cake", "GraduationCap", "Briefcase", "Star", "Music", "Gift", "Globe", "Sun", "Moon", "Flower", "Flag", "Trophy", "Crown", "Diamond"];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(getCategoriesSnapshot);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCategorySchema>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { isActive: true, displayOrder: categories.length + 1, icon: "Star" },
  });

  const nameValue = watch("name");
  const selectedIcon = watch("icon");

  // Auto-fill slug from name
  React.useEffect(() => {
    if (!editTarget) {
      setValue("slug", slugify(nameValue ?? ""));
    }
  }, [nameValue, editTarget, setValue]);

  const filtered = categories.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && c.isActive) ||
      (statusFilter === "inactive" && !c.isActive);
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setEditTarget(null);
    reset({ isActive: true, displayOrder: categories.length + 1, icon: "Star", name: "", slug: "", description: "" });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      coverImage: cat.coverImage ?? "",
      displayOrder: cat.displayOrder,
      isActive: cat.isActive,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: CreateCategorySchema) => {
    // Check duplicate slug
    const slugExists = categories.some(
      (c) => c.slug === data.slug && c.id !== editTarget?.id
    );
    if (slugExists) {
      toast.error("A category with this slug already exists.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500)); // simulate latency

    if (editTarget) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editTarget.id ? { ...c, ...data, updatedAt: new Date() } : c
        )
      );
      toast.success(`"${data.name}" updated successfully. (Demo only — not persisted to database)`);
    } else {
      const newCat = createCategory(data);
      setCategories((prev) => [...prev, newCat]);
      toast.success(`"${data.name}" created successfully. (Demo only — not persisted to database)`);
    }

    setIsSubmitting(false);
    setDialogOpen(false);
    reset();
  };

  const handleToggleStatus = () => {
    if (!confirmDeactivate) return;
    setCategories((prev) =>
      prev.map((c) =>
        c.id === confirmDeactivate.id ? { ...c, isActive: !c.isActive, updatedAt: new Date() } : c
      )
    );
    toast.success(
      `"${confirmDeactivate.name}" ${confirmDeactivate.isActive ? "deactivated" : "activated"}. (Demo only)`
    );
    setConfirmDeactivate(null);
  };

  const moveOrder = (id: string, dir: "up" | "down") => {
    setCategories((prev) => {
      const sorted = [...prev].sort((a, b) => a.displayOrder - b.displayOrder);
      const idx = sorted.findIndex((c) => c.id === id);
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const orderA = sorted[idx].displayOrder;
      const orderB = sorted[swapIdx].displayOrder;
      return prev.map((c) => {
        if (c.id === sorted[idx].id) return { ...c, displayOrder: orderB };
        if (c.id === sorted[swapIdx].id) return { ...c, displayOrder: orderA };
        return c;
      });
    });
  };

  const sorted = [...filtered].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
      <PageHeader
        title="Categories"
        description="Manage invitation categories. Categories group related templates and events."
        actions={
          <button className="btn-primary" onClick={openCreate} id="create-category-btn">
            <Plus size={15} />
            New Category
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search categories…"
          className="w-64"
        />
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all capitalize ${
                statusFilter === s
                  ? "text-white"
                  : "border"
              }`}
              style={
                statusFilter === s
                  ? { background: "var(--accent)" }
                  : { borderColor: "var(--border-default)", color: "var(--text-secondary)", background: "var(--bg-card)" }
              }
            >
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
          {filtered.length} of {categories.length} categories
        </span>
      </div>

      {/* Table */}
      <SectionCard>
        {sorted.length === 0 ? (
          <EmptyState
            icon={<Tag size={24} />}
            title="No categories found"
            description="Try adjusting your search or filters, or create your first category."
            action={
              <button className="btn-primary" onClick={openCreate}>
                <Plus size={14} />
                Create Category
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Category</th>
                  <th>Slug</th>
                  <th>Subcategories</th>
                  <th>Templates</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((cat, idx) => (
                  <tr key={cat.id}>
                    <td>
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveOrder(cat.id, "up")}
                          disabled={idx === 0}
                          className="p-0.5 rounded hover:bg-surface disabled:opacity-30 transition-opacity"
                        >
                          <ChevronUp size={13} style={{ color: "var(--text-muted)" }} />
                        </button>
                        <span className="text-center text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                          {cat.displayOrder}
                        </span>
                        <button
                          onClick={() => moveOrder(cat.id, "down")}
                          disabled={idx === sorted.length - 1}
                          className="p-0.5 rounded hover:bg-surface disabled:opacity-30 transition-opacity"
                        >
                          <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                          style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                        >
                          {cat.icon[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            {cat.name}
                          </p>
                          {cat.description && (
                            <p className="text-xs truncate max-w-xs" style={{ color: "var(--text-muted)" }}>
                              {cat.description.slice(0, 60)}…
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}>
                        {cat.slug}
                      </code>
                    </td>
                    <td>
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {cat.subcategoryCount ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {cat.templateCount ?? 0}
                      </span>
                    </td>
                    <td>
                      <Badge variant={cat.isActive ? "active" : "inactive"}>
                        {cat.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {formatDate(cat.createdAt)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-1.5 rounded-md transition-all hover:opacity-70"
                          title="Edit"
                          id={`edit-cat-${cat.id}`}
                        >
                          <Edit2 size={14} style={{ color: "var(--text-muted)" }} />
                        </button>
                        <button
                          onClick={() => setConfirmDeactivate(cat)}
                          className="p-1.5 rounded-md transition-all hover:opacity-70"
                          title={cat.isActive ? "Deactivate" : "Activate"}
                          id={`toggle-cat-${cat.id}`}
                        >
                          <Power size={14} style={{ color: cat.isActive ? "var(--destructive)" : "var(--success)" }} />
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

      {/* Create/Edit Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 dialog-overlay" onClick={() => setDialogOpen(false)} />
          <div
            className="relative card w-full max-w-xl p-0 z-10 animate-fade-in flex flex-col max-h-[90vh]"
            style={{ boxShadow: "var(--shadow-xl)" }}
          >
            {/* Dialog Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <div>
                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  {editTarget ? "Edit Category" : "Create Category"}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {editTarget ? `Editing "${editTarget.name}"` : "Add a new invitation category to the platform"}
                </p>
              </div>
              <button onClick={() => setDialogOpen(false)} className="p-1.5 rounded-md hover:opacity-70 transition-opacity">
                <X size={16} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            {/* Dialog Body */}
            <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto">
              <div className="px-6 py-5 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
                    Category Name *
                  </label>
                  <input {...register("name")} className="form-input" placeholder="e.g. Wedding, Birthday…" id="cat-name-input" />
                  {errors.name && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{errors.name.message}</p>}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
                    Slug *
                  </label>
                  <input {...register("slug")} className="form-input font-mono text-sm" placeholder="auto-generated-from-name" />
                  {errors.slug && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{errors.slug.message}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    className="form-input resize-none"
                    rows={2}
                    placeholder="Brief description of this category…"
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
                    Icon *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setValue("icon", icon)}
                        className="w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-all"
                        style={
                          selectedIcon === icon
                            ? { background: "var(--accent)", color: "white" }
                            : { background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }
                        }
                        title={icon}
                      >
                        {icon[0]}
                      </button>
                    ))}
                  </div>
                  {errors.icon && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{errors.icon.message}</p>}
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
                    Cover Image URL <span style={{ color: "var(--text-muted)" }}>(optional)</span>
                  </label>
                  <input {...register("coverImage")} className="form-input" placeholder="https://…" />
                  {errors.coverImage && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{errors.coverImage.message}</p>}
                </div>

                {/* Order & Status Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
                      Display Order
                    </label>
                    <input {...register("displayOrder")} type="number" min={0} className="form-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
                      Status
                    </label>
                    <div className="flex items-center gap-3 h-9">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="true" checked={watch("isActive") === true} onChange={() => setValue("isActive", true)} className="accent-amber-600" />
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Active</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="false" checked={watch("isActive") === false} onChange={() => setValue("isActive", false)} className="accent-amber-600" />
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Inactive</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dialog Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <button type="button" className="btn-ghost" onClick={() => setDialogOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting} id="save-category-btn">
                  {isSubmitting ? "Saving…" : editTarget ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Toggle Status */}
      <ConfirmDialog
        open={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={handleToggleStatus}
        title={confirmDeactivate?.isActive ? "Deactivate Category" : "Activate Category"}
        description={
          confirmDeactivate?.isActive
            ? `Deactivating "${confirmDeactivate?.name}" will hide it from template and event creation. Existing events will not be affected.`
            : `Activating "${confirmDeactivate?.name}" will make it available for template and event creation again.`
        }
        confirmLabel={confirmDeactivate?.isActive ? "Deactivate" : "Activate"}
        variant={confirmDeactivate?.isActive ? "danger" : "default"}
      />
    </div>
  );
}
