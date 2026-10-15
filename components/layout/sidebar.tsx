"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Tag,
  Layers,
  FileImage,
  Users,
  Calendar,
  ClipboardList,
  Settings,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Sparkles,
  UserCheck,
  GalleryVerticalEnd,
  Mails,
} from "lucide-react";
import React from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const superAdminNav: NavItem[] = [
  { label: "Overview", href: "/super-admin/dashboard", icon: <LayoutDashboard size={17} /> },
  { label: "Categories", href: "/super-admin/categories", icon: <Tag size={17} /> },
  { label: "Subcategories", href: "/super-admin/subcategories", icon: <Layers size={17} /> },
  { label: "Templates", href: "/super-admin/templates", icon: <FileImage size={17} /> },
  { label: "Owners", href: "/super-admin/owners", icon: <UserCheck size={17} /> },
  { label: "Events", href: "/super-admin/events", icon: <Calendar size={17} /> },
  { label: "Audit Logs", href: "/super-admin/audit-logs", icon: <ClipboardList size={17} /> },
  { label: "Settings", href: "/super-admin/settings", icon: <Settings size={17} /> },
];

const ownerNav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: <LayoutDashboard size={17} /> },
  { label: "Guests", href: "/dashboard/guests", icon: <Users size={17} /> },
  { label: "Invitations", href: "/dashboard/invitations", icon: <Mails size={17} /> },
  { label: "Account Settings", href: "/dashboard/settings", icon: <Settings size={17} /> },
];

// ── Super Admin Sidebar ───────────────────────────────────────────────────────
export function SuperAdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [adminName, setAdminName] = React.useState("Super Admin");

  React.useEffect(() => {
    fetch("/api/auth/admin/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((user) => {
        if (user?.fullName) setAdminName(user.fullName);
      })
      .catch(() => {
        // Middleware still protects the route if the identity request fails.
      });
  }, []);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <Link href="/super-admin/dashboard" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent)" }}
          >
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Celebrium
            </span>
            <span
              className="block text-[10px] font-medium uppercase tracking-widest -mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Super Admin
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {superAdminNav.map((item) => {
          const isActive =
            item.href === "/super-admin/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-item", isActive && "active")}
              onClick={() => setMobileOpen(false)}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} style={{ color: "var(--accent)" }} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg" style={{ background: "var(--bg-surface)" }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: "var(--accent)", color: "white" }}
          >
            {adminName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {adminName}
            </p>
          </div>
          <button
              onClick={async () => {
                await fetch("/api/auth/admin/logout", {
                  method: "POST",
                  cache: "no-store",
                });
                localStorage.clear();
                sessionStorage.clear();
                window.location.replace("/super-admin/login");
              }}
              className="p-1.5 rounded-md transition-colors hover:opacity-70"
              title="Sign out"
            >
            <LogOut size={14} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar hidden lg:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-md)" }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 dialog-overlay"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="admin-sidebar lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col animate-slide-left">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}

// ── Owner Sidebar ─────────────────────────────────────────────────────────────
export function OwnerSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent)" }}
          >
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Celebrium
            </span>
            <span
              className="block text-[10px] font-medium uppercase tracking-widest -mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              My Dashboard
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {ownerNav.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-item", isActive && "active")}
              onClick={() => setMobileOpen(false)}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} style={{ color: "var(--accent)" }} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg" style={{ background: "var(--bg-surface)" }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: "var(--accent)", color: "white" }}
          >
            KP
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              Kasun Perera
            </p>
            <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
              kasun@gmail.com
            </p>
          </div>
          <Link
            href="/login"
            className="p-1.5 rounded-md transition-colors hover:opacity-70"
            title="Sign out"
          >
            <LogOut size={14} style={{ color: "var(--text-muted)" }} />
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="admin-sidebar hidden lg:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-md)" }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 dialog-overlay" onClick={() => setMobileOpen(false)} />
          <aside className="admin-sidebar lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col animate-slide-left">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}

// ── Breadcrumbs ───────────────────────────────────────────────────────────────
interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs mb-1" style={{ color: "var(--text-muted)" }}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight size={11} />}
          {item.href && index < items.length - 1 ? (
            <Link href={item.href} className="hover:underline transition-colors" style={{ color: "var(--text-secondary)" }}>
              {item.label}
            </Link>
          ) : (
            <span style={{ color: index === items.length - 1 ? "var(--text-primary)" : "var(--text-secondary)" }}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// ── Top Header Bar ────────────────────────────────────────────────────────────
interface AdminHeaderProps {
  title?: string;
  isSuperAdmin?: boolean;
}

export function AdminHeader({ title, isSuperAdmin = true }: AdminHeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between h-14 px-6 border-b lg:pl-6 pl-16"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h2 className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
            {title}
          </h2>
        )}
      </div>
      <div className="flex items-center gap-3">
        {isSuperAdmin && (
          <Link
            href="/dashboard"
            className="text-xs font-medium px-3 py-1.5 rounded-md transition-all"
            style={{ color: "var(--accent)", background: "var(--accent-light)" }}
          >
            Switch to Owner View
          </Link>
        )}
        {!isSuperAdmin && (
          <Link
            href="/super-admin/dashboard"
            className="text-xs font-medium px-3 py-1.5 rounded-md transition-all"
            style={{ color: "var(--accent)", background: "var(--accent-light)" }}
          >
            Admin Panel
          </Link>
        )}
      </div>
    </header>
  );
}
