"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  grandTotal: number;
  status: string;
  payments: { status: string }[];
  createdAt: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    const response = await fetch("/api/admin/orders");
    const data = await response.json();

    if (response.ok) {
      setOrders(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function updateStatus(
    id: string,
    status: string
  ) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    loadOrders();
  }

  if (loading) {
    return (
      <div className="p-8">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Orders
          </h1>

          <p className="mt-2 text-gray-500">
            Manage customer orders and fulfillment.
          </p>
        </div>

        <Link
          href="/admin"
          className="rounded-lg border px-4 py-2"
        >
          Dashboard
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b"
              >
                <td className="p-4 font-medium">
                  {order.orderNumber}
                </td>

                <td className="p-4">
                  <div>{order.customerName}</div>
                  <div className="text-sm text-gray-500">
                    {order.customerEmail}
                  </div>
                </td>

                <td className="p-4">
                  PKR {Number(order.grandTotal).toLocaleString()}
                </td>

                <td className="p-4">
                  {order.payments[0]?.status || "PENDING"}
                </td>

                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatus(
                        order.id,
                        e.target.value
                      )
                    }
                    className="rounded border p-2"
                  >
                    <option value="PENDING">
                      Pending
                    </option>
                    <option value="CONFIRMED">
                      Confirmed
                    </option>
                    <option value="PROCESSING">
                      Processing
                    </option>
                    <option value="SHIPPED">
                      Shipped
                    </option>
                    <option value="DELIVERED">
                      Delivered
                    </option>
                    <option value="CANCELLED">
                      Cancelled
                    </option>
                    <option value="REFUNDED">
                      Refunded
                    </option>
                  </select>
                </td>

                <td className="p-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}