"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Crosshair,
  RotateCcw,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  featured: boolean;
  category?: { name: string; slug: string } | null;
  variants: {
    id: string;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    sku: string;
  }[];
  images: {
    id: string;
    url: string;
    alt: string | null;
  }[];
};

function ShopCatalog() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedSort, setSelectedSort] = useState(searchParams.get("sort") || "newest");
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("inStock") === "true");
  const [priceRange, setPriceRange] = useState<number>(100000);

  // Mobile Filter Drawer
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Load Categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/categories");
        if (res.ok) {
          const data = await res.json();
          if (data.categories) setCategories(data.categories);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Fetch Products based on filters
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
        if (selectedSort) params.set("sort", selectedSort);
        if (inStockOnly) params.set("inStock", "true");

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedSort, inStockOnly]);

  // Client price filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const price = p.variants?.[0]?.price ?? 0;
      return price <= priceRange;
    });
  }, [products, priceRange]);

  function resetFilters() {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSort("newest");
    setInStockOnly(false);
    setPriceRange(100000);
    router.push("/shop");
  }

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "all" ||
    inStockOnly ||
    selectedSort !== "newest";

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] pb-24">
      {/* Header Banner */}
      <section className="border-b border-[#262626] bg-[#0E0E0E] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#D6FF3F] uppercase mb-2">
            <Crosshair className="w-3.5 h-3.5" />
            <span>OPERATIONAL CATALOG</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#F5F5F5]">
            EQUIPMENT STORE
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#A3A3A3] max-w-2xl font-mono">
            Mission-ready gear, modular tactical carriers, rugged packs, and precision field accessories.
          </p>
        </div>
      </section>

      {/* Main Catalog Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Mobile Filter & Sort Bar (Sticky) */}
        <div className="lg:hidden sticky top-[72px] z-30 mb-6 py-2.5 px-4 rounded-xl border border-[#292929] bg-[#141414]/95 backdrop-blur-md flex items-center justify-between shadow-lg">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-[#F5F5F5]"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#D6FF3F]" />
            <span>FILTERS {hasActiveFilters && "•"}</span>
          </button>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#737373]" />
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-transparent text-xs font-mono uppercase text-[#F5F5F5] focus:outline-none"
            >
              <option value="newest" className="bg-[#141414]">Newest</option>
              <option value="price-asc" className="bg-[#141414]">Price: Low</option>
              <option value="price-desc" className="bg-[#141414]">Price: High</option>
              <option value="title" className="bg-[#141414]">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* 2-Column Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-7 pr-4">
            {/* Search Input */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] block mb-2 font-semibold">
                SEARCH
              </label>
              <div className="relative">
                <Search className="absolute left-3 w-3.5 h-3.5 text-[#737373] top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter gear..."
                  className="w-full rounded-xl border border-[#262626] bg-[#111111] pl-9 pr-8 py-2.5 text-xs text-[#F5F5F5] placeholder-[#525252] focus:outline-none focus:border-[#D6FF3F]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#F5F5F5]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] block mb-2.5 font-semibold">
                CATEGORIES
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono uppercase transition-colors flex items-center justify-between ${
                    selectedCategory === "all"
                      ? "bg-[#D6FF3F]/15 text-[#D6FF3F] font-bold border border-[#D6FF3F]/30"
                      : "text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-white/[0.04]"
                  }`}
                >
                  <span>ALL EQUIPMENT</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono uppercase transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? "bg-[#D6FF3F]/15 text-[#D6FF3F] font-bold border border-[#D6FF3F]/30"
                        : "text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-white/[0.04]"
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Availability */}
            <div className="pt-5 border-t border-[#222222]">
              <label className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] block mb-3 font-semibold">
                AVAILABILITY
              </label>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#111111] border-[#292929] text-[#D6FF3F] accent-[#D6FF3F] focus:ring-0"
                />
                <span className="text-xs font-mono text-[#A3A3A3] hover:text-[#F5F5F5]">
                  In Stock Only
                </span>
              </label>
            </div>

            {/* Price Filter */}
            <div className="pt-5 border-t border-[#222222]">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-[#A3A3A3] uppercase font-semibold">MAX PRICE</span>
                <span className="text-[#F5F5F5] font-bold">
                  PKR {priceRange.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={100000}
                step={1000}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#D6FF3F] cursor-pointer"
              />
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <div className="pt-2">
                <button
                  onClick={resetFilters}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#292929] text-xs font-mono uppercase text-[#737373] hover:text-red-400 hover:border-red-500/30 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET FILTERS</span>
                </button>
              </div>
            )}
          </aside>

          {/* Product Grid Area */}
          <div>
            {/* Top Toolbar (Sort & Count) */}
            <div className="hidden lg:flex items-center justify-between pb-6 border-b border-[#222222] mb-8">
              <span className="text-xs font-mono text-[#737373] uppercase">
                SHOWING <strong className="text-[#F5F5F5]">{filteredProducts.length}</strong> PRODUCTS
              </span>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#737373] uppercase">SORT BY:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="rounded-xl border border-[#262626] bg-[#111111] px-3.5 py-2 text-xs font-mono uppercase text-[#F5F5F5] focus:outline-none focus:border-[#D6FF3F]"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Active Filter Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-[11px] font-mono text-[#737373] uppercase mr-1">
                  ACTIVE:
                </span>
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1D1D1D] border border-[#292929] text-xs font-mono text-[#F5F5F5]">
                    Category: {selectedCategory}
                    <button onClick={() => setSelectedCategory("all")}>
                      <X className="w-3 h-3 text-[#737373] hover:text-white" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1D1D1D] border border-[#292929] text-xs font-mono text-[#F5F5F5]">
                    &ldquo;{searchQuery}&rdquo;
                    <button onClick={() => setSearchQuery("")}>
                      <X className="w-3 h-3 text-[#737373] hover:text-white" />
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1D1D1D] border border-[#292929] text-xs font-mono text-[#F5F5F5]">
                    In Stock
                    <button onClick={() => setInStockOnly(false)}>
                      <X className="w-3 h-3 text-[#737373] hover:text-white" />
                    </button>
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="text-xs font-mono text-[#D6FF3F] hover:underline ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Product Grid or Skeletons or Empty State */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                icon={<Crosshair className="w-6 h-6" />}
                title="NO EQUIPMENT MATCHED"
                description="We couldn't find gear matching your current filter specifications. Try adjusting your search query or reset your filters."
                actionText="RESET ALL FILTERS"
                onAction={resetFilters}
                className="my-12"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="FILTER EQUIPMENT"
        position="left"
        maxWidth="sm"
      >
        <div className="space-y-6 flex flex-col justify-between h-full">
          <div className="space-y-6">
            {/* Search */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] block mb-2 font-semibold">
                SEARCH
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-xl border border-[#262626] bg-[#111111] px-4 py-3 text-xs text-[#F5F5F5] placeholder-[#525252] focus:outline-none"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] block mb-2 font-semibold">
                CATEGORIES
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono uppercase ${
                    selectedCategory === "all" ? "bg-[#D6FF3F]/20 text-[#D6FF3F] font-bold" : "text-[#A3A3A3]"
                  }`}
                >
                  ALL EQUIPMENT
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono uppercase ${
                      selectedCategory === c.slug ? "bg-[#D6FF3F]/20 text-[#D6FF3F] font-bold" : "text-[#A3A3A3]"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="pt-4 border-t border-[#262626]">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#D6FF3F]"
                />
                <span className="text-xs font-mono text-[#F5F5F5]">In Stock Only</span>
              </label>
            </div>

            {/* Price */}
            <div className="pt-4 border-t border-[#262626]">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-[#A3A3A3]">MAX PRICE</span>
                <span className="text-[#F5F5F5] font-bold">PKR {priceRange.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={1000}
                max={100000}
                step={1000}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#D6FF3F]"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-[#262626] flex gap-3">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={resetFilters}
            >
              RESET
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={() => setIsFilterDrawerOpen(false)}
            >
              APPLY
            </Button>
          </div>
        </div>
      </Drawer>
    </main>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
        <ShopCatalog />
      </Suspense>
      <Footer />
    </div>
  );
}