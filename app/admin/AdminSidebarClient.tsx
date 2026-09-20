"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingBag,
  Users,
  Tag,
  Star,
  Gift,
  Trophy,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Layers,
} from "lucide-react";

const NAV_GROUPS: Array<{
  label: string;
  items: Array<{
    href: string;
    label: string;
    icon: React.ElementType;
    exact?: boolean;
  }>;
}> = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderOpen },
      { href: "/admin/bundles", label: "Bundles", icon: Layers },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/discounts", label: "Discounts", icon: Tag },
    ],
  },
  {
    label: "Engagement",
    items: [
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/loyalty", label: "Loyalty", icon: Trophy },
    ],
  },
];

function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group ${
        isActive
          ? "bg-[#D6FF3F]/10 text-[#D6FF3F] border border-[#D6FF3F]/20"
          : "text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#1D1D1D]"
      }`}
    >
      <Icon
        size={16}
        className={`shrink-0 ${isActive ? "text-[#D6FF3F]" : "text-[#737373] group-hover:text-[#A3A3A3]"}`}
      />
      <span>{label}</span>
      {isActive && <ChevronRight size={12} className="ml-auto text-[#D6FF3F]" />}
    </Link>
  );
}

function SidebarContent({
  userName,
  onClose,
}: {
  userName: string;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#292929]">
        <Image
          src="/logo-png.png"
          alt="The North Tactical"
          width={32}
          height={32}
          className="object-contain"
        />
        <div>
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#F5F5F5]">
            The North Tactical
          </p>
          <p className="text-[10px] font-mono text-[#737373] uppercase tracking-widest">
            Admin Console
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1 text-[#737373] hover:text-[#F5F5F5] lg:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-[#737373]">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  exact={item.exact}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="border-t border-[#292929] p-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-[#D6FF3F]/10 border border-[#D6FF3F]/30 flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#D6FF3F]">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#F5F5F5] truncate">{userName}</p>
            <p className="text-[10px] text-[#737373] font-mono">ADMIN</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[#737373] hover:text-red-400 hover:bg-red-400/10 transition-all duration-150"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export function AdminSidebarClient({ userName }: { userName: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3.5 left-4 z-50 p-2 text-[#A3A3A3] hover:text-[#F5F5F5] lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-[#292929] bg-[#0D0D0D] z-40">
        <SidebarContent userName={userName} />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] flex flex-col border-r border-[#292929] bg-[#0D0D0D] h-full">
            <SidebarContent userName={userName} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
