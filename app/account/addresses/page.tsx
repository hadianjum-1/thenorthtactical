import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function AccountAddressesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-mono uppercase font-bold text-[#F5F5F5]">
            SAVED DISPATCH ADDRESSES ({addresses.length})
          </h2>
          <p className="text-xs font-mono text-[#737373] mt-0.5">
            Default tactical delivery locations for rapid checkout.
          </p>
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#292929] bg-[#141414] p-10 text-center max-w-lg mx-auto">
          <MapPin className="w-8 h-8 text-[#525252] mx-auto mb-3" />
          <h3 className="text-sm font-mono font-bold uppercase text-[#F5F5F5]">
            NO ADDRESSES RECORDED
          </h3>
          <p className="text-xs font-mono text-[#737373] mt-1">
            Addresses are automatically saved when you complete an order checkout.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="rounded-2xl border border-[#262626] bg-[#141414] p-6 space-y-2 text-xs font-mono"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#222222]">
                <span className="font-bold text-[#F5F5F5] uppercase text-sm">
                  {addr.recipient}
                </span>
                <span className="text-[10px] text-[#D6FF3F] bg-[#D6FF3F]/10 px-2 py-0.5 rounded border border-[#D6FF3F]/20">
                  VERIFIED
                </span>
              </div>
              <p className="text-[#A3A3A3] pt-1">{addr.line1}</p>
              {addr.line2 && <p className="text-[#A3A3A3]">{addr.line2}</p>}
              <p className="text-[#A3A3A3]">
                {addr.city}, {addr.region} {addr.postalCode}
              </p>
              <p className="text-[#A3A3A3]">{addr.country}</p>
              <p className="text-[#737373] pt-2">COMMUNICATION: {addr.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
