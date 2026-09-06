# Courier Platform — Database Schema (v2.0)

This expands the original entity list (§55 of the feature spec) into concrete tables with
fields, types, and relationships, ready to translate into a Prisma schema. Money fields are
stored as integers in **paise** (₹1 = 100 paise) to avoid floating-point rounding errors.

---

## Auth & Access Control

### `users`
| Field | Type | Notes |
|---|---|---|
| id | uuid/pk | |
| name | string | |
| email | string, unique | |
| mobile | string, unique | |
| password_hash | string | bcrypt/argon2 |
| role_id | fk → roles.id | |
| status | enum(ACTIVE, DISABLED) | |
| two_factor_enabled | boolean | default false |
| last_login_at | datetime, nullable | |
| created_at / updated_at | datetime | |

### `roles`
`id`, `name` (SUPER_ADMIN, ADMIN, STAFF), `is_system_role` (boolean — prevents deleting built-ins), timestamps.

### `permissions`
`id`, `key` (e.g. `booking.create`), `description`, `group` (e.g. "Booking").

### `role_permissions`
`role_id`, `permission_id` — composite PK, many-to-many join.

### `staff_permission_overrides` **[NEW]**
For per-staff-member permission grants beyond their role default: `user_id`, `permission_id`, `granted` (boolean, allows explicit deny too).

---

## Customers

### `customers`
| Field | Type | Notes |
|---|---|---|
| id | uuid/pk | |
| user_id | fk → users.id, nullable | null until they register an account |
| name | string | |
| email | string, nullable | |
| mobile | string | |
| account_type | enum(INDIVIDUAL, BUSINESS) | **[NEW]** §17a |
| gstin | string, nullable | **[NEW]** for business accounts |
| status | enum(ACTIVE, BLOCKED) | |
| created_at / updated_at | datetime | |

### `customer_addresses`
`id`, `customer_id`, `label` (Home/Office/etc.), `address`, `city`, `state`, `pincode`, `is_default` (boolean).

---

## Bookings

### `bookings`
| Field | Type | Notes |
|---|---|---|
| id | uuid/pk | |
| booking_number | string, unique | human-readable, e.g. BK-1025 |
| customer_id | fk → customers.id | |
| source | enum(CUSTOMER, STAFF, ADMIN) | §13 |
| created_by | fk → users.id | |
| status | enum(DRAFT, REQUESTED, UNDER_REVIEW, APPROVED, REJECTED, CANCELLED) | §17 |
| payment_type | enum(PREPAID, COD) | |
| cod_amount | int (paise) | 0 if prepaid |
| — sender snapshot — | | |
| sender_name, sender_mobile, sender_email, sender_address, sender_city, sender_state, sender_pincode | | frozen at booking time |
| — receiver snapshot — | | |
| receiver_name, receiver_mobile, receiver_email, receiver_address, receiver_city, receiver_state, receiver_pincode | | frozen at booking time |
| rejection_reason | string, nullable | |
| reviewed_by | fk → users.id, nullable | |
| reviewed_at | datetime, nullable | |
| created_at / updated_at | datetime | |

> **[IMPROVED]** Sender/receiver are stored directly on the booking (not just via `customer_addresses`) because the receiver is frequently a third party, not the customer's own saved address — and because the shipped-to details must be frozen even if the customer later edits their address book.

### `booking_parcels`
One row per parcel in the booking (supports multi-parcel bookings even though v1 UI may only expose one).

| Field | Type | Notes |
|---|---|---|
| id | uuid/pk | |
| booking_id | fk → bookings.id | |
| parcel_type | string | |
| description | string | |
| — customer submitted — | | |
| submitted_weight_grams, submitted_length_cm, submitted_width_cm, submitted_height_cm | int | §15 |
| declared_value | int (paise) | |
| — admin verified — | | |
| verified_weight_grams, verified_length_cm, verified_width_cm, verified_height_cm | int, nullable | filled during review |
| verified_by | fk → users.id, nullable | |
| verified_at | datetime, nullable | |

### `booking_charges` **[IMPROVED — split out from a flat field set]**
| Field | Type | Notes |
|---|---|---|
| id | uuid/pk | |
| booking_id | fk → bookings.id, unique | one charge breakdown per booking |
| shipping_charge | int (paise) | §16 |
| additional_charge | int (paise) | |
| discount | int (paise) | |
| tax | int (paise) | |
| total | int (paise) | generated/validated = sum of the above |
| set_by | fk → users.id | |
| set_at | datetime | |

---

## Shipments & Tracking

### `shipments`
| Field | Type | Notes |
|---|---|---|
| id | uuid/pk | |
| booking_id | fk → bookings.id, unique | |
| courier_partner_id | fk → courier_partners.id | |
| awb | string, nullable, indexed | null until generated / manually entered |
| awb_source | enum(API, MANUAL) | |
| status | enum(PROCESSING, COURIER_ASSIGNED, AWB_GENERATED, PICKUP_SCHEDULED, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, RTO, EXCEPTION, CANCELLED) | §18 |
| exception_reason | enum, nullable | **[NEW]** §18 — ADDRESS_ISSUE, RECEIVER_UNAVAILABLE, DAMAGED, LOST, OTHER |
| tracking_token | string, unique, indexed | §29 — cryptographically random |
| idempotency_key | string, unique | §22b — typically = booking_id |
| label_url | string, nullable | object storage path |
| next_poll_at | datetime, nullable | **[NEW]** §33 — drives adaptive polling |
| last_synced_at | datetime, nullable | |
| created_at / updated_at | datetime | |

