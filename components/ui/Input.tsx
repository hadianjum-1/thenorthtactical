import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] flex items-center justify-between"
          >
            <span>{label}</span>
            {hint && <span className="text-[10px] text-[#737373] normal-case">{hint}</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-[#737373] pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-xl border bg-[#111111] text-[#F5F5F5] placeholder-[#525252] text-sm transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#D6FF3F] focus:border-[#D6FF3F] disabled:opacity-50 disabled:cursor-not-allowed ${
              icon ? "pl-10 pr-4" : "px-4"
            } py-3.5 ${
              error ? "border-red-500/80 focus:border-red-500 focus:ring-red-500" : "border-[#292929] hover:border-[#404040]"
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
