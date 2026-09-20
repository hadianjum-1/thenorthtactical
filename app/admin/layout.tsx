import { ReactNode } from "react";
import Link from "next/link";
import { AdminSidebarClient } from "./AdminSidebarClient";
import { auth } from "@/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const isAdmin = !!session?.user && ["ADMIN", "STAFF"].includes(session.user.role as string);

  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-[#F5F5F5]">
      {/* Sidebar */}
      <AdminSidebarClient userName={session.user.name ?? session.user.email ?? "Admin"} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 ml-0 lg:ml-64">
        {/* Admin Header */}
        <header className="sticky top-0 z-30 border-b border-[#292929] bg-[#0A0A0A]/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 h-14">
            <div className="flex items-center gap-3">
              {/* Mobile menu handled by client component */}
              <span className="text-xs font-mono text-[#737373] uppercase tracking-widest hidden sm:block">
                Admin Console
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest bg-[#D6FF3F]/10 text-[#D6FF3F] border border-[#D6FF3F]/20"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D6FF3F] animate-pulse" />
                Live
              </span>
              <Link
                href="/"
                target="_blank"
                className="text-xs text-[#737373] hover:text-[#F5F5F5] transition-colors font-mono uppercase tracking-wider"
              >
                View Store ↗
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
