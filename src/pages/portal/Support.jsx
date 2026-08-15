import React, { useState } from "react";
import { LifeBuoy, MessageSquare } from "lucide-react";
import { SectionHeading, Card, Field, Input, Button } from "../../components/ui/Primitives.jsx";
import { AsyncBoundary, EmptyState } from "../../components/ui/States.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { supportService } from "../../services/supportService.js";
import { formatDate } from "../../utils/formatters.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useNotifications } from "../../context/NotificationsContext.jsx";

const FAQ = [
  { q: "When is payroll processed?", a: "Payroll runs biweekly, with pay statements available in the Payroll tab three days before the payment date." },
  { q: "How do I update my mailing address?", a: "Go to Information Setup and update your personal information section." },
  { q: "Who can see my identity verification documents?", a: "Only authorized HR and administrator personnel — never other employees." },
];

export function Support() {
  const { data, status, error, retry } = useAsync(() => supportService.getTickets(), []);
  const { push } = useToast();
  const { refresh: refreshNotifications } = useNotifications();
  const [subject, setSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Every request is emailed straight to the company inbox and logged
  // as a plain history entry — no open/resolved status. The
  // notification itself is created server-side as a side effect of
  // this call — refresh() just picks it up for the Topbar badge.
  const submit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) return;
    setSubmitting(true);
    try {
      const { emailSent } = await supportService.submitTicket({ subject });
      refreshNotifications();
      setSubject("");
      push(
        emailSent ? "Support request submitted — sent to the support team." : "Submitted, but the email to the support team couldn't be sent.",
        emailSent ? "success" : "warning"
      );
      retry();
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <SectionHeading eyebrow="Support" title="Support" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <p className="font-semibold mb-4 flex items-center gap-2"><MessageSquare size={16} /> Submit a request</p>
            <form onSubmit={submit} className="space-y-4">
              <Field label="What do you need help with?" htmlFor="subj">
                <Input id="subj" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Missing pay statement" />
              </Field>
              <Button type="submit" size="sm" disabled={submitting}>{submitting ? "Submitting…" : "Submit request"}</Button>
            </form>
          </Card>

          <Card className="p-6">
            <p className="font-semibold mb-3 flex items-center gap-2"><LifeBuoy size={16} /> Help center</p>
            <div className="divide-y divide-sand-100">
              {FAQ.map((f) => (
                <details key={f.q} className="py-2.5 group">
                  <summary className="text-sm font-medium cursor-pointer list-none flex justify-between items-center">
                    {f.q}
                    <span className="text-ink-700/30 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="text-sm text-ink-700/60 mt-2">{f.a}</p>
                </details>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <p className="font-semibold mb-4">Ticket history</p>
          <AsyncBoundary
            status={status} error={error} retry={retry}
            empty={data?.length === 0 ? <EmptyState icon={LifeBuoy} title="No support requests yet" /> : null}
          >
            <ul className="space-y-3">
              {data?.map((t) => (
                <li key={t.id} className="text-sm border-b border-sand-100 last:border-0 pb-3 last:pb-0">
                  <p className="font-medium">{t.subject}</p>
                  <p className="text-xs text-ink-700/50 mt-0.5">{formatDate(t.date)}</p>
                </li>
              ))}
            </ul>
          </AsyncBoundary>
        </Card>
      </div>
    </div>
  );
}
