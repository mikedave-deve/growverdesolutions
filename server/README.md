# Growverde Solutions — Auth API

Express + MongoDB backend for registration, admin approval, and login.
Pairs with the existing React frontend in `../src` — no frontend design
changes were made; only `authService.js` now calls these real
endpoints instead of returning mock data.

## Setup

```bash
cd server
npm install
cp .env.example .env
# then edit .env — at minimum set MONGODB_URI and JWT_SECRET
npm run dev
```

Server runs on `http://localhost:4000` by default. The frontend's
`VITE_API_BASE_URL` should point at `http://localhost:4000/api`
(see `../.env.example` in the frontend project).

Email is sent through Hostinger's HTTP Mail API
(`api.mail.hostinger.com`), not raw SMTP — Render (and some other
hosts) block outbound SMTP ports at the network level regardless of
which mail provider you point at, which silently failed every
submission email in production. The Mail API goes over plain HTTPS,
which isn't blocked.

Email is optional to configure: if `HOSTINGER_API_TOKEN` is left
blank, emails are logged to the server console instead of sent — the
whole flow still works end-to-end for testing.

To send real email:
1. In the Hostinger Panel, open the mailbox's email provisioning tab
   and create an API token — copy it into `HOSTINGER_API_TOKEN`.
2. Set `HOSTINGER_MAILBOX_ADDRESS` to the mailbox to send from (must
   be a mailbox that token has access to). Falls back to `SMTP_USER`
   if unset, for compatibility with an older local setup.

## Creating the first admin account

Every new account starts as `Pending Approval` and can't log in —
including the very first one. To bootstrap:

1. Register a normal account through the app (or via curl below).
2. Run: `node scripts/promoteAdmin.js you@growverdesolutions.com`
   This sets that account's role to `administrator` and status to
   `Approved` directly in the database, bypassing the approval flow
   just this once.
3. Log in as that account and use the endpoints below (or a future
   admin UI) to approve everyone else.

## API

| Method | Path                          | Auth           | Description |
|--------|-------------------------------|----------------|-------------|
| POST   | `/api/auth/register`          | —              | Create a Pending Approval account |
| POST   | `/api/auth/login`             | —              | Sign in (Approved accounts only) |
| POST   | `/api/auth/logout`            | —              | Clear the session cookie |
| GET    | `/api/auth/session`           | signed in      | Get the current user |
| GET    | `/api/admin/users/pending`    | admin/HR       | List accounts awaiting approval |
| POST   | `/api/admin/users/:id/approve`| admin/HR       | Approve + send the branded email |
| POST   | `/api/admin/users/:id/reject` | admin/HR       | Reject an account |

## Manual test (curl)

```bash
# 1. Register
curl -i -c cookies.txt -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Doe","email":"jane@example.com","password":"testpass123"}'

# 2. Try logging in before approval — should be rejected with a clear message
curl -i -c cookies.txt -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"testpass123"}'

# 3. As an approved admin, approve Jane (replace <id> and use the admin's cookies.txt)
curl -i -b admin-cookies.txt -X POST http://localhost:4000/api/admin/users/<id>/approve

# 4. Jane logs in again — should now succeed and set a session cookie
curl -i -c cookies.txt -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"testpass123"}'
```

## What's intentionally out of scope here

- No admin UI page for approving users yet — the existing
  `AdminDashboard.jsx` is still a placeholder. These endpoints are
  ready to wire up to a real approvals table whenever that's built.
- `authService.changePassword` (used by the Settings page) is still
  mocked — this pass only covers register/login/approve.
- No password-reset flow — `requestPasswordReset` is still mocked.
- Portal routes (`/portal/*`) still aren't guarded by a real
  `<RequireAuth>` check on the frontend; that was already flagged as
  future work in `PortalLayout.jsx` before this change and remains so.
