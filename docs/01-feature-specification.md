# Courier Booking & Multi-Courier Tracking Platform
## Master Development Specification — Version 2.0 (English, Revised & Improved)

> This document is a rewritten, English-language, improved version of the original mixed-language spec.
> Changes from v1.0 are marked with **[IMPROVED]** or **[NEW]** inline.

---

## 1. Project Overview

This is a modern courier booking and shipment management platform.

Core purpose of the platform:

- Let customers submit parcel booking requests
- Let admin/staff process and verify those bookings
- Correct and verify parcel details (weight/dimensions) before shipping
- Let admin manually set the customer's shipping charge
- Support both Prepaid and COD (Cash on Delivery) shipments
- Integrate with multiple courier partners for shipment creation
- Track shipments through courier APIs
- Give customers simple, unified shipment tracking regardless of courier
- Support QR-code-based tracking on receipts/labels
- Send Email, WhatsApp, and SMS notifications
- Let admin manage the entire website and integrations dynamically, without code changes

The system must be extensible for future courier partners, payment gateways, a mobile app, and an automated pricing engine — **without requiring a rewrite of the core architecture**.

**[IMPROVED]** Additional guiding principles added for v2.0:
- Every external action (courier API call, notification send) must be **idempotent and retryable** — network/API failures should never create duplicate shipments or duplicate notifications.
- Every money-related field must be stored in the smallest currency unit (paise) as an integer to avoid floating-point rounding bugs, and rendered as rupees only in the UI.
- The system should be built API-first: the same backend APIs used by the Next.js frontend should be reusable by a future mobile app without modification.

---

## 2. Technology Stack

### Frontend + Backend — Next.js

- Next.js (App Router)
- TypeScript (strict mode)
- React
- Server/API route architecture

A single Next.js project will contain:
- Public Website
- Customer Portal
- Admin Panel
- Backend APIs

### Database — MySQL

All core business data lives in MySQL.

### ORM — Prisma

Used for all database access and migrations.

### Cache / Queue — Redis + BullMQ

Redis is used for caching and as the BullMQ backing store. BullMQ handles background jobs:

- Courier tracking sync
- Email sending
- WhatsApp sending
- SMS sending
- Webhook processing (**[IMPROVED]** — see §22a, inbound courier webhooks)
- Scheduled tasks (COD reconciliation, tracking polling, report generation)

**[NEW]** Additional recommended stack additions:
- **Zod** — request/response schema validation on every API route
- **Sentry (or similar)** — error tracking and alerting in production
- **Pino/Winston** — structured logging, correlated with a request ID
- **S3-compatible object storage** (e.g. Cloudflare R2, AWS S3) for uploaded documents, labels, and QR images, instead of local disk — needed for horizontal scaling and backups
- **Playwright** — end-to-end test coverage for critical flows (booking, tracking, admin approval)

---

## 3. High-Level Architecture

```
                        NEXT.JS APPLICATION
                              |
        ┌─────────────────────┼─────────────────────┐
        |                     |                     |
   Public Website      Customer Portal         Admin Panel
        |                     |                     |
        └─────────────────────┼─────────────────────┘
                              |
                    Next.js Backend / API Layer
                              |
        ┌───────────────────┬─┴──────────────────┐
        |                    |                    |
     Prisma             Courier Engine     Notification Engine
        |                    |                    |
      MySQL             Courier APIs      Email / WhatsApp / SMS
                              |
                            Redis
                              |
                        BullMQ Workers
```

**[IMPROVED]** Inbound courier webhooks (status push from courier → us) hit a dedicated `/api/webhooks/courier/[code]` route, which authenticates the request, enqueues a BullMQ job, and returns immediately — keeping webhook response times fast and avoiding courier-side retries/timeouts.

---

## 4. User Types & Roles

### Super Admin
Full system access: everything, system settings, courier integration, user management, roles & permissions, financial data, reports.

### Admin
Manages business operations: bookings, shipments, customers, couriers, COD, payments, notifications, reports. Settings permissions are configurable per admin.

### Staff
Limited, permission-based access. Example default permission set:

```
booking.create
booking.view
booking.edit
shipment.view
shipment.process
customer.create
customer.view
```

By default, staff do **not** get:
```
settings.manage
courier.manage
users.manage
```

### Customer
Can register/login, submit parcel booking requests, view booking history, track shipments, manage their profile, and view notifications.

**[NEW]** A fifth role recommended for scale: **Business Customer** — a customer flagged with a business account type, unlocking bulk/CSV booking upload and (later) invoicing. See §17a.

