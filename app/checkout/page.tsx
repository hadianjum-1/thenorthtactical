"use client";

import React, { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  Banknote,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading: cartLoading, subtotal, refreshCart } = useCart();
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Form Fields
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Pakistan",
  });

  // Promo Code in Checkout
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);

  const FREE_SHIPPING_THRESHOLD = 10000;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : 250;
  const finalTotal = Math.max(0, subtotal - promoDiscount + shippingCost);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

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
        toast("Coupon applied to checkout", "success");
      } else {
        setPromoError(data.message || "Invalid coupon code");
      }
    } catch {
      setPromoError("Failed to validate coupon");
    } finally {
      setValidatingPromo(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart || cart.items.length === 0) {
      toast("Your loadout is empty", "error");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...form,
        paymentMethod,
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast(data.message || "Checkout failed. Please inspect field inputs.", "error");
        setSubmitting(false);
        return;
      }

      await refreshCart();
      router.push(`/order-success?order=${encodeURIComponent(data.order.orderNumber)}`);
    } catch (error) {
      console.error(error);
      toast("Something went wrong processing your order. Please retry.", "error");
      setSubmitting(false);
    }
  }

  if (cartLoading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#737373] text-xs font-mono tracking-widest uppercase">
        PREPARING SECURE CHECKOUT INTERFACE...
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-[#292929] flex items-center justify-center text-[#737373] mb-4">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">YOUR CART IS EMPTY</h1>
        <p className="mt-2 text-xs font-mono text-[#737373] max-w-sm">
          Please add tactical equipment to your kit before initiating deployment checkout.
        </p>
        <Link href="/shop" className="mt-6">
          <Button variant="primary" size="md">
            EXPLORE CATALOG
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5]">
      {/* Top Header */}
      <header className="border-b border-[#262626] bg-[#0E0E0E] py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="The North Tactical"
              width={36}
              height={36}
              className="object-contain brightness-0 invert"
            />
            <span className="text-sm font-bold tracking-[0.2em] text-[#F5F5F5] uppercase">
              THE NORTH TACTICAL
            </span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-[#737373]">
            <Lock className="w-3.5 h-3.5 text-[#D6FF3F]" />
            <span className="hidden sm:inline">256-BIT ENCRYPTED DISPATCH CHECKOUT</span>
          </div>

          <Link
            href="/cart"
            className="text-xs font-mono text-[#A3A3A3] hover:text-[#F5F5F5] flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO CART</span>
          </Link>
        </div>
      </header>

      {/* Main Checkout Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 sm:gap-14 items-start"
        >
          {/* Left Column: Information, Shipping & Payment */}
          <div className="space-y-8">
            {/* 1. Contact Information */}
            <section className="rounded-2xl border border-[#262626] bg-[#141414] p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                <h2 className="text-sm font-mono uppercase font-bold text-[#F5F5F5] tracking-wider">
                  01 // CONTACT DETAILS
                </h2>
                <span className="text-[10px] font-mono text-[#737373]">STEP 1 OF 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address *"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="operator@email.com"
                  hint="Order confirmation will be sent here"
                />

                <Input
                  label="Phone Number *"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+92 300 1234567"
                  hint="For courier delivery coordination"
                />
              </div>
            </section>

            {/* 2. Shipping Destination */}
            <section className="rounded-2xl border border-[#262626] bg-[#141414] p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                <h2 className="text-sm font-mono uppercase font-bold text-[#F5F5F5] tracking-wider">
                  02 // DISPATCH DESTINATION
                </h2>
                <span className="text-[10px] font-mono text-[#737373]">STEP 2 OF 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name *"
                  required
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="Ali"
                />

                <Input
                  label="Last Name *"
                  required
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Khan"
                />
              </div>

              <Input
                label="Street Address / Building *"
                required
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="House / Apartment #, Sector, Street address"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City *"
                  required
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="Lahore / Islamabad"
                />

                <Input
                  label="State / Province"
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  placeholder="Punjab"
                />

                <Input
                  label="Postal Code *"
                  required
                  value={form.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  placeholder="54000"
                />
              </div>

              <Input
                label="Country *"
                required
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                placeholder="Pakistan"
                disabled
              />
            </section>

            {/* 3. Payment Method */}
            <section className="rounded-2xl border border-[#262626] bg-[#141414] p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                <h2 className="text-sm font-mono uppercase font-bold text-[#F5F5F5] tracking-wider">
                  03 // PAYMENT METHOD
                </h2>
                <span className="text-[10px] font-mono text-[#737373]">STEP 3 OF 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* COD */}
                <label
                  className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "COD"
                      ? "border-[#D6FF3F] bg-[#D6FF3F]/10 shadow-[0_0_15px_rgba(214,255,63,0.1)]"
                      : "border-[#292929] bg-[#111111] hover:border-[#404040]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Banknote className="w-4 h-4 text-[#D6FF3F]" />
                      <span className="text-xs font-mono font-bold uppercase text-[#F5F5F5]">
                        Cash on Delivery (COD)
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-[#D6FF3F]"
                    />
                  </div>
                  <p className="text-[11px] text-[#737373] mt-2 leading-relaxed">
                    Pay with cash when courier delivers the tactical package to your doorstep.
                  </p>
                </label>

                {/* Bank Transfer */}
                <label
                  className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "BANK_TRANSFER"
                      ? "border-[#D6FF3F] bg-[#D6FF3F]/10 shadow-[0_0_15px_rgba(214,255,63,0.1)]"
                      : "border-[#292929] bg-[#111111] hover:border-[#404040]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-[#D6FF3F]" />
                      <span className="text-xs font-mono font-bold uppercase text-[#F5F5F5]">
                        Direct Bank Wire
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK_TRANSFER"
                      checked={paymentMethod === "BANK_TRANSFER"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-[#D6FF3F]"
                    />
                  </div>
                  <p className="text-[11px] text-[#737373] mt-2 leading-relaxed">
                    Transfer directly to our official corporate account. Instructions shown on receipt.
                  </p>
                </label>

                {/* JazzCash */}
                <label
                  className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "JAZZCASH"
                      ? "border-[#D6FF3F] bg-[#D6FF3F]/10 shadow-[0_0_15px_rgba(214,255,63,0.1)]"
                      : "border-[#292929] bg-[#111111] hover:border-[#404040]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-4 h-4 text-[#D6FF3F]" />
                      <span className="text-xs font-mono font-bold uppercase text-[#F5F5F5]">
                        JazzCash Mobile
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="JAZZCASH"
                      checked={paymentMethod === "JAZZCASH"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-[#D6FF3F]"
                    />
                  </div>
                  <p className="text-[11px] text-[#737373] mt-2 leading-relaxed">
                    Pay instantly via JazzCash mobile wallet or CNIC transfer.
                  </p>
                </label>

                {/* Easypaisa */}
                <label
                  className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "EASYPAISA"
                      ? "border-[#D6FF3F] bg-[#D6FF3F]/10 shadow-[0_0_15px_rgba(214,255,63,0.1)]"
                      : "border-[#292929] bg-[#111111] hover:border-[#404040]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-4 h-4 text-[#D6FF3F]" />
                      <span className="text-xs font-mono font-bold uppercase text-[#F5F5F5]">
                        Easypaisa Wallet
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="EASYPAISA"
                      checked={paymentMethod === "EASYPAISA"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-[#D6FF3F]"
                    />
                  </div>
                  <p className="text-[11px] text-[#737373] mt-2 leading-relaxed">
                    Fast payment via Easypaisa account with instant dispatch confirmation.
                  </p>
                </label>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <aside className="rounded-2xl border border-[#292929] bg-[#141414] p-6 sm:p-7 space-y-6 sticky top-20">
            <h3 className="text-sm font-mono uppercase font-bold text-[#F5F5F5] tracking-wider pb-3 border-b border-[#262626]">
              ORDER LOADOUT REVIEW
            </h3>

            {/* Item List */}
            <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1 divide-y divide-[#222222]">
              {cart.items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-[#1A1A1A] border border-[#292929] overflow-hidden shrink-0">
                      {item.variant.product.images?.[0]?.url ? (
                        <img
                          src={item.variant.product.images[0].url}
                          alt={item.variant.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-[#525252]">
                          IMG
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#F5F5F5] uppercase truncate">
                        {item.variant.product.title}
                      </p>
                      <p className="text-[10px] font-mono text-[#737373]">
                        QTY: {item.quantity} · SKU: {item.variant.sku}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-[#F5F5F5] shrink-0">
                    PKR {(Number(item.variant.price) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Discount Code Input */}
            <div className="pt-4 border-t border-[#262626] space-y-2">
              <label className="text-[11px] font-mono uppercase text-[#737373] block">
                PROMO / DISCOUNT CODE
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled={promoApplied}
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="ENTER PROMO"
                  className="w-full rounded-xl border border-[#292929] bg-[#0E0E0E] px-3.5 py-2.5 text-xs font-mono text-[#F5F5F5] focus:outline-none focus:border-[#D6FF3F] uppercase"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoApplied || validatingPromo}
                >
                  {validatingPromo ? "..." : promoApplied ? "APPLIED" : "APPLY"}
                </Button>
              </div>
              {promoError && <p className="text-[10px] text-red-400 font-mono">{promoError}</p>}
              {promoApplied && (
                <p className="text-[10px] text-[#D6FF3F] font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  DISCOUNT APPLIED
                </p>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="pt-4 border-t border-[#262626] space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-[#A3A3A3]">
                <span>SUBTOTAL</span>
                <span className="text-[#F5F5F5]">PKR {subtotal.toLocaleString()}</span>
              </div>

              {promoApplied && (
                <div className="flex justify-between text-[#D6FF3F]">
                  <span>PROMO DISCOUNT</span>
                  <span>- PKR {promoDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-[#A3A3A3]">
                <span>SHIPPING CHARGES</span>
                <span>
                  {isFreeShipping ? (
                    <span className="text-[#D6FF3F] font-semibold">FREE</span>
                  ) : (
                    `PKR ${shippingCost.toLocaleString()}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-[#A3A3A3]">
                <span>TAXES & DUTIES</span>
                <span className="text-[#737373]">INCLUDED</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="pt-4 border-t border-[#262626] flex justify-between items-baseline">
              <span className="text-sm font-mono uppercase font-bold text-[#F5F5F5]">
                FINAL TOTAL
              </span>
              <span className="text-2xl font-mono font-black text-[#D6FF3F]">
                PKR {finalTotal.toLocaleString()}
              </span>
            </div>

            {/* Submit Action */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={submitting}
              isLoading={submitting}
            >
              <span>{submitting ? "CONFIRMING ORDER..." : "PLACE ORDER FOR DISPATCH"}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="pt-2 text-center text-[10px] font-mono text-[#737373] space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D6FF3F]" />
                <span>CONFIDENTIAL TRANSACTION · ZERO TELEMETRY RISK</span>
              </div>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}