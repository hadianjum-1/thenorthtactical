import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  ArrowLeft,
  ShieldCheck,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/account/login");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: true,
    },
  });

  if (!order) notFound();

  // Security check: ensure order belongs to logged-in user or matching email
  if (
    order.userId !== session.user.id &&
    order.customerEmail !== session.user.email &&
    session.user.role !== "ADMIN" &&
    session.user.role !== "STAFF"
  ) {
    redirect("/account");
  }

  const shippingAddress = order.shippingAddress as Record<string, string>;
  const payment = order.payments?.[0];

  const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentStatusIndex = statuses.indexOf(order.status);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#222222]">
        <div>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#737373] hover:text-[#F5F5F5] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO ALL ORDERS</span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-mono uppercase font-bold text-[#F5F5F5]">
            ORDER #{order.orderNumber}
          </h2>
          <p className="text-xs font-mono text-[#737373] mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} type="order" className="scale-105" />
          {payment && (
            <StatusBadge status={payment.status} type="payment" className="scale-105" />
          )}
        </div>
      </div>

      {/* Fulfillment Stepper */}
      {order.status !== "CANCELLED" && order.status !== "REFUNDED" ? (
        <section className="rounded-2xl border border-[#262626] bg-[#141414] p-6 sm:p-8">
          <h3 className="text-xs font-mono uppercase font-bold text-[#737373] tracking-widest mb-6">
            DISPATCH LIFECYCLE TRACKER
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {statuses.map((step, idx) => {
              const isCompleted = currentStatusIndex >= idx;
              const isCurrent = currentStatusIndex === idx;

              return (
                <div
                  key={step}
                  className={`p-3.5 rounded-xl border text-center font-mono text-xs transition-all ${
                    isCurrent
                      ? "border-[#D6FF3F] bg-[#D6FF3F]/10 text-[#F5F5F5] font-bold shadow-[0_0_15px_rgba(214,255,63,0.15)]"
                      : isCompleted
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-[#262626] bg-[#0E0E0E] text-[#525252]"
                  }`}
                >
                  <div className="flex items-center justify-center mb-1.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#525252]" />
                    )}
                  </div>
                  <span className="block">{step}</span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Main Order Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[#262626] bg-[#141414] p-6">
            <h3 className="text-sm font-mono uppercase font-bold text-[#F5F5F5] tracking-wider mb-4 pb-3 border-b border-[#222222]">
              ITEMS IN LOADOUT ({order.items.length})
            </h3>
            <div className="divide-y divide-[#222222]">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs font-mono"
                >
                  <div>
                    <h4 className="font-semibold text-[#F5F5F5] uppercase text-sm">
                      {item.titleSnapshot}
                    </h4>
                    <p className="text-[11px] text-[#737373] mt-0.5">
                      SKU: {item.skuSnapshot} · QTY: {item.quantity} × PKR {item.unitPrice.toLocaleString()}
                    </p>
                  </div>
                  <span className="font-bold text-[#F5F5F5] text-sm">
                    PKR {item.lineTotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Shipping & Payment Summary */}
        <div className="space-y-6">
          {/* Destination */}
          <div className="rounded-2xl border border-[#262626] bg-[#141414] p-6 space-y-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#D6FF3F] uppercase font-bold tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>DISPATCH RECIPIENT</span>
            </div>
            <div className="pt-2 border-t border-[#222222] space-y-1 text-[#A3A3A3]">
              <p className="font-bold text-[#F5F5F5] uppercase">{order.customerName}</p>
              <p>{shippingAddress?.address}</p>
              <p>
                {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postalCode}
              </p>
              <p>{shippingAddress?.country || "Pakistan"}</p>
              <p className="text-[#737373] pt-1">PH: {order.customerPhone}</p>
            </div>
          </div>

          {/* Payment & Financials */}
          <div className="rounded-2xl border border-[#262626] bg-[#141414] p-6 space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
              <span className="font-bold text-[#F5F5F5] uppercase">PAYMENT METHOD</span>
              <span className="text-[#D6FF3F] font-bold">{payment?.method || "COD"}</span>
            </div>

            <div className="space-y-2 text-[#A3A3A3]">
              <div className="flex justify-between">
                <span>SUBTOTAL</span>
                <span className="text-[#F5F5F5]">PKR {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>SHIPPING</span>
                <span>PKR {order.shippingTotal.toLocaleString()}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-[#D6FF3F]">
                  <span>DISCOUNT APPLIED</span>
                  <span>- PKR {order.discountTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>TAX</span>
                <span>PKR {order.taxTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#222222] flex justify-between items-baseline">
              <span className="text-sm font-bold uppercase text-[#F5F5F5]">TOTAL</span>
              <span className="text-xl font-bold font-mono text-[#D6FF3F]">
                PKR {order.grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