---

## 5. Public Website — Pages

```
/
/about
/services
/how-it-works
/track
/book
/contact
/login
/register
/privacy-policy
/terms
/shipping-policy
```

---

## 6. Homepage

**Header:** Company Logo, Home, About, Services, Track Shipment, Book Parcel, Contact, Login/Register.

**Hero Section (example copy):**
> Send Your Parcel — Fast, Safe & Reliable
> Book your shipment with trusted courier partners.
> [ Book a Parcel ]
>
> Track Your Shipment
> [ AWB Number / Order ID ] [ TRACK ]

**Services:** Domestic Parcel, Business Shipping, COD Shipping, Express Delivery, Multi-Courier Shipping. Content should be editable from admin settings, not hard-coded.

**How It Works:** 1. Book Parcel → 2. Admin Processes → 3. Courier Assigned → 4. Shipment Picked Up → 5. Track Shipment → 6. Delivered.

**Contact CTA:** Company details are pulled dynamically from settings (see §7).

---

## 7. Dynamic Company Information

Company information must never be hard-coded. Admin manages it under **Settings → Company Profile**:

- Company Name, Logo, Favicon
- Email, Support Email, Phone, WhatsApp Number
- Full Address, City, State, Pincode
- Google Maps URL, Latitude, Longitude
- Business Hours
- Website Name, Website Description

Used in: Header, Footer, Contact Page, Booking Receipt, Email, WhatsApp, SMS, Notifications.

---

## 8. Customer Booking Form

**Sender Details:** Name, Mobile, Email (optional), Address, City, State, Pincode
**Receiver Details:** Name, Mobile, Email (optional), Address, City, State, Pincode
**Parcel Details:** Parcel Type, Description, Weight, Length, Width, Height, Declared Value
**Payment Type:** Prepaid or COD (radio choice)

**[IMPROVED]** Add client-side and server-side validation: pincode format/existence check, mobile number format check (10-digit Indian mobile), weight/dimension sane-range checks (e.g. reject 0 kg or negative values), and a max declared value cap configurable in settings (fraud/liability control).

---

## 9. Prepaid vs COD — Two Separate Financial Concepts

**Shipping Charge** — what your company charges the customer to ship the parcel.
**COD Amount** — what the receiver pays the courier for the product itself, at delivery.

These are always separate database fields. Example:

```
Shipping Charge = ₹150
COD Amount      = ₹2,000
```

If COD: Customer → Your Company: ₹150 shipping charge. Receiver → Courier: ₹2,000 COD amount.
If Prepaid: Shipping Charge = ₹150, COD Amount = ₹0.

---

## 10. Customer Pricing at Booking Time

The customer does **not** get an automatic shipping price at booking time (in the initial version). They submit parcel details, select Prepaid/COD, provide the COD amount if applicable, and submit. They see:

> "Shipping charge will be confirmed after admin review."

**[IMPROVED — see §68a]** This is intentionally kept manual for v1, but the schema should support an optional automated rate-card engine so this message can later be replaced with an instant estimate, without restructuring the booking table.

---

## 11. Customer Booking Request Flow

```
Customer → Book Parcel → Sender Details → Receiver Details → Parcel Details
→ Prepaid/COD → COD Amount (if COD) → Confirm Booking
→ Booking Request Created → Admin Review
```

---

## 12. Admin / Staff Booking

Admin or authorized staff can create a booking directly on behalf of a customer:

```
Admin/Staff → New Booking → Select Existing Customer / Create Customer
→ Sender → Receiver → Parcel → Prepaid/COD → COD Amount
→ Customer Shipping Charge → Courier Processing
```

An admin/staff-created booking does not require the "customer request approval" step — depending on the staff member's permissions.

---

## 13. Booking Source Tracking

Every booking records:
- **source**: `CUSTOMER` | `STAFF` | `ADMIN`
- **created_by**: the user ID who created it

This preserves an audit trail of who created each booking.

---

## 14. Admin Review System

Customer requests land in the Admin Panel review queue. Admin sees: Sender, Receiver, Parcel, Weight, Dimensions, Prepaid/COD, COD Amount.

---

## 15. Weight & Dimension Verification

Customer-submitted and admin-verified values are stored **separately** — never overwritten.

```
Customer Submitted:  Weight 2 KG,   L20 x W20 x H20 CM
Admin Verified:      Weight 2.5 KG, L25 x W22 x H20 CM
```

This is required for audit trails and dispute handling (e.g. courier billing disputes over chargeable weight).

