import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[#1A1A1A] border border-white/[0.03] ${className}`}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#262626] bg-[#141414] overflow-hidden p-4 flex flex-col gap-4">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="w-1/3 h-3" />
        <Skeleton className="w-3/4 h-5" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="w-1/3 h-6" />
        <Skeleton className="w-1/4 h-8 rounded-lg" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-[#262626]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}
