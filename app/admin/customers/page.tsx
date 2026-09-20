"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import {
  Users,
  Search,
  Mail,
  ShoppingBag,
  Calendar,
  TrendingUp,
  Loader2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

type Customer = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  _count?: { orders: number };
  totalSpend?: number;
};

export default function AdminCustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      setCustomers(data.customers ?? data ?? []);
    } catch {
      toast({ title: "Error", description: "Failed to load customers", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void loadCustomers();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loadCustomers]);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.name ?? "").toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatCurrency(amount: number) {
    return `PKR ${amount.toLocaleString()}`;
  }

  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-[10px] font-mono text-[#737373] uppercase tracking-widest mb-1">Sales</p>
        <h1 className="text-2xl font-bold text-[#F5F5F5] tracking-tight">Customers</h1>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Customers", value: customers.length, icon: Users },
          { label: "Active This Month", value: "—", icon: TrendingUp },
          { label: "Avg Orders", value: customers.length ? (customers.reduce((s, c) => s + (c._count?.orders ?? 0), 0) / customers.length).toFixed(1) : "0", icon: ShoppingBag },
          { label: "New This Month", value: customers.filter(c => new Date(c.createdAt) > monthAgo).length, icon: Calendar },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-[#292929] bg-[#111111] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-[#737373]" />
              <p className="text-[10px] font-mono text-[#737373] uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-xl font-bold text-[#F5F5F5]">{value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-4 py-2.5 bg-[#1D1D1D] border border-[#292929] rounded-lg text-sm text-[#F5F5F5] placeholder-[#4A4A4A] focus:outline-none focus:border-[#404040] transition-colors"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#292929] bg-[#111111] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#737373]" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={32} className="text-[#737373]" />}
            title="No customers found"
            description="Customers will appear here once they create accounts."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#292929]">
                  <th className="px-4 py-3 text-left text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373]">Customer</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373] hidden sm:table-cell">Joined</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373] hidden md:table-cell">Orders</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373] hidden lg:table-cell">Total Spend</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D1D1D]">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#171717] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1D1D1D] border border-[#292929] flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-[#A3A3A3]">
                            {(customer.name ?? customer.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[#F5F5F5]">
                            {customer.name ?? "Anonymous"}
                          </p>
                          <p className="text-xs text-[#737373] font-mono flex items-center gap-1">
                            <Mail size={10} />
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-xs text-[#737373] font-mono">
                        {formatDate(customer.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1D1D1D] border border-[#292929] text-xs font-mono text-[#A3A3A3]">
                        <ShoppingBag size={10} />
                        {customer._count?.orders ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-sm font-mono text-[#F5F5F5]">
                        {customer.totalSpend != null ? formatCurrency(customer.totalSpend) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}