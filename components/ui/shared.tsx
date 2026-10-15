"use client";

import { cn } from "@/lib/utils";
import React from "react";

// ── Badge ─────────────────────────────────────────────────────────────────────
interface BadgeProps {
  variant?: "active" | "inactive" | "published" | "draft" | "archived" | "gold" | "pending" | "viewed" | "revoked" | "owner" | "super_admin";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "active", children, className }: BadgeProps) {
  const variantClasses: Record<string, string> = {
    active:      "badge badge-active",
    inactive:    "badge badge-inactive",
    published:   "badge badge-published",
    draft:       "badge badge-draft",
    archived:    "badge badge-archived",
    gold:        "badge badge-gold",
    pending:     "badge",
    viewed:      "badge badge-active",
    revoked:     "badge",
    owner:       "badge badge-gold",
    super_admin: "bg-purple-50 text-purple-700 badge",
  };

  const extra: Record<string, string> = {
    pending:  "bg-amber-50 text-amber-700",
    revoked:  "bg-gray-100 text-gray-500 line-through",
  };

  return (
    <span className={cn(variantClasses[variant] ?? "badge", extra[variant] ?? "", className)}>
      {children}
    </span>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: { value: number; label: string };
  accentColor?: string;
}

export function StatCard({ title, value, icon, description, trend, accentColor }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              {description}
            </p>
          )}
          {trend && (
            <p className={cn("mt-2 text-xs font-medium", trend.value >= 0 ? "text-green-600" : "text-red-500")}>
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ml-3"
          style={{ background: accentColor ?? "var(--accent-light)", color: accentColor ? "white" : "var(--accent)" }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm max-w-sm" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn("skeleton h-4", i === lines - 1 ? "w-3/4" : "w-full", className)}
          />
        ))}
      </div>
    );
  }
  return <div className={cn("skeleton h-4 w-full", className)} />;
}

// ── Page Header ───────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
}

export function PageHeader({ title, description, actions, breadcrumb }: PageHeaderProps) {
  return (
    <div className="mb-6 animate-fade-in">
      {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}

// ── Search Bar ────────────────────────────────────────────────────────────────
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search…", className }: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
        style={{ color: "var(--text-muted)" }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input pl-9 h-9"
      />
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────
interface SectionCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function SectionCard({ title, description, children, className, actions }: SectionCardProps) {
  return (
    <div className={cn("card overflow-hidden", className)}>
      {(title || actions) && (
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div>
            {title && (
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {description}
              </p>
            )}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ className }: { className?: string }) {
  return (
    <hr
      className={cn("my-4", className)}
      style={{ borderColor: "var(--border-subtle)" }}
    />
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold flex-shrink-0",
        sizeClasses[size],
        className
      )}
      style={{ background: "var(--accent-light)", color: "var(--accent-dark)" }}
    >
      {initials}
    </div>
  );
}

// ── Confirmation Dialog ────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "warning" | "default";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmStyle = {
    danger: { background: "var(--destructive)", color: "white" },
    warning: { background: "var(--warning)", color: "white" },
    default: { background: "var(--accent)", color: "white" },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 dialog-overlay"
        onClick={onClose}
      />
      <div
        className="relative card max-w-md w-full p-6 z-10 animate-fade-in"
        style={{ boxShadow: "var(--shadow-xl)" }}
      >
        <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button className="btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn-primary"
            style={confirmStyle}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Copy Button ───────────────────────────────────────────────────────────────
interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = "Copy", className }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn("btn-ghost text-xs h-8 px-3 gap-1.5 flex items-center", className)}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

// ── Guest Link Display ────────────────────────────────────────────────────────
interface GuestLinkProps {
  url: string;
  guestName: string;
  eventSlug: string;
}

export function GuestLink({ url, guestName, eventSlug }: GuestLinkProps) {
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Hi ${guestName}! 🎉 You're cordially invited. Open your personalized invitation: ${url}`
  )}`;

  return (
    <div
      className="rounded-lg p-3 space-y-2"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex-1 min-w-0 font-mono text-xs px-2 py-1.5 rounded"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          title={url}
        >
          {url}
        </div>
        <CopyButton text={url} />
      </div>
      <div className="flex gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-xs h-8 px-3 flex items-center gap-1.5 flex-1 justify-center"
        >
          Preview
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs h-8 px-3 flex items-center gap-1.5 flex-1 justify-center rounded-md font-medium transition-all"
          style={{ background: "#25D366", color: "white" }}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.528 5.84L0 24l6.335-1.497A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.816 9.816 0 01-5.002-1.368l-.359-.214-3.723.879.918-3.634-.235-.374A9.797 9.797 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
          </svg>
          WhatsApp
        </a>
      </div>
    </div>
  );
}

// ── Loading Spinner ───────────────────────────────────────────────────────────
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <svg
      className={cn("animate-spin", sizeMap[size])}
      style={{ color: "var(--accent)" }}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
