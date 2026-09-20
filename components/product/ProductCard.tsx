"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { useCart } from "../cart/CartContext";
import { StatusBadge } from "../ui/StatusBadge";
import { useToast } from "../ui/Toast";

export interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    description?: string;
    featured?: boolean;
    category?: { name: string; slug?: string } | null;
    variants: {
      id: string;
      price: number;
      compareAtPrice: number | null;
      stock: number;
      sku: string;
    }[];
    images: {
      id?: string;
      url: string;
      alt?: string | null;
    }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const primaryVariant = product.variants?.[0];
  const primaryImage = product.images?.[0];
  const secondaryImage = product.images?.[1] || primaryImage;

  const isOutOfStock = !primaryVariant || primaryVariant.stock <= 0;
  const hasDiscount =
    primaryVariant?.compareAtPrice &&
    primaryVariant.compareAtPrice > primaryVariant.price;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((primaryVariant.compareAtPrice! - primaryVariant.price) /
          primaryVariant.compareAtPrice!) *
          100
      )
    : null;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!primaryVariant || isOutOfStock || isAdding) return;

    setIsAdding(true);
    const success = await addToCart(primaryVariant.id, 1);
    setIsAdding(false);
    if (success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    }
  }

  async function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!primaryVariant) return;

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: primaryVariant.id }),
      });
      if (res.ok) {
        setIsWishlisted((prev) => !prev);
        toast(
          !isWishlisted ? "Saved to equipment wishlist" : "Removed from wishlist",
          "info"
        );
      } else if (res.status === 401) {
        toast("Please log in to save items to your wishlist", "info");
      }
    } catch {
      toast("Could not update wishlist", "error");
    }
  }

  return (
    <div className="group relative rounded-2xl border border-[#262626] bg-[#141414] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-[#404040] hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:-translate-y-1">
      {/* Top Media Area */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-[#1A1A1A] overflow-hidden">
        {primaryImage?.url ? (
          <>
            <img
              src={primaryImage.url}
              alt={primaryImage.alt || product.title}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                product.images?.length > 1
                  ? "group-hover:opacity-0"
                  : ""
              }`}
            />
            {product.images?.length > 1 && secondaryImage?.url && (
              <img
                src={secondaryImage.url}
                alt={secondaryImage.alt || product.title}
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:scale-105"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-mono text-[#525252]">
            NO IMAGE
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.featured && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#D6FF3F] text-[#0A0A0A] shadow-md">
              FEATURED
            </span>
          )}
          {hasDiscount && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-600 text-white shadow-md">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all z-10 ${
            isWishlisted
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-black/60 text-[#A3A3A3] border border-white/10 hover:text-white hover:bg-black/80"
          }`}
          aria-label="Save to wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-400" : ""}`} />
        </button>

        {/* Floating Quick Add (appears on hover) */}
        {!isOutOfStock && (
          <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 hidden sm:block">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0A0A0A]/90 hover:bg-[#D6FF3F] text-[#F5F5F5] hover:text-[#0A0A0A] border border-white/15 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 backdrop-blur-md shadow-xl"
            >
              {addedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>LOADED</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>QUICK ADD</span>
                </>
              )}
            </button>
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {product.category && (
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#737373] block mb-1">
              {product.category.name}
            </span>
          )}

          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-[#F5F5F5] hover:text-[#D6FF3F] transition-colors line-clamp-2">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="mt-4 pt-3 border-t border-[#222222] flex items-center justify-between gap-2">
          {/* Price */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-sm sm:text-base font-mono font-bold text-[#F5F5F5]">
                PKR {Number(primaryVariant?.price || 0).toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs font-mono text-[#737373] line-through">
                  PKR {Number(primaryVariant!.compareAtPrice).toLocaleString()}
                </span>
              )}
            </div>
            {primaryVariant && (
              <span className="text-[10px] font-mono text-[#737373]">
                {primaryVariant.stock > 0 ? (
                  primaryVariant.stock <= 4 ? (
                    <span className="text-amber-400">Only {primaryVariant.stock} left</span>
                  ) : (
                    <span className="text-[#A3A3A3]">In Stock</span>
                  )
                ) : (
                  <span className="text-red-400">Out of Stock</span>
                )}
              </span>
            )}
          </div>

          {/* Mobile direct Add button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className="sm:hidden p-2.5 rounded-xl bg-[#D6FF3F] text-[#0A0A0A] disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
