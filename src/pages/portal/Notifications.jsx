import React, { useState } from "react";
import { Bell, Archive, Check } from "lucide-react";
import { SectionHeading, Card, Badge, Button } from "../../components/ui/Primitives.jsx";
import { AsyncBoundary, EmptyState } from "../../components/ui/States.jsx";
import { useNotifications } from "../../context/NotificationsContext.jsx";
import { notificationService } from "../../services/notificationService.js";
import { formatDate } from "../../utils/formatters.js";

const CATS = ["All", "Employment", "Documents", "Payroll", "Logistics", "Tasks", "Attendance", "Verification", "Security", "Support"];

export function Notifications() {
  // Shared with the Topbar bell badge — mark-as-read/archive here also
  // refresh that shared state, so the badge count stays in sync.
  const { notifications, status, refresh } = useNotifications();
  const [cat, setCat] = useState("All");
  const [archivedIds, setArchivedIds] = useState(new Set());
  const [readIds, setReadIds] = useState(new Set());

  const rows = notifications
    .filter((n) => !archivedIds.has(n.id))
    .filter((n) => cat === "All" || n.category === cat);

  const markAsRead = async (id) => {
    setReadIds((s) => new Set(s).add(id));
    await notificationService.markAsRead(id);
    refresh();
  };

  const archive = async (id) => {
    setArchivedIds((s) => new Set(s).add(id));
    await notificationService.archive(id);
    refresh();
  };

  return (
    <div>
      <SectionHeading eyebrow="Notifications" title="Notifications" description="Everything happening across your portal — documents, payroll, logistics, tasks, and account security." />
      <div className="flex gap-2 flex-wrap mb-5">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border ${cat === c ? "bg-ink-900 text-white border-ink-900" : "bg-white text-ink-700 border-sand-300 hover:border-forest-400"}`}>
            {c}
          </button>
        ))}
      </div>
      <AsyncBoundary
        status={status} retry={refresh}
        empty={rows.length === 0 && status === "success" ? <EmptyState icon={Bell} title="You're all caught up" description="Nothing here for this category." /> : null}
      >
        <div className="flex flex-col gap-2.5">
          {rows.map((n) => {
            const isRead = n.read || readIds.has(n.id);
            return (
              <Card key={n.id} className={`p-4 flex items-center justify-between gap-4 flex-wrap ${!isRead ? "border-forest-300" : ""}`}>
                <div className="flex items-center gap-3">
                  {!isRead && <span className="w-2 h-2 rounded-full bg-forest-600 shrink-0" aria-label="Unread" />}
                  <div>
                    <div className="flex items-center gap-2 mb-0.5"><Badge>{n.category}</Badge></div>
                    <p className={`text-sm ${!isRead ? "font-semibold" : ""}`}>{n.title}</p>
                    <p className="text-xs text-ink-700/50 mt-0.5">{formatDate(n.date)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!isRead && (
                    <Button variant="ghost" size="sm" aria-label="Mark as read" onClick={() => markAsRead(n.id)}><Check size={14} /></Button>
                  )}
                  <Button variant="ghost" size="sm" aria-label="Archive" onClick={() => archive(n.id)}><Archive size={14} /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      </AsyncBoundary>
    </div>
  );
}
