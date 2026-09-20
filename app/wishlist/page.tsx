"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/components/cart/CartContext";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

type WishlistItem = {
  id: string;
  variantId: string;
  variant: {
    id: string;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    sku: string;
    product: {
      id: string;
      title: string;
      slug: string;
      category?: { name: string } | null;
      images: { url: string; alt: string | null }[];
    };
  };
};

export default function WishlistPage() {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthenticated, setUnauthenticated] = useState(false);

  const loadWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.status === 401) {
        setUnauthenticated(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setItems(data?.items || []);
      }
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void loadWishlist();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loadWishlist]);

  async function removeItem(variantId: string) {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.variantId !== variantId));
        toast("Removed from wishlist", "info");
      }
    } catch {
      toast("Failed to update wishlist", "error");
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-[#262626] bg-[#0E0E0E] py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F5F5]">
              SAVED LOADOUT (WISHLIST)
            </h1>
            <p className="mt-2 text-xs font-mono text-[#737373] uppercase">
              Field gear pinned for subsequent mission deployment.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="py-20 text-center text-xs font-mono text-[#737373] uppercase animate-pulse">
              RETRIEVING SAVED LOADOUT INVENTORY...
            </div>
          ) : unauthenticated ? (
            <EmptyState
              icon={<Heart className="w-8 h-8 text-[#525252]" />}
              title="OPERATOR LOGIN REQUIRED"
              description="Sign in to your customer account to view and synchronize your saved equipment wishlist across devices."
              actionText="SIGN IN / ACCESS ACCOUNT"
              actionHref="/account"
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Heart className="w-8 h-8 text-[#525252]" />}
              title="YOUR WISHLIST IS EMPTY"
              description="Save products you want to monitor, compare, or arm your kit with at a later date."
              actionText="EXPLORE PRODUCTS"
              actionHref="/shop"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => {
                const product = item.variant.product;
                const image = product.images?.[0];
                const isOutOfStock = item.variant.stock <= 0;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#262626] bg-[#141414] overflow-hidden flex flex-col justify-between hover:border-[#404040] transition-colors group"
                  >
                    {/* Media */}
                    <div className="relative aspect-square bg-[#1A1A1A] overflow-hidden">
                      <Link href={`/products/${product.slug}`} className="block w-full h-full">
                        {image?.url ? (
                          <img
                            src={image.url}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-mono text-[#525252]">
                            NO IMAGE
                          </div>
                        )}
                      </Link>

                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 border border-white/10 text-red-400 hover:bg-black/90 transition-colors"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                      <div>
                        {product.category && (
                          <span className="text-[10px] font-mono uppercase text-[#737373] tracking-widest block mb-1">
                            {product.category.name}
                          </span>
                        )}
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="text-sm font-semibold uppercase text-[#F5F5F5] hover:text-[#D6FF3F] transition-colors truncate">
                            {product.title}
                          </h3>
                        </Link>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-mono font-bold text-[#F5F5F5]">
                            PKR {Number(item.variant.price).toLocaleString()}
                          </span>
                          <span className="text-[10px] font-mono text-[#737373]">
                            {isOutOfStock ? (
                              <span className="text-red-400">OUT OF STOCK</span>
                            ) : (
                              <span className="text-[#A3A3A3]">IN STOCK</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#222222]">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          disabled={isOutOfStock}
                          onClick={() => addToCart(item.variantId, 1)}
                        >
                          <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                          <span>{isOutOfStock ? "OUT OF STOCK" : "LOAD TO CART"}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
