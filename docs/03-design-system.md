# Courier Platform — Frontend Design System (v1.0)

**[NEW]** The original specification only stated general principles ("modern, clean,
professional, responsive"). This document defines those principles concretely so the
frontend-first phase (Phase 1) has something exact to build against, and so the Public
Website, Customer Portal, and Admin Panel look consistent with each other.

---

## 1. Design Direction

Logistics platforms live or die on **trust and clarity** — a customer handing over a parcel
(and often cash-on-delivery money) needs to feel the company is reliable and organized. Two
distinct visual registers are used within the same design language:

- **Public Website + Customer Portal** — spacious, confident, reassuring. Generous whitespace,
  large readable type, a single strong accent color used sparingly for calls to action.
- **Admin Panel** — dense, efficient, information-first. Tighter spacing, smaller type scale,
  status communicated primarily through color-coded badges rather than illustration.

Recommend: use `shadcn/ui` + Tailwind (matches the Next.js/TypeScript stack), and Framer
Motion for restrained micro-interactions (page transitions, status-change animations on the
tracking timeline) — not for decorative flourish.

---

## 2. Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--brand-primary` | `#1D4ED8` (blue-700) | Primary CTAs, links, active nav state |
| `--brand-primary-hover` | `#1E40AF` (blue-800) | Hover/active state — never pure black |
| `--brand-accent` | `#F59E0B` (amber-500) | Secondary highlight — e.g. "Track" button, badges |
| `--surface-base` | `#FFFFFF` | Page background (public/customer) |
| `--surface-subtle` | `#F8FAFC` (slate-50) | Section backgrounds, card fills |
| `--surface-admin-base` | `#F1F5F9` (slate-100) | Admin panel background |
| `--border-default` | `#E2E8F0` (slate-200) | Card/table borders |
| `--text-primary` | `#0F172A` (slate-900) | Headings, primary text |
| `--text-secondary` | `#475569` (slate-600) | Body copy, secondary text |
| `--text-muted` | `#94A3B8` (slate-400) | Placeholders, disabled text |

**Status colors** (used consistently across booking status, shipment status, COD status, and payment status badges):

| Status meaning | Token | Hex |
|---|---|---|
| Neutral / Draft / Pending | `--status-neutral` | `#64748B` slate-500 |
| In progress / Processing | `--status-info` | `#2563EB` blue-600 |
| Success / Delivered / Paid | `--status-success` | `#16A34A` green-600 |
| Warning / Exception / Action needed | `--status-warning` | `#D97706` amber-600 |
| Failure / Rejected / RTO / Failed | `--status-danger` | `#DC2626` red-600 |

> **[IMPROVED]** Never rely on color alone for status — every status badge pairs color with a
> short text label and, where space allows, an icon. This matters for accessibility and for
> screenshots shared over WhatsApp where color rendering can vary.

---

## 3. Typography

- **Headings font:** Sans-serif, geometric — e.g. `Inter` or `Manrope`. Weight 600–700.
- **Body font:** `Inter` (same family, lighter weights) — avoids a jarring font pairing and
  loads fast (one font family, multiple weights).
- **Monospace** (for AWB numbers, tracking tokens, booking IDs): `JetBrains Mono` or system
  mono — fixed-width improves scanability of alphanumeric codes and prevents ambiguous
  character confusion (0 vs O, 1 vs l).

### Type scale

| Token | Mobile | Desktop | Usage |
|---|---|---|---|
| `text-display` | 32px / 1.2 | 48px / 1.15 | Hero heading only |
| `text-h1` | 26px / 1.25 | 36px / 1.2 | Page titles |
| `text-h2` | 22px / 1.3 | 28px / 1.3 | Section headings |
| `text-h3` | 18px / 1.35 | 20px / 1.35 | Card/subsection headings |
| `text-body` | 15px / 1.6 | 16px / 1.6 | Default body copy |
| `text-small` | 13px / 1.5 | 13px / 1.5 | Meta info, table cells, captions |
| `text-mono` | 14px / 1.4 | 14px / 1.4 | AWB / Booking ID / Tracking token |

Admin panel uses `text-body` at 14px and `text-small` at 12px throughout (one step down from
public site) to fit more information density into tables and dashboards.

---

## 4. Spacing & Layout

8px base unit throughout:

```
space-1 = 4px    space-2 = 8px    space-3 = 12px   space-4 = 16px
space-5 = 20px   space-6 = 24px   space-8 = 32px   space-10 = 40px
space-12 = 48px  space-16 = 64px
```

- **Public/Customer pages:** max content width `1120px`, section vertical padding
  `space-16` desktop / `space-10` mobile.
- **Admin panel:** fixed sidebar (240px desktop, collapsible drawer on mobile), content area
  padding `space-6` desktop / `space-4` mobile, data tables use `space-3` row padding.
- **Forms** (booking form is the most complex form in the product): group into clearly
  titled sections (Sender / Receiver / Parcel / Payment) with `space-8` between sections and
  `space-4` between fields within a section — this directly reflects the booking flow
  structure in §8 of the feature spec, so the UI teaches the data model implicitly.

### Breakpoints
```
mobile: 0–639px | tablet: 640–1023px | desktop: 1024px+
```
Mobile-first: base styles target mobile, then progressively enhance with `md:`/`lg:` in
Tailwind. Admin panel is desktop-first for the data tables (staff mostly work on laptops) but
must remain fully usable on tablet.

---

## 5. Core Components

Beyond the component list already named in the spec (Header, Footer, TrackingForm,
BookingForm, StatusBadge, DataTable, Modal, FormInput, QRCode, ShipmentTimeline,
DashboardCards), define these shared behaviors:

- **StatusBadge** — pill shape, color per §2 status table, 12px text, optional small dot
  indicator. One canonical component used for booking status, shipment status, COD status,
  and payment status — never a one-off per page.
- **ShipmentTimeline** — vertical stepper on mobile, horizontal stepper on desktop; completed
  steps filled with `--status-success`, current step pulses subtly (Framer Motion), future
  steps shown muted. Reused identically on the customer tracking page and the admin booking
  detail's Tracking Information section (§45).
- **DataTable** — sticky header, sortable columns, built-in empty/loading/error states (per
  §63's development rule), row density toggle for admin panel (comfortable/compact).
- **QRCode** — rendered only inside print/PDF label templates, never as an inline page
  element (per §28 — it's a receipt/label-only feature).

---

## 6. States (per §63 development rule)

Every data-driven view must define, at design time, not just when building:

1. **Loading** — skeleton screens matching the eventual content's shape (not a generic
   spinner) for tables and cards; a simple centered spinner is acceptable for full-page
   transitions only.
2. **Empty** — a short explanatory line + a primary action where relevant (e.g. "No bookings
   yet" + "[Book a Parcel]" button on the customer dashboard).
3. **Error** — human-readable message + a retry action; never expose raw API errors or stack
   traces to customers (only in admin panel/dev tools).
4. **Populated** — the default state.

---

## 7. Accessibility

- Minimum contrast ratio 4.5:1 for body text against its background (all palette pairings
  above were chosen to satisfy this).
- All interactive elements reachable via keyboard, with a visible focus ring
  (`--brand-primary` outline, 2px).
- Form fields always have a visible `<label>`, not placeholder-only labeling.
- Status conveyed by color + text + icon, never color alone (§2).

---

## 8. Motion

Framer Motion used sparingly and purposefully:
- Page/route transitions: 150–200ms fade/slide, never longer.
- Status change on the shipment timeline: a brief highlight pulse when a new tracking event
  arrives (used on the customer tracking page when a live refresh returns a new status).
- No decorative parallax, no auto-playing carousels — logistics customers want information
  fast, not spectacle.
