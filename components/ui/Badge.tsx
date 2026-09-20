import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "success" | "warning" | "danger" | "muted" | "tactical";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className = "",
}: BadgeProps) {
  const variantStyles = {
    default: "bg-[#1D1D1D] text-[#A3A3A3] border border-[#292929]",
    accent: "bg-[#D6FF3F]/15 text-[#D6FF3F] border border-[#D6FF3F]/30 font-semibold",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20",
    muted: "bg-[#111111] text-[#737373] border border-[#262626]",
    tactical: "bg-black text-[#F5F5F5] border border-[#404040] font-mono tracking-widest uppercase",
  };

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 rounded-md",
    md: "text-xs px-2.5 py-1 rounded-lg",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono uppercase font-medium select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
