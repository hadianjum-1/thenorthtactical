import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  Zap,
  Crosshair,
  Truck,
  Lock,
  ArrowRight,
  Compass,
  Layers,
  ChevronRight,
} from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export default async function HomePage() {
  // Fetch real database products
  const [featuredProducts, newArrivals, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        featured: true,
      },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
      take: 4,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      take: 6,
      include: {
        _count: {
          select: { products: { where: { status: "ACTIVE" } } },
        },
      },
    }),
  ]);

  // If there are no explicitly featured products, use newest products
  const displayFeatured =
    featuredProducts.length > 0 ? featuredProducts : newArrivals.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* 1. CINEMATIC TACTICAL HERO */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-[#262626]">
          {/* Tactical Background Overlay */}
          <div className="absolute inset-0 z-0 bg-[#0A0A0A]">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-transparent to-[#0A0A0A] z-10" />
            {/* High-tech grid texture */}
            <div className="absolute inset-0 tactical-grid-bg opacity-30 z-10" />

            {/* Tactical background graphic */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div className="w-[800px] h-[800px] rounded-full border border-white/20 flex items-center justify-center animate-[spin_120s_linear_infinite]">
                <div className="w-[600px] h-[600px] rounded-full border border-dashed border-[#D6FF3F]/30 flex items-center justify-center">
                  <div className="w-[400px] h-[400px] rounded-full border border-white/10" />
                </div>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center text-center">
            {/* Tactical Kicker */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#D6FF3F]/30 bg-[#D6FF3F]/10 text-[#D6FF3F] text-xs font-mono tracking-[0.25em] uppercase mb-8 shadow-[0_0_20px_rgba(214,255,63,0.15)]">
              <Crosshair className="w-3.5 h-3.5" />
              <span>THE NORTH TACTICAL · OPERATIONAL GEAR</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tight text-[#F5F5F5] max-w-5xl leading-[1.05]">
              EQUIPMENT BUILT <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#F5F5F5] to-[#D6FF3F]">
                FOR THE MISSION.
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-7 text-base sm:text-lg md:text-xl text-[#A3A3A3] max-w-2xl font-normal leading-relaxed">
              Premium tactical equipment, loadout carriers, and rugged apparel for professionals who demand unconditional reliability in the field.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  <span>SHOP COLLECTION</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/shop?sort=newest" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <span>EXPLORE NEW ARRIVALS</span>
                </Button>
              </Link>
            </div>

            {/* Coordinates / Technical Stamp */}
            <div className="mt-16 flex items-center gap-6 text-[11px] font-mono text-[#737373] tracking-widest uppercase">
              <span>LAT: 33.6844° N</span>
              <span>•</span>
              <span>LON: 73.0479° E</span>
              <span>•</span>
              <span>ELEV: 540M</span>
            </div>
          </div>
        </section>

        {/* 2. TRUST / BRAND STRIP */}
        <section className="border-b border-[#262626] bg-[#0E0E0E] py-5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center items-center divide-y md:divide-y-0 md:divide-x divide-[#262626]">
              <div className="flex items-center justify-center gap-2 py-2 text-xs font-mono tracking-widest text-[#A3A3A3] uppercase">
                <ShieldCheck className="w-4 h-4 text-[#D6FF3F]" />
                <span>BUILT FOR PERFORMANCE</span>
              </div>
              <div className="flex items-center justify-center gap-2 py-2 text-xs font-mono tracking-widest text-[#A3A3A3] uppercase">
                <Zap className="w-4 h-4 text-[#D6FF3F]" />
                <span>FIELD TESTED</span>
              </div>
              <div className="flex items-center justify-center gap-2 py-2 text-xs font-mono tracking-widest text-[#A3A3A3] uppercase">
                <Layers className="w-4 h-4 text-[#D6FF3F]" />
                <span>MIL-SPEC MATERIALS</span>
              </div>
              <div className="flex items-center justify-center gap-2 py-2 text-xs font-mono tracking-widest text-[#A3A3A3] uppercase">
                <Truck className="w-4 h-4 text-[#D6FF3F]" />
                <span>EXPEDITED SHIPPING</span>
              </div>
              <div className="flex items-center justify-center gap-2 py-2 text-xs font-mono tracking-widest text-[#A3A3A3] uppercase col-span-2 md:col-span-1">
                <Lock className="w-4 h-4 text-[#D6FF3F]" />
                <span>SECURE CHECKOUT</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. FEATURED EQUIPMENT */}
        <section className="py-20 sm:py-28 border-b border-[#262626] bg-[#0A0A0A]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#D6FF3F] block mb-2">
                  TACTICAL SELECTION
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#F5F5F5]">
                  FEATURED EQUIPMENT
                </h2>
                <p className="mt-2 text-sm text-[#A3A3A3]">
                  Discover our most demanded, combat-ready field gear.
                </p>
              </div>

              <Link href="/shop">
                <Button variant="outline" size="sm">
                  <span>VIEW ALL PRODUCTS</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {displayFeatured.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayFeatured.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#292929] p-12 text-center">
                <p className="text-sm font-mono text-[#737373] uppercase">
                  Catalog inventory synchronizing. Please check back shortly.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 4. EDITORIAL COLLECTIONS (ARCTOS STYLE MAGAZINE PANELS) */}
        <section className="py-20 sm:py-28 border-b border-[#262626] bg-[#0E0E0E]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#D6FF3F] block mb-2">
                MISSION DIVISIONS
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#F5F5F5]">
                TACTICAL COLLECTIONS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Collection 1 */}
              <Link
                href="/shop?category=tactical"
                className="group relative h-[380px] sm:h-[440px] rounded-3xl overflow-hidden border border-[#292929] bg-[#141414] p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#D6FF3F]/50"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent z-10" />
                <div className="absolute inset-0 tactical-grid-bg opacity-20" />
                <div className="relative z-20">
                  <span className="text-xs font-mono tracking-widest text-[#D6FF3F] uppercase">
                    SERIES 01 // LOADOUT
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-[#F5F5F5] mt-2 group-hover:text-[#D6FF3F] transition-colors">
                    TACTICAL FIELD EQUIPMENT
                  </h3>
                  <p className="text-xs text-[#A3A3A3] mt-2 max-w-sm">
                    Plate carriers, modular chest rigs, pouches, and combat belts engineered to hold your frontline loadout.
                  </p>
                </div>
                <div className="relative z-20 flex items-center gap-2 text-xs font-mono tracking-wider font-bold text-[#F5F5F5] group-hover:text-[#D6FF3F] transition-colors">
                  <span>EXPLORE LOADOUT EQUIPMENT</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>

              {/* Collection 2 */}
              <Link
                href="/shop?category=outdoor"
                className="group relative h-[380px] sm:h-[440px] rounded-3xl overflow-hidden border border-[#292929] bg-[#141414] p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#D6FF3F]/50"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent z-10" />
                <div className="absolute inset-0 tactical-grid-bg opacity-20" />
                <div className="relative z-20">
                  <span className="text-xs font-mono tracking-widest text-[#D6FF3F] uppercase">
                    SERIES 02 // TERRAIN
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-[#F5F5F5] mt-2 group-hover:text-[#D6FF3F] transition-colors">
                    OUTDOOR ADVENTURE GEAR
                  </h3>
                  <p className="text-xs text-[#A3A3A3] mt-2 max-w-sm">
                    All-weather backpacks, emergency survival kits, tactical boots, and thermal protective layers.
                  </p>
                </div>
                <div className="relative z-20 flex items-center gap-2 text-xs font-mono tracking-wider font-bold text-[#F5F5F5] group-hover:text-[#D6FF3F] transition-colors">
                  <span>EXPLORE OUTDOOR GEAR</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>

              {/* Collection 3 */}
              <Link
                href="/shop?category=edc"
                className="group relative h-[320px] rounded-3xl overflow-hidden border border-[#292929] bg-[#141414] p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#D6FF3F]/50"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent z-10" />
                <div className="relative z-20">
                  <span className="text-xs font-mono tracking-widest text-[#D6FF3F] uppercase">
                    SERIES 03 // DAILY CARRY
                  </span>
                  <h3 className="text-2xl font-extrabold tracking-tight uppercase text-[#F5F5F5] mt-2 group-hover:text-[#D6FF3F] transition-colors">
                    EVERYDAY CARRY (EDC)
                  </h3>
                  <p className="text-xs text-[#A3A3A3] mt-2 max-w-sm">
                    High-output tactical flashlights, precision folding blades, multi-tools, and RFID tactical wallets.
                  </p>
                </div>
                <div className="relative z-20 flex items-center gap-2 text-xs font-mono tracking-wider font-bold text-[#F5F5F5] group-hover:text-[#D6FF3F] transition-colors">
                  <span>EXPLORE EDC TOOLS</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>

              {/* Collection 4 */}
              <Link
                href="/shop?filter=bundles"
                className="group relative h-[320px] rounded-3xl overflow-hidden border border-[#292929] bg-[#141414] p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#D6FF3F]/50"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent z-10" />
                <div className="relative z-20">
                  <span className="text-xs font-mono tracking-widest text-[#D6FF3F] uppercase">
                    SERIES 04 // FIELD KITS
                  </span>
                  <h3 className="text-2xl font-extrabold tracking-tight uppercase text-[#F5F5F5] mt-2 group-hover:text-[#D6FF3F] transition-colors">
                    TACTICAL STARTER BUNDLES
                  </h3>
                  <p className="text-xs text-[#A3A3A3] mt-2 max-w-sm">
                    Curated mission sets offering unmatched savings and instant operational preparedness.
                  </p>
                </div>
                <div className="relative z-20 flex items-center gap-2 text-xs font-mono tracking-wider font-bold text-[#F5F5F5] group-hover:text-[#D6FF3F] transition-colors">
                  <span>EXPLORE BUNDLE PACKS</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* 5. NEW ARRIVALS */}
        <section className="py-20 sm:py-28 border-b border-[#262626] bg-[#0A0A0A]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#D6FF3F] block mb-2">
                  LATEST DISPATCH
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#F5F5F5]">
                  NEW ARRIVALS
                </h2>
                <p className="mt-2 text-sm text-[#A3A3A3]">
                  Fresh drops and newly deployed combat gear.
                </p>
              </div>

              <Link href="/shop?sort=newest">
                <Button variant="tactical" size="sm">
                  <span>BROWSE ALL NEW</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {newArrivals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {newArrivals.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#292929] p-12 text-center">
                <p className="text-sm font-mono text-[#737373] uppercase">
                  No new arrivals found.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 6. BRAND STORY SECTION (EDITORIAL ASYMMETRIC) */}
        <section className="py-24 sm:py-36 border-b border-[#262626] bg-[#0D0D0D] relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Brand Emblem & Statement */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#D6FF3F] uppercase">
                  <Compass className="w-4 h-4" />
                  <span>OPERATIONAL PHILOSOPHY</span>
                </div>

                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#F5F5F5] leading-none">
                  BUILT WITH PURPOSE. <br />
                  <span className="text-[#737373]">NOTHING UNNECESSARY.</span>
                </h2>

                <p className="text-base text-[#A3A3A3] leading-relaxed max-w-xl">
                  The North Tactical was forged on a single doctrine: equipment must never fail the individual relying on it. Whether deployed in harsh northern terrain or navigating high-stakes field scenarios, our products deliver extreme durability, ergonomic precision, and relentless performance.
                </p>

                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#262626] max-w-md">
                  <div>
                    <h4 className="text-2xl font-bold font-mono text-[#F5F5F5]">100%</h4>
                    <p className="text-xs font-mono text-[#737373] uppercase mt-1">
                      Field Tested
                    </p>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold font-mono text-[#D6FF3F]">MIL-SPEC</h4>
                    <p className="text-xs font-mono text-[#737373] uppercase mt-1">
                      Materials
                    </p>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold font-mono text-[#F5F5F5]">24/7</h4>
                    <p className="text-xs font-mono text-[#737373] uppercase mt-1">
                      Support
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Tactical Emblem Box */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-3xl border border-[#292929] bg-[#141414] p-8 flex items-center justify-center shadow-2xl tactical-card-corners">
                  <Image
                    src="/logo.png"
                    alt="The North Tactical Badge"
                    width={280}
                    height={280}
                    className="object-contain filter drop-shadow-[0_0_25px_rgba(214,255,63,0.25)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. PROMOTIONAL CONVERSION BANNER */}
        <section className="py-20 sm:py-28 border-b border-[#262626] bg-[#0A0A0A] relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-[#333333] bg-gradient-to-b from-[#171717] to-[#101010] p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 tactical-grid-bg opacity-15" />
              <div className="relative z-10 max-w-2xl mx-auto">
                <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#D6FF3F] block mb-3">
                  LIMITED RUN BATCHES
                </span>
                <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#F5F5F5]">
                  GEAR UP. MOVE WITH PURPOSE.
                </h2>
                <p className="mt-4 text-sm sm:text-base text-[#A3A3A3] leading-relaxed">
                  Equip yourself with military-grade tactical equipment built to withstand extreme punishment. Free shipping on orders over PKR 10,000.
                </p>
                <div className="mt-8 flex justify-center">
                  <Link href="/shop">
                    <Button variant="primary" size="lg">
                      <span>ARM YOUR LOADOUT NOW</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