---

## 16. Customer Shipping Charge

Admin manually sets the final shipping charge:

```
Shipping Charge     ₹150
Additional Charge   ₹20
Discount             ₹0
Tax                  ₹30
Total               ₹200
```

An automatic pricing engine is not required for the initial version, but see §68a for the future-ready design.

---

## 17. Booking Status

```
DRAFT → REQUESTED → UNDER_REVIEW → APPROVED
                                  → REJECTED
                                  → CANCELLED
```

Once a shipment is created from an approved booking, **shipment status** is tracked separately (§18).

### 17a. Business Customer & Bulk Booking **[NEW]**

- A customer account can be flagged `account_type: INDIVIDUAL | BUSINESS`.
- Business accounts unlock a **CSV bulk-upload booking** flow: upload a spreadsheet of sender/receiver/parcel rows, system validates each row, creates a batch of `DRAFT`/`REQUESTED` bookings, and reports per-row errors.
- This reuses the exact same booking pipeline — no separate code path, just a different entry point.

---

## 18. Shipment Status

```
PROCESSING → COURIER_ASSIGNED → AWB_GENERATED → PICKUP_SCHEDULED
→ PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
                                              → RTO
                                              → EXCEPTION
                                              → CANCELLED
```

**[IMPROVED]** Recommend adding an `EXCEPTION_REASON` free-text/enum field (e.g. `ADDRESS_ISSUE`, `RECEIVER_UNAVAILABLE`, `DAMAGED`, `LOST`) so exceptions are actionable in reports, not just a dead-end status.

---

## 19. Courier Partner System

Core module of the platform. Admin adds couriers under **Courier Partners → Add New Courier**:

- Courier Name, Courier Code, Logo, Website, Support Contact, Status
- API Configuration, Authentication Configuration
- Tracking Configuration, Shipment Configuration

---

## 20. Courier ON/OFF

Admin can activate/deactivate any courier (e.g. Delhivery ON, DTDC ON, Blue Dart OFF, XpressBees ON). A deactivated courier is not available for **new** shipments, but tracking must continue working for its existing shipments.

---

## 21. Courier Capabilities (Granular Switches)

Each courier has independent switches:

```
Courier Status ON/OFF
Shipment API ON/OFF
Tracking API ON/OFF
Label API ON/OFF
Pickup API ON/OFF
Cancellation API ON/OFF
```

Example: `Courier Status: ON, Shipment API: OFF, Tracking API: ON` means existing/manually-entered AWBs for that courier can still be tracked, but automatic shipment creation is disabled.

---

## 22. Multi-Courier Adapter Architecture

Each courier's API is different, so a common adapter interface is used:

```
Courier Engine
├── Delhivery Adapter
├── DTDC Adapter
├── Blue Dart Adapter
├── XpressBees Adapter
└── Custom Adapter
```

Each adapter implements standard methods wherever the underlying API supports them:

```
createShipment()
trackShipment()
cancelShipment()
generateLabel()
requestPickup()
```

**[NEW — 22a] Inbound Webhooks**
In addition to polling (`trackShipment()`), each adapter should optionally implement:
```
verifyWebhookSignature(payload, headers)
parseWebhookEvent(payload)
```
so couriers that support push notifications update tracking in near-real-time instead of waiting for the next poll cycle. Polling remains the fallback for couriers without webhook support.

**[NEW — 22b] Idempotency**
`createShipment()` calls must be wrapped with an idempotency key (e.g. the booking ID) so a network timeout followed by a retry never creates two AWBs for the same booking. If the adapter's API doesn't natively support idempotency keys, the engine checks for an existing non-failed shipment on that booking before calling out.

### New Courier Rule
Admin can manage courier name, API credentials, API configuration/endpoints, and enable/disable from the panel. If a new courier's API is fundamentally different from the existing adapter model, a developer will need to implement a new adapter — this is an accepted architectural limitation.

**[NEW — 22d] Self-Service Pre-Built Adapter Library**
Admin Panel → Courier Partners → Add New Courier provides direct self-service onboarding for four major courier partners without code changes:
1. **Delhivery**: Single-carrier CMU API integration (`staging-express.delhivery.com` / `track.delhivery.com`) with API token, client name, and auto waybill generation.
2. **DTDC**: Connote API integration (`demodashboardapi.dtdc.com` / `dtdcapi.dtdc.com`) with Customer ID and X-Access-Token.
3. **Shiprocket (Aggregator)**: Unlike single-carrier APIs, Shiprocket aggregates multiple couriers under one REST API. The adapter handles 24-hr JWT authentication (`POST /auth/login`), configurable preferred carrier selection (Auto / Best Rate vs specific sub-carriers), and normalizes underlying courier names on tracking responses.
4. **XpressBees**: Surface and air cargo manifest API integration with App Key / Secret Key authentication.

