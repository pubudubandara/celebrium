import type { Metadata } from "next";
import { Tag, FileImage, UserCheck, Calendar, Plus, Eye } from "lucide-react";
import Link from "next/link";
import { StatCard, Badge, SectionCard, PageHeader } from "@/components/ui/shared";
import { mockDashboardStats, mockEvents } from "@/lib/data/mock-data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Super Admin Dashboard",
};

export default function SuperAdminDashboardPage() {
  const recentEvents = mockEvents.slice(0, 3);

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Templates"
          value={mockDashboardStats.activeTemplates}
          icon={<FileImage size={20} />}
          description="Active templates"
        />
        <StatCard
          title="Owners"
          value={mockDashboardStats.totalOwners}
          icon={<UserCheck size={20} />}
          description="Total owners"
        />
        <StatCard
          title="Published Events"
          value={mockDashboardStats.publishedEvents}
          icon={<Calendar size={20} />}
          description="Total published"
        />
      </div>

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
    </div>
  );
}