import React from "react";
import { RotateCw, Inbox, AlertTriangle } from "lucide-react";
import { Button } from "./Primitives.jsx";

export function LoadingState({ label = "Loading…", rows = 3 }) {
  return (
    <div className="py-6" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-2 text-sm text-ink-700/60 mb-4">
        <RotateCw size={14} className="animate-spin" /> {label}
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-11 rounded-lg bg-sand-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      <div className="w-11 h-11 rounded-full bg-sand-100 flex items-center justify-center mb-4">
        <Icon size={20} className="text-ink-700/50" />
      </div>
      <p className="font-semibold text-ink-900">{title}</p>
      {description && <p className="text-sm text-ink-700/60 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6" role="alert">
      <div className="w-11 h-11 rounded-full bg-signal-errorBg flex items-center justify-center mb-4">
        <AlertTriangle size={20} className="text-signal-error" />
      </div>
      <p className="font-semibold text-ink-900">Unable to load this page</p>
      <p className="text-sm text-ink-700/60 mt-1">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          <RotateCw size={14} /> Retry
        </Button>
      )}
    </div>
  );
}

// Wraps a useAsync() result and renders the right state automatically.
export function AsyncBoundary({ status, error, retry, empty, children, loadingRows }) {
  if (status === "loading") return <LoadingState rows={loadingRows} />;
  if (status === "error") return <ErrorState message={error?.message} onRetry={retry} />;
  if (empty) return empty;
  return children;
}
