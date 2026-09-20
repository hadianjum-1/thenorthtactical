import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { User, Shield, Key } from "lucide-react";

export default async function AccountProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-xl font-mono uppercase font-bold text-[#F5F5F5]">
          OPERATOR CREDENTIALS
        </h2>
        <p className="text-xs font-mono text-[#737373] mt-0.5">
          Account identity details and operational role permissions.
        </p>
      </div>

      <div className="rounded-2xl border border-[#262626] bg-[#141414] p-6 sm:p-8 space-y-6">
        <div className="space-y-4 text-xs font-mono">
          <div className="flex justify-between py-3 border-b border-[#222222]">
            <span className="text-[#737373] uppercase">OPERATOR NAME</span>
            <span className="text-[#F5F5F5] font-semibold">{user?.name || "Not set"}</span>
          </div>

          <div className="flex justify-between py-3 border-b border-[#222222]">
            <span className="text-[#737373] uppercase">PRIMARY EMAIL</span>
            <span className="text-[#F5F5F5] font-semibold">{user?.email}</span>
          </div>

          <div className="flex justify-between py-3 border-b border-[#222222]">
            <span className="text-[#737373] uppercase">CONTACT PHONE</span>
            <span className="text-[#F5F5F5] font-semibold">{user?.phone || "Not set"}</span>
          </div>

          <div className="flex justify-between py-3 border-b border-[#222222]">
            <span className="text-[#737373] uppercase">SECURITY ROLE</span>
            <span className="text-[#D6FF3F] font-bold">{user?.role}</span>
          </div>

          <div className="flex justify-between py-3">
            <span className="text-[#737373] uppercase">COMMISSION DATE</span>
            <span className="text-[#A3A3A3]">
              {user ? new Date(user.createdAt).toLocaleDateString() : "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
