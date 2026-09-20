import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, children, className = "", id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] flex items-center justify-between"
          >
            <span>{label}</span>
            {hint && <span className="text-[10px] text-[#737373] normal-case">{hint}</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={`w-full appearance-none rounded-xl border bg-[#111111] text-[#F5F5F5] text-sm px-4 py-3.5 pr-10 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#D6FF3F] focus:border-[#D6FF3F] disabled:opacity-50 disabled:cursor-not-allowed ${
              error ? "border-red-500/80 focus:border-red-500 focus:ring-red-500" : "border-[#292929] hover:border-[#404040]"
            } ${className}`}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-3.5 w-4 h-4 text-[#737373] pointer-events-none" />
        </div>
        {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
