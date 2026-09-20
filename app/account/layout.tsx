import React from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  User,
  Shield,
  Award,
} from "lucide-react";
import { SignOutButton } from "./SignOutButton";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    return <>{children}</>;
  }

  const loyalty = await prisma.loyaltyAccount.findUnique({
    where: { userId: user.id },
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Account Banner */}
        <section className="border-b border-[#262626] bg-[#0E0E0E] py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#D6FF3F] uppercase mb-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>OPERATOR ACCOUNT · {user.role}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F5F5]">
                WELCOME BACK, {user.name || "OPERATOR"}
              </h1>
              <p className="text-xs font-mono text-[#737373] mt-1">
                {user.email}
              </p>
            </div>

            {/* Loyalty Balance Badge */}
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-[#292929] bg-[#141414] self-start sm:self-auto">
              <div className="w-10 h-10 rounded-xl bg-[#D6FF3F]/15 border border-[#D6FF3F]/30 flex items-center justify-center text-[#D6FF3F]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#737373] uppercase block">
                  TACTICAL LOYALTY POINTS
                </span>
                <span className="text-lg font-mono font-bold text-[#F5F5F5]">
                  {loyalty?.pointsBalance ?? 0} PTS
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs Bar */}
        <div className="border-b border-[#222222] bg-[#111111] overflow-x-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 py-2">
            <Link
              href="/account"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-white/[0.04] transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-[#D6FF3F]" />
              <span>DASHBOARD</span>
            </Link>

            <Link
              href="/account/orders"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-white/[0.04] transition-colors"
            >
              <Package className="w-4 h-4 text-[#D6FF3F]" />
              <span>ORDERS</span>
            </Link>

            <Link
              href="/account/wishlist"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-white/[0.04] transition-colors"
            >
              <Heart className="w-4 h-4 text-[#D6FF3F]" />
              <span>SAVED LOADOUT</span>
            </Link>

            <Link
              href="/account/addresses"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-white/[0.04] transition-colors"
            >
              <MapPin className="w-4 h-4 text-[#D6FF3F]" />
              <span>ADDRESSES</span>
            </Link>

            <Link
              href="/account/profile"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-white/[0.04] transition-colors"
            >
              <User className="w-4 h-4 text-[#D6FF3F]" />
              <span>PROFILE</span>
            </Link>

            <div className="ml-auto">
              <SignOutButton />
            </div>
          </div>
        </div>

        {/* Child Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
