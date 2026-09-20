"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/components/cart/CartContext";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import {
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Star,
  Minus,
  Plus,
  ArrowLeft,
  Crosshair,
  Maximize2,
  X,
} from "lucide-react";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category?: { name: string; slug: string } | null;
  variants: {
    id: string;
    sku: string;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    weightG?: number;
    title: string;
  }[];
  images: { id?: string; url: string; alt: string | null }[];
};

export default function ProductDetails({ slug }: { slug: string }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(`/api/products/${slug}`);
        const data = await response.json();
        if (data.success && data.product) {
          setProduct(data.product);

          // Fetch reviews
          const reviewsRes = await fetch(`/api/products/${slug}/reviews`);
          if (reviewsRes.ok) {
            const revData = await reviewsRes.json();
            if (Array.isArray(revData)) setReviews(revData);
          }

          // Fetch related products
          const relRes = await fetch(`/api/products?limit=4`);
          if (relRes.ok) {
            const relData = await relRes.json();
            if (relData.success) {
              setRelatedProducts(
                relData.products.filter((p: Product) => p.slug !== slug).slice(0, 4)
              );
            }
          }
        }
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-xs font-mono text-[#737373] tracking-widest uppercase animate-pulse">
            LOADING TACTICAL EQUIPMENT SPECIFICATIONS...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <Crosshair className="w-12 h-12 text-[#525252] mb-4" />
          <h1 className="text-2xl font-bold uppercase text-[#F5F5F5]">
            EQUIPMENT NOT FOUND
          </h1>
          <p className="mt-2 text-xs font-mono text-[#737373] max-w-sm">
            The requested SKU or tactical gear is either classified or no longer exists in our field inventory.
          </p>
          <Link href="/shop" className="mt-6">
            <Button variant="primary" size="md">
              RETURN TO CATALOG
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const images = product.images.length > 0 ? product.images : [{ url: "", alt: "No Image" }];
  const currentImage = images[selectedImageIndex] || images[0];

  const isOutOfStock = !currentVariant || currentVariant.stock <= 0;
  const hasDiscount =
    currentVariant?.compareAtPrice &&
    currentVariant.compareAtPrice > currentVariant.price;

  async function handleAddToCart() {
    if (!currentVariant || isOutOfStock || isAdding) return;
    setIsAdding(true);
    await addToCart(currentVariant.id, quantity);
    setIsAdding(false);
  }

  async function handleToggleWishlist() {
    if (!currentVariant) return;
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: currentVariant.id }),
      });
      if (res.ok) {
        setIsWishlisted(!isWishlisted);
        toast(
          !isWishlisted ? "Saved to equipment loadout" : "Removed from wishlist",
          "info"
        );
      } else if (res.status === 401) {
        toast("Sign in to save items to your wishlist", "info");
      }
    } catch {
      toast("Error updating wishlist", "error");
    }
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewRating,
          title: reviewTitle,
          body: reviewBody,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast("Review submitted for tactical review", "success");
        setReviewFormOpen(false);
        setReviewTitle("");
        setReviewBody("");
      } else {
        toast(data.message || "Failed to submit review", "error");
      }
    } catch {
      toast("Error submitting review", "error");
    } finally {
      setSubmittingReview(false);
    }
  }

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col text-[#F5F5F5]">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb Bar */}
        <div className="border-b border-[#222222] bg-[#0E0E0E] py-3.5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-mono text-[#737373]">
            <div className="flex items-center gap-2 truncate">
              <Link href="/" className="hover:text-[#F5F5F5] transition-colors">
                HOME
              </Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-[#F5F5F5] transition-colors">
                SHOP
              </Link>
              {product.category && (
                <>
                  <span>/</span>
                  <Link
                    href={`/shop?category=${product.category.slug}`}
                    className="hover:text-[#F5F5F5] transition-colors uppercase"
                  >
                    {product.category.name}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="text-[#F5F5F5] uppercase truncate">{product.title}</span>
            </div>

            <Link
              href="/shop"
              className="hidden sm:flex items-center gap-1.5 text-[#A3A3A3] hover:text-[#D6FF3F] transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>BACK TO CATALOG</span>
            </Link>
          </div>
        </div>

        {/* Product Showcase */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Gallery Column (Desktop: 7 cols, Mobile: full) */}
            <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[560px] pb-2 md:pb-0 shrink-0">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border overflow-hidden shrink-0 transition-all ${
                        selectedImageIndex === idx
                          ? "border-[#D6FF3F] shadow-[0_0_12px_rgba(214,255,63,0.3)]"
                          : "border-[#292929] opacity-60 hover:opacity-100"
                      }`}
                    >
                      {img.url ? (
                        <img
                          src={img.url}
                          alt={img.alt || product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center text-[8px] font-mono text-[#525252]">
                          NO IMG
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image Stage */}
              <div className="flex-1 relative aspect-square rounded-2xl border border-[#292929] bg-[#141414] overflow-hidden group">
                {currentImage.url ? (
                  <img
                    src={currentImage.url}
                    alt={currentImage.alt || product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-mono text-[#525252]">
                    NO PHOTOGRAPHY AVAILABLE
                  </div>
                )}

                {/* Zoom Trigger */}
                {currentImage.url && (
                  <button
                    onClick={() => setIsZoomOpen(true)}
                    className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/70 border border-white/10 text-[#A3A3A3] hover:text-white hover:bg-black/90 backdrop-blur-md transition-colors"
                    aria-label="Enlarge tactical photograph"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}

                {/* Tactical Status Pill */}
                <div className="absolute bottom-4 left-4">
                  <StatusBadge
                    status={String(currentVariant?.stock || 0)}
                    type="stock"
                  />
                </div>
              </div>
            </div>

            {/* Product Information Column (Desktop: 5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                {/* Category & Tactical Indicator */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono tracking-[0.25em] text-[#D6FF3F] uppercase">
                    {product.category?.name || "TACTICAL GEAR"}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-[#F5F5F5]">{averageRating}</span>
                    <span className="text-[#737373]">({reviews.length} reviews)</span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#F5F5F5] leading-tight">
                  {product.title}
                </h1>

                {/* Pricing Display */}
                <div className="mt-5 flex items-baseline gap-3 pb-5 border-b border-[#222222]">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-[#F5F5F5]">
                    PKR {Number(currentVariant?.price || 0).toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="text-base font-mono text-[#737373] line-through">
                      PKR {Number(currentVariant.compareAtPrice).toLocaleString()}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      SAVE PKR {(currentVariant.compareAtPrice! - currentVariant.price).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="mt-6 text-sm text-[#A3A3A3] leading-relaxed font-sans space-y-2">
                  <p>{product.description}</p>
                </div>

                {/* Variant Picker (if multiple variants exist) */}
                {product.variants.length > 1 && (
                  <div className="mt-6 pt-6 border-t border-[#222222]">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] block mb-2.5 font-semibold">
                      CONFIGURATION / VARIANT
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant, idx) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariantIndex(idx)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase transition-all ${
                            selectedVariantIndex === idx
                              ? "bg-[#D6FF3F] text-[#0A0A0A] font-bold border border-[#D6FF3F]"
                              : "bg-[#141414] text-[#A3A3A3] border border-[#292929] hover:border-[#404040]"
                          }`}
                        >
                          <span>{variant.title !== "Default" ? variant.title : `Option #${idx + 1}`}</span>
                          <span className="ml-2 opacity-70">
                            PKR {Number(variant.price).toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tactical Specifications Card */}
                <div className="mt-6 rounded-xl border border-[#292929] bg-[#141414] p-4.5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-[#737373]">
                    <span>SERIAL / SKU</span>
                    <span className="text-[#F5F5F5] font-semibold">{currentVariant?.sku}</span>
                  </div>
                  <div className="flex justify-between text-[#737373]">
                    <span>FIELD AVAILABILITY</span>
                    <span className={currentVariant?.stock > 0 ? "text-[#D6FF3F]" : "text-red-400"}>
                      {currentVariant?.stock > 0 ? `${currentVariant.stock} UNITS IN STOCK` : "OUT OF STOCK"}
                    </span>
                  </div>
                  {currentVariant?.weightG ? (
                    <div className="flex justify-between text-[#737373]">
                      <span>OPERATIONAL WEIGHT</span>
                      <span className="text-[#F5F5F5]">{currentVariant.weightG}g</span>
                    </div>
                  ) : null}
                </div>

                {/* Quantity & CTA Row */}
                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-3">
                    {/* Quantity */}
                    <div className="flex items-center border border-[#292929] rounded-xl bg-[#111111] p-1 shrink-0">
                      <button
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        className="p-2.5 text-[#737373] hover:text-[#F5F5F5] disabled:opacity-30"
                        disabled={quantity <= 1 || isOutOfStock}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-9 text-center text-xs font-mono font-bold text-[#F5F5F5]">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          quantity < (currentVariant?.stock || 0) &&
                          setQuantity(quantity + 1)
                        }
                        className="p-2.5 text-[#737373] hover:text-[#F5F5F5] disabled:opacity-30"
                        disabled={quantity >= (currentVariant?.stock || 0) || isOutOfStock}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Add to Cart */}
                    <Button
                      variant="primary"
                      size="lg"
                      className="flex-1"
                      disabled={isOutOfStock}
                      isLoading={isAdding}
                      onClick={handleAddToCart}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      <span>{isOutOfStock ? "OUT OF STOCK" : "LOAD INTO KIT"}</span>
                    </Button>

                    {/* Save Wishlist */}
                    <button
                      onClick={handleToggleWishlist}
                      className={`p-3.5 rounded-xl border transition-colors shrink-0 ${
                        isWishlisted
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-[#141414] text-[#A3A3A3] border-[#292929] hover:text-[#F5F5F5] hover:border-[#404040]"
                      }`}
                      aria-label="Save to equipment wishlist"
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-400" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Assurance Points */}
                <div className="mt-8 pt-6 border-t border-[#222222] grid grid-cols-3 gap-3 text-[11px] font-mono text-[#737373] text-center">
                  <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-[#0E0E0E]">
                    <ShieldCheck className="w-4 h-4 text-[#D6FF3F]" />
                    <span>MIL-SPEC AUTHENTIC</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-[#0E0E0E]">
                    <Truck className="w-4 h-4 text-[#D6FF3F]" />
                    <span>FAST DISPATCH</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-[#0E0E0E]">
                    <RotateCcw className="w-4 h-4 text-[#D6FF3F]" />
                    <span>TACTICAL RETURN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="border-t border-[#262626] bg-[#0E0E0E] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#D6FF3F]">
                  OPERATOR VERIFICATION
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold uppercase text-[#F5F5F5] mt-1">
                  CUSTOMER REVIEWS
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewFormOpen(!reviewFormOpen)}
              >
                {reviewFormOpen ? "CANCEL REVIEW" : "WRITE AN OPERATOR REVIEW"}
              </Button>
            </div>

            {/* Review Submission Form Drawer/Collapse */}
            {reviewFormOpen && (
              <form
                onSubmit={handleReviewSubmit}
                className="mb-10 rounded-2xl border border-[#292929] bg-[#141414] p-6 max-w-xl space-y-4"
              >
                <h4 className="text-sm font-mono uppercase font-bold text-[#F5F5F5]">
                  SUBMIT FIELD REPORT
                </h4>
                <div>
                  <label className="text-xs font-mono text-[#A3A3A3] block mb-1.5 uppercase">
                    RATING (1 TO 5 STARS)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating ? "fill-amber-400" : "text-[#404040]"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-mono text-[#A3A3A3] block mb-1 uppercase">
                    REPORT TITLE
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g., Rugged, built like a tank"
                    className="w-full rounded-xl border border-[#292929] bg-[#111111] px-3.5 py-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D6FF3F]"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-[#A3A3A3] block mb-1 uppercase">
                    FIELD EVALUATION
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    placeholder="Describe product performance, build quality, and durability under test..."
                    className="w-full rounded-xl border border-[#292929] bg-[#111111] px-3.5 py-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D6FF3F]"
                  />
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={submittingReview}
                  isLoading={submittingReview}
                >
                  SUBMIT FOR MODERATION
                </Button>
              </form>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#292929] p-8 text-center">
                <p className="text-xs font-mono text-[#737373] uppercase">
                  No verified field reports published yet. Be the first to evaluate this gear.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-xl border border-[#262626] bg-[#141414] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex gap-1 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-[#737373]">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {rev.title && (
                      <h5 className="text-sm font-bold uppercase text-[#F5F5F5]">
                        {rev.title}
                      </h5>
                    )}
                    <p className="text-xs text-[#A3A3A3] leading-relaxed">
                      {rev.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Related Gear */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-[#262626] bg-[#0A0A0A] py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <span className="text-xs font-mono uppercase tracking-widest text-[#D6FF3F]">
                  COMPATIBLE LOADOUT
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold uppercase text-[#F5F5F5] mt-1">
                  RELATED EQUIPMENT
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    className="rounded-2xl border border-[#262626] bg-[#141414] overflow-hidden p-4 flex flex-col justify-between"
                  >
                    <Link href={`/products/${rel.slug}`} className="block aspect-square bg-[#1A1A1A] rounded-xl overflow-hidden mb-3">
                      {rel.images?.[0]?.url ? (
                        <img
                          src={rel.images[0].url}
                          alt={rel.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-[#525252]">
                          NO IMAGE
                        </div>
                      )}
                    </Link>
                    <div>
                      <Link href={`/products/${rel.slug}`} className="block">
                        <h4 className="text-xs font-semibold uppercase text-[#F5F5F5] hover:text-[#D6FF3F] transition-colors truncate">
                          {rel.title}
                        </h4>
                      </Link>
                      <div className="mt-2 flex items-center justify-between text-xs font-mono font-bold">
                        <span>PKR {Number(rel.variants?.[0]?.price || 0).toLocaleString()}</span>
                        <Link href={`/products/${rel.slug}`} className="text-[#D6FF3F] hover:underline text-[10px]">
                          VIEW GEAR
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Lightbox / Zoom Dialog */}
        {isZoomOpen && currentImage.url && (
          <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsZoomOpen(false)}
          >
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={currentImage.url}
              alt={product.title}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}