**[NEW — 22e] Generic REST Connector**
For couriers without a dedicated pre-built adapter, a config-driven Generic REST Connector allows admin to define:
- Base API URL
- Authentication method (`API_KEY_HEADER`, `BEARER_TOKEN`, `BASIC_AUTH`)
- Request JSON field mapping for Create Shipment (mapping internal sender, receiver, weight, dimensions, and COD amount to courier payload keys)
- Dot-delimited JSON response paths for AWB number (`data.awb_number`) and label URL
- Track Shipment path with `{awb}` placeholder and status mapping dictionary.
Configuration is stored in `courier_configurations` as JSON.

**[NEW — 22f] Honesty Requirement for Complex Integrations**
If a courier's API is structurally different (e.g. multi-step OAuth handshakes, SOAP/WSDL XML protocols, or stateful session tokens), the Generic REST Connector will not reliably handle it. In the UI, selecting "Custom/Other" explicitly displays an honest requirement notice: *"This courier's API requires custom integration — contact your developer"* to prevent silent failures.

---

## 23. Courier API Test

Every courier has a **[ Test Connection ]** button.

Success: "Authentication Successful", "API Connection Successful", "Tracking Endpoint Working"
Failure: "Authentication Failed", "Invalid Credentials", "Endpoint Unavailable"

API call logs are maintained for debugging (see §22c below).

**[NEW — 22c] API Call Logging**
Every outbound courier API call (and inbound webhook) should be logged with: timestamp, courier, endpoint, request (credentials redacted), response status, response time, and outcome. This is essential for diagnosing "why didn't my shipment get created" support cases and for detecting a courier's API degrading before customers complain.

---

## 24. Shipment Creation Flow

```
Admin: Booking → Review → Verify → Set Customer Charge → Select Courier
→ Create Shipment → Courier API → AWB Generated
```

If no API is available for that courier, **Manual AWB Entry** is supported as a fallback.

---

## 25. Tracking System — Customer-Facing

Customers get three clearly labeled, separate search options on `/track`:

**Option 1 — AWB Number:**
```
Air Waybill Number [____________]  [ TRACK BY AWB ]
```
Direct lookup matching courier-assigned AWB (e.g. `DEL98234123`, `BLU77491021`).

**Option 2 — Order ID / Booking ID:**
```
Booking / Order Reference [____________]  [ TRACK BY BOOKING ID ]
```
Lookup matching internal order numbers (e.g. `BK-1025`, `BK-1018`).

**Option 3 — Mobile Number + Pincode:**
```
10-Digit Mobile Number [____________]
6-Digit Pincode        [____________]
[ SEARCH BY MOBILE & PINCODE ]
```
The system checks both `(Sender Mobile + Sender Pincode)` OR `(Receiver Mobile + Receiver Pincode)` — customer does not need to specify whether they are the sender or receiver.

---

## 26. Mobile + Pincode Duplicate & Multi-Match Handling

- **One match** → direct tracking timeline is displayed immediately.
- **Multiple matches** → a clean, scrollable disambiguation list is displayed with route summaries, status badges, and masked AWBs for the customer to choose from:
  ```
  BK-1025   Jaipur → Mumbai   DEL••••123   In Transit   [ View Timeline ]
  BK-1018   Jaipur → Delhi    BLU••••021   Delivered    [ View Timeline ]
  BK-1009   Jaipur → Mumbai   DTD••••982   Delivered    [ View Timeline ]
  ```
- Selecting an entry renders the full standardized shipment timeline with back-to-list navigation.

**[IMPROVED]** Rate-limit this public search endpoint per IP and target mobile number (see §53a) to prevent brute-force enumeration.

---

## 27. Privacy in Tracking Results

**Show:** Booking ID, masked AWB (e.g. `DEL••••4123`), Origin City, Destination City, Current Status, Shipment Date, Payment Type (Prepaid / COD).
**Never show:** full phone numbers (masked as `98••••10`), complete street addresses, or payment card details.

---

## 28. QR Code Tracking

The QR code is **not** a separate option on the tracking page. It only appears on the Receipt / Shipping Label / Parcel Label (as a printed/PDF document). The customer scans it with their phone camera.

