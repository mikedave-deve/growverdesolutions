import React from "react";

export function Button({ as: As = "button", variant = "primary", size = "md", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none";
  const sizes = { sm: "text-sm px-3 py-1.5", md: "text-sm px-4 py-2.5", lg: "text-base px-5 py-3" };
  const variants = {
    primary: "bg-gold-500 text-ink-900 hover:bg-ink-900 hover:text-white",
    secondary: "bg-white text-ink-800 border border-sand-300 hover:border-forest-500 hover:text-forest-700",
    ghost: "text-ink-700 hover:bg-sand-100",
    danger: "bg-signal-error text-white hover:opacity-90",
  };
  return <As className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}

export function Card({ className = "", ...props }) {
  return <div className={`bg-white border border-sand-200 rounded-2xl shadow-card ${className}`} {...props} />;
}

export function Badge({ tone = "neutral", children, className = "" }) {
  const tones = {
    neutral: "bg-sand-100 text-ink-700 border-sand-300",
    success: "bg-signal-successBg text-signal-success border-signal-success/20",
    warning: "bg-signal-warningBg text-signal-warning border-signal-warning/20",
    error: "bg-signal-errorBg text-signal-error border-signal-error/20",
    info: "bg-signal-infoBg text-signal-info border-signal-info/20",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

const STATUS_TONE = {
  Active: "success", Completed: "success", Approved: "success", Available: "success", Paid: "success", Resolved: "success", Delivered: "success",
  "In Progress": "info", "Under Review": "info", "In Transit": "info", "Out for Delivery": "info", Processing: "info", Open: "info", Scheduled: "info",
  New: "neutral", "Not Started": "neutral", "Order Created": "neutral", Packed: "neutral", Shipped: "neutral",
  Overdue: "error", Rejected: "error", Failed: "error", "Not Found": "error", Terminated: "error", Unpaid: "error",
  "Requires Action": "warning", "Pending Signature": "warning", Incomplete: "warning", Submitted: "info", "Pending Confirmation": "warning", "On Leave": "warning", Suspended: "warning", "On Hold": "warning", Pending: "warning",
};

export function StatusPill({ status }) {
  return <Badge tone={STATUS_TONE[status] || "neutral"}>{status}</Badge>;
}

export function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink-800">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-ink-700/60">{hint}</p>}
      {error && <p className="text-xs text-signal-error">{error}</p>}
    </div>
  );
}

export function Input({ error, className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-white placeholder:text-ink-700/40 focus:border-forest-500 ${
        error ? "border-signal-error" : "border-sand-300"
      } ${className}`}
      {...props}
    />
  );
}

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
      <div>
        {eyebrow && <p className="label-eyebrow mb-1">{eyebrow}</p>}
        <h2 className="text-xl font-bold">{title}</h2>
        {description && <p className="text-sm text-ink-700/70 mt-1 max-w-2xl">{description}</p>}
      </div>
      {action}
    </div>
  );
}
