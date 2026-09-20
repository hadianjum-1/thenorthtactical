import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Layers, Package, Tag } from "lucide-react";

export default async function AdminBundlesPage() {
  const session = await auth();

  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role as string)) {
    redirect("/admin/login");
  }

  const bundles = await prisma.bundle.findMany({
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  function formatPrice(n: number) {
    return `PKR ${n.toLocaleString()}`;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-mono text-[#737373] uppercase tracking-widest mb-1">Catalog</p>
        <h1 className="text-2xl font-bold text-[#F5F5F5] tracking-tight">Bundles</h1>
        <p className="text-sm text-[#737373] mt-1">
          Curated gear kits offered at a combined bundle price.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#292929] bg-[#111111] p-4">
          <p className="text-[10px] font-mono text-[#737373] uppercase tracking-widest mb-2">Total Bundles</p>
          <p className="text-2xl font-bold text-[#F5F5F5]">{bundles.length}</p>
        </div>
        <div className="rounded-xl border border-[#292929] bg-[#111111] p-4">
          <p className="text-[10px] font-mono text-[#737373] uppercase tracking-widest mb-2">Active</p>
          <p className="text-2xl font-bold text-[#D6FF3F]">{bundles.filter(b => b.active).length}</p>
        </div>
        <div className="rounded-xl border border-[#292929] bg-[#111111] p-4">
          <p className="text-[10px] font-mono text-[#737373] uppercase tracking-widest mb-2">Draft</p>
          <p className="text-2xl font-bold text-[#A3A3A3]">{bundles.filter(b => !b.active).length}</p>
        </div>
      </div>

      {/* Bundles Grid */}
      {bundles.length === 0 ? (
        <div className="rounded-xl border border-[#292929] bg-[#111111] p-12 text-center">
          <Layers size={32} className="mx-auto text-[#737373] mb-3" />
          <p className="text-sm font-medium text-[#A3A3A3]">No bundles yet</p>
          <p className="text-xs text-[#737373] mt-1">Create product bundles in your database.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle) => {
            // Calculate individual sum from variants
            const individualSum = bundle.items.reduce((sum, item) => {
              return sum + (item.variant.price as unknown as number) * item.quantity;
            }, 0);
            const savings = individualSum - (bundle.price as unknown as number);
            const savingsPct = individualSum > 0 ? Math.round((savings / individualSum) * 100) : 0;

            return (
              <div
                key={bundle.id}
                className="rounded-xl border border-[#292929] bg-[#111111] p-5 flex flex-col gap-4"
              >
                {/* Bundle Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#D6FF3F]/10 border border-[#D6FF3F]/20 flex items-center justify-center shrink-0">
                      <Layers size={16} className="text-[#D6FF3F]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#F5F5F5] leading-tight">{bundle.title}</h3>
                      {bundle.slug && (
                        <p className="text-[10px] font-mono text-[#737373]">/{bundle.slug}</p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border shrink-0 ${
                      bundle.active
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-[#1D1D1D] text-[#737373] border-[#292929]"
                    }`}
                  >
                    {bundle.active ? "Active" : "Draft"}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {bundle.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Package size={12} className="text-[#737373] shrink-0" />
                      <span className="text-xs text-[#A3A3A3] truncate">
                        {item.variant.product.title}
                      </span>
                      <span className="ml-auto text-xs font-mono text-[#737373] shrink-0">
                        ×{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="border-t border-[#1D1D1D] pt-4 space-y-1">
                  {individualSum > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#737373]">Individual price</span>
                      <span className="text-[#737373] line-through font-mono">
                        {formatPrice(individualSum)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#A3A3A3]">Bundle price</span>
                    <span className="font-bold text-sm text-[#F5F5F5] font-mono">
                      {formatPrice(bundle.price as unknown as number)}
                    </span>
                  </div>
                  {savings > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#737373]">Customer saves</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D6FF3F]/10 border border-[#D6FF3F]/20 text-xs font-mono font-bold text-[#D6FF3F]">
                        <Tag size={10} />
                        {savingsPct}% off
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}