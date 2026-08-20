import React, { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, CheckCircle2 } from "lucide-react";
import { ROUTES } from "../../constants/routes.js";
import { Field, Input, Button } from "../../components/ui/Primitives.jsx";
import { authService } from "../../services/authService.js";
import { isValidEmail } from "../../utils/validators.js";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | sent
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValidEmail(email)) return setError("Enter a valid email address.");
    setStatus("loading");
    try {
      await authService.requestPasswordReset(email);
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  if (status === "sent") {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2 text-forest-700">
          <CheckCircle2 size={18} />
          <p className="text-xs font-semibold uppercase tracking-wide">Check your inbox</p>
        </div>
        <h1 className="text-2xl font-bold mb-1">Reset link sent</h1>
        <p className="text-sm text-ink-700/60 mb-7">
          If an account exists for <span className="font-medium text-ink-800">{email}</span>, we've sent a
          link to reset your password. It expires in 1 hour.
        </p>
        <Link to={ROUTES.LOGIN} className="text-forest-700 font-medium hover:underline text-sm">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-forest-700">
        <KeyRound size={18} />
        <p className="text-xs font-semibold uppercase tracking-wide">Reset your password</p>
      </div>
      <h1 className="text-2xl font-bold mb-1">Forgot password?</h1>
      <p className="text-sm text-ink-700/60 mb-7">
        Enter the email on your account and we'll send you a link to reset your password.
      </p>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </Field>

        {error && <p className="text-sm text-signal-error" role="alert">{error}</p>}

        <Button type="submit" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="text-sm text-ink-700/60 mt-6">
        Remembered your password? <Link to={ROUTES.LOGIN} className="text-forest-700 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
