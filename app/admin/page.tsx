import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "STAFF"
  ) {
    redirect("/");
  }

  const [productCount, orderCount, customerCount, revenue, recentOrders, inventoryAlerts] =
    await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    }),
    prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: { status: { notIn: ["CANCELLED", "RETURNED", "REFUNDED"] } },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        orderNumber: true,
        customerName: true,
        grandTotal: true,
        status: true,
      },
    }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 4 } },
      take: 8,
      orderBy: { stock: "asc" },
      select: {
        stock: true,
        product: { select: { title: true } },
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
            The North Tactical Admin
          </p>

          <h1 className="mt-2 text-4xl font-semibold">Dashboard</h1>

          <p className="mt-2 text-neutral-400">
            Welcome back,{" "}
            {session.user.name || "Admin"}.
          </p>
        </div>

        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Revenue"
            value={`PKR ${Number(revenue._sum.grandTotal || 0).toLocaleString()}`}
            description="Net order value"
          />
          <DashboardCard
            title="Orders"
            value={orderCount.toString()}
            description="Orders received"
          />
          <DashboardCard
            title="Customers"
            value={customerCount.toString()}
            description="Registered customers"
          />
          <DashboardCard
            title="Products"
            value={productCount.toString()}
            description="Products in your catalog"
          />
        </div>

        <section className="mb-10 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="text-xl font-medium">Recent orders</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-neutral-800 text-neutral-500">
                <tr>
                  <th className="px-3 py-3 font-medium">Order</th>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Total</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {recentOrders.map((order) => (
                  <tr key={order.orderNumber}>
                    <td className="px-3 py-4 font-medium">{order.orderNumber}</td>
                    <td className="px-3 py-4 text-neutral-400">{order.customerName}</td>
                    <td className="px-3 py-4">PKR {order.grandTotal.toLocaleString()}</td>
                    <td className="px-3 py-4 text-neutral-400">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="text-xl font-medium">Inventory alerts</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {inventoryAlerts.map((item) => (
              <div key={`${item.product.title}-${item.stock}`} className="flex justify-between border-b border-neutral-800 py-3 text-sm">
                <span>{item.product.title}</span>
                <span className={item.stock === 0 ? "text-red-400" : "text-amber-400"}>{item.stock}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminLink
            href="/admin/products"
            title="Products"
            description="Manage catalog"
          />
          <AdminLink
            href="/admin/categories"
            title="Categories"
            description="Organize the catalog"
          />
          <AdminLink
            href="/admin/orders"
            title="Orders"
            description="Manage fulfillment"
          />
          <AdminLink
            href="/admin/customers"
            title="Customers"
            description="View customer accounts"
          />
          <AdminLink
            href="/admin/discounts"
            title="Discounts"
            description="Manage promotions"
          />
          <AdminLink
            href="/admin/reviews"
            title="Reviews"
            description="Moderate product reviews"
          />
          <AdminLink
            href="/admin/bundles"
            title="Bundles"
            description="Sell curated kits"
          />
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
      <p className="text-sm text-neutral-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-semibold">
        {value}
      </p>

      <p className="mt-2 text-sm text-neutral-400">
        {description}
      </p>
    </div>
  );
}

function AdminLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition hover:border-neutral-600"
    >
      <p className="font-medium">{title}</p>

      <p className="mt-2 text-sm text-neutral-500">
        {description}
      </p>
    </Link>
  );
}