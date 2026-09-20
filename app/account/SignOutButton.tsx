"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase text-[#737373] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>DISCONNECT</span>
    </button>
  );
}
