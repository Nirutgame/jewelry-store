"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiExclamation, HiX } from "react-icons/hi";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const config = {
    success: { icon: HiCheckCircle, bg: "bg-green-50 border-green-400", text: "text-green-800", iconColor: "text-green-500" },
    error: { icon: HiXCircle, bg: "bg-red-50 border-red-400", text: "text-red-800", iconColor: "text-red-500" },
    info: { icon: HiInformationCircle, bg: "bg-blue-50 border-blue-400", text: "text-blue-800", iconColor: "text-blue-500" },
    warning: { icon: HiExclamation, bg: "bg-amber-50 border-amber-400", text: "text-amber-800", iconColor: "text-amber-500" },
  };

  const c = config[toast.type];
  const Icon = c.icon;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-in ${c.bg}`}
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${c.iconColor}`} />
      <p className={`text-sm font-medium flex-1 ${c.text}`}>{toast.message}</p>
      <button onClick={onClose} className={`shrink-0 ${c.text} hover:opacity-70`}>
        <HiX className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
