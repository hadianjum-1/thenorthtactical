import React from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading Tactical Operations..." }: { message?: string }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-[#292929] flex items-center justify-center relative overflow-hidden">
          <Image
            src="/logo.png"
            alt="The North Tactical"
            width={40}
            height={40}
            className="opacity-70"
          />
        </div>
        <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#D6FF3F] text-[#0A0A0A]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        </div>
      </div>
      <p className="text-xs font-mono tracking-widest text-[#737373] uppercase animate-pulse">
        {message}
      </p>
    </div>
  );
}
