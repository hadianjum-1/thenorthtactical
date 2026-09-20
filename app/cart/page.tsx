"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/components/cart/CartContext";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default function CartPage() {
  const { cart, loading, subtotal, totalItems, updateQuantity, removeItem } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);

  const FREE_SHIPPING_THRESHOLD = 10000;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : 250;
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const finalTotal = Math.max(0, subtotal - promoDiscount + shippingCost);

  async function handleApplyPromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setValidatingPromo(true);
    setPromoError("");

    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await res.json();
      if (data.valid && data.discount) {
        setPromoApplied(true);
        if (data.discount.type === "PERCENTAGE") {
          setPromoDiscount(Math.round((subtotal * data.discount.value) / 100));
        } else {
          setPromoDiscount(data.discount.value);
        }
      } else {
        setPromoError(data.message || "Invalid coupon code");
      }
    } catch {
      setPromoError("Failed to validate coupon");
    } finally {
      setValidatingPromo(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-xs font-mono text-[#737373] tracking-widest uppercase animate-pulse">
            SYNCHRONIZING TACTICAL LOADOUT...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-[#262626] bg-[#0E0E0E] py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F5F5]">
              TACTICAL LOADOUT CART ({totalItems})
            </h1>
            <p className="mt-2 text-xs font-mono text-[#737373] uppercase">
              Review assigned field gear prior to deployment checkout.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {!cart || cart.items.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="w-8 h-8 text-[#525252]" />}
              title="YOUR LOADOUT IS EMPTY"
              description="No tactical equipment or supplies are currently assigned to your loadout."
              actionText="EXPLORE FIELD GEAR"
              actionHref="/shop"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
              {/* Items List */}
              <div className="space-y-4">
                {/* Free shipping banner */}
                <div className="rounded-2xl border border-[#292929] bg-[#141414] p-5">
                  <div className="flex items-center justify-between text-xs font-mono mb-2.5">
                    <span className="text-[#A3A3A3]">
                      {isFreeShipping ? (
                        <strong className="text-[#D6FF3F] uppercase">
                          ✓ FREE EXPEDITED SHIPPING UNLOCKED
                        </strong>
                      ) : (
                        <span>
                          ADD <strong className="text-[#F5F5F5]">PKR {remainingForFreeShipping.toLocaleString()}</strong> TO QUALIFY FOR FREE DISPATCH
                        </span>
                      )}
                    </span>
                    <span className="text-[#737373]">{Math.round(freeShippingProgress)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#262626] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D6FF3F] transition-all duration-300"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>

                {/* Items */}
                {cart.items.map((item) => {
                  const product = item.variant.product;
                  const image = product.images?.[0];
                  const isStockLow = item.variant.stock <= 3;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row gap-5 p-5 rounded-2xl border border-[#262626] bg-[#141414] hover:border-[#333333] transition-colors"
                    >
                      {/* Image */}
                      <Link
                        href={`/products/${product.slug}`}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#1A1A1A] border border-[#292929] overflow-hidden shrink-0"
                      >
                        {image?.url ? (
                          <img
                            src={image.url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] font-mono text-[#525252]">
                            NO IMG
                          </div>
                        )}
                      </Link>

                      {/* Info & Quantity */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <Link
                                href={`/products/${product.slug}`}
                                className="text-sm font-semibold uppercase text-[#F5F5F5] hover:text-[#D6FF3F] transition-colors"
                              >
                                {product.title}
                              </Link>
                              <p className="text-xs font-mono text-[#737373] mt-1">
                                SKU: {item.variant.sku}
                              </p>
                              {isStockLow && (
                                <p className="text-[10px] font-mono text-amber-400 mt-1">
                                  ⚠ Low inventory warning ({item.variant.stock} left)
                                </p>
                              )}
                            </div>

                            <span className="text-sm font-mono font-bold text-[#F5F5F5]">
                              PKR {(Number(item.variant.price) * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
                          <div className="flex items-center border border-[#292929] rounded-xl bg-[#0E0E0E] p-1">
                            <button
                              onClick={() =>
                                item.quantity > 1 &&
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="p-1.5 px-2 text-[#737373] hover:text-[#F5F5F5] disabled:opacity-30"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-mono font-bold text-[#F5F5F5]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                item.quantity < item.variant.stock &&
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="p-1.5 px-2 text-[#737373] hover:text-[#F5F5F5] disabled:opacity-30"
                              disabled={item.quantity >= item.variant.stock}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex items-center gap-1.5 text-xs font-mono text-[#737373] hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>REMOVE</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="pt-4">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 text-xs font-mono text-[#737373] hover:text-[#F5F5F5] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>CONTINUE EXPLORING EQUIPMENT</span>
                  </Link>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <aside className="rounded-2xl border border-[#292929] bg-[#141414] p-6 space-y-6 sticky top-28">
                <h3 className="text-sm font-mono uppercase font-bold text-[#F5F5F5] tracking-wider pb-4 border-b border-[#262626]">
                  DEPLOYMENT SUMMARY
                </h3>

                {/* Subtotal / Shipping / Discounts */}
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between text-[#A3A3A3]">
                    <span>SUBTOTAL</span>
                    <span className="text-[#F5F5F5] font-semibold">
                      PKR {subtotal.toLocaleString()}
                    </span>
                  </div>

                  {promoApplied && (
                    <div className="flex justify-between text-[#D6FF3F]">
                      <span>DISCOUNT APPLIED</span>
                      <span>- PKR {promoDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#A3A3A3]">
                    <span>ESTIMATED DISPATCH</span>
                    <span>
                      {isFreeShipping ? (
                        <span className="text-[#D6FF3F] font-bold">FREE</span>
                      ) : (
                        `PKR ${shippingCost.toLocaleString()}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#A3A3A3]">
                    <span>ESTIMATED TAX</span>
                    <span className="text-[#737373]">INCLUDED</span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="pt-4 border-t border-[#262626] space-y-2">
                  <label className="text-[11px] font-mono uppercase text-[#737373] block">
                    TACTICAL PROMO CODE
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled={promoApplied}
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      className="w-full rounded-xl border border-[#292929] bg-[#0E0E0E] px-3.5 py-2.5 text-xs font-mono text-[#F5F5F5] focus:outline-none focus:border-[#D6FF3F] uppercase"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      type="submit"
                      disabled={promoApplied || validatingPromo}
                    >
                      {validatingPromo ? "..." : promoApplied ? "APPLIED" : "APPLY"}
                    </Button>
                  </div>
                  {promoError && <p className="text-[10px] text-red-400 font-mono">{promoError}</p>}
                  {promoApplied && (
                    <p className="text-[10px] text-[#D6FF3F] font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      COUPON VERIFIED AND APPLIED
                    </p>
                  )}
                </form>

                {/* Final Total */}
                <div className="pt-4 border-t border-[#262626] flex justify-between items-baseline">
                  <span className="text-sm font-mono uppercase font-bold text-[#F5F5F5]">
                    TOTAL
                  </span>
                  <span className="text-xl sm:text-2xl font-mono font-black text-[#F5F5F5]">
                    PKR {finalTotal.toLocaleString()}
                  </span>
                </div>

                {/* Proceed Button */}
                <Link href="/checkout" className="block">
                  <Button variant="primary" size="lg" className="w-full">
                    <span>PROCEED TO CHECKOUT</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-mono text-[#737373] text-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D6FF3F]" />
                  <span>256-BIT ENCRYPTED TACTICAL CHECKOUT</span>
                </div>
              </aside>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}