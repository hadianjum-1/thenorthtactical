"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  position?: "right" | "left";
  maxWidth?: "sm" | "md" | "lg";
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
  maxWidth = "md",
}: DrawerProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className={`fixed inset-y-0 ${position === "right" ? "right-0" : "left-0"} flex max-w-full`}>
        <div
          role="dialog"
          aria-modal="true"
          className={`w-screen ${widthClasses[maxWidth]} border-[#292929] ${
            position === "right" ? "border-l" : "border-r"
          } bg-[#111111] flex flex-col shadow-2xl z-10`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#292929] bg-[#0E0E0E]">
            {title ? (
              <div className="text-sm font-mono uppercase tracking-wider text-[#F5F5F5] font-semibold">
                {title}
              </div>
            ) : (
              <div />
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#737373] hover:text-[#F5F5F5] hover:bg-white/[0.06] transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
