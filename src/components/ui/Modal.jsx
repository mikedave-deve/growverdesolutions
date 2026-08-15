import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Modal({ open, onClose, title, children, footer, maxWidth = "max-w-md" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
    // Deliberately only [open]: callers pass a new onClose function
    // identity on every render (e.g. onClose={() => setX(null)}), and
    // depending on it here would re-run this effect — and re-steal
    // focus from whatever's focused inside the modal — on every
    // keystroke in any form field the modal contains.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40 animate-in fade-in" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={ref}
        tabIndex={-1}
        className={`relative bg-white rounded-2xl shadow-popover w-full ${maxWidth} max-h-[90vh] flex flex-col p-6 outline-none animate-in fade-in zoom-in-95`}
      >
        <div className="flex items-start justify-between mb-4 shrink-0">
          <h3 id="modal-title" className="font-display font-bold text-lg">{title}</h3>
          <button onClick={onClose} aria-label="Close dialog" className="text-ink-700/50 hover:text-ink-900 p-1 -m-1 rounded">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
