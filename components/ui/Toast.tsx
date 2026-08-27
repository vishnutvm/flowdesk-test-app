"use client";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import clsx from "clsx";

interface Toast {
  id: number;
  message: string;
  variant: "success" | "error" | "info";
}

interface ToastContextValue {
  showToast: (message: string, variant?: Toast["variant"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, variant: Toast["variant"] = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        data-testid="toast-container"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            data-testid="toast"
            data-variant={t.variant}
            className={clsx(
              "pointer-events-auto min-w-[240px] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg",
              t.variant === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
              t.variant === "error" && "border-red-200 bg-red-50 text-red-800",
              t.variant === "info" && "border-indigo-200 bg-indigo-50 text-indigo-800"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
