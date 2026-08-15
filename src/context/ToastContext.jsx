import React, { createContext, useContext, useCallback, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    iconWrap: "bg-signal-successBg text-signal-success",
    border: "border-signal-success/25",
    title: "text-signal-success",
    defaultTitle: "Success",
  },
  warning: {
    icon: AlertTriangle,
    iconWrap: "bg-signal-warningBg text-signal-warning",
    border: "border-signal-warning/25",
    title: "text-signal-warning",
    defaultTitle: "Heads up",
  },
  error: {
    icon: XCircle,
    iconWrap: "bg-signal-errorBg text-signal-error",
    border: "border-signal-error/25",
    title: "text-signal-error",
    defaultTitle: "Something went wrong",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  // Accepts an optional `title` so important actions (like an approval)
  // can surface a bolder heading instead of relying on message text
  // alone to signal success.
  const push = useCallback((message, variant = "success", title) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, variant: VARIANTS[variant] ? variant : "success", title }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2.5 sm:w-96">
        {toasts.map((t) => {
          const v = VARIANTS[t.variant];
          const Icon = v.icon;
          return (
            <div
              key={t.id}
              role="status"
              className={`toast-pop flex items-start gap-3 rounded-xl border ${v.border} bg-white px-4 py-3.5 text-sm shadow-popover`}
            >
              <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${v.iconWrap}`}>
                <Icon size={17} strokeWidth={2.25} />
              </span>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className={`font-semibold ${v.title}`}>{t.title || v.defaultTitle}</p>
                <p className="text-ink-700/80 mt-0.5 break-words">{t.message}</p>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 text-ink-700/40 hover:text-ink-800 p-1 -m-1 rounded"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
