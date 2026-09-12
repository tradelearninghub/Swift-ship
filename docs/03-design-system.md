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

---

## 9. Shipping Labels & Thermal Printing System **[NEW — Round 2]**

Logistics hardware relies on specialized thermal barcode printers. Two standard sizes are supported as first-class templates:

1. **4x6 Inch (100x150mm) Thermal Label**:
   - Media query: `@page { size: 100mm 150mm; margin: 3mm; }`
   - High-contrast, dense hierarchy:
     - Prominent boxed destination pincode in 24pt bold mono font (`DEST: 302003`).
     - Vector Code 128 1D Barcode with minimum 40px bar height and 1.8px bar module width.
     - 2D QR Code (Version 2 matrix, 80x80px) encoding secure tracking URL.
     - "IF UNDELIVERED RETURN TO" return hub address block.
   - Zero background clutter, maximum contrast for optical handheld scanners.

2. **A4 Full Page (Office / Invoice)**:
   - Media query: `@page { size: A4 portrait; margin: 8mm; }`
   - Split dual-section layout:
     - Top half: Official Consignment Dispatch Receipt (Customer & Merchant copy with charge breakdown, payment status, terms, and signature/stamp line).
     - Perforated cut line: `✂ Cut Along Line & Affix Below to Parcel ✂`.
     - Bottom half: Physical Package Shipping Label.

---

## 10. Toggle Switch Component Standards **[NEW — Round 2]**

A consistent pill-switch design language is enforced across all operational controls (Courier ON/OFF, Staff Active/Inactive, and Granular Capability Switches):
- Base container: `relative inline-flex h-5 w-9 sm:h-6 sm:w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200`
- Active State: `bg-emerald-600` (green)
- Disabled/Inactive State: `bg-slate-300` (muted slate)
- Indicator thumb: `inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200`
- Status labels: paired with uppercase status indicators (`ON`/`OFF` or `ACTIVE`/`INACTIVE`), never color alone.

---

## 11. Footer Layout Standards **[NEW — Round 4]**

The public website footer strictly adheres to a structured, balanced four-column layout on desktop, collapsing to a clear single stacked column on mobile:

### Breakpoints & Sizing
- **Desktop (`1024px+`)**: Four equal-width columns (`grid-cols-4`, `gap-8` / `space-8` = 32px).
- **Tablet (`640–1023px`)**: Two columns (`sm:grid-cols-2`, `gap-8`).
- **Mobile (`0–639px`)**: Single stacked column (`grid-cols-1`, `gap-8` / `space-8` vertical rhythm).

### Four Distinct Functional Sections
1. **Section 1 — Company**: Branded company name, 1–2 line company brief/tagline, and central hub address. All company metadata is sourced dynamically from the `settings` database table (§7/§52).
2. **Section 2 — Quick Links**: Exactly 6 canonical links matching the fixed header navigation (`Home`, `About Us`, `Services`, `How It Works`, `Track Shipment`, `Book a Parcel`).
3. **Section 3 — Support & Policies**: Essential customer trust links (`Contact Us`, `Shipping Policy`, `Privacy Policy`, `Terms of Service`).
4. **Section 4 — Contact Info**: Direct telephone helpline numbers (`support_phones`), official support email, and physical hub location with semantic icons.

### Bottom Utility Row
A thin border-top utility bar below the four columns displaying:
- Copyright notice with dynamic current year and company name.
- Legal policy links: `Privacy Policy`, `Terms of Service`, `Shipping Policy`.
- Discrete administrative portal entry: `Admin Operations` linking to `/admin/login`.

---

## 12. Mobile Navigation Architecture **[NEW — Round 4]**

The mobile navigation experience is unified into a single, clean pattern:

- **Single Mobile Pattern**: A sticky top header with the company logo, a prominent primary CTA button ("Book a Parcel"), and an accessible hamburger menu trigger button (`aria-label="Open mobile navigation menu"`).
- **Elimination of Bottom Tab Bar**: Fixed bottom tab bars have been completely excised from the layout. This eliminates screen clutter, removes accidental touch targets on mobile keyboards, and reclaims 64px of vertical viewport height.
- **Slide-Out Side Drawer**: Opening the hamburger trigger displays a full-height right-aligned drawer panel covering all required user journeys:
  - Header with branded identity and close (`X`) button.
  - Quick action CTA button: "Book a Parcel" (`/book`).
  - Primary navigation links: `Home`, `Services`, `Track Shipment`, `Rate Calculator`, `How It Works`, `About Us`, `Contact Us`.
  - Customer & Staff portals: `Customer Sign In`, `Register Free Account`, and `Admin Operations`.
  - Direct contact options: Click-to-call phone links, email mailto link, and central hub address.

