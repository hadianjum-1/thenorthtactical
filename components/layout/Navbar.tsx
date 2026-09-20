"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, User, Menu, Heart } from "lucide-react";
import { useCart } from "../cart/CartContext";
import { SearchModal } from "./SearchModal";
import { MobileNav } from "./MobileNav";

export function Navbar() {
  const { totalItems, openDrawer } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#292929] py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-[#0A0A0A] border-b border-[#222222] py-5"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Mobile Menu & Desktop Brand */}
            <div className="flex items-center gap-3 md:gap-6">
              <button
                onClick={() => setIsMobileNavOpen(true)}
                className="lg:hidden p-2 text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors rounded-lg hover:bg-white/[0.05]"
                aria-label="Open mobile navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-9 h-9 md:w-11 md:h-11 overflow-hidden shrink-0">
                  <Image
                    src="/logo.png"
                    alt="The North Tactical"
                    width={44}
                    height={44}
                    priority
                    className="w-full h-full object-contain brightness-0 invert filter drop-shadow-[0_0_8px_rgba(255,255,255,0.25)] transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm md:text-base font-bold tracking-[0.2em] text-[#F5F5F5] uppercase group-hover:text-[#D6FF3F] transition-colors">
                    THE NORTH TACTICAL
                  </span>
                  <span className="hidden sm:block text-[9px] font-mono tracking-[0.25em] text-[#737373] uppercase">
                    MIL-SPEC · FIELD GEAR
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-8 text-xs font-mono font-semibold tracking-widest text-[#A3A3A3]">
              <Link
                href="/shop"
                className="hover:text-[#D6FF3F] transition-colors uppercase py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#D6FF3F] hover:after:w-full after:transition-all"
              >
                SHOP
              </Link>
              <Link
                href="/shop?category=tactical"
                className="hover:text-[#D6FF3F] transition-colors uppercase py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#D6FF3F] hover:after:w-full after:transition-all"
              >
                TACTICAL
              </Link>
              <Link
                href="/shop?category=outdoor"
                className="hover:text-[#D6FF3F] transition-colors uppercase py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#D6FF3F] hover:after:w-full after:transition-all"
              >
                OUTDOOR
              </Link>
              <Link
                href="/shop?sort=newest"
                className="hover:text-[#D6FF3F] transition-colors uppercase py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#D6FF3F] hover:after:w-full after:transition-all"
              >
                NEW ARRIVALS
              </Link>
              <Link
                href="/shop?filter=bundles"
                className="hover:text-[#D6FF3F] transition-colors uppercase py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#D6FF3F] hover:after:w-full after:transition-all"
              >
                KITS & BUNDLES
              </Link>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Search button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-white/[0.05] rounded-xl transition-colors flex items-center gap-2"
                aria-label="Open tactical search"
              >
                <Search className="w-4 h-4" />
                <span className="hidden xl:inline text-xs font-mono text-[#737373]">
                  SEARCH [CTRL+K]
                </span>
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-2.5 text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-white/[0.05] rounded-xl transition-colors"
                aria-label="View saved gear wishlist"
              >
                <Heart className="w-4 h-4" />
              </Link>

              {/* Account */}
              <Link
                href="/account"
                className="p-2.5 text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-white/[0.05] rounded-xl transition-colors"
                aria-label="Customer account"
              >
                <User className="w-4 h-4" />
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={openDrawer}
                className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#292929] bg-[#141414] hover:border-[#D6FF3F]/40 hover:bg-[#1A1A1A] transition-all cursor-pointer group"
                aria-label={`Cart containing ${totalItems} items`}
              >
                <ShoppingBag className="w-4 h-4 text-[#D6FF3F]" />
                <span className="text-xs font-mono font-bold text-[#F5F5F5]">
                  {totalItems}
                </span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D6FF3F] animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modals & Drawers */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
    </>
  );
}
