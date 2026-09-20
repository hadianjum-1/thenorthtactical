"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Drawer } from "../ui/Drawer";
import { Search, ShoppingBag, Heart, User, ShieldCheck, Phone, ChevronRight } from "lucide-react";

export function MobileNav({
  isOpen,
  onClose,
  onOpenSearch,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}) {
  const navLinks = [
    { label: "SHOP ALL", href: "/shop" },
    { label: "TACTICAL GEAR", href: "/shop?category=tactical" },
    { label: "OUTDOOR & SURVIVAL", href: "/shop?category=outdoor" },
    { label: "EVERYDAY CARRY (EDC)", href: "/shop?category=edc" },
    { label: "NEW ARRIVALS", href: "/shop?sort=newest" },
    { label: "TACTICAL BUNDLES", href: "/shop?filter=bundles" },
  ];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} position="left" maxWidth="sm">
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-6">
          {/* Brand Emblem */}
          <div className="flex items-center gap-3 pb-5 border-b border-[#292929]">
            <Image
              src="/logo.png"
              alt="The North Tactical"
              width={42}
              height={42}
              className="object-contain"
            />
            <div>
              <span className="text-sm font-bold tracking-widest text-[#F5F5F5] uppercase block">
                THE NORTH TACTICAL
              </span>
              <span className="text-[10px] font-mono text-[#D6FF3F] uppercase tracking-wider block">
                MISSION READY
              </span>
            </div>
          </div>

          {/* Quick Search Action */}
          <button
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[#292929] bg-[#171717] text-xs font-mono text-[#737373] hover:text-[#F5F5F5] hover:border-[#404040] transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-[#A3A3A3]" />
              <span>SEARCH EQUIPMENT...</span>
            </span>
            <span className="text-[10px] bg-[#262626] px-1.5 py-0.5 rounded text-[#A3A3A3]">
              ESC
            </span>
          </button>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between py-3 px-3 rounded-lg text-xs font-mono font-semibold tracking-wider text-[#F5F5F5] hover:text-[#D6FF3F] hover:bg-white/[0.04] transition-colors"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#525252]" />
              </Link>
            ))}
          </nav>

          {/* Account & Wishlist Shortcut */}
          <div className="pt-4 border-t border-[#292929] space-y-2">
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-white/[0.04] transition-colors"
            >
              <User className="w-4 h-4 text-[#D6FF3F]" />
              <span>OPERATOR ACCOUNT</span>
            </Link>
            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-white/[0.04] transition-colors"
            >
              <Heart className="w-4 h-4 text-[#D6FF3F]" />
              <span>SAVED LOADOUT (WISHLIST)</span>
            </Link>
            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-white/[0.04] transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-[#D6FF3F]" />
              <span>VIEW CART</span>
            </Link>
          </div>
        </div>

        {/* Footer Support Info */}
        <div className="pt-6 border-t border-[#292929] text-[10px] font-mono text-[#737373] space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D6FF3F]" />
            <span>AUTHENTIC MIL-SPEC & TACTICAL GRADE</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#A3A3A3]" />
            <span>DISPATCH & SUPPORT: +92 (300) 000-0000</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
