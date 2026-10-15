import type { Metadata } from "next";
import {
  Tag,
  FileImage,
  UserCheck,
  Calendar,
  Users,
  Eye,
  Plus,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { StatCard, Badge, SectionCard, PageHeader } from "@/components/ui/shared";
import { mockDashboardStats, mockEvents, mockUsers, mockAuditLogs } from "@/lib/data/mock-data";
import { formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Super Admin Dashboard",
};

export default function SuperAdminDashboardPage() {
  const recentEvents = mockEvents.slice(0, 3);
  const recentOwners = mockUsers.filter((u) => u.role === "owner").slice(0, 3);
  const recentLogs = mockAuditLogs.slice(-5).reverse();

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Platform Overview"
        description="Welcome back, Alex. Here's what's happening on Celebrium today."
        actions={
          <Link href="/super-admin/owners/new" className="btn-primary">
            <Plus size={15} />
            Add Invitation Owner
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Categories"
          value={mockDashboardStats.totalCategories}
          icon={<Tag size={20} />}
          description="4 active, 1 inactive"
          trend={{ value: 25, label: "this month" }}
        />
        <StatCard
          title="Templates"
          value={mockDashboardStats.activeTemplates}
          icon={<FileImage size={20} />}
          description="3 published, 1 draft"
        />
        <StatCard
          title="Owners"
          value={mockDashboardStats.totalOwners}
          icon={<UserCheck size={20} />}
          description="2 active accounts"
          trend={{ value: 50, label: "this month" }}
        />
        <StatCard
          title="Published Events"
          value={mockDashboardStats.publishedEvents}
          icon={<Calendar size={20} />}
          description="Out of 3 total events"
        />
        <StatCard
          title="Total Guests"
          value={mockDashboardStats.totalGuests}
          icon={<Users size={20} />}
          description="Across all events"
          trend={{ value: 40, label: "this week" }}
        />
        <StatCard
          title="Viewed"
          value={mockDashboardStats.viewedInvitations}
          icon={<Eye size={20} />}
          description="Invitations opened"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <SectionCard
          title="Recent Events"
          description="Latest configured events"
          actions={
            <Link href="/super-admin/events" className="text-xs font-medium" style={{ color: "var(--accent)" }}>
              View all →
            </Link>
          }
        >
          <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-surface transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {event.title}
                  </p>
                  <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                    <span>{event.categoryName}</span>
                    <span>·</span>
                    <span>{formatDate(event.eventDate)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Badge variant={event.status}>{event.status}</Badge>
                  <Link href={`/super-admin/events`} className="p-1.5 rounded-md hover:opacity-70 transition-opacity">
                    <Eye size={14} style={{ color: "var(--text-muted)" }} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Recent Owners */}
        <SectionCard
          title="Invitation Owners"
          description="Recently created owner accounts"
          actions={
            <Link href="/super-admin/owners" className="text-xs font-medium" style={{ color: "var(--accent)" }}>
              View all →
            </Link>
          }
        >
          <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {recentOwners.map((owner) => (
              <div key={owner.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface transition-colors">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "var(--accent-light)", color: "var(--accent-dark)" }}
                >
                  {owner.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {owner.fullName}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {owner.email}
                  </p>
                </div>
                <Badge variant={owner.isActive ? "active" : "inactive"}>
                  {owner.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <SectionCard title="Quick Actions" description="Common platform tasks">
          <div className="p-4 space-y-2">
            {[
              { href: "/super-admin/categories", icon: <Tag size={15} />, label: "Manage Categories" },
              { href: "/super-admin/templates", icon: <FileImage size={15} />, label: "Manage Templates" },
              { href: "/super-admin/owners/new", icon: <UserCheck size={15} />, label: "Add New Owner" },
              { href: "/super-admin/events", icon: <Calendar size={15} />, label: "View All Events" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium"
                style={{ color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
              >
                <span style={{ color: "var(--accent)" }}>{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </SectionCard>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Recent Activity"
            description="Latest platform actions"
            actions={
              <Link href="/super-admin/audit-logs" className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                Full log →
              </Link>
            }
          >
            <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 px-5 py-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "var(--accent-light)" }}
                  >
                    <Clock size={12} style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: "var(--text-primary)" }}>
                      <span className="font-semibold">{log.userName}</span>{" "}
                      <span className="capitalize">{log.action}d</span>{" "}
                      <span className="font-medium">{log.resourceName ?? log.resource}</span>
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {formatDateTime(log.createdAt)}
                    </p>
                  </div>
                  <Badge variant={log.resource as "category"} className="text-[10px] capitalize">
                    {log.resource}
                  </Badge>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Mock Data Notice */}
      <div
        className="rounded-lg px-4 py-3 text-xs flex items-start gap-2"
        style={{ background: "var(--info-light)", color: "var(--info)", border: "1px solid #BFDBFE" }}
      >
        <TrendingUp size={14} className="flex-shrink-0 mt-0.5" />
        <span>
          <strong>Demo Mode:</strong> All data shown here is sample data from the mock repository.
          Statistics and activity logs are not persisted. Connect MongoDB to enable live data.
        </span>
      </div>
    </div>
  );
}
