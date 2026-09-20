import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Package, Heart, MapPin, ArrowRight, Award, ShoppingBag, UserRound } from "lucide-react";

export default async function AccountDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/account/login?callbackUrl=%2Faccount");

  const userEmail = session.user.email || "";

  const [orders, orderCount, addressCount, wishlistCount, loyalty] = await Promise.all([
    prisma.order.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          ...(userEmail ? [{ customerEmail: userEmail }] : []),
        ],
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    }),
    prisma.order.count({
      where: {
        OR: [
          { userId: session.user.id },
          ...(userEmail ? [{ customerEmail: userEmail }] : []),
        ],
      },
    }),
    prisma.address.count({
      where: { userId: session.user.id },
    }),
    prisma.wishlistItem.count({
      where: {
        wishlist: { userId: session.user.id },
      },
    }),
    prisma.loyaltyAccount.findUnique({
      where: { userId: session.user.id },
    }),
  ]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] p-5 sm:p-7 tactical-grid-bg">
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-[#D6FF3F]">
              FIELD LOG / ACCOUNT OVERVIEW
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#F5F5F5] sm:text-3xl">
              Your loadout, at a glance.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#A3A3A3]">
              Track active dispatches, manage your saved gear, and keep your delivery details ready for the next mission.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#D6FF3F] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] transition-colors hover:bg-[#B8E62E]"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse gear
          </Link>
        </div>
      </section>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl border border-[#262626] bg-[#141414]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#737373]">TOTAL ORDERS</span>
            <Package className="w-4 h-4 text-[#D6FF3F]" />
          </div>
          <p className="mt-4 text-3xl font-mono font-bold text-[#F5F5F5]">{orderCount}</p>
          <Link href="/account/orders" className="mt-3 text-xs font-mono text-[#D6FF3F] hover:underline flex items-center gap-1">
            <span>VIEW ALL ORDERS</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl border border-[#262626] bg-[#141414]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#737373]">LOYALTY POINTS</span>
            <Award className="w-4 h-4 text-[#D6FF3F]" />
          </div>
          <p className="mt-4 text-3xl font-mono font-bold text-[#F5F5F5]">{loyalty?.pointsBalance ?? 0}</p>
          <p className="mt-3 text-xs font-mono text-[#737373]">Earn 1 pt per PKR 100 on delivered orders</p>
        </div>

        <div className="p-6 rounded-2xl border border-[#262626] bg-[#141414]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#737373]">SAVED GEAR</span>
            <Heart className="w-4 h-4 text-[#D6FF3F]" />
          </div>
          <p className="mt-4 text-3xl font-mono font-bold text-[#F5F5F5]">{wishlistCount}</p>
          <Link href="/wishlist" className="mt-3 text-xs font-mono text-[#D6FF3F] hover:underline flex items-center gap-1">
            <span>EXPLORE WISHLIST</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl border border-[#262626] bg-[#141414]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#737373]">DISPATCH ADDRESSES</span>
            <MapPin className="w-4 h-4 text-[#D6FF3F]" />
          </div>
          <p className="mt-4 text-3xl font-mono font-bold text-[#F5F5F5]">{addressCount}</p>
          <Link href="/account/addresses" className="mt-3 text-xs font-mono text-[#D6FF3F] hover:underline flex items-center gap-1">
            <span>MANAGE ADDRESSES</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <section className="rounded-2xl border border-[#262626] bg-[#141414] overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#222222] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-base font-mono uppercase font-bold text-[#F5F5F5]">
              RECENT DISPATCH ORDERS
            </h2>
            <p className="text-xs font-mono text-[#737373] mt-0.5">
              Live status of your tactical equipment shipments.
            </p>
          </div>
          <Link href="/account/orders">
            <Button variant="outline" size="sm">
              VIEW FULL HISTORY
            </Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-10 text-center text-xs font-mono text-[#737373] uppercase">
            No recent orders placed yet.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#222222] bg-[#0E0E0E] text-[#737373]">
                <tr>
                  <th className="px-6 py-3.5 uppercase">ORDER #</th>
                  <th className="px-6 py-3.5 uppercase">DATE</th>
                  <th className="px-6 py-3.5 uppercase">ITEMS</th>
                  <th className="px-6 py-3.5 uppercase">TOTAL</th>
                  <th className="px-6 py-3.5 uppercase">STATUS</th>
                  <th className="px-6 py-3.5 uppercase text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#F5F5F5]">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-[#A3A3A3]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-[#A3A3A3]">
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                    </td>
                    <td className="px-6 py-4 font-bold text-[#F5F5F5]">
                      PKR {order.grandTotal.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} type="order" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="text-[#D6FF3F] hover:underline"
                      >
                        VIEW INVOICE →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="divide-y divide-[#222222] sm:hidden">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block space-y-3 p-5 transition-colors hover:bg-white/[0.03]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-[#F5F5F5]">{order.orderNumber}</p>
                    <p className="mt-1 text-[11px] font-mono text-[#737373]">
                      {new Date(order.createdAt).toLocaleDateString()} · {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                    </p>
                  </div>
                  <StatusBadge status={order.status} type="order" />
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#F5F5F5]">PKR {order.grandTotal.toLocaleString()}</span>
                  <span className="inline-flex items-center gap-1 text-[#D6FF3F]">VIEW DETAILS <ArrowRight className="h-3 w-3" /></span>
                </div>
              </Link>
            ))}
            </div>
          </>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/account/profile" className="group rounded-2xl border border-[#262626] bg-[#141414] p-5 transition-colors hover:border-[#D6FF3F]/40">
          <UserRound className="h-5 w-5 text-[#D6FF3F]" />
          <h3 className="mt-4 text-sm font-bold uppercase text-[#F5F5F5]">Complete your profile</h3>
          <p className="mt-1 text-xs leading-5 text-[#737373]">Keep your contact details current for smoother dispatch updates.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-mono uppercase text-[#D6FF3F]">Edit profile <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" /></span>
        </Link>
        <Link href="/account/addresses" className="group rounded-2xl border border-[#262626] bg-[#141414] p-5 transition-colors hover:border-[#D6FF3F]/40">
          <MapPin className="h-5 w-5 text-[#D6FF3F]" />
          <h3 className="mt-4 text-sm font-bold uppercase text-[#F5F5F5]">Set a primary address</h3>
          <p className="mt-1 text-xs leading-5 text-[#737373]">Save a delivery point once and spend less time at checkout.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-mono uppercase text-[#D6FF3F]">Manage addresses <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" /></span>
        </Link>
      </section>
    </div>
  );
}
