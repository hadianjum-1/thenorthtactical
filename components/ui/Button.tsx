import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "tactical";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      loading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium tracking-wide uppercase transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none";

    const variantStyles = {
      primary:
        "bg-[#D6FF3F] text-[#0A0A0A] hover:bg-[#B8E62E] font-semibold active:translate-y-[1px] shadow-[0_0_20px_rgba(214,255,63,0.2)]",
      secondary:
        "bg-[#1D1D1D] text-[#F5F5F5] hover:bg-[#262626] border border-[#292929] hover:border-[#404040]",
      outline:
        "bg-transparent text-[#F5F5F5] border border-[#292929] hover:border-[#F5F5F5] hover:bg-[#171717]",
      ghost:
        "bg-transparent text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-white/[0.05]",
      danger:
        "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30",
      tactical:
        "bg-[#111111] text-[#D6FF3F] border border-[#D6FF3F]/30 hover:border-[#D6FF3F] hover:bg-[#D6FF3F]/10 font-mono",
    };

    const sizeStyles = {
      sm: "text-xs px-3.5 py-2 rounded-lg gap-2 tracking-wider",
      md: "text-xs px-5 py-3 rounded-xl gap-2.5 tracking-wider",
      lg: "text-sm px-7 py-4 rounded-xl gap-3 tracking-widest font-semibold",
      icon: "p-2.5 rounded-xl",
    };

    const effectiveLoading = isLoading || loading;

    return (
      <button
        ref={ref}
        disabled={disabled || effectiveLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {effectiveLoading && <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