```
QR Code → Secure Tracking URL → Website Tracking Page → Shipment → Tracking Status
```

---

## 29. Secure Tracking URL

The QR never encodes a raw database ID or sensitive data — it encodes a **secure random tracking token**, e.g. `/track/secure-random-token`. The backend resolves the token to a shipment server-side.

**[IMPROVED]** Tokens should be cryptographically random (min. 128 bits of entropy), non-guessable/non-sequential, and support optional expiry/rotation for extra-sensitive shipments in the future.

---

## 30. Tracking Engine (Internal Flow)

```
Customer → AWB / Order ID / Mobile+Pincode / QR
→ Tracking Engine → Find Shipment → Find Courier → Courier Adapter
→ Courier API → Normalize Response → Tracking Result
```

---

## 31. Standard Tracking Status Mapping

Each courier's raw statuses are normalized into one common set, e.g.:

```
Courier raw statuses:      Manifested, Picked, Reached Hub, OFD, Delivered
Our normalized statuses:   BOOKED, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED
```

This keeps the customer experience identical regardless of which courier handled the shipment.

---

## 32. Tracking History

Every shipment stores a full event timeline, e.g.:

```
27 Aug 09:20   Shipment Booked
27 Aug 12:45   Picked Up — Jaipur Hub
27 Aug 18:30   In Transit
28 Aug 08:15   Reached Delhi Hub
28 Aug 10:20   Out for Delivery
```

---

## 33. Tracking Sync (Background Jobs)

```
Scheduler → Active Shipments → BullMQ → Courier API → Update Tracking → Database
```

The customer's tracking page can show the latest stored status, with a "refresh" action for a live re-check.

**[IMPROVED]** Poll frequency should scale with shipment status/age — e.g. poll every 30 min for `IN_TRANSIT`, every 4 hours for `PICKED_UP`, and stop polling entirely once `DELIVERED`/`RTO`/`CANCELLED` — to avoid wasting API call quota with couriers who often rate-limit or charge per call.

---

## 34. Courier API Failure Handling

If a courier API is temporarily unavailable, the customer sees:
> "Tracking information is temporarily unavailable. Please try again later."

The last known status remains visible/preserved in the database.

---

## 35. COD Management

COD amount and shipping charge are always separate. COD fields:

```
COD Amount
COD Collected
COD Collection Date
COD Settlement Amount
COD Settlement Date
COD Settlement Status
```

COD status enum:
```
NOT_APPLICABLE → TO_COLLECT → COLLECTED → SETTLEMENT_PENDING → SETTLED
                                                              → FAILED
```

**[IMPROVED]** Add a `COD Settlement Batch` concept: couriers typically settle COD in batches (e.g. weekly), not per-shipment. The schema should support grouping many shipments into one settlement batch/UTR reference, with per-shipment reconciliation against the batch total — this makes COD reconciliation reports actually usable at scale.

---

## 36. Payment Management (Shipping Charge)

```
PENDING → PAID
        → FAILED
        → REFUNDED
```

Online payment gateway integration is future-ready but not required for v1 (see §65a).

---

## 37. Notification Engine

```
Notification Engine
├── Email
├── WhatsApp
└── SMS
```

All notifications are sent via the background queue, never synchronously in the request/response cycle.

---

## 38. Email / SMTP

Admin configures under **Settings → Email / SMTP**: SMTP Host, Port, Encryption, Username, Password, From Name, From Email. Features: Test Email, Enable/Disable, Connection Test.

## 39. Email Templates

```
Welcome, Booking Received, Booking Approved, Booking Rejected, Shipment Created,
AWB Generated, Pickup Scheduled, In Transit, Out for Delivery, Delivered, RTO,
Password Reset, OTP (future), Payment Notification
```

Dynamic variables: `{{customerName}}`, `{{bookingId}}`, `{{awb}}`, `{{courierName}}`, `{{trackingLink}}`, `{{companyName}}`

## 40. WhatsApp Integration

Admin configures under **Settings → WhatsApp**: Provider, API URL, API Key, Access Token, Business Account ID, Phone Number ID, Webhook configuration, Status. WhatsApp templates are configurable.

## 41. SMS Integration

Admin configures under **Settings → SMS**: Provider, API URL, API Key, Sender ID, Credentials, Status.

## 42. Notification Rules (Per-Event Channel Toggles)

Admin decides which channel fires on which event, e.g.:
```
Booking Created:  Email ON, WhatsApp ON, SMS OFF
Delivered:        Email ON, WhatsApp ON, SMS ON
```