### `shipment_tracking_events`
| Field | Type | Notes |
|---|---|---|
| id | uuid/pk | |
| shipment_id | fk → shipments.id | |
| status | string | normalized status (§31) |
| raw_status | string | original courier status text |
| location | string, nullable | |
| occurred_at | datetime | when the event happened per courier |
| received_at | datetime | when we recorded it |
| source | enum(POLL, WEBHOOK, MANUAL) | **[NEW]** §22a |

### `courier_api_logs` **[NEW — §23]**
| Field | Type | Notes |
|---|---|---|
| id | uuid/pk | |
| courier_partner_id | fk | |
| shipment_id | fk, nullable | |
| direction | enum(OUTBOUND, INBOUND_WEBHOOK) | |
| endpoint | string | |
| request_summary | json | credentials redacted |
| response_status | int | |
| response_summary | json | |
| response_time_ms | int | |
| outcome | enum(SUCCESS, FAILURE) | |
| created_at | datetime | |

---

## Courier Partners

### `courier_partners`
`id`, `name`, `code` (unique), `logo_url`, `website`, `support_contact`, `status` (ACTIVE/INACTIVE), `capability_shipment_api`, `capability_tracking_api`, `capability_label_api`, `capability_pickup_api`, `capability_cancellation_api` (all booleans, §21), `created_at`/`updated_at`.

### `courier_credentials`
`id`, `courier_partner_id`, `credential_key` (e.g. `api_key`, `client_secret`), `credential_value_encrypted`, `created_at`/`updated_at`. **[IMPROVED]** application-level encryption (§53a), not plaintext, even inside the DB.

### `courier_configurations`
`id`, `courier_partner_id`, `config_key`, `config_value` (json) — flexible per-courier config (endpoints, zones served, etc.).

---

## Payments & COD

### `payments`
| Field | Type | Notes |
|---|---|---|
| id | uuid/pk | |
| booking_id | fk → bookings.id | |
| amount | int (paise) | = booking_charges.total |
| status | enum(PENDING, PAID, FAILED, REFUNDED) | §36 |
| method | enum(MANUAL, GATEWAY) | GATEWAY reserved for future |
| gateway_reference | string, nullable | future-ready |
| paid_at | datetime, nullable | |

### `cod_transactions`
| Field | Type | Notes |
|---|---|---|
| id | uuid/pk | |
| shipment_id | fk → shipments.id, unique | |
| cod_amount | int (paise) | |
| status | enum(NOT_APPLICABLE, TO_COLLECT, COLLECTED, SETTLEMENT_PENDING, SETTLED, FAILED) | §35 |
| collected_at | datetime, nullable | |
| settlement_batch_id | fk → cod_settlements.id, nullable | **[NEW]** §35 |

### `cod_settlements` **[NEW — §35]**
| Field | Type | Notes |
|---|---|---|
| id | uuid/pk | |
| courier_partner_id | fk | |
| reference_utr | string | courier's settlement/UTR reference |
| total_amount | int (paise) | courier-reported batch total |
| reconciled_amount | int (paise) | sum of matched cod_transactions |
| status | enum(PENDING, RECONCILED, DISCREPANCY) | |
| settled_at | datetime | |

---

## Notifications

### `notification_templates`
`id`, `event_key` (e.g. `booking.approved`), `channel` (EMAIL/WHATSAPP/SMS), `subject` (email only), `body`, `is_active`, `updated_at`.

### `notification_rules`
`id`, `event_key`, `channel`, `enabled` (boolean) — implements the ON/OFF grid from §42.

### `notification_logs`
`id`, `event_key`, `channel`, `recipient`, `booking_id`/`shipment_id` nullable refs, `status` (SENT/FAILED/RETRYING), `provider_response`, `attempt_count`, `created_at`. **[NEW]** required for §42's retry/audit improvement.

---

## Support **[NEW — §49]**

### `support_tickets`
`id`, `booking_id`/`shipment_id` (nullable refs), `raised_by`, `type` (WEIGHT_DISPUTE, DELAY, DAMAGE, OTHER), `status` (OPEN, IN_PROGRESS, RESOLVED, CLOSED), `assigned_to`, `created_at`/`updated_at`.

### `support_ticket_notes`
`id`, `ticket_id`, `author_id`, `note`, `created_at`.

---

## Settings & System

### `settings`
`id`, `group` (company_profile, email_smtp, whatsapp, sms, payment, tracking, seo, social, security), `key`, `value` (json), `updated_by`, `updated_at`. A single flexible key-value table backs the entire §51 settings architecture.

### `activity_logs`
`id`, `actor_id`, `action` (e.g. `booking.weight_changed`), `entity_type`, `entity_id`, `before` (json, nullable), `after` (json, nullable), `created_at`. Powers §46's Activity Timeline and §53a's admin action audit.

### `tracking_tokens`
Only needed as a standalone table if tokens must be rotatable/revocable independent of the shipment row; otherwise the `tracking_token` column directly on `shipments` (as modeled above) is sufficient for v1. Add this table only if multi-token-per-shipment or expiry/rotation history is required.

---

## Indexing Notes **[NEW]**

- `bookings.booking_number`, `shipments.awb`, `shipments.tracking_token` — unique indexes (already noted above), all on the hot path for lookups.
- Composite index on `bookings(customer_id, status)` for customer dashboard queries.
- Composite index on `shipments(status, next_poll_at)` for the tracking-sync scheduler to efficiently pull the next batch to poll.
- Composite index on `customer_addresses` / booking sender-receiver mobile+pincode fields to support the §26 tracking search efficiently — this is a frequently-hit public endpoint.

## Data Retention Note **[NEW — ties to §53a]**

Never hard-delete `bookings`, `shipments`, or `cod_transactions` — add a `deleted_at` (soft-delete) column if removal from active views is ever needed. Financial and shipment records typically need to be retained for compliance and dispute-resolution windows even after a customer requests account deletion; anonymize customer PII on request instead of deleting transactional rows.
