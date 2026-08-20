import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2, ShieldAlert } from "lucide-react";
import { ROUTES } from "../../constants/routes.js";
import { Field, Input, Button } from "../../components/ui/Primitives.jsx";
import { authService } from "../../services/authService.js";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | done
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirm) return setError("Passwords don't match.");
    setStatus("loading");
    try {
      await authService.resetPassword(token, form.password);
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err.message || "This reset link is invalid or has expired.");
    }
  };

  if (!token) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2 text-signal-error">
          <ShieldAlert size={18} />
          <p className="text-xs font-semibold uppercase tracking-wide">Invalid link</p>
        </div>
        <h1 className="text-2xl font-bold mb-1">This reset link is invalid</h1>
        <p className="text-sm text-ink-700/60 mb-7">
          The link is missing its reset token. Request a new one below.
        </p>
        <Link to={ROUTES.FORGOT_PASSWORD} className="text-forest-700 font-medium hover:underline text-sm">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2 text-forest-700">
          <CheckCircle2 size={18} />
          <p className="text-xs font-semibold uppercase tracking-wide">Password updated</p>
        </div>
        <h1 className="text-2xl font-bold mb-1">You're all set</h1>
        <p className="text-sm text-ink-700/60 mb-7">Your password has been reset. Sign in with your new password.</p>
        <Button className="w-full" onClick={() => navigate(ROUTES.LOGIN)}>Continue to sign in</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Set a new password</h1>
      <p className="text-sm text-ink-700/60 mb-7">Choose a new password for your account.</p>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field label="New password" htmlFor="password">
          <div className="relative">
            <Input id="password" type={showPw ? "text" : "password"} autoComplete="new-password"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="pr-10" />
            <button type="button" onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/40 hover:text-ink-800"
              aria-label={showPw ? "Hide password" : "Show password"}>
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>
        <Field label="Confirm new password" htmlFor="confirm">
          <Input id="confirm" type={showPw ? "text" : "password"} autoComplete="new-password"
            value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        </Field>

        {error && <p className="text-sm text-signal-error" role="alert">{error}</p>}

        <Button type="submit" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "Updating…" : "Update password"}
        </Button>
      </form>

      <p className="text-sm text-ink-700/60 mt-6">
        <Link to={ROUTES.LOGIN} className="text-forest-700 font-medium hover:underline">Back to sign in</Link>
      </p>
    </div>
  );
}
