# Master Build Prompt — Courier Booking & Multi-Courier Tracking Platform

Copy everything below into your AI coding assistant (e.g. Claude Code, Cursor, Google
Antigravity) as the project's master instruction, alongside the three companion documents:
`01-feature-specification.md`, `02-database-schema.md`, and `03-design-system.md`.

---

```
You are building "[Company Name] Courier" — a courier booking and multi-courier tracking
platform. Three reference documents are attached to this project and are your source of
truth:

1. 01-feature-specification.md — full functional spec (booking flow, courier engine,
   tracking, COD, notifications, admin panel, roles/permissions, security requirements)
2. 02-database-schema.md — the target database schema (Prisma/MySQL)
3. 03-design-system.md — colors, typography, spacing, and component rules

STACK
- Next.js (App Router) + TypeScript (strict mode) + React
- MySQL via Prisma ORM
- Redis + BullMQ for background jobs (tracking sync, notifications, webhook processing)
- Zod for all request/response validation
- shadcn/ui + Tailwind CSS, Framer Motion for motion
- All money fields stored as integers in paise

DEVELOPMENT RULES (non-negotiable — from feature spec §63)
- Inspect existing code before changing anything; follow the architecture already in place.
- Never break existing functionality without flagging it to me first.
- Keep TypeScript strict; no `any` unless truly unavoidable, and comment why.
- Build reusable components; avoid duplicating logic across public/customer/admin surfaces.
- Every API route validates input AND output with Zod.
- Every data-driven view implements loading / empty / error / populated states (see design
  system §6) — not just the happy path.
- Every external call (courier API, notification send) is idempotent and retryable — use the
  idempotency_key pattern from the schema, never fire-and-forget on user-facing requests.
- Never hard-code company info, secrets, or courier credentials — company info comes from the
  `settings` table, secrets from environment variables, courier credentials from the
  encrypted `courier_credentials` table.
- Maintain Prisma migrations for every schema change — never hand-edit the database.
- Test each module before moving to the next phase; tell me what you tested and how.

DEVELOPMENT SEQUENCE — work through these phases IN ORDER. Do not start a phase until I
confirm the previous one is approved. At the start of each phase, restate what you're about
to build and which sections of the feature spec it covers, before writing code.

Phase 0  — Project foundation: repo structure, Next.js app router skeleton, Prisma schema
           from 02-database-schema.md, base layout shells for (public)/(auth)/customer/admin
           route groups, environment variable setup, linting/formatting config.

Phase 1  — Complete frontend UI with MOCK DATA ONLY (no real API/DB calls yet):
           Public website (all pages from feature spec §5–6), Customer Portal shell
           (dashboard, booking form, tracking page), Admin Panel shell (dashboard, booking
           table, courier list, settings pages). Apply 03-design-system.md exactly. I will
           review this visually before you proceed to Phase 2.

Phase 2  — Authentication + Users + Roles + Permissions (schema: users, roles, permissions,
           role_permissions, staff_permission_overrides). Server-side permission enforcement
           on every protected route, not just UI hiding.

Phase 3  — Customer booking: real booking form wired to the database, booking_parcels,
           booking submission flow (feature spec §8–11), business-account bulk CSV upload
           stub (§17a) can be deferred to a later pass — flag it, don't skip silently.

Phase 4  — Admin booking management: review queue, weight/dimension verification (separate
           submitted vs verified fields — §15), manual shipping charge entry (booking_charges
           table, §16), booking status transitions (§17), activity_logs audit trail (§46).

Phase 5  — Courier partner system: courier_partners, courier_credentials (encrypted),
           courier_configurations CRUD in admin panel; build the adapter interface
           (createShipment/trackShipment/cancelShipment/generateLabel/requestPickup) with
           ONE real adapter implemented end-to-end first, then a mock/manual adapter as the
           fallback path (§19–24).

Phase 6  — Shipment creation + AWB generation, manual AWB fallback, courier_api_logs on every
           call (§23), idempotency enforcement (§22b).

Phase 7  — Tracking engine: public /track page (AWB/Order ID search + mobile/pincode search
           with rate limiting — §25–27), QR + secure tracking token generation (§29),
           standardized status mapping per adapter (§31), BullMQ tracking-sync worker with
           adaptive polling frequency by status (§33).

Phase 7a — Inbound courier webhooks (only after Phase 7's polling flow is stable and tested):
           /api/webhooks/courier/[code] route, signature verification, event normalization
           into shipment_tracking_events with source=WEBHOOK.

Phase 8  — COD management (cod_transactions, cod_settlements, §35) and shipping-charge
           payment tracking (payments table, §36) — manual/offline for v1, gateway-ready.

Phase 9  — Notification engine: email/SMTP, WhatsApp, SMS provider integration, template
           system with variable substitution, per-event channel rules (notification_rules),
           notification_logs with retry-with-backoff on failure (§37–42).

Phase 10 — Reports (§59), full settings architecture (§51–52), admin activity/audit views.

Phase 11 — Testing + security pass: run through every checklist item in feature spec §53 and
           §53a explicitly and report status on each one; add Playwright coverage for booking
           creation, admin approval, and tracking lookup as minimum critical-path tests.

Phase 12 — Production deployment: environment setup, migration run, error tracking (Sentry or
           equivalent), uptime/log monitoring (§66's Phase 12a from the feature spec).

At any point, if something in the reference documents is ambiguous or you think a documented
decision should change, STOP and ask me rather than guessing silently.
```

---

## Notes for using this prompt

- **Fill in `[Company Name]`** before pasting.
- If your AI tool supports attaching files directly, attach all three companion documents
  rather than pasting their content inline — keeps this prompt reusable across phases.
- Re-paste the relevant phase section (not the whole prompt) when resuming work in a new
  session, along with a short summary of what's already built — most AI coding tools don't
  retain state between sessions.
- Phases marked with a letter suffix (4a, 7a, 8a, 12a) are the improvements added in v2.0 of
  the spec and are safe to defer if you want the leanest possible v1 — just make sure the
  schema still accounts for them (it does, per `02-database-schema.md`) so adding them later
  doesn't require restructuring existing tables.
