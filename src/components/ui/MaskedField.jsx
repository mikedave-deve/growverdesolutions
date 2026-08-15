import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Field, Input } from "./Primitives.jsx";

// A text field masked like a password with a show/hide toggle — used
// anywhere a form wants that same reveal interaction (Login's password
// field, Company Services, Retirement Benefits) without necessarily
// holding an actual secret.
export function MaskedField({ label, htmlFor, value, onChange }) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} htmlFor={htmlFor}>
      <div className="relative">
        <Input id={htmlFor} type={visible ? "text" : "password"} value={value} onChange={onChange} className="pr-10" required />
        <button type="button" onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/40 hover:text-ink-800"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </Field>
  );
}
