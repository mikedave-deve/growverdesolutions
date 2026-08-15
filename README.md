# Growverde Solutions — Employment Platform (Frontend)

A backend-ready React frontend combining two pieces:

1. **The public marketing site** — Home, Browse Jobs, Submit Resume, Meet
   Our Team, and About Company — under `src/pages/public/`. It renders
   inside a `.gv-public` wrapper styled by `src/styles/public-site.css`
   (its own gold/teal/serif design system, fully namespaced so it never
   touches the portal below).
2. **The employee portal** — Dashboard, Profile, Documents, Payroll, etc.
   under `src/pages/portal/` — unchanged from the original Growverde
   build, using the forest-green Tailwind design system in
   `tailwind.config.js` / `index.css`. The employee menu (top right of
   the portal) now includes a **Log Out** option.

## Stack

React 18 · React Router 6 · Tailwind CSS · lucide-react · Vite

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. The app runs entirely on mock data — no
backend is required to explore it.

## Architecture

```
src/
  components/     Reusable UI: primitives, states, tables, uploads, layout chrome
                  components/public/  — PlaceholderImage, Marquee, Counter (public site only)
  layouts/        PublicLayout (marketing site chrome), AuthLayout, PortalLayout (sidebar shell)
  pages/public/   Home, Jobs, Resume, Team, About — the Growverde Solutions marketing site
  pages/          One file per route, organized public / auth / portal / admin
  services/       Mock service layer — one file per domain (auth, employee,
                  documents, missions, attendance, payroll, logistics,
                  verification, notifications, support)
  services/api/   Fetch wrapper (client.js) + mockRequest() latency/error simulator
  mocks/          Fictional demo data shaped like the eventual MongoDB documents
  data/           publicSiteData.js — jobs, team, testimonials, marquee content
  styles/         public-site.css — scoped (.gv-public) styles for the marketing site
  context/        AuthContext, ToastContext
  hooks/          useAsync — standardizes loading/error/empty states everywhere
  constants/      Route paths, roles, status enums
```

Logging out: the portal's top-right user menu (`components/layout/Topbar.jsx`)
has a **Log Out** item that calls `authService.logout()`, clears the
in-memory session via `AuthContext`, and redirects to `/login`.

## Connecting the real backend later

Every page calls a `*Service` function (e.g. `payrollService.getCurrentPay()`)
— never `fetch` directly. To go live:

1. Stand up Express routes matching `/api/<domain>` (see the endpoint list
   in each service file's comments).
2. Replace each service function's `mockRequest(...)` call with the matching
   `apiClient.get/post/patch/delete(...)` call from `services/api/client.js`.
3. Set `VITE_API_BASE_URL` in `.env.local`.
4. Wrap `PortalLayout` (and `/admin`) in a `RequireAuth` route guard once
   `authService` talks to a real session/JWT endpoint. Auth is designed
   around an httpOnly cookie — the frontend never touches tokens directly.

No page-level UI changes are required for this migration — the loading,
empty, and error states are already wired to whatever the service promise
resolves or rejects with.

## Security notes (frontend scope)

- Sensitive identifiers (SSN-equivalent, financial account numbers) are
  masked by default and never written to localStorage/sessionStorage.
- The Identity Verification flow (`pages/portal/Verification.jsx`) is a
  **demonstration workflow only** — it does not persist or transmit real
  personal data. In production the sensitive identifier field would post
  directly to the backend over TLS and never round-trip through client
  state beyond the form itself.
- `CompanyServices.jsx` renders masked credentials only; real values are
  never hardcoded into the frontend.

## Still to build (noted, not started)

Full admin CRUD screens (Employees, Documents, Missions, etc. under
`/admin`), the real Express/Mongoose API, JWT/session auth, S3-style file
storage, and the email notification service — all scaffolded for in the
service layer and data model comments, per the project brief.
