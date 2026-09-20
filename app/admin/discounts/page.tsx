"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import {
  Tag,
  Plus,
  Search,
  Trash2,
  Loader2,
  Percent,
  DollarSign,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

type Discount = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  active: boolean;
  expiresAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  createdAt: string;
};

function slugifyCode(str: string) {
  return str.toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9]/g, "");
}

export default function AdminDiscountsPage() {
  const { toast } = useToast();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    value: "",
    active: true,
    expiresAt: "",
    usageLimit: "",
  });

  const loadDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/discounts");
      const data = await res.json();
      setDiscounts(data.discounts ?? data ?? []);
    } catch {
      toast({ title: "Error", description: "Failed to load discounts", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void loadDiscounts();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loadDiscounts]);

  async function handleCreate() {
    if (!form.code || !form.value) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        code: form.code,
        type: form.type,
        value: parseFloat(form.value),
        active: form.active,
      };
      if (form.expiresAt) body.expiresAt = form.expiresAt;
      if (form.usageLimit) body.usageLimit = parseInt(form.usageLimit);

      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Discount created", variant: "success" });
      setCreateOpen(false);
      setForm({ code: "", type: "PERCENTAGE", value: "", active: true, expiresAt: "", usageLimit: "" });
      void loadDiscounts();
    } catch {
      toast({ title: "Error", description: "Failed to create discount", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(discount: Discount) {
    try {
      await fetch(`/api/admin/discounts/${discount.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !discount.active }),
      });
      void loadDiscounts();
    } catch {
      toast({ title: "Error", description: "Failed to update discount", variant: "error" });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/discounts/${deleteTarget.id}`, { method: "DELETE" });
      toast({ title: "Discount deleted", variant: "success" });
      setDeleteTarget(null);
      void loadDiscounts();
    } catch {
      toast({ title: "Error", description: "Failed to delete discount", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  const filtered = discounts.filter((d) =>
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  function formatValue(d: Discount) {
    return d.type === "PERCENTAGE" ? `${d.value}%` : `PKR ${d.value.toLocaleString()}`;
  }

  function formatDate(str: string | null) {
    if (!str) return "—";
    return new Date(str).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono text-[#737373] uppercase tracking-widest mb-1">Sales</p>
          <h1 className="text-2xl font-bold text-[#F5F5F5] tracking-tight">Discounts</h1>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={15} />
          New Coupon
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search coupon codes…"
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
            icon={<Tag size={32} className="text-[#737373]" />}
            title="No discount codes"
            description="Create your first coupon to offer promotions."
            action={{ label: "Create Coupon", onClick: () => setCreateOpen(true) }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#292929]">
                  <th className="px-4 py-3 text-left text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373]">Code</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373] hidden sm:table-cell">Type</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373]">Value</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373] hidden md:table-cell">Expires</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373] hidden md:table-cell">Used</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373]">Status</th>
                  <th className="px-4 py-3 text-right text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D1D1D]">
                {filtered.map((discount) => (
                  <tr key={discount.id} className="hover:bg-[#171717] transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-[#D6FF3F] tracking-widest text-sm">
                        {discount.code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1D1D1D] border border-[#292929] text-xs font-mono text-[#A3A3A3]">
                        {discount.type === "PERCENTAGE" ? <Percent size={10} /> : <DollarSign size={10} />}
                        {discount.type === "PERCENTAGE" ? "Percent" : "Fixed"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-sm text-[#F5F5F5]">{formatValue(discount)}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-[#737373] font-mono">{formatDate(discount.expiresAt)}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs font-mono text-[#A3A3A3]">
                        {discount.usedCount}/{discount.usageLimit ?? "∞"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => handleToggle(discount)} className="focus:outline-none">
                        {discount.active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
                            <ToggleRight size={12} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-[#1D1D1D] text-[#737373] border border-[#292929]">
                            <ToggleLeft size={12} />
                            Inactive
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => setDeleteTarget(discount)}
                          className="p-1.5 rounded-md text-[#737373] hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Coupon">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-widest text-[#737373] mb-2">Coupon Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm(f => ({ ...f, code: slugifyCode(e.target.value) }))}
              placeholder="TACTICAL20"
              className="w-full px-4 py-2.5 bg-[#1D1D1D] border border-[#292929] rounded-lg text-sm font-mono font-bold text-[#D6FF3F] placeholder-[#4A4A4A] focus:outline-none focus:border-[#D6FF3F]/50 transition-all uppercase tracking-widest"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-widest text-[#737373] mb-2">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm(f => ({ ...f, type: e.target.value as "PERCENTAGE" | "FIXED" }))}
                className="w-full px-3 py-2.5 bg-[#1D1D1D] border border-[#292929] rounded-lg text-sm text-[#F5F5F5] focus:outline-none focus:border-[#D6FF3F]/50 transition-all"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (PKR)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-widest text-[#737373] mb-2">
                Value {form.type === "PERCENTAGE" ? "(%)" : "(PKR)"}
              </label>
              <input
                type="number"
                min="0"
                value={form.value}
                onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder={form.type === "PERCENTAGE" ? "20" : "500"}
                className="w-full px-3 py-2.5 bg-[#1D1D1D] border border-[#292929] rounded-lg text-sm text-[#F5F5F5] placeholder-[#4A4A4A] focus:outline-none focus:border-[#D6FF3F]/50 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-widest text-[#737373] mb-2">Expiry Date</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#1D1D1D] border border-[#292929] rounded-lg text-sm text-[#F5F5F5] focus:outline-none focus:border-[#D6FF3F]/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-widest text-[#737373] mb-2">Usage Limit</label>
              <input
                type="number"
                min="0"
                value={form.usageLimit}
                onChange={(e) => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                placeholder="Unlimited"
                className="w-full px-3 py-2.5 bg-[#1D1D1D] border border-[#292929] rounded-lg text-sm text-[#F5F5F5] placeholder-[#4A4A4A] focus:outline-none focus:border-[#D6FF3F]/50 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 bg-[#1D1D1D] rounded-lg border border-[#292929]">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, active: !f.active }))}
              className="focus:outline-none"
            >
              {form.active ? <ToggleRight size={20} className="text-[#D6FF3F]" /> : <ToggleLeft size={20} className="text-[#737373]" />}
            </button>
            <span className="text-sm text-[#A3A3A3]">
              Coupon is <strong className="text-[#F5F5F5]">{form.active ? "active" : "inactive"}</strong>
            </span>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleCreate} loading={saving}>Create Coupon</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Coupon">
        <p className="text-sm text-[#A3A3A3] mb-5">
          Delete coupon <strong className="text-[#D6FF3F] font-mono">{deleteTarget?.code}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete} loading={saving}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}