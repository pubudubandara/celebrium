import { SuperAdminSidebar, AdminHeader } from "@/components/layout/sidebar";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader isSuperAdmin />
        <main className="flex-1 overflow-y-auto p-6 admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
