import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { ROUTES } from "../../constants/routes.js";
import { ADMIN_ROLES } from "../../constants/roles.js";
import { Field, Input, Button } from "../../components/ui/Primitives.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { isValidEmail } from "../../utils/validators.js";

// Free-tier hosting for the API can spin down after a period of
// inactivity — the first request after that can take up to a minute
// to wake it back up. These rotate while a login is in flight so a
// slow first request reads as "working" instead of "broken."
const CONNECTING_MESSAGES = [
  "Connecting to our secure server, please wait…",
  "Thanks for your patience — you'll be signed in automatically once connected.",
];

export function Login() {
  const { login, status } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [connectingMessageIndex, setConnectingMessageIndex] = useState(0);

  useEffect(() => {
    if (status !== "loading") {
      setConnectingMessageIndex(0);
      return;
    }
    const id = setInterval(() => {
      setConnectingMessageIndex((i) => (i + 1) % CONNECTING_MESSAGES.length);
    }, 3500);
    return () => clearInterval(id);
  }, [status]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValidEmail(form.email)) return setError("Enter a valid email address.");
    if (!form.password) return setError("Enter your password.");
    try {
      const user = await login(form.email, form.password, form.remember);
      push("Signed in successfully.");
      // One shared login form for every role — where it lands after
      // that depends on who just signed in, not on a separate admin
      // login page.
      navigate(ADMIN_ROLES.includes(user.role) ? ROUTES.ADMIN : ROUTES.DASHBOARD);
    } catch (err) {
      // The backend distinguishes invalid credentials from a pending
      // approval account with a specific message — both render through
      // this same existing error element, just with different text.
      setError(err.message || "We couldn't sign you in. Check your email and password.");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-forest-700">
        <ShieldCheck size={18} />
        <p className="text-xs font-semibold uppercase tracking-wide">Secure Growverde Solutions Employee Portal</p>
      </div>
      <h1 className="text-2xl font-bold mb-1">Sign in</h1>
      <p className="text-sm text-ink-700/60 mb-7">Enter your credentials to access your employee account.</p>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field label="Email" htmlFor="email" error={error && !form.password ? undefined : undefined}>
          <Input id="email" type="email" autoComplete="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Password" htmlFor="password">
          <div className="relative">
            <Input id="password" type={showPw ? "text" : "password"} autoComplete="current-password"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="pr-10" />
            <button type="button" onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/40 hover:text-ink-800"
              aria-label={showPw ? "Hide password" : "Show password"}>
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>

        {error && <p className="text-sm text-signal-error" role="alert">{error}</p>}

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-700">
            <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })}
              className="rounded border-sand-300 text-forest-700 focus:ring-forest-500" />
            Remember me
          </label>
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-forest-700 font-medium hover:underline">Forgot password?</Link>
        </div>

        <Button type="submit" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {status === "loading" && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-forest-200 bg-forest-50 p-4">
          <Loader2 size={18} className="mt-0.5 shrink-0 animate-spin text-forest-700" />
          <p className="text-sm text-forest-700">{CONNECTING_MESSAGES[connectingMessageIndex]}</p>
        </div>
      )}

      <p className="text-sm text-ink-700/60 mt-6">
        New to Growverde Solutions? <Link to={ROUTES.REGISTER} className="text-forest-700 font-medium hover:underline">Create an account</Link>
      </p>
      <p className="text-sm text-ink-700/60 mt-2">
        Need help? <Link to={ROUTES.SUPPORT} className="text-forest-700 font-medium hover:underline">Contact support</Link>
      </p>
    </div>
  );
}
