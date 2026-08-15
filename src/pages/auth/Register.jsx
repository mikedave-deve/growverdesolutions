import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes.js";
import { Field, Input, Button } from "../../components/ui/Primitives.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { authService } from "../../services/authService.js";
import { isValidEmail, isValidPhone, passwordStrength, passwordStrengthLabel } from "../../utils/validators.js";

const STRENGTH_COLORS = ["bg-signal-error", "bg-signal-error", "bg-signal-warning", "bg-forest-400", "bg-forest-600"];

export function Register() {
  const navigate = useNavigate();
  const { push } = useToast();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "", terms: false });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const strength = passwordStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.firstName) e.firstName = "First name is required.";
    if (!form.lastName) e.lastName = "Last name is required.";
    if (!isValidEmail(form.email)) e.email = "Enter a valid email address.";
    if (form.phone && !isValidPhone(form.phone)) e.phone = "Enter a valid phone number.";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (form.confirm !== form.password) e.confirm = "Passwords don't match.";
    if (!form.terms) e.terms = "You must accept the terms to continue.";
    return e;
  };

  // A new account is Pending Approval and cannot sign in yet, so
  // registration intentionally does NOT start a session here — it
  // only confirms the submission and sends the person to sign in
  // later, once approved.
  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    try {
      await authService.register(form);
      push("Registration successful! Your account is pending admin approval. You will receive an email once approved.");
      navigate(ROUTES.LOGIN);
    } catch (err) {
      setErrors({ email: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Create your account</h1>
      <p className="text-sm text-ink-700/60 mb-7">Set up access to your Growverde Solutions employee portal.</p>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" htmlFor="firstName" error={errors.firstName}>
            <Input id="firstName" value={form.firstName} error={!!errors.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </Field>
          <Field label="Last name" htmlFor="lastName" error={errors.lastName}>
            <Input id="lastName" value={form.lastName} error={!!errors.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </Field>
        </div>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input id="email" type="email" value={form.email} error={!!errors.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Phone" htmlFor="phone" error={errors.phone} hint="Optional">
          <Input id="phone" type="tel" value={form.phone} error={!!errors.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password}>
          <Input id="password" type="password" value={form.password} error={!!errors.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {form.password && (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex gap-1 flex-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${i < strength ? STRENGTH_COLORS[strength] : "bg-sand-200"}`} />
                ))}
              </div>
              <span className="text-xs text-ink-700/50 w-16 text-right">{passwordStrengthLabel(strength)}</span>
            </div>
          )}
        </Field>
        <Field label="Confirm password" htmlFor="confirm" error={errors.confirm}>
          <Input id="confirm" type="password" value={form.confirm} error={!!errors.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        </Field>

        <label className="flex items-start gap-2.5 text-sm text-ink-700">
          <input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })}
            className="mt-0.5 rounded border-sand-300 text-forest-700 focus:ring-forest-500" />
          <span>I agree to the Terms of Service and Privacy Policy.</span>
        </label>
        {errors.terms && <p className="text-sm text-signal-error">{errors.terms}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-ink-700/60 mt-6">
        Already have an account? <Link to={ROUTES.LOGIN} className="text-forest-700 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
