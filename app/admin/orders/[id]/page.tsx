"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  User,
  Clock,
  CheckCircle2,
  Loader2,
  ChevronRight,
} from "lucide-react";

type OrderItem = {
  id: string;
  productTitle: string;
  variantTitle: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type Payment = {
  id: string;
  method: string;
  status: string;
  amount: number;
};

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  shippingAddress: Record<string, string> | string;
  city: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  grandTotal: number;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
  payments: Payment[];
};

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

function StatusStep({
  step,
  currentStatus,
}: {
  step: string;
  currentStatus: string;
}) {
  const steps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentIdx = steps.indexOf(currentStatus);
  const stepIdx = steps.indexOf(step);

  const isCompleted = stepIdx < currentIdx;
  const isActive = stepIdx === currentIdx;
  const isCancelled = currentStatus === "CANCELLED" || currentStatus === "REFUNDED";

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
          isCancelled && stepIdx >= currentIdx
            ? "border-red-500/20 bg-red-500/10"
            : isCompleted
            ? "border-[#D6FF3F]/40 bg-[#D6FF3F]/10"
            : isActive
            ? "border-[#D6FF3F] bg-[#D6FF3F]/20"
            : "border-[#292929] bg-[#1D1D1D]"
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 size={14} className="text-[#D6FF3F]" />
        ) : (
          <span
            className={`w-2 h-2 rounded-full ${
              isActive ? "bg-[#D6FF3F]" : isCancelled ? "bg-red-400" : "bg-[#4A4A4A]"
            }`}
          />
        )}
      </div>
      <span
        className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
          isActive ? "text-[#D6FF3F]" : isCompleted ? "text-[#A3A3A3]" : "text-[#4A4A4A]"
        }`}
      >
        {step.charAt(0) + step.slice(1).toLowerCase()}
      </span>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const loadOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data);
        setNewStatus(data.status);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load order", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [orderId, toast]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void loadOrder();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loadOrder]);

  async function handleStatusUpdate() {
    if (!newStatus || newStatus === order?.status) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Order status updated", variant: "success" });
      void loadOrder();
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "error" });
    } finally {
      setUpdating(false);
    }
  }

  function formatCurrency(n: number) {
    return `PKR ${Number(n).toLocaleString()}`;
  }

  function formatDate(str: string) {
    return new Date(str).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const shippingDetails =
    typeof order?.shippingAddress === "string"
      ? null
      : (order?.shippingAddress as Record<string, string> | null);

  const formattedShippingAddress = shippingDetails
    ? [
        shippingDetails.address,
        [shippingDetails.city, shippingDetails.state, shippingDetails.postalCode]
          .filter(Boolean)
          .join(", "),
        shippingDetails.country || "Pakistan",
      ].filter(Boolean)
    : [
        typeof order?.shippingAddress === "string" ? order.shippingAddress : "",
        order?.city,
      ].filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 size={24} className="animate-spin text-[#737373]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-[#737373]">Order not found.</p>
        <Link href="/admin/orders" className="text-sm text-[#D6FF3F] mt-2 inline-block">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb + Header */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-xs font-mono text-[#737373] hover:text-[#F5F5F5] transition-colors mb-3"
        >
          <ArrowLeft size={12} />
          Orders
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[#F5F5F5] tracking-tight font-mono">
              {order.orderNumber}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Clock size={12} className="text-[#737373]" />
              <span className="text-xs text-[#737373] font-mono">{formatDate(order.createdAt)}</span>
              <StatusBadge status={order.status} />
            </div>
          </div>
          {/* Status Update */}
          <div className="flex items-center gap-2">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="px-3 py-2 bg-[#1D1D1D] border border-[#292929] rounded-lg text-sm text-[#F5F5F5] focus:outline-none focus:border-[#D6FF3F]/50 transition-all"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={handleStatusUpdate}
              loading={updating}
              disabled={newStatus === order.status}
            >
              Update
            </Button>
          </div>
        </div>
      </div>

      {/* Order Status Timeline */}
      <div className="rounded-xl border border-[#292929] bg-[#111111] p-4">
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373] mb-4">
          Fulfillment Timeline
        </p>
        <div className="flex items-start justify-between relative">
          {/* Connector line */}
          <div className="absolute top-4 left-8 right-8 h-px bg-[#292929]" />
          {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].map((step) => (
            <StatusStep key={step} step={step} currentStatus={order.status} />
          ))}
        </div>
        {(order.status === "CANCELLED" || order.status === "REFUNDED") && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest">
              Order {order.status.toLowerCase()}
            </span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main — Items + Payment */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <div className="rounded-xl border border-[#292929] bg-[#111111] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#292929] flex items-center gap-2">
              <Package size={14} className="text-[#D6FF3F]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#A3A3A3]">
                Order Items ({order.items?.length ?? 0})
              </h2>
            </div>
            <div className="divide-y divide-[#1D1D1D]">
              {(order.items ?? []).map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-4 py-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#1D1D1D] border border-[#292929] flex items-center justify-center shrink-0">
                    <Package size={14} className="text-[#737373]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#F5F5F5] truncate">
                      {item.productTitle}
                    </p>
                    <p className="text-xs text-[#737373] font-mono">
                      {item.variantTitle} · SKU: {item.sku} · ×{item.quantity}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm text-[#F5F5F5] font-mono">
                      {formatCurrency(item.totalPrice)}
                    </p>
                    <p className="text-xs text-[#737373] font-mono">
                      {formatCurrency(item.unitPrice)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-xl border border-[#292929] bg-[#111111] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#292929] flex items-center gap-2">
              <CreditCard size={14} className="text-[#D6FF3F]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#A3A3A3]">
                Payment
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {(order.payments ?? []).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#F5F5F5]">{payment.method}</p>
                    <p className="text-xs text-[#737373] font-mono">{payment.status}</p>
                  </div>
                  <p className="font-bold font-mono text-[#F5F5F5]">{formatCurrency(payment.amount)}</p>
                </div>
              ))}
              {(!order.payments || order.payments.length === 0) && (
                <p className="text-sm text-[#737373]">No payment records.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar — Customer + Summary */}
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="rounded-xl border border-[#292929] bg-[#111111] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#292929] flex items-center gap-2">
              <User size={14} className="text-[#D6FF3F]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#A3A3A3]">
                Customer
              </h2>
            </div>
            <div className="p-4 space-y-2">
              <p className="font-medium text-sm text-[#F5F5F5]">{order.customerName}</p>
              <p className="text-xs text-[#737373] font-mono">{order.customerEmail}</p>
              {order.phone && (
                <p className="text-xs text-[#737373] font-mono">{order.phone}</p>
              )}
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-xl border border-[#292929] bg-[#111111] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#292929] flex items-center gap-2">
              <MapPin size={14} className="text-[#D6FF3F]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#A3A3A3]">
                Shipping Address
              </h2>
            </div>
            <div className="p-4">
              <p className="text-sm text-[#A3A3A3] leading-relaxed">
                {formattedShippingAddress.map((line, index) => (
                  <span key={`${line}-${index}`} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-xl border border-[#292929] bg-[#111111] p-4 space-y-3">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373]">
              Order Summary
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#737373]">Subtotal</span>
                <span className="font-mono text-[#F5F5F5]">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">Shipping</span>
                <span className="font-mono text-[#F5F5F5]">
                  {order.shippingCost === 0 ? "Free" : formatCurrency(order.shippingCost)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#737373]">Discount</span>
                  <span className="font-mono text-[#D6FF3F]">−{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-[#292929] pt-2 flex justify-between font-bold">
                <span className="text-[#F5F5F5]">Total</span>
                <span className="font-mono text-[#D6FF3F]">{formatCurrency(order.grandTotal)}</span>
              </div>
            </div>
            {order.notes && (
              <div className="border-t border-[#292929] pt-3">
                <p className="text-[10px] font-mono text-[#737373] uppercase tracking-widest mb-1">Notes</p>
                <p className="text-xs text-[#A3A3A3]">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}