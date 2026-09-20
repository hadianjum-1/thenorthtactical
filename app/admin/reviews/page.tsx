"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import {
  Star,
  StarHalf,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  Package,
  Filter,
} from "lucide-react";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  approved: boolean;
  createdAt: string;
  product: { title: string; slug: string };
  user?: { name: string | null; email: string } | null;
};

type TabFilter = "all" | "pending" | "approved";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? "text-[#D6FF3F] fill-[#D6FF3F]" : "text-[#292929] fill-[#292929]"}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      setReviews(data.reviews ?? data ?? []);
    } catch {
      toast({ title: "Error", description: "Failed to load reviews", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void loadReviews();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loadReviews]);

  async function handleApprove(id: string) {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
      toast({ title: "Review approved", variant: "success" });
      void loadReviews();
    } catch {
      toast({ title: "Error", description: "Failed to approve review", variant: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: string) {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: false }),
      });
      toast({ title: "Review rejected", variant: "success" });
      void loadReviews();
    } catch {
      toast({ title: "Error", description: "Failed to reject review", variant: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id);
    try {
      await fetch(`/api/admin/reviews/${deleteTarget.id}`, { method: "DELETE" });
      toast({ title: "Review deleted", variant: "success" });
      setDeleteTarget(null);
      void loadReviews();
    } catch {
      toast({ title: "Error", description: "Failed to delete review", variant: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = reviews.filter((r) => {
    if (tab === "pending" && r.approved) return false;
    if (tab === "approved" && !r.approved) return false;
    const q = search.toLowerCase();
    return (
      r.product.title.toLowerCase().includes(q) ||
      (r.body ?? "").toLowerCase().includes(q) ||
      (r.user?.email ?? "").toLowerCase().includes(q)
    );
  });

  const pendingCount = reviews.filter((r) => !r.approved).length;

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const TABS: { key: TabFilter; label: string }[] = [
    { key: "all", label: `All (${reviews.length})` },
    { key: "pending", label: `Pending (${pendingCount})` },
    { key: "approved", label: `Approved (${reviews.length - pendingCount})` },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-mono text-[#737373] uppercase tracking-widest mb-1">Engagement</p>
        <h1 className="text-2xl font-bold text-[#F5F5F5] tracking-tight">Reviews</h1>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1 p-1 bg-[#111111] rounded-lg border border-[#292929]">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                tab === key
                  ? "bg-[#D6FF3F] text-[#0A0A0A]"
                  : "text-[#737373] hover:text-[#F5F5F5]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews…"
            className="pl-9 pr-4 py-2 bg-[#1D1D1D] border border-[#292929] rounded-lg text-sm text-[#F5F5F5] placeholder-[#4A4A4A] focus:outline-none focus:border-[#404040] transition-colors"
          />
        </div>
      </div>

      {/* Review Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#737373]" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Star size={32} className="text-[#737373]" />}
          title="No reviews found"
          description={tab === "pending" ? "All reviews have been moderated." : "No reviews yet."}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <div
              key={review.id}
              className={`rounded-xl border ${review.approved ? "border-[#292929]" : "border-yellow-500/20"} bg-[#111111] p-4`}
            >
              <div className="flex items-start gap-4">
                {/* Left: Rating + meta */}
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#1D1D1D] border border-[#292929] flex items-center justify-center">
                    <span className="text-sm font-bold text-[#A3A3A3]">
                      {(review.user?.name ?? review.user?.email ?? "A").charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Center: Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <StarRating rating={review.rating} />
                    <span className="text-xs font-mono text-[#737373]">
                      {formatDate(review.createdAt)}
                    </span>
                    {!review.approved && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        Pending
                      </span>
                    )}
                    {review.approved && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
                        Approved
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mb-2">
                    <Package size={12} className="text-[#D6FF3F] shrink-0" />
                    <span className="text-xs font-medium text-[#D6FF3F]">{review.product.title}</span>
                  </div>

                  {review.title && (
                    <p className="font-semibold text-sm text-[#F5F5F5] mb-1">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="text-sm text-[#A3A3A3] leading-relaxed line-clamp-3">{review.body}</p>
                  )}
                  <p className="text-xs text-[#737373] mt-2 font-mono">
                    by {review.user?.name ?? review.user?.email ?? "Anonymous"}
                  </p>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {!review.approved && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={actionLoading === review.id}
                      className="p-1.5 rounded-md text-[#737373] hover:text-green-400 hover:bg-green-400/10 transition-all"
                      title="Approve"
                    >
                      {actionLoading === review.id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <CheckCircle size={15} />
                      )}
                    </button>
                  )}
                  {review.approved && (
                    <button
                      onClick={() => handleReject(review.id)}
                      disabled={actionLoading === review.id}
                      className="p-1.5 rounded-md text-[#737373] hover:text-yellow-400 hover:bg-yellow-400/10 transition-all"
                      title="Revoke Approval"
                    >
                      <XCircle size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteTarget(review)}
                    className="p-1.5 rounded-md text-[#737373] hover:text-red-400 hover:bg-red-400/10 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Review"
      >
        <p className="text-sm text-[#A3A3A3] mb-5">
          Are you sure you want to permanently delete this review? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete} loading={actionLoading === deleteTarget?.id}>
            Delete Review
          </Button>
        </div>
      </Modal>
    </div>
  );
}