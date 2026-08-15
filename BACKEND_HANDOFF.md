# Growverde Solutions — Backend Handoff Spec

This documents exactly what the frontend now expects from a real
backend, organized by feature. Every mock service function referenced
below already exists in `src/services/` with a `BACKEND INTEGRATION
POINT` comment at the call site — search the codebase for that phrase
to find every place a real API call replaces a mock one.

All data in the frontend is fictional/test data for a school project.
No real personal, financial, or credential data is collected or sent
anywhere by this codebase as it stands.

---

## 1. Shared mock "email" service

**File:** `src/services/notifyService.js`

Several forms (Information Setup, Identity Verification, Support) are
specified as "whatever is submitted here should be sent to HR by
email." Rather than each page rolling its own fetch call, they all
call one shared function:

```js
notifyService.sendToEmail({ subject, summary })
```

**Real endpoint:** `POST /api/notify/email`
The server resolves the destination address from a configured HR
distribution list — the frontend never knows or sends a real
recipient address, and never receives delivery confirmation beyond
"queued." Render the email server-side from a template; never forward
raw form payloads verbatim into an email body.

---

## 2. Information Setup — `src/pages/portal/InformationSetup.jsx`

- Button renamed **Submit Details** (was "Save information").
- Added payment fields: **Account holder name, Bank Name, Account
  Number, Routing Number** (routing validated client-side as 9
  digits; account number as 4–17 digits — real validation must also
  happen server-side).
- On submit: calls `employeeService.updateProfile()` **and**
  `notifyService.sendToEmail()`, then `notificationService.notify()`.

**Real endpoints:**
- `PATCH /api/employees/:id` — personal + payment info. Payment fields
  must be encrypted at rest; never log or return them in full in any
  response.
- `POST /api/notify/email` (see §1)

---

## 3. Identity Verification — `src/pages/portal/Verification.jsx`

**Unchanged by request** except:
- Step 3 relabeled **"SSN"** (was "Sensitive identifier").
- Submission now also calls `notifyService.sendToEmail()` — the email
  contains only a status summary, never the SSN or ID images.
- Updated one sidebar bullet that had become factually inaccurate
  once email notification was added ("Never included in ordinary
  email notifications" → "HR is notified by email only that a
  submission is pending — never your SSN or ID images").

**Real endpoints:**
- ID images upload via multipart directly to secure object storage
  (S3-style, signed URLs) — never through the notify-email path.
- `POST /api/verification/submit` — stores only metadata + status in
  the database; the SSN itself should be encrypted at rest or
  tokenized, and access-logged.
- `POST /api/notify/email` (see §1) — status summary only.

---

## 4. Payroll — `src/pages/portal/Payroll.jsx`

**Note on scope:** the original brief described a "deposit" flow
where the employee sends funds to a company Bitcoin address, and a
"transfer" flow with a confirmation code. That mechanic was not
implemented — it matches advance-fee/crypto payment-diversion scam
patterns, not a legitimate payroll feature. What's implemented instead
covers the same UI surface (deposit management, transfer, confirmation
code, transfer summary, transaction history) using the standard,
legitimate version of each: the employee manages *their own* linked
bank accounts and moves funds *between those accounts* — never to the
company.

Implemented:
- **Overview cards:** Balance, Next Pay Date, Gross, Deductions,
  Status — all from `payrollService.getCurrentPay()`.
- **Direct deposit accounts:** list + "Add Account" form (account
  holder, bank name, account number, type, split %).
- **Transfer between accounts:** From/To account, amount, type →
  `submitTransfer()` creates a pending record → confirmation-code
  modal → `confirmTransfer()` → Transfer Summary + appended to
  Transaction History.
- **Transaction history** and **Pay history** tables.

**Real endpoints:**
- `GET /api/payroll/current`
- `GET /api/payroll/history`
- `GET /api/payroll/deposit-accounts` / `PATCH /api/payroll/deposit-accounts`
- `GET /api/payroll/transfers`
- `POST /api/payroll/transfers` — server generates and sends a real
  one-time code to the employee's verified email/phone
- `POST /api/payroll/transfers/:id/confirm` — server verifies the
  code it generated; the frontend's mock code (`123456`) is a demo
  stand-in only and must not exist in a real build

---

## 5. Company Services — `src/pages/portal/CompanyServices.jsx`

**Not changed.** The brief asked for this page to become a "Phone
Service" form collecting the employee's personal carrier account
username and password, framed as needed for Finance to "use a company
promo code to purchase your equipment." That specific request was not
implemented — it matches a documented tactic for harvesting a
victim's phone-carrier login to enable SIM-swap/account-takeover
fraud, regardless of the "school project" framing. The existing page
(masked, company-*issued* credentials only, e.g. VPN/fleet phone
line) was left as-is.

If you want a legitimate equipment/phone-line request feature instead,
a safe version would be a simple form (equipment needed, phone line
requested, ship-to location) that never asks for the employee's own
account password — happy to build that on request.

---

## 6. Notifications — `src/pages/portal/Notifications.jsx`

- Fixed: **Mark as read** and **Archive** buttons were previously
  rendered but did nothing — now call
  `notificationService.markAsRead()` / `.archive()` and update local
  state immediately (optimistic UI).
- Categories broadened to cover everything else built in this pass:
  Employment, Documents, Payroll, Logistics, Tasks, Attendance,
  Verification, Security, Support.
- `notificationService.notify()` is called from Information Setup,
  Identity Verification, Support, and Payroll (account added / transfer
  confirmed) so portal activity performed earlier in a session shows
  up here — a lightweight mock event bus (module-level array mutation)
  standing in for what would be a real-time feed or polling endpoint.

**Real endpoints:**
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/:id/archive`
- Notifications should be inserted server-side as a side effect of the
  actions above (e.g. the support-ticket endpoint itself inserts a
  notification row) rather than via a separate client call.

---

## 7. Account Settings — `src/pages/portal/Settings.jsx`

- **Change Password**: inline form, current password + new password +
  confirm, with strength meter (reuses the same `passwordStrength`
  util as Register). Calls `authService.changePassword()`.
- **Profile fields**: split into First name / Last name / Email
  address / Phone number, all validated client-side. Button renamed
  **Update Profile**.

**Real endpoints:**
- `POST /api/auth/change-password` — `{ currentPassword, newPassword }`;
  server re-verifies the current password hash before updating.
- `PATCH /api/employees/:id` (same endpoint as §2)

---

## 8. Support — `src/pages/portal/Support.jsx`

- Submitting a request now calls `supportService.submitTicket()`
  **and** `notifyService.sendToEmail()`, plus
  `notificationService.notify()`.
- Submit button shows a "Submitting…" loading state and is
  disabled while in flight (previously had no loading state).

**Real endpoints:**
- `POST /api/support/tickets`
- `POST /api/notify/email` (see §1)

---

## 9. Logistics — `src/pages/portal/Logistics.jsx`

- Added a **"Track your shipment"** search box: "Enter your tracking
  number below to view your real-time status." + input + Track
  button.
- Results render as a collapsed summary row (tracking number + status)
  that expands on click to show the full progress timeline + shipment
  details — same detail card as before, now also reachable by search.
- Falls back to showing the employee's current assigned shipment when
  no search has been performed.

**Real endpoints:**
- `GET /api/logistics/shipment` — employee's active shipment
- `GET /api/logistics/track/:trackingNumber` — lookup by number,
  404/error response drives the "not found" state already built

All shipment status/steps are rendered exactly as the backend reports
them — the frontend does not compute or infer shipment state itself.

---

## Review notes (bugs fixed during this pass)

- Notifications page had two dead buttons (Mark as read / Archive) —
  fixed.
- Identity Verification's "protected" bullet list contradicted the
  new email-notification behavior — corrected the wording.
- Payroll's Status stat card rendered an empty bold line when no
  numeric value was passed — fixed.
- Tracking number input lacked an accessible label — added
  `aria-label`.
- Removed one now-unused `useAsync` call (payment method) left over
  from the previous Payroll layout.

## Not yet done (flagged, not started)

- Real backend for any of the above — every endpoint listed is still
  a mock.
- Two-factor authentication (button still just shows a placeholder
  toast, matching its pre-existing state).
- Admin-side management for any of these (documents, verification
  review queue, payroll approval, shipment status control) — the
  Admin dashboard is still a structural placeholder.