**[IMPROVED]** Add a `notification_logs` write on every attempt (success/failure + provider response), and a retry policy (e.g. 3 attempts with backoff) in BullMQ — silent notification failures are a common source of "the customer says they never got an update" support tickets.

---

## 43. Admin Dashboard

Overview cards: Today's Bookings, New Requests, Processing, In Transit, Delivered, RTO, COD Pending, COD Collected.

**Action Required:** New Booking Requests, Pending Courier Assignment, AWB Pending, Payment Pending, Shipment Exceptions, COD Settlement Pending.

## 44. Booking Management (Admin Table)

Columns: Booking ID, Customer, Source, Origin, Destination, Payment Type, COD Amount, Shipping Charge, Courier, AWB, Status, Created At, Action.
Filters: Status, Courier, Prepaid/COD, Date, Customer, Booking ID, AWB.

## 45. Booking Detail Page — Sections

```
Customer Information
Sender Information
Receiver Information
Customer Submitted Parcel Details
Admin Verified Parcel Details
Payment / Charge Details
Courier Information
Tracking Information
Activity Timeline
```

## 46. Activity Timeline (Audit Trail)

Every important action is audited, e.g.:
```
Booking created by Customer
Admin opened booking
Weight changed: 2 KG → 2.5 KG
Shipping charge set: ₹150
Courier assigned: Delhivery
AWB generated
Shipment status changed: In Transit
```

## 47. Customer Management

Admin can view: Customer list, search, add/edit customer, customer details, booking history, shipment history, COD history.

## 48. Staff Management
Admin panel → Staff & Roles provides complete administrative user management:
- **Staff List**: Name, Email, Mobile, Role Badge, Custom Overrides Count, Active Status.
- **Add New Staff Form**: Name, Email, Mobile (10-digit Indian format), Password (with interactive show/hide eye toggle), and Role dropdown (`STAFF`, `ADMIN`, `SUPER_ADMIN`).
- **Active / Inactive Toggle**: An interactive ON/OFF toggle switch per staff member (matching courier ON/OFF styling). Deactivated staff accounts are blocked server-side from authenticating at `/api/auth/login`.
- **Granular Permission Overrides**: Visual matrix interface allowing admin to grant or deny individual capabilities beyond role defaults, wired directly to `staff_permission_overrides`.

## 49. Support & Disputes **[NEW]**

A lightweight internal ticket/note system tied to a booking or shipment:
- Admin/staff can log a customer complaint or dispute (e.g. "weight dispute", "delayed delivery", "damaged parcel") against a specific shipment.
- Status: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`.
- This avoids disputes being tracked only in the generic activity timeline, and gives a dedicated "Open Tickets" view on the dashboard.

---

## 50. Role & Permission System

Granular permission keys categorized by operational domain:
```
booking.view, booking.create, booking.edit, booking.approve, booking.reject, booking.cancel
shipment.view, shipment.process, shipment.label, shipment.cancel
courier.view, courier.manage
customer.view, customer.create, customer.edit
cod.view, cod.manage
payment.view, payment.manage
notification.manage
reports.view
settings.view, settings.manage
users.manage, roles.manage
support.view, support.manage
```
**Server-Side Enforcement**: All protected administrative API routes and server actions evaluate `hasPermission(session, permissionKey)` server-side, never relying solely on UI element hiding (§53).

---

## 51. Settings Architecture

```
Settings
├── Company Profile
├── Contact Information
├── Website
├── Email / SMTP
├── WhatsApp
├── SMS
├── Courier Integrations
├── Payment
├── Notifications
├── Tracking
├── SEO
├── Social Media
└── Security
```

All settings are dynamic and database-driven.

## 52. Website Dynamic Rule

Company information is never hard-coded:
```
WRONG:  "ABC Courier", "+91 9876543210", "Jaipur" typed directly in code
RIGHT:  Database → Settings → Application → Website / Receipt / Notifications
```
When admin changes a setting, all relevant areas of the site update immediately.

---

## 53. Security Requirements

- API secrets encrypted at rest where appropriate
- Passwords hashed (bcrypt/argon2)
- Authentication protected (secure sessions, HttpOnly cookies)
- Role-based authorization enforced server-side on every route, not just hidden in the UI
- CSRF/security protections as applicable
- Rate limiting
- Input validation (client AND server side)
- API validation (Zod schemas on every route)
- Secure, non-guessable tracking tokens
- No sensitive data encoded in QR codes
- No API credentials ever shipped to the frontend
- No secrets committed to Git
- Audit logs for sensitive actions
- Secure environment variable handling

**[NEW — 53a] Additional hardening for v2.0:**
- Rate-limit public endpoints separately from authenticated ones — especially `/track`, `/login`, `/register`, and the tracking search (mobile+pincode lookup is an enumeration risk, see §26).
- Enforce a strong password policy + optional 2FA for Admin/Super Admin accounts.
- Log all admin/staff logins and permission changes to the audit log.
- Encrypt courier API credentials at the column level (application-level encryption, not just relying on "the database is on a private network").
- Add a documented data retention / soft-delete policy for customer PII (never hard-delete booking/shipment records needed for compliance and disputes; support anonymization on request instead).

---

## 54. Environment Variables

Sensitive configuration lives in `.env`:
```
DATABASE_URL, REDIS_URL
AUTH_SECRET
SMTP credentials, WhatsApp credentials, SMS credentials
Encryption key
Application URL
```
Courier credentials that are entered via the admin panel are stored encrypted in the database, not in `.env` (since they're configured at runtime, not deploy time).

---

## 55. Frontend Architecture

```
app/
├── (public)/
├── (auth)/
├── customer/
├── admin/
└── api/

components/
├── Header, Footer
├── TrackingForm, BookingForm
├── StatusBadge, DataTable, Modal, FormInput
├── QRCode, ShipmentTimeline
└── DashboardCards
```
Exact folder structure will be finalized during implementation.

## 56. Frontend Design Principles

Modern, clean, professional, responsive, mobile-first, easy navigation, fast-loading, accessible. Customer side stays simple; admin panel is data-heavy but organized. (Full design system in the companion document — see `03-design-system.md`.)

## 57. Customer Dashboard

Summary cards: Total Bookings, In Transit, Delivered, RTO.
Recent shipments table: Booking ID, Route, Courier, AWB, Payment Type, Status, Track.
Navigation: New Booking, Booking History, Shipment Details, Tracking, Profile, Notifications.

## 58. Admin Panel Navigation

```
Dashboard
Bookings
 ├── New Requests
 ├── All Bookings
 ├── Processing
 ├── Completed
 └── Cancelled
Shipments
 ├── All Shipments
 ├── Pickup Pending
 ├── In Transit
 ├── Out for Delivery
 ├── Delivered
 └── RTO
Customers
Staff / Users
Courier Partners
COD
Payments
Support Tickets   [NEW]
Notifications
Reports
Settings
```

## 59. Reports

```
Booking Report, Shipment Report, Courier Report, Customer Report,
COD Report, Payment Report, Revenue Report, Staff Performance Report, RTO Report
```
Filters: Date, Courier, Status, Customer, Payment Type.

## 60. Receipt / Shipping Label (Dual-Format Architecture)

Contains: Company Logo/Name, Booking ID, AWB, Courier, Sender, Receiver, Parcel info, Prepaid/COD, COD Amount, Shipping Charge, QR Code, Tracking info. Company profile information is dynamically pulled from the `settings` table.

**Standard Physical Label Enhancements [Round 2]**:
- **Scannable Pincodes**: Destination and Origin pincodes rendered in high-contrast, large font boxes for sorting hub operators.
- **Vector Code 128 Barcode**: Crisp, scalable 1D vector barcode encoding the AWB number, scannable by physical handheld laser scanners.
- **Vector QR Code**: Scannable 2D matrix encoding the direct secure tracking URL (`https://sscourierservice.in/track?q={awb}`).
- **Return Address Block**: "IF UNDELIVERED RETURN TO" block with full registered hub address and helpline.
- **Booking / Ship Date & Weight**: Verified/chargeable weight and dimensions clearly displayed.

**Dual Size Options Supported**:
1. **4x6 Inch / 100x150mm Thermal Label**: High-density logistics format optimized for thermal label printers (Zebra, TSC, Citizen) with `@page { size: 100mm 150mm; margin: 3mm; }`.
2. **A4 Full Page (Office / Invoice)**: Split layout containing customer dispatch receipt (top half), perforated cut line, and package shipping label (bottom half) with `@page { size: A4 portrait; margin: 8mm; }`.
- Extensible template system allowing one-click **Print Slip** and **Download PDF** across Admin Panel and Customer Portal.

---

## 61. Development Strategy — Phases

