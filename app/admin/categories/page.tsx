"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import {
  Plus,
  Search,
  FolderOpen,
  Trash2,
  Edit2,
  Tag,
  Loader2,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .trim();
}

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: "", slug: "" });

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories ?? data ?? []);
    } catch {
      toast({ title: "Error", description: "Failed to load categories", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void loadCategories();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loadCategories]);

  function openCreate() {
    setForm({ name: "", slug: "" });
    setCreateOpen(true);
  }

  function openEdit(cat: Category) {
    setForm({ name: cat.name, slug: cat.slug });
    setEditTarget(cat);
  }

  function handleNameChange(name: string) {
    setForm((f) => ({ name, slug: slugify(name) }));
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const isEdit = !!editTarget;
      const res = await fetch(
        isEdit ? `/api/admin/categories/${editTarget!.id}` : "/api/admin/categories",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error();
      toast({ title: isEdit ? "Category updated" : "Category created", variant: "success" });
      setCreateOpen(false);
      setEditTarget(null);
      void loadCategories();
    } catch {
      toast({ title: "Error", description: "Failed to save category", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" });
      toast({ title: "Category deleted", variant: "success" });
      setDeleteTarget(null);
      void loadCategories();
    } catch {
      toast({ title: "Error", description: "Failed to delete category", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono text-[#737373] uppercase tracking-widest mb-1">
            Catalog
          </p>
          <h1 className="text-2xl font-bold text-[#F5F5F5] tracking-tight">
            Categories
          </h1>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus size={15} />
          New Category
        </Button>
      </div>

      {/* Search + Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories…"
            className="w-full pl-9 pr-4 py-2.5 bg-[#1D1D1D] border border-[#292929] rounded-lg text-sm text-[#F5F5F5] placeholder-[#4A4A4A] focus:outline-none focus:border-[#404040] transition-colors"
          />
        </div>
        <div className="px-3 py-2 rounded-lg border border-[#292929] bg-[#111111] text-xs font-mono text-[#737373]">
          {categories.length} total
        </div>
      </div>

      {/* Categories Table */}
      <div className="rounded-xl border border-[#292929] bg-[#111111] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#737373]" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FolderOpen size={32} className="text-[#737373]" />}
            title="No categories found"
            description="Create your first category to start organizing products."
            action={{ label: "Create Category", onClick: openCreate }}
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#292929]">
                <th className="px-4 py-3 text-left text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373]">Name</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373] hidden sm:table-cell">Slug</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373] hidden md:table-cell">Products</th>
                <th className="px-4 py-3 text-right text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D1D1D]">
              {filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#171717] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <FolderOpen size={14} className="text-[#D6FF3F] shrink-0" />
                      <span className="font-medium text-[#F5F5F5]">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="font-mono text-xs text-[#737373]">/{cat.slug}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1D1D1D] border border-[#292929] text-xs font-mono text-[#A3A3A3]">
                      <Tag size={10} />
                      {cat._count?.products ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 rounded-md text-[#737373] hover:text-[#D6FF3F] hover:bg-[#D6FF3F]/10 transition-all"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="p-1.5 rounded-md text-[#737373] hover:text-red-400 hover:bg-red-400/10 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={createOpen || !!editTarget}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
        title={editTarget ? "Edit Category" : "New Category"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-widest text-[#737373] mb-2">
              Category Name
            </label>
            <input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Tactical Bags"
              className="w-full px-4 py-2.5 bg-[#1D1D1D] border border-[#292929] rounded-lg text-sm text-[#F5F5F5] placeholder-[#4A4A4A] focus:outline-none focus:border-[#D6FF3F]/50 focus:ring-1 focus:ring-[#D6FF3F]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-widest text-[#737373] mb-2">
              URL Slug
            </label>
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
              placeholder="tactical-bags"
              className="w-full px-4 py-2.5 bg-[#1D1D1D] border border-[#292929] rounded-lg text-sm font-mono text-[#A3A3A3] placeholder-[#4A4A4A] focus:outline-none focus:border-[#D6FF3F]/50 transition-all"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => { setCreateOpen(false); setEditTarget(null); }}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} loading={saving}>
              {editTarget ? "Update" : "Create"} Category
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Category"
      >
        <p className="text-sm text-[#A3A3A3] mb-5">
          Are you sure you want to delete{" "}
          <strong className="text-[#F5F5F5]">{deleteTarget?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete} loading={saving}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}