import React from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Package, ArrowRight } from "lucide-react";

export default async function AccountOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userEmail = session.user.email || "";

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        ...(userEmail ? [{ customerEmail: userEmail }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      payments: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-mono uppercase font-bold text-[#F5F5F5]">
            ALL FIELD ORDERS ({orders.length})
          </h2>
          <p className="text-xs font-mono text-[#737373] mt-1">
            Complete tactical transaction log and fulfillment statuses.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8 text-[#525252]" />}
          title="NO ORDERS FOUND"
          description="You have not placed any equipment orders yet."
          actionText="EXPLORE STORE"
          actionHref="/shop"
        />
      ) : (
        <div className="rounded-2xl border border-[#262626] bg-[#141414] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#222222] bg-[#0E0E0E] text-[#737373]">
                <tr>
                  <th className="px-6 py-4 uppercase">ORDER NUMBER</th>
                  <th className="px-6 py-4 uppercase">DATE</th>
                  <th className="px-6 py-4 uppercase">PAYMENT</th>
                  <th className="px-6 py-4 uppercase">ITEMS</th>
                  <th className="px-6 py-4 uppercase">TOTAL</th>
                  <th className="px-6 py-4 uppercase">STATUS</th>
                  <th className="px-6 py-4 uppercase text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {orders.map((order) => {
                  const payment = order.payments?.[0];
                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#F5F5F5]">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-[#A3A3A3]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-[#A3A3A3]">
                        {payment?.method || "COD"}
                      </td>
                      <td className="px-6 py-4 text-[#A3A3A3]">
                        {order.items.length} items
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
                          className="text-[#D6FF3F] hover:underline inline-flex items-center gap-1"
                        >
                          <span>DETAILS</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
