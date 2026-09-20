"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Drawer } from "../ui/Drawer";
import { useCart } from "./CartContext";
import { Button } from "../ui/Button";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";

export function CartDrawer() {
  const { cart, isDrawerOpen, closeDrawer, subtotal, totalItems, updateQuantity, removeItem } =
    useCart();

  const FREE_SHIPPING_THRESHOLD = 10000;
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <Drawer
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      title={`TACTICAL LOADOUT (${totalItems})`}
      maxWidth="md"
    >
      <div className="flex flex-col h-full">
        {/* Free Shipping Milestone */}
        <div className="rounded-xl border border-[#292929] bg-[#171717] p-4 mb-6">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#A3A3A3]">
              {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                <span className="text-[#D6FF3F] font-bold">FREE SHIPPING UNLOCKED</span>
              ) : (
                <span>
                  ADD <strong className="text-[#F5F5F5]">PKR {remainingForFreeShipping.toLocaleString()}</strong> FOR FREE SHIPPING
                </span>
              )}
            </span>
            <span className="text-[#737373]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#262626] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D6FF3F] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        {!cart || cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-[#171717] border border-[#292929] flex items-center justify-center text-[#737373] mb-4">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold uppercase tracking-wider text-[#F5F5F5]">
              LOADOUT EMPTY
            </h4>
            <p className="text-xs text-[#737373] mt-2 max-w-xs leading-relaxed">
              No equipment currently assigned. Browse our field-tested gear to arm your kit.
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  closeDrawer();
                }}
              >
                <Link href="/shop">EXPLORE CATALOG</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 -mr-1">
            {cart.items.map((item) => {
              const product = item.variant.product;
              const image = product.images?.[0];

              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 rounded-xl border border-[#262626] bg-[#141414] hover:border-[#333333] transition-colors"
                >
                  <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-[#1A1A1A] border border-[#292929] relative">
                    {image?.url ? (
                      <img
                        src={image.url}
                        alt={image.alt || product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-[#525252]">
                        NO IMAGE
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={closeDrawer}
                          className="text-xs font-semibold uppercase tracking-wide text-[#F5F5F5] hover:text-[#D6FF3F] transition-colors truncate"
                        >
                          {product.title}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#737373] hover:text-red-400 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] font-mono text-[#737373] mt-0.5">
                        SKU: {item.variant.sku}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.04]">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#292929] rounded-lg bg-[#0E0E0E]">
                        <button
                          onClick={() =>
                            item.quantity > 1 &&
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 px-2 text-[#A3A3A3] hover:text-[#F5F5F5] disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-medium px-2 text-[#F5F5F5]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            item.quantity < item.variant.stock &&
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 px-2 text-[#A3A3A3] hover:text-[#F5F5F5] disabled:opacity-30"
                          disabled={item.quantity >= item.variant.stock}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-mono font-bold text-[#F5F5F5]">
                        PKR {(Number(item.variant.price) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Summary & Checkout */}
        {cart && cart.items.length > 0 && (
          <div className="pt-5 border-t border-[#292929] bg-[#111111] space-y-4">
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#A3A3A3]">
                <span>SUBTOTAL</span>
                <span className="text-[#F5F5F5] font-bold">
                  PKR {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[#A3A3A3]">
                <span>SHIPPING</span>
                <span>
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                    <span className="text-[#D6FF3F] font-semibold">FREE</span>
                  ) : (
                    "CALCULATED AT CHECKOUT"
                  )}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href="/cart" onClick={closeDrawer} className="flex-1">
                <Button variant="secondary" size="md" className="w-full">
                  VIEW CART
                </Button>
              </Link>
              <Link href="/checkout" onClick={closeDrawer} className="flex-1">
                <Button variant="primary" size="md" className="w-full">
                  <span>CHECKOUT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-[#737373] text-center pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D6FF3F]" />
              <span>ENCRYPTED TRANSACTION · FIELD TESTED GEAR</span>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
