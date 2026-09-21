"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  }

  return (
    <footer className="border-t border-[#262626] bg-[#0A0A0A] text-[#F5F5F5] pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Value Props Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-14 border-b border-[#222222]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#292929] flex items-center justify-center text-[#D6FF3F] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-mono uppercase font-bold tracking-wider text-[#F5F5F5]">
                FIELD TESTED
              </h5>
              <p className="text-[11px] text-[#737373] mt-0.5">Tested in demanding environments</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#292929] flex items-center justify-center text-[#D6FF3F] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-mono uppercase font-bold tracking-wider text-[#F5F5F5]">
                FAST DISPATCH
              </h5>
              <p className="text-[11px] text-[#737373] mt-0.5">Expedited nationwide shipping</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#292929] flex items-center justify-center text-[#D6FF3F] shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-mono uppercase font-bold tracking-wider text-[#F5F5F5]">
                TACTICAL GUARANTEE
              </h5>
              <p className="text-[11px] text-[#737373] mt-0.5">Hassle-free equipment returns</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#292929] flex items-center justify-center text-[#D6FF3F] shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-mono uppercase font-bold tracking-wider text-[#F5F5F5]">
                SECURE CHECKOUT
              </h5>
              <p className="text-[11px] text-[#737373] mt-0.5">COD & encrypted transfers</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-16 border-b border-[#222222]">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="The North Tactical"
                width={48}
                height={48}
                className="object-contain"
              />
              <div>
                <span className="text-base font-bold tracking-[0.2em] text-[#F5F5F5] uppercase block">
                  THE NORTH TACTICAL
                </span>
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#D6FF3F] uppercase block">
                  EQUIPMENT BUILT FOR THE MISSION
                </span>
              </div>
            </Link>
            <p className="text-xs text-[#A3A3A3] leading-relaxed max-w-sm">
              We design and supply high-performance tactical equipment, outdoor gear, and apparel for professionals, outdoor enthusiasts, and demanding missions.
            </p>
            <div className="text-xs font-mono text-[#737373]">
              PESHAWAR kPK, PAKISTAN
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h5 className="text-xs font-mono uppercase font-bold tracking-widest text-[#F5F5F5] mb-4">
              EQUIPMENT
            </h5>
            <ul className="space-y-2.5 text-xs font-mono text-[#A3A3A3]">
              <li>
                <Link href="/shop" className="hover:text-[#D6FF3F] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?category=tactical" className="hover:text-[#D6FF3F] transition-colors">
                  Tactical Gear
                </Link>
              </li>
              <li>
                <Link href="/shop?category=outdoor" className="hover:text-[#D6FF3F] transition-colors">
                  Outdoor & Survival
                </Link>
              </li>
              <li>
                <Link href="/shop?category=edc" className="hover:text-[#D6FF3F] transition-colors">
                  Everyday Carry (EDC)
                </Link>
              </li>
              <li>
                <Link href="/shop?sort=newest" className="hover:text-[#D6FF3F] transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h5 className="text-xs font-mono uppercase font-bold tracking-widest text-[#F5F5F5] mb-4">
              SUPPORT
            </h5>
            <ul className="space-y-2.5 text-xs font-mono text-[#A3A3A3]">
              <li>
                <Link href="/shop" className="hover:text-[#D6FF3F] transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#D6FF3F] transition-colors">
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#D6FF3F] transition-colors">
                  Warranty & Repairs
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#D6FF3F] transition-colors">
                  FAQ & Support
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-[#D6FF3F] transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="text-xs font-mono uppercase font-bold tracking-widest text-[#F5F5F5] mb-4">
              FIELD BRIEFINGS
            </h5>
            <p className="text-xs text-[#A3A3A3] mb-4 leading-relaxed">
              Subscribe to dispatch alerts, new tactical releases, and limited edition drops.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs font-mono text-[#D6FF3F] p-3 bg-[#141414] border border-[#D6FF3F]/30 rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>COMMUNICATION ESTABLISHED. WELCOME OPERATOR.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@email.com"
                  className="w-full rounded-xl border border-[#292929] bg-[#141414] px-3.5 py-3 text-xs font-mono text-[#F5F5F5] placeholder-[#525252] focus:outline-none focus:border-[#D6FF3F]"
                />
                <Button variant="primary" size="sm" className="w-full">
                  <span>SUBSCRIBE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#737373]">
          <div>
            © {new Date().getFullYear()} THE NORTH TACTICAL. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/shop" className="hover:text-[#F5F5F5] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/shop" className="hover:text-[#F5F5F5] transition-colors">
              Terms of Service
            </Link>
            <Link href="/shop" className="hover:text-[#F5F5F5] transition-colors">
              Shipping Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
