"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Modal } from "../ui/Modal";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { StatusBadge } from "../ui/StatusBadge";

interface ProductResult {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: { url: string; alt: string | null }[];
  variants: { id: string; price: number; stock: number; sku: string }[];
}

export function SearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchProducts = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, searchProducts]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="TACTICAL GEAR SEARCH"
      description="Instant equipment lookup across the field catalog."
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-[#737373] pointer-events-none" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product name, SKU, or keyword..."
            className="w-full rounded-xl border border-[#292929] bg-[#0E0E0E] pl-11 pr-10 py-3.5 text-sm text-[#F5F5F5] placeholder-[#525252] focus:outline-none focus:border-[#D6FF3F] focus:ring-1 focus:ring-[#D6FF3F] font-sans"
          />
          {loading && (
            <Loader2 className="absolute right-4 w-4 h-4 text-[#D6FF3F] animate-spin" />
          )}
        </div>

        {/* Results Container */}
        <div className="min-h-[260px] max-h-[420px] overflow-y-auto divide-y divide-[#262626] pr-1">
          {query.trim() === "" ? (
            <div className="py-8 text-center">
              <p className="text-xs font-mono uppercase tracking-wider text-[#737373]">
                Popular Search Terms
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {["Backpack", "Plate Carrier", "Holster", "Tactical Boots", "EDC Knife", "Tactical Belt"].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="text-xs font-mono px-3 py-1.5 rounded-lg border border-[#292929] bg-[#171717] text-[#A3A3A3] hover:text-[#D6FF3F] hover:border-[#D6FF3F]/40 transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="py-12 text-center text-xs font-mono text-[#737373] uppercase">
              No tactical gear found matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((product) => {
              const image = product.images?.[0];
              const variant = product.variants?.[0];

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 py-3.5 px-2 hover:bg-white/[0.03] rounded-xl transition-colors group"
                >
                  <div className="w-14 h-14 rounded-lg bg-[#171717] border border-[#292929] overflow-hidden shrink-0">
                    {image?.url ? (
                      <img
                        src={image.url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] font-mono text-[#525252]">
                        NO IMAGE
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#F5F5F5] group-hover:text-[#D6FF3F] transition-colors truncate uppercase">
                      {product.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-mono font-bold text-[#F5F5F5]">
                        PKR {Number(variant?.price || 0).toLocaleString()}
                      </span>
                      {variant && (
                        <StatusBadge
                          status={String(variant.stock)}
                          type="stock"
                          className="scale-90"
                        />
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#525252] group-hover:text-[#D6FF3F] group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