```
Phase 0  — Architecture & Project Foundation
Phase 1  — Frontend Design System + Public Website
Phase 2  — Authentication + Users + Roles
Phase 3  — Customer Booking
Phase 4  — Admin Booking Management
Phase 5  — Courier Management
Phase 6  — Shipment + AWB
Phase 7  — Tracking Engine
Phase 8  — COD + Payments
Phase 9  — Email + WhatsApp + SMS
Phase 10 — Reports + Settings + Audit
Phase 11 — Testing + Security
Phase 12 — Production Deployment
```

**[NEW]** Recommended additional phases:
```
Phase 4a — Support/Dispute Tickets   (can slot in alongside Phase 4)
Phase 7a — Inbound Courier Webhooks  (after Phase 7 tracking engine is stable)
Phase 8a — Automated Pricing Engine  (optional, opt-in — see §68a)
Phase 12a — Observability & Monitoring (error tracking, uptime, log aggregation — before real launch)
```

## 62. Frontend-First Strategy

Build the complete visual UI first, with mock data and no real API, so the whole site and Admin Panel can be visually reviewed and approved. Only after UI approval does backend/database integration begin:
```
Real UI + Mock Data + No Real API  →  (approval)  →  Mock Data → Real API → MySQL
```

## 63. Development Rules for the AI/Developer

- Inspect existing code before changing it; follow existing architecture
- Never break existing functionality without a documented reason
- Keep TypeScript strict
- Build reusable components; avoid duplicate code
- Apply validation and proper error handling everywhere
- Build loading / empty / error states for every data view
- Keep the UI responsive
- Maintain database migrations (never hand-edit the schema in production)
- Never hard-code secrets
- Test after every module, not just at the end

---

## 64. Final Business Flow

```
CUSTOMER → Book Parcel → Booking Request
   → ADMIN/STAFF: Review → Verify Weight/Size → Confirm Prepaid/COD
                → Set Shipping Charge → Select Courier
   → Create Shipment → AWB Generated → QR Code
   → Courier Pickup → In Transit → Out for Delivery
   → Delivered  OR  RTO
   → COD Settlement (if COD)
```

## 65. Final Tracking Flow

```
Customer: AWB | Order/Booking ID | Mobile+Pincode | QR Scan
   → Tracking Engine → Find Shipment → Find Courier → Courier Adapter
   → Courier Tracking API → Standardized Status → Customer
```

---

## 66. Future-Ready Extension Points **[IMPROVED / EXPANDED]**

The architecture must allow these to be added later **without a core rewrite**:

- New courier partners (new adapters)
- New/updated courier APIs
- **65a. Automated pricing engine (Built in v1 — /calculator & /api/calculator)**:
  A multi-carrier rate-card calculation engine keyed by origin pincode (default Jaipur Central Hub 302003), destination pincode, weight slab, and volumetric dimensions (`(L × W × H) / 5000`).
  - Resolves Indian pincodes into standardized shipping zones:
    - **Zone A**: Intra-City Jaipur (`302xxx`, same-day / next-day delivery)
    - **Zone B**: Intra-State Regional Rajasthan (`30xxxx` - `34xxxx`, 1 - 2 days)
    - **Zone C**: Major Metro Corridors (Delhi NCR, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad, 2 - 3 days)
    - **Zone D**: Rest of India Tier-2 & Tier-3 (3 - 5 days)
    - **Zone E**: Special Remote Zones (North-East, J&K, Island territories, 4 - 7 days)
  - Provides comparative quotes across Delhivery Express Air, DTDC Standard Surface, and XpressBees Priority.
  - **ESTIMATE ONLY RULE**: Per §10 & §16, this calculator provides an indicative customer estimate for transparency. The actual customer `shipping_charge` is verified, calibrated, and confirmed manually by admin/staff upon package physical intake at the hub.
- WhatsApp bot for two-way customer interaction (status queries, not just outbound notifications)
- Advanced reports / BI export
- Customer wallet (prepaid balance for frequent shippers)
- Business accounts (bulk booking, GST invoicing — see §17a)
- GST-compliant invoice generation for shipping charges

---

## 67. Development Start Point

Start with **Phase 0 — Project Foundation**, then **Phase 1 — Complete Frontend UI** (Public Website + Customer Portal + Admin Panel, with mock data). Backend/database integration begins only after UI approval.

---

## 68. Final Core Principle

This platform is not just a courier website. It is a:

**Courier Booking + Shipment Management + Multi-Courier Tracking + COD + Communication + Admin Operations Platform.**

The architecture must let all of §66's extensions be added later without rewriting the core system.

## END OF MASTER SPECIFICATION
