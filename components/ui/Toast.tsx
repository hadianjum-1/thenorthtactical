"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastType;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string | ToastOptions, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string | ToastOptions, type: ToastType = "success") => {
      const resolvedMessage =
        typeof message === "string"
          ? message
          : message.description
          ? `${message.title ?? "Notification"}: ${message.description}`
          : message.title ?? "Notification";

      const resolvedType = typeof message === "string" ? type : message.variant ?? type;

      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message: resolvedMessage, type: resolvedType }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-3 ${
              t.type === "success"
                ? "bg-[#141414]/95 border-[#D6FF3F]/30 text-[#F5F5F5]"
                : t.type === "error"
                ? "bg-[#1C1414]/95 border-red-500/30 text-red-300"
                : "bg-[#141414]/95 border-[#292929] text-[#F5F5F5]"
            }`}
          >
            <div className="flex items-center gap-3">
              {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-[#D6FF3F] shrink-0" />}
              {t.type === "error" && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
              {t.type === "info" && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
              <span className="text-xs font-mono tracking-wide">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#737373] hover:text-[#F5F5F5] transition-colors p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
