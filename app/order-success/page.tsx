"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Check, ShieldCheck, ArrowRight, Package, Truck, Phone, FileText } from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "TNT-PENDING";

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col justify-between py-12 px-4 sm:px-6">
      <div className="w-full max-w-2xl mx-auto my-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Image
            src="/logo.png"
            alt="The North Tactical"
            width={44}
            height={44}
            className="object-contain"
          />
          <span className="text-sm font-bold tracking-[0.2em] uppercase text-[#F5F5F5]">
            THE NORTH TACTICAL
          </span>
        </div>

        {/* Confirmation Card */}
        <div className="rounded-3xl border border-[#292929] bg-[#141414] p-8 sm:p-12 shadow-2xl relative overflow-hidden tactical-card-corners text-center">
          <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />

          {/* Success Check Badge */}
          <div className="relative z-10 w-20 h-20 rounded-full bg-[#D6FF3F]/15 border border-[#D6FF3F] text-[#D6FF3F] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(214,255,63,0.3)]">
            <Check className="w-10 h-10" />
          </div>

          <div className="relative z-10 space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#D6FF3F] block">
              MISSION DISPATCH CONFIRMED
            </span>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F5F5]">
              THANK YOU FOR YOUR ORDER
            </h1>
            <p className="text-sm text-[#A3A3A3] max-w-md mx-auto leading-relaxed">
              Your equipment order has been registered in our central fulfillment registry. Our armory specialists are preparing dispatch.
            </p>
          </div>

          {/* Order Reference Box */}
          <div className="relative z-10 mt-8 p-5 rounded-2xl border border-[#292929] bg-[#0E0E0E] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-[11px] font-mono text-[#737373] uppercase block">
                OFFICIAL ORDER TRACKING NUMBER
              </span>
              <span className="text-lg font-mono font-bold text-[#F5F5F5] tracking-wider">
                {orderNumber}
              </span>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-[11px] font-mono text-[#737373] uppercase block">
                STATUS
              </span>
              <span className="text-xs font-mono font-bold text-[#D6FF3F] px-2.5 py-1 rounded bg-[#D6FF3F]/15 border border-[#D6FF3F]/30">
                PENDING FULFILLMENT
              </span>
            </div>
          </div>

          {/* Fulfillment Stepper */}
          <div className="relative z-10 mt-8 pt-8 border-t border-[#222222]">
            <span className="text-xs font-mono uppercase text-[#737373] block mb-4">
              DISPATCH LIFECYCLE
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-3 rounded-xl border border-[#D6FF3F]/40 bg-[#D6FF3F]/10">
                <FileText className="w-4 h-4 text-[#D6FF3F] mx-auto mb-1" />
                <span className="text-[#F5F5F5] font-bold block">1. RECORDED</span>
                <span className="text-[10px] text-[#A3A3A3]">Confirmed</span>
              </div>
              <div className="p-3 rounded-xl border border-[#262626] bg-[#111111]">
                <Package className="w-4 h-4 text-[#737373] mx-auto mb-1" />
                <span className="text-[#737373] font-medium block">2. ARMORY PACK</span>
                <span className="text-[10px] text-[#525252]">Processing</span>
              </div>
              <div className="p-3 rounded-xl border border-[#262626] bg-[#111111]">
                <Truck className="w-4 h-4 text-[#737373] mx-auto mb-1" />
                <span className="text-[#737373] font-medium block">3. DISPATCH</span>
                <span className="text-[10px] text-[#525252]">In Transit</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="relative z-10 mt-10 flex flex-col sm:flex-row gap-3">
            <Link href="/shop" className="flex-1">
              <Button variant="primary" size="md" className="w-full">
                <span>CONTINUE SHOPPING</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/account/orders" className="flex-1">
              <Button variant="secondary" size="md" className="w-full">
                <span>VIEW IN ACCOUNT</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Support note */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs font-mono text-[#737373]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D6FF3F]" />
            <span>GENUINE FIELD GEAR</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#A3A3A3]" />
            <span>DISPATCH HOTLINE: +92 300 000-0000</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-xs font-mono text-[#737373]">
          GENERATING RECEIPT...
        </main>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}