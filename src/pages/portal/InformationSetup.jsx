import React, { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { SectionHeading, Card, Field, Input, Button } from "../../components/ui/Primitives.jsx";
import { useOutletContext } from "react-router-dom";
import { useToast } from "../../context/ToastContext.jsx";
import { employeeService } from "../../services/employeeService.js";
import { notifyService } from "../../services/notifyService.js";
import { useNotifications } from "../../context/NotificationsContext.jsx";
import { isValidEmail, isValidPhone } from "../../utils/validators.js";

function Section({ title, children }) {
  return (
    <Card className="p-6">
      <p className="font-semibold mb-4">{title}</p>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </Card>
  );
}

export function InformationSetup() {
  const { user } = useOutletContext();
  const { push } = useToast();
  const { refresh: refreshNotifications } = useNotifications();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAccount, setShowAccount] = useState(false);
  const [showRouting, setShowRouting] = useState(false);
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    email: user.email,
    address: "",
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.firstName) e.firstName = "First name is required.";
    if (!form.lastName) e.lastName = "Last name is required.";
    if (!isValidEmail(form.email)) e.email = "Enter a valid email address.";
    if (form.phone && !isValidPhone(form.phone)) e.phone = "Enter a valid phone number.";
    if (form.accountNumber && !/^\d{4,17}$/.test(form.accountNumber)) e.accountNumber = "Account number should be 4–17 digits.";
    if (form.routingNumber && !/^\d{9}$/.test(form.routingNumber)) e.routingNumber = "Routing number must be 9 digits.";
    return e;
  };

  // Personal, employment, and payment details are emailed straight to
  // the company inbox via a real endpoint (notifyService.submitInformationSetup
  // → POST /api/notify/information-setup), using the same branded
  // template as the approval email — account/routing numbers are sent
  // unmasked, per instruction. employeeService.updateProfile(...) also
  // persists the personal-contact fields to the employee's own real
  // profile record (PATCH /api/employees/me).
  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    try {
      await employeeService.updateProfile(form);
      // The notification itself is created server-side as a side
      // effect of this call — refresh() just picks it up so the
      // Topbar bell badge updates immediately.
      const { emailSent } = await notifyService.submitInformationSetup(form);
      refreshNotifications();
      push(
        emailSent ? "Details submitted — sent to HR for review." : "Details submitted, but the email to HR couldn't be sent. Please follow up directly.",
        emailSent ? "success" : "warning"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeading eyebrow="Information Setup" title="Complete your information" description="Keep your personal, employment, and payment details current. Submitting sends your details to HR for review." />
      <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
        <Section title="Personal information">
          <Field label="Legal first name" htmlFor="lfn" error={errors.firstName}>
            <Input id="lfn" value={form.firstName} error={!!errors.firstName} onChange={set("firstName")} />
          </Field>
          <Field label="Legal last name" htmlFor="lln" error={errors.lastName}>
            <Input id="lln" value={form.lastName} error={!!errors.lastName} onChange={set("lastName")} />
          </Field>
          <Field label="Phone" htmlFor="phn" error={errors.phone}>
            <Input id="phn" value={form.phone} error={!!errors.phone} onChange={set("phone")} />
          </Field>
          <Field label="Email" htmlFor="eml" error={errors.email}>
            <Input id="eml" type="email" value={form.email} error={!!errors.email} onChange={set("email")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Mailing address" htmlFor="addr"><Input id="addr" placeholder="Street, City, State, ZIP" value={form.address} onChange={set("address")} /></Field>
          </div>
        </Section>

        <Section title="Employment information">
          <Field label="Employee ID" htmlFor="eid"><Input id="eid" defaultValue={user.employeeId} disabled className="bg-sand-50" /></Field>
          <Field label="Department" htmlFor="dept"><Input id="dept" defaultValue={user.department} disabled className="bg-sand-50" /></Field>
          <Field label="Job title" htmlFor="title"><Input id="title" defaultValue={user.jobTitle} disabled className="bg-sand-50" /></Field>
          <Field label="Manager" htmlFor="mgr"><Input id="mgr" defaultValue={user.manager} disabled className="bg-sand-50" /></Field>
        </Section>

        <Section title="Payment information">
          <Field label="Account holder name" htmlFor="holder"><Input id="holder" placeholder="Full name on the account" value={form.accountHolder} onChange={set("accountHolder")} /></Field>
          <Field label="Bank name" htmlFor="bank"><Input id="bank" placeholder="e.g. First National Bank" value={form.bankName} onChange={set("bankName")} /></Field>
          <Field label="Account number" htmlFor="acct" error={errors.accountNumber} hint={!errors.accountNumber ? "Masked once submitted." : undefined}>
            <div className="relative">
              <Input id="acct" type={showAccount ? "text" : ""} inputMode="alphabet" placeholder="•••• •••• ••••"
                value={form.accountNumber} error={!!errors.accountNumber} onChange={set("accountNumber")} className="pr-10" />
              <button type="button" onClick={() => setShowAccount((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/40 hover:text-ink-800"
                aria-label={showAccount ? "Hide account number" : "Show account number"}>
                {showAccount ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </Field>
          <Field label="Routing number" htmlFor="routing" error={errors.routingNumber} hint={!errors.routingNumber ? "9-digit bank routing number." : undefined}>
            <div className="relative">
              <Input id="routing" type={showRouting ? "text" : "password"} inputMode="numeric" placeholder="•••••••••"
                value={form.routingNumber} error={!!errors.routingNumber} onChange={set("routingNumber")} className="pr-10" />
              <button type="button" onClick={() => setShowRouting((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/40 hover:text-ink-800"
                aria-label={showRouting ? "Hide routing number" : "Show routing number"}>
                {showRouting ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </Field>
        </Section>

        <div><Button type="submit" disabled={saving}>{saving ? "Submitting…" : "Submit Details"}</Button></div>
      </form>

      <Card className="p-5 mt-6">
        <div className="flex items-center gap-2 text-forest-700 mb-2"><ShieldCheck size={16} /><p className="text-sm font-semibold">How this is protected</p></div>
        <ul className="text-xs text-ink-700/60 space-y-2 list-disc list-inside">
          <li>Accessible only to authorized personnel</li>
          <li>Account and routing numbers are never stored in browser storage or URLs</li>
          <li>HR is notified by email only that your details were submitted for review</li>
          <li>Reviewed and audited by authorized personnel </li>
        </ul>
      </Card>
    </div>
  );
}
