import React, { useState } from "react";
import { Download, Eye, EyeOff } from "lucide-react";
import { SectionHeading, Card, Field, Input, Button } from "../../components/ui/Primitives.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Logo } from "../../components/brand/Logo.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { employeeService } from "../../services/employeeService.js";
import { authService } from "../../services/authService.js";
import { formatDate } from "../../utils/formatters.js";
import { isValidEmail, isValidPhone } from "../../utils/validators.js";

// Controlled show/hide-state toggle — persistence and the "On"/"Off"
// label (for clarity) are handled by the caller.
function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-sand-100 last:border-0 gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-ink-700/50 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="flex items-center gap-2 shrink-0"
      >
        <span className={`text-xs font-semibold w-6 text-right ${checked ? "text-forest-700" : "text-ink-700/40"}`}>
          {checked ? "On" : "Off"}
        </span>
        <span className={`w-10 h-6 rounded-full relative transition-colors ${checked ? "bg-forest-700" : "bg-sand-300"}`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`} />
        </span>
      </button>
    </div>
  );
}

function PasswordInput({ id, autoComplete, value, error, onChange }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={visible ? "text" : "password"} autoComplete={autoComplete} value={value} error={error} onChange={onChange} className="pr-10" />
      <button type="button" onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/40 hover:text-ink-800"
        aria-label={visible ? "Hide password" : "Show password"}>
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

function ChangePasswordForm() {
  const { push } = useToast();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.current) e.current = "Enter your current password.";
    if (form.next.length < 8) e.next = "New password must be at least 8 characters.";
    if (form.confirm !== form.next) e.confirm = "Passwords don't match.";
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      await authService.changePassword(form.current, form.next);
      push("Password updated.");
      setForm({ current: "", next: "", confirm: "" });
      setErrors({});
    } catch (err) {
      setErrors({ current: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <Field label="Old password" htmlFor="curPw" error={errors.current}>
        {/* autoComplete="new-password" here is deliberate, not the more
            "correct" current-password — current-password actively invites
            the browser to autofill a saved credential on load, which
            reads as content already sitting in the box unasked for. */}
        <PasswordInput id="curPw" autoComplete="new-password" value={form.current} error={!!errors.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
      </Field>
      <Field label="New password" htmlFor="newPw" error={errors.next}>
        <PasswordInput id="newPw" autoComplete="new-password" value={form.next} error={!!errors.next} onChange={(e) => setForm({ ...form, next: e.target.value })} />
      </Field>
      <Field label="Confirm new password" htmlFor="confPw" error={errors.confirm}>
        <PasswordInput id="confPw" autoComplete="new-password" value={form.confirm} error={!!errors.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
      </Field>
      <Button type="submit" size="sm" disabled={saving}>{saving ? "Updating…" : "Change Password"}</Button>
    </form>
  );
}

function AccountDataModal({ open, onClose, user }) {
  const rows = [
    ["Employee ID", user.employeeId],
    ["First name", user.firstName],
    ["Last name", user.lastName],
    ["Email", user.email],
    ["Phone", user.phone || "—"],
    ["Job title", user.jobTitle],
    ["Department", user.department],
    ["Manager", user.manager || "—"],
    ["Location", user.location || "—"],
    ["Employment status", user.employmentStatus],
    ["Start date", formatDate(user.startDate)],
    ["Role", user.role],
    ["Account status", user.status],
  ];

  const download = () => {
    const blob = new Blob([JSON.stringify(user, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `growverde-account-data-${user.employeeId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Your account data"
      maxWidth="max-w-lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
          <Button size="sm" onClick={download}><Download size={14} /> Download JSON</Button>
        </>
      }
    >
      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-sand-100">
        <Logo />
        <p className="text-xs text-ink-700/50">Everything Growverde Solutions has on file for your account.</p>
      </div>
      <div className="space-y-2.5 text-sm max-h-[50vh] overflow-y-auto pr-1">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <span className="text-ink-700/50">{label}</span>
            <span className="font-medium text-right">{value}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export function Settings() {
  const { user, setUser } = useAuth();
  const { push } = useToast();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
  });
  const [dataModalOpen, setDataModalOpen] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.firstName) e.firstName = "First name is required.";
    if (!form.lastName) e.lastName = "Last name is required.";
    if (!isValidEmail(form.email)) e.email = "Enter a valid email address.";
    if (form.phone && !isValidPhone(form.phone)) e.phone = "Enter a valid phone number.";
    return e;
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      const updated = await employeeService.updateProfile(form);
      setUser(updated);
      push("Profile updated.");
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = async (key, value) => {
    const previous = user.preferences;
    setUser({ ...user, preferences: { ...user.preferences, [key]: value } });
    try {
      const updated = await employeeService.updatePreferences({ [key]: value });
      setUser(updated);
    } catch (err) {
      setUser({ ...user, preferences: previous });
      push(err.message || "Couldn't save that preference. Please try again.", "error");
    }
  };

  return (
    <div>
      <SectionHeading eyebrow="Settings" title="Account settings" />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <p className="font-semibold mb-4">Account</p>
          <form onSubmit={updateProfile} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" htmlFor="sfirst" error={errors.firstName}>
                <Input id="sfirst" value={form.firstName} error={!!errors.firstName} onChange={set("firstName")} />
              </Field>
              <Field label="Last name" htmlFor="slast" error={errors.lastName}>
                <Input id="slast" value={form.lastName} error={!!errors.lastName} onChange={set("lastName")} />
              </Field>
            </div>
            <Field label="Email address" htmlFor="semail" error={errors.email}>
              <Input id="semail" type="email" value={form.email} error={!!errors.email} onChange={set("email")} />
            </Field>
            <Field label="Phone number" htmlFor="sphone" error={errors.phone}>
              <Input id="sphone" type="tel" value={form.phone} error={!!errors.phone} onChange={set("phone")} />
            </Field>
            <Button type="submit" size="sm" disabled={saving}>{saving ? "Updating…" : "Update Profile"}</Button>
          </form>
        </Card>

        <Card className="p-6">
          <p className="font-semibold mb-1">Security</p>
          <p className="text-xs text-ink-700/50 mb-3">Manage how you sign in.</p>
          <div className="mb-4">
            <ChangePasswordForm />
          </div>
          
        </Card>

        <Card className="p-6">
          <p className="font-semibold mb-3">Notifications</p>
          <Toggle label="Email notifications" checked={user.preferences.emailNotifications} onChange={(v) => togglePreference("emailNotifications", v)} />
          <Toggle label="Document notifications" checked={user.preferences.documentNotifications} onChange={(v) => togglePreference("documentNotifications", v)} />
          <Toggle label="Payroll notifications" checked={user.preferences.payrollNotifications} onChange={(v) => togglePreference("payrollNotifications", v)} />
          <Toggle label="Logistics notifications" checked={user.preferences.logisticsNotifications} onChange={(v) => togglePreference("logisticsNotifications", v)} />
        </Card>

        <Card className="p-6">
          <p className="font-semibold mb-3">Privacy</p>
          <Toggle label="Share usage data to improve the platform" checked={user.preferences.shareUsageData} onChange={(v) => togglePreference("shareUsageData", v)} />
          <div className="pt-3">
            <Button variant="secondary" size="sm" onClick={() => setDataModalOpen(true)}>Request account data</Button>
          </div>
        </Card>
      </div>

      <AccountDataModal open={dataModalOpen} onClose={() => setDataModalOpen(false)} user={user} />
    </div>
  );
}
