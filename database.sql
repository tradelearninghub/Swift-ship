-- =============================================================================
-- Swift Ship Courier & Tracking Platform - Full Database Schema & Seed Data
-- Target Database: MySQL 8.0+ / MariaDB 10.4+
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL UNIQUE,
  `is_system_role` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Permissions
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `key` VARCHAR(191) NOT NULL UNIQUE,
  `description` VARCHAR(191) NOT NULL,
  `group` VARCHAR(191) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Role Permissions
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` VARCHAR(191) NOT NULL,
  `permission_id` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `mobile` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(191) NOT NULL,
  `role_id` VARCHAR(191) NOT NULL,
  `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
  `two_factor_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `last_login_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3) NULL,
  INDEX `idx_users_role` (`role_id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Staff Permission Overrides
CREATE TABLE IF NOT EXISTS `staff_permission_overrides` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(191) NOT NULL,
  `permission_id` VARCHAR(191) NOT NULL,
  `granted` TINYINT(1) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `uk_staff_override` (`user_id`, `permission_id`),
  CONSTRAINT `fk_override_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_override_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Customers
CREATE TABLE IF NOT EXISTS `customers` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(191) NULL UNIQUE,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NULL,
  `mobile` VARCHAR(191) NOT NULL,
  `account_type` ENUM('INDIVIDUAL', 'BUSINESS') NOT NULL DEFAULT 'INDIVIDUAL',
  `gstin` VARCHAR(191) NULL,
  `status` ENUM('ACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3) NULL,
  INDEX `idx_customers_mobile` (`mobile`),
  CONSTRAINT `fk_customer_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Customer Addresses
CREATE TABLE IF NOT EXISTS `customer_addresses` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `customer_id` VARCHAR(191) NOT NULL,
  `label` VARCHAR(191) NOT NULL,
  `source` VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
  `type` VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
  `contact_name` VARCHAR(191) NULL,
  `contact_mobile` VARCHAR(191) NULL,
  `contact_email` VARCHAR(191) NULL,
  `country` VARCHAR(100) NOT NULL DEFAULT 'India',
  `address` TEXT NOT NULL,
  `address_line_2` VARCHAR(191) NULL,
  `address_line_3` VARCHAR(191) NULL,
  `landmark` VARCHAR(191) NULL,
  `city` VARCHAR(191) NOT NULL,
  `district` VARCHAR(191) NULL,
  `state` VARCHAR(191) NOT NULL,
  `pincode` VARCHAR(191) NOT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `idx_address_cust` (`customer_id`),
  INDEX `idx_address_source` (`source`),
  CONSTRAINT `fk_address_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bookings
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `booking_number` VARCHAR(191) NOT NULL UNIQUE,
  `customer_id` VARCHAR(191) NOT NULL,
  `source` ENUM('CUSTOMER', 'STAFF', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `shipment_mode` VARCHAR(20) NOT NULL DEFAULT 'DOMESTIC',
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `exchange_rate` DOUBLE NOT NULL DEFAULT 1.0,
  `total_inr_paise` INT NOT NULL DEFAULT 0,
  `created_by` VARCHAR(191) NOT NULL,
  `status` ENUM('DRAFT', 'REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'REQUESTED',
  `payment_type` ENUM('PREPAID', 'COD') NOT NULL DEFAULT 'PREPAID',
  `cod_amount` INT NOT NULL DEFAULT 0,
  `sender_name` VARCHAR(191) NOT NULL,
  `sender_mobile` VARCHAR(191) NOT NULL,
  `sender_email` VARCHAR(191) NULL,
  `sender_country` VARCHAR(100) NOT NULL DEFAULT 'India',
  `sender_address` TEXT NOT NULL,
  `sender_address_2` VARCHAR(191) NULL,
  `sender_address_3` VARCHAR(191) NULL,
  `sender_landmark` VARCHAR(191) NULL,
  `sender_city` VARCHAR(191) NOT NULL,
  `sender_district` VARCHAR(191) NULL,
  `sender_state` VARCHAR(191) NOT NULL,
  `sender_pincode` VARCHAR(191) NOT NULL,
  `receiver_name` VARCHAR(191) NOT NULL,
  `receiver_mobile` VARCHAR(191) NOT NULL,
  `receiver_email` VARCHAR(191) NULL,
  `receiver_country` VARCHAR(100) NOT NULL DEFAULT 'India',
  `receiver_address` TEXT NOT NULL,
  `receiver_address_2` VARCHAR(191) NULL,
  `receiver_address_3` VARCHAR(191) NULL,
  `receiver_landmark` VARCHAR(191) NULL,
  `receiver_city` VARCHAR(191) NOT NULL,
  `receiver_district` VARCHAR(191) NULL,
  `receiver_state` VARCHAR(191) NOT NULL,
  `receiver_pincode` VARCHAR(191) NOT NULL,
  `invoice_number` VARCHAR(191) NULL,
  `invoice_date` VARCHAR(191) NULL,
  `service_type` VARCHAR(100) NULL,
  `ioss_number` VARCHAR(191) NULL,
  `rejection_reason` TEXT NULL,
  `reviewed_by` VARCHAR(191) NULL,
  `reviewed_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3) NULL,
  INDEX `idx_bookings_customer_status` (`customer_id`, `status`),
  INDEX `idx_bookings_sender` (`sender_mobile`, `sender_pincode`),
  INDEX `idx_bookings_receiver` (`receiver_mobile`, `receiver_pincode`),
  CONSTRAINT `fk_bookings_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Booking Parcels
CREATE TABLE IF NOT EXISTS `booking_parcels` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `booking_id` VARCHAR(191) NOT NULL,
  `parcel_type` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `submitted_weight_grams` INT NOT NULL,
  `submitted_length_cm` INT NOT NULL,
  `submitted_width_cm` INT NOT NULL,
  `submitted_height_cm` INT NOT NULL,
  `declared_value` INT NOT NULL DEFAULT 0,
  `declared_value_inr` INT NOT NULL DEFAULT 0,
  `line_items` JSON NULL,
  `verified_weight_grams` INT NULL,
  `verified_length_cm` INT NULL,
  `verified_width_cm` INT NULL,
  `verified_height_cm` INT NULL,
  `verified_by` VARCHAR(191) NULL,
  `verified_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `idx_parcels_booking` (`booking_id`),
  INDEX `idx_parcels_verifier` (`verified_by`),
  CONSTRAINT `fk_parcels_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_parcels_verifier` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Booking Charges
CREATE TABLE IF NOT EXISTS `booking_charges` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `booking_id` VARCHAR(191) NOT NULL UNIQUE,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `exchange_rate` DOUBLE NOT NULL DEFAULT 1.0,
  `shipping_charge` INT NOT NULL DEFAULT 0,
  `additional_charge` INT NOT NULL DEFAULT 0,
  `discount` INT NOT NULL DEFAULT 0,
  `tax` INT NOT NULL DEFAULT 0,
  `total` INT NOT NULL DEFAULT 0,
  `total_inr` INT NOT NULL DEFAULT 0,
  `set_by` VARCHAR(191) NOT NULL,
  `set_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT `fk_charges_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_charges_setter` FOREIGN KEY (`set_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Courier Partners
CREATE TABLE IF NOT EXISTS `courier_partners` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL UNIQUE,
  `logo_url` VARCHAR(191) NULL,
  `website` VARCHAR(191) NULL,
  `support_contact` VARCHAR(191) NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `capability_shipment_api` TINYINT(1) NOT NULL DEFAULT 0,
  `capability_tracking_api` TINYINT(1) NOT NULL DEFAULT 0,
  `capability_label_api` TINYINT(1) NOT NULL DEFAULT 0,
  `capability_pickup_api` TINYINT(1) NOT NULL DEFAULT 0,
  `capability_cancellation_api` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Courier Credentials
CREATE TABLE IF NOT EXISTS `courier_credentials` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `courier_partner_id` VARCHAR(191) NOT NULL,
  `credential_key` VARCHAR(191) NOT NULL,
  `credential_value_encrypted` TEXT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `uk_courier_cred` (`courier_partner_id`, `credential_key`),
  CONSTRAINT `fk_cred_courier` FOREIGN KEY (`courier_partner_id`) REFERENCES `courier_partners` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Courier Configurations
CREATE TABLE IF NOT EXISTS `courier_configurations` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `courier_partner_id` VARCHAR(191) NOT NULL,
  `config_key` VARCHAR(191) NOT NULL,
  `config_value` JSON NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `uk_courier_config` (`courier_partner_id`, `config_key`),
  CONSTRAINT `fk_config_courier` FOREIGN KEY (`courier_partner_id`) REFERENCES `courier_partners` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Shipments
CREATE TABLE IF NOT EXISTS `shipments` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `booking_id` VARCHAR(191) NOT NULL UNIQUE,
  `courier_partner_id` VARCHAR(191) NOT NULL,
  `awb` VARCHAR(191) NULL,
  `awb_source` ENUM('API', 'MANUAL') NOT NULL DEFAULT 'API',
  `status` ENUM('PROCESSING', 'COURIER_ASSIGNED', 'AWB_GENERATED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RTO', 'EXCEPTION', 'CANCELLED') NOT NULL DEFAULT 'PROCESSING',
  `exception_reason` ENUM('ADDRESS_ISSUE', 'RECEIVER_UNAVAILABLE', 'DAMAGED', 'LOST', 'OTHER') NULL,
  `tracking_token` VARCHAR(191) NOT NULL UNIQUE,
  `idempotency_key` VARCHAR(191) NOT NULL UNIQUE,
  `label_url` VARCHAR(191) NULL,
  `next_poll_at` DATETIME(3) NULL,
  `last_synced_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3) NULL,
  INDEX `idx_shipments_awb` (`awb`),
  INDEX `idx_shipments_poll` (`status`, `next_poll_at`),
  CONSTRAINT `fk_shipments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_shipments_courier` FOREIGN KEY (`courier_partner_id`) REFERENCES `courier_partners` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Shipment Tracking Events
CREATE TABLE IF NOT EXISTS `shipment_tracking_events` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `shipment_id` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL,
  `raw_status` VARCHAR(191) NOT NULL,
  `location` VARCHAR(191) NULL,
  `occurred_at` DATETIME(3) NOT NULL,
  `received_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `source` ENUM('POLL', 'WEBHOOK', 'MANUAL') NOT NULL DEFAULT 'POLL',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `idx_tracking_shipment` (`shipment_id`),
  CONSTRAINT `fk_tracking_shipment` FOREIGN KEY (`shipment_id`) REFERENCES `shipments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Courier API Logs
CREATE TABLE IF NOT EXISTS `courier_api_logs` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `courier_partner_id` VARCHAR(191) NOT NULL,
  `shipment_id` VARCHAR(191) NULL,
  `direction` ENUM('OUTBOUND', 'INBOUND_WEBHOOK') NOT NULL,
  `endpoint` VARCHAR(191) NOT NULL,
  `request_summary` JSON NOT NULL,
  `response_status` INT NOT NULL,
  `response_summary` JSON NOT NULL,
  `response_time_ms` INT NOT NULL,
  `outcome` ENUM('SUCCESS', 'FAILURE') NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `idx_apilogs_courier` (`courier_partner_id`),
  INDEX `idx_apilogs_shipment` (`shipment_id`),
  CONSTRAINT `fk_apilogs_courier` FOREIGN KEY (`courier_partner_id`) REFERENCES `courier_partners` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_apilogs_shipment` FOREIGN KEY (`shipment_id`) REFERENCES `shipments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Payments
CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `booking_id` VARCHAR(191) NOT NULL,
  `amount` INT NOT NULL,
  `status` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  `method` ENUM('MANUAL', 'GATEWAY') NOT NULL DEFAULT 'MANUAL',
  `gateway_reference` VARCHAR(191) NULL,
  `paid_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `idx_payments_booking` (`booking_id`),
  CONSTRAINT `fk_payments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. COD Settlements
CREATE TABLE IF NOT EXISTS `cod_settlements` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `courier_partner_id` VARCHAR(191) NOT NULL,
  `reference_utr` VARCHAR(191) NOT NULL UNIQUE,
  `total_amount` INT NOT NULL,
  `reconciled_amount` INT NOT NULL,
  `status` ENUM('PENDING', 'RECONCILED', 'DISCREPANCY') NOT NULL DEFAULT 'PENDING',
  `settled_at` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `idx_cod_settlement_courier` (`courier_partner_id`),
  CONSTRAINT `fk_settlement_courier` FOREIGN KEY (`courier_partner_id`) REFERENCES `courier_partners` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. COD Transactions
CREATE TABLE IF NOT EXISTS `cod_transactions` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `shipment_id` VARCHAR(191) NOT NULL UNIQUE,
  `cod_amount` INT NOT NULL,
  `status` ENUM('TO_COLLECT', 'COLLECTED', 'SETTLEMENT_PENDING', 'SETTLED', 'FAILED') NOT NULL DEFAULT 'TO_COLLECT',
  `collected_at` DATETIME(3) NULL,
  `settlement_batch_id` VARCHAR(191) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3) NULL,
  INDEX `idx_cod_trans_batch` (`settlement_batch_id`),
  CONSTRAINT `fk_cod_shipment` FOREIGN KEY (`shipment_id`) REFERENCES `shipments` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_cod_batch` FOREIGN KEY (`settlement_batch_id`) REFERENCES `cod_settlements` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Notification Templates
CREATE TABLE IF NOT EXISTS `notification_templates` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `event_key` VARCHAR(191) NOT NULL,
  `channel` ENUM('EMAIL', 'WHATSAPP', 'SMS') NOT NULL,
  `subject` VARCHAR(191) NULL,
  `body` TEXT NOT NULL,
  `sender_email` VARCHAR(191) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `uk_template_event_chan` (`event_key`, `channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Notification Rules
CREATE TABLE IF NOT EXISTS `notification_rules` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `event_key` VARCHAR(191) NOT NULL,
  `channel` ENUM('EMAIL', 'WHATSAPP', 'SMS') NOT NULL,
  `enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `uk_rule_event_chan` (`event_key`, `channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Notification Logs
CREATE TABLE IF NOT EXISTS `notification_logs` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `event_key` VARCHAR(191) NOT NULL,
  `channel` ENUM('EMAIL', 'WHATSAPP', 'SMS') NOT NULL,
  `recipient` VARCHAR(191) NOT NULL,
  `booking_id` VARCHAR(191) NULL,
  `shipment_id` VARCHAR(191) NULL,
  `status` ENUM('SENT', 'FAILED', 'RETRYING') NOT NULL DEFAULT 'SENT',
  `provider_response` TEXT NULL,
  `attempt_count` INT NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `idx_notif_booking` (`booking_id`),
  INDEX `idx_notif_shipment` (`shipment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. Support Tickets
CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `booking_id` VARCHAR(191) NULL,
  `shipment_id` VARCHAR(191) NULL,
  `raised_by` VARCHAR(191) NOT NULL,
  `type` ENUM('WEIGHT_DISPUTE', 'DELAY', 'DAMAGE', 'OTHER') NOT NULL DEFAULT 'OTHER',
  `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
  `assigned_to` VARCHAR(191) NULL,
  `subject` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `idx_tickets_raised` (`raised_by`),
  INDEX `idx_tickets_assigned` (`assigned_to`),
  CONSTRAINT `fk_tickets_raiser` FOREIGN KEY (`raised_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_tickets_assignee` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. Support Ticket Notes
CREATE TABLE IF NOT EXISTS `support_ticket_notes` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `ticket_id` VARCHAR(191) NOT NULL,
  `author_id` VARCHAR(191) NOT NULL,
  `note` TEXT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `idx_notes_ticket` (`ticket_id`),
  CONSTRAINT `fk_notes_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_notes_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. Settings
CREATE TABLE IF NOT EXISTS `settings` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `group` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL UNIQUE,
  `value` JSON NOT NULL,
  `updated_by` VARCHAR(191) NULL,
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `idx_settings_group` (`group`),
  CONSTRAINT `fk_settings_updater` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. Activity Logs
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `actor_id` VARCHAR(191) NULL,
  `action` VARCHAR(191) NOT NULL,
  `entity_type` VARCHAR(191) NOT NULL,
  `entity_id` VARCHAR(191) NOT NULL,
  `before` JSON NULL,
  `after` JSON NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `idx_activity_actor` (`actor_id`),
  INDEX `idx_activity_entity` (`entity_type`, `entity_id`),
  CONSTRAINT `fk_activity_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. Rate Cards (Automated Indicative Pricing Engine - §65a)
CREATE TABLE IF NOT EXISTS `rate_cards` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `courier_code` VARCHAR(50) NOT NULL,
  `courier_name` VARCHAR(100) NOT NULL,
  `service_type` VARCHAR(20) NOT NULL,
  `zone` VARCHAR(50) NOT NULL,
  `zone_title` VARCHAR(100) NOT NULL,
  `base_weight_grams` INT NOT NULL,
  `base_rate_paise` INT NOT NULL,
  `additional_weight_grams` INT NOT NULL,
  `additional_rate_paise` INT NOT NULL,
  `min_transit_days` INT NOT NULL DEFAULT 1,
  `max_transit_days` INT NOT NULL DEFAULT 3,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `idx_rate_cards_courier_zone` (`courier_code`, `zone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SEED INITIAL DATA (Idempotent INSERT IGNORE / ON DUPLICATE KEY UPDATE)
-- =============================================================================

-- Seed Roles
INSERT INTO `roles` (`id`, `name`, `is_system_role`, `created_at`, `updated_at`) VALUES
('role-super-admin', 'SUPER_ADMIN', 1, NOW(3), NOW(3)),
('role-admin', 'ADMIN', 1, NOW(3), NOW(3)),
('role-staff', 'STAFF', 1, NOW(3), NOW(3)),
('role-customer', 'CUSTOMER', 1, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `is_system_role` = VALUES(`is_system_role`);

-- Seed Permissions
INSERT INTO `permissions` (`id`, `key`, `description`, `group`, `created_at`, `updated_at`) VALUES
('perm-bk-view', 'booking.view', 'View bookings', 'Booking', NOW(3), NOW(3)),
('perm-bk-create', 'booking.create', 'Create bookings', 'Booking', NOW(3), NOW(3)),
('perm-bk-edit', 'booking.edit', 'Edit booking details', 'Booking', NOW(3), NOW(3)),
('perm-bk-approve', 'booking.approve', 'Approve and rate bookings', 'Booking', NOW(3), NOW(3)),
('perm-bk-reject', 'booking.reject', 'Reject bookings', 'Booking', NOW(3), NOW(3)),
('perm-bk-cancel', 'booking.cancel', 'Cancel bookings', 'Booking', NOW(3), NOW(3)),
('perm-sp-view', 'shipment.view', 'View shipments', 'Shipment', NOW(3), NOW(3)),
('perm-sp-process', 'shipment.process', 'Process shipments and AWBs', 'Shipment', NOW(3), NOW(3)),
('perm-cr-view', 'courier.view', 'View courier partners', 'Courier', NOW(3), NOW(3)),
('perm-cr-manage', 'courier.manage', 'Manage couriers and credentials', 'Courier', NOW(3), NOW(3)),
('perm-cs-view', 'customer.view', 'View customers', 'Customer', NOW(3), NOW(3)),
('perm-cs-manage', 'customer.manage', 'Manage customers', 'Customer', NOW(3), NOW(3)),
('perm-cd-view', 'cod.view', 'View COD transactions', 'COD', NOW(3), NOW(3)),
('perm-cd-manage', 'cod.manage', 'Manage COD settlements', 'COD', NOW(3), NOW(3)),
('perm-py-view', 'payment.view', 'View payments', 'Payment', NOW(3), NOW(3)),
('perm-py-manage', 'payment.manage', 'Manage payments', 'Payment', NOW(3), NOW(3)),
('perm-rp-view', 'reports.view', 'View reports', 'Reports', NOW(3), NOW(3)),
('perm-st-view', 'settings.view', 'View settings', 'Settings', NOW(3), NOW(3)),
('perm-st-manage', 'settings.manage', 'Manage settings', 'Settings', NOW(3), NOW(3)),
('perm-us-manage', 'users.manage', 'Manage staff and roles', 'Staff', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `group` = VALUES(`group`);

-- Assign Permissions to SUPER_ADMIN
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'role-super-admin', `id` FROM `permissions`;

-- Assign Permissions to ADMIN (except settings & users management)
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'role-admin', `id` FROM `permissions`
WHERE `key` NOT LIKE 'settings.%' AND `key` NOT LIKE 'users.%';

-- Assign Permissions to STAFF (operations view & create)
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'role-staff', `id` FROM `permissions`
WHERE `key` IN ('booking.view', 'booking.create', 'shipment.view', 'customer.view');

-- Seed Super Admin Users (admin@sscourierservice.in & admin@swiftship.com / Admin@12345)
-- Verified bcrypt hash: $2a$10$3gFAfXHoT/GYzAqOwYTlMeSCCYLyTBnL65BmWSPOLoQH.X88p8Dl.
INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `password_hash`, `role_id`, `status`, `created_at`, `updated_at`)
VALUES 
(
  'user-super-admin-01',
  'Super Admin',
  'admin@sscourierservice.in',
  '8000151117',
  '$2a$10$3gFAfXHoT/GYzAqOwYTlMeSCCYLyTBnL65BmWSPOLoQH.X88p8Dl.',
  'role-super-admin',
  'ACTIVE',
  NOW(3),
  NOW(3)
),
(
  'user-super-admin-02',
  'Super Admin (SwiftShip Alias)',
  'admin@swiftship.com',
  '9876543210',
  '$2a$10$3gFAfXHoT/GYzAqOwYTlMeSCCYLyTBnL65BmWSPOLoQH.X88p8Dl.',
  'role-super-admin',
  'ACTIVE',
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE 
  `password_hash` = VALUES(`password_hash`),
  `status` = 'ACTIVE',
  `role_id` = 'role-super-admin';

-- Seed Courier Partners
INSERT INTO `courier_partners` (`id`, `name`, `code`, `website`, `support_contact`, `status`, `capability_shipment_api`, `capability_tracking_api`, `capability_label_api`, `capability_pickup_api`, `capability_cancellation_api`, `created_at`, `updated_at`) VALUES
('cp-delhivery', 'Delhivery', 'DELHIVERY', 'https://www.delhivery.com', '+91 124 6719500', 'ACTIVE', 1, 1, 1, 1, 1, NOW(3), NOW(3)),
('cp-bluedart', 'Blue Dart', 'BLUEDART', 'https://www.bluedart.com', '1860 233 1234', 'ACTIVE', 1, 1, 1, 1, 1, NOW(3), NOW(3)),
('cp-dtdc', 'DTDC Express', 'DTDC', 'https://www.dtdc.in', '+91 80 2536 5032', 'ACTIVE', 1, 1, 0, 1, 0, NOW(3), NOW(3)),
('cp-xpressbees', 'XpressBees', 'XPRESSBEES', 'https://www.xpressbees.com', '+91 20 4911 1900', 'ACTIVE', 0, 1, 0, 0, 0, NOW(3), NOW(3)),
('partner-in-house', 'SS International Courier In-House Delivery (Self Fleet)', 'IN_HOUSE', 'https://ssinternationalcourier.com', '+91 8000151117', 'ACTIVE', 1, 1, 1, 0, 0, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `code` = VALUES(`code`), `website` = VALUES(`website`);

-- Seed Default Settings (SAFEGUARD: INSERT IGNORE to never overwrite existing admin configurations)
INSERT IGNORE INTO `settings` (`id`, `group`, `key`, `value`, `updated_at`) VALUES
(
  'setting-company-profile',
  'company_profile',
  'company_profile',
  JSON_OBJECT(
    'company_name', 'SS International Courier',
    'tagline', 'Fast, Safe & Multi-Carrier Courier Logistics',
    'support_email', 'support@sscourierservice.in',
    'support_phones', JSON_ARRAY('8000151117', '7689987368'),
    'whatsapp', '8000151117',
    'operating_hours', 'Mon - Sat: 08:00 AM - 09:00 PM IST',
    'address', 'Shop No 4, 5th Crossing, Near Padmavati School, Ghee Walo Ka Rasta, Johri Bazar',
    'landmark', 'Near Padmavati School',
    'city', 'Jaipur',
    'district', 'Jaipur',
    'state', 'Rajasthan',
    'pincode', '302003',
    'latitude', 26.9211,
    'longitude', 75.8267,
    'map_zoom', 16,
    'facebook_url', 'https://facebook.com/sscourierjaipur',
    'instagram_url', 'https://instagram.com/sscourier_official',
    'twitter_url', 'https://x.com/',
    'x_url', 'https://x.com/',
    'linkedin_url', 'https://in.linkedin.com/',
    'youtube_url', '',
    'whatsapp_url', ''
  ),
  NOW(3)
),
(
  'c3444be1-643c-496a-ae4b-42794dc3253a',
  'smtp',
  'smtp_config',
  '{"host":"smtp.hostinger.com","port":465,"user":"support@ssinternationalcourier.com","from_email":"support@ssinternationalcourier.com","from_name":"SS International Courier","pass":"Sscourier@2026"}',
  NOW(3)
),
(
  'e87f31bb-4b32-406d-96f1-f6e506c6547b',
  'whatsapp',
  'whatsapp_config',
  '{"api_url":"","phone_number_id":"","business_account_id":""}',
  NOW(3)
),
(
  '86855afe-50f8-4f76-adcd-c8752e952d04',
  'sms',
  'sms_config',
  '{"gateway_url":"","sender_id":"","entity_id":""}',
  NOW(3)
),
(
  '0a09929d-6782-41b6-8366-94db5e6c2bc4',
  'cms',
  'testimonials',
  '[{"id":"testi-1","client_name":"Vikram Singhania","client_role":"Managing Director","company_name":"Singhania Gemstone & Exports, Jaipur","avatar_url":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80","rating":5,"review":"We export fine handcrafted jewellery and precious gemstones to the USA and Europe on strict delivery schedules. SS International Courier handles customs clearance effortlessly with 100% on-time air delivery. Live tracking gives both us and our overseas buyers complete peace of mind.","destination_route":"Jaipur → New York, USA","tag":"Verified Air Cargo Exporter","is_active":true,"created_at":"2024-09-15T10:00:00.000Z"},{"id":"testi-2","client_name":"Pooja Deshmukh","client_role":"Head of International Logistics","company_name":"Aura Apparel & Handloom Exports","avatar_url":"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80","rating":5,"review":"Switching to SS International was the best operational decision for our UK fashion consignments. Doorstep pickup in Jaipur was seamless, export commercial invoices were vetted accurately, and our samples reached our London buyers in 4 days without a single customs delay.","destination_route":"Delhi / Jaipur → London, UK","tag":"Regular Export Consignee","is_active":true,"created_at":"2024-09-28T14:30:00.000Z"},{"id":"testi-3","client_name":"Dr. Arvind K. Mehta","client_role":"Senior Professor & Parent","company_name":"University Transcripts & Legal Documents","avatar_url":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80","rating":5,"review":"Needed to send my son\'s original university transcripts and urgent visa certificates to University of Toronto. The team packed everything in tamper-evident security flyers and tracked the consignment milestone-by-milestone. Delivered in Canada in under 72 hours!","destination_route":"Mumbai → Toronto, Canada","tag":"Express Document Client","is_active":true,"created_at":"2024-10-04T09:15:00.000Z"},{"id":"testi-4","client_name":"Farhan Qureshi","client_role":"Co-Founder & Operations Lead","company_name":"Zesture Handcrafted Goods","avatar_url":"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80","rating":5,"review":"Our handmade brass and leather artisanal goods are dispatched weekly to Dubai and Riyadh. SS International offers the most transparent cross-border rates, zero hidden fuel surcharges, and instant WhatsApp support whenever we need customs documentation guidance.","destination_route":"Jaipur → Dubai, UAE","tag":"Cross-Border E-Commerce","is_active":true,"created_at":"2024-10-10T16:45:00.000Z"}]',
  NOW(3)
),
(
  'setting-seo-global',
  'seo',
  'seo_global',
  JSON_OBJECT(
    'site_name', 'SS International Courier',
    'title_template', '%s | SS International Courier',
    'default_meta_description', 'Fast, customs-cleared global parcel dispatch across 220+ countries with automated commercial invoices, live tracking, and door-to-door transit.',
    'default_share_image', '/images/ss-logo.jpg',
    'canonical_base_url', 'https://ssinternationalcourier.com',
    'favicon', '/favicon.ico'
  ),
  NOW(3)
),
(
  'setting-seo-robots',
  'seo',
  'seo_robots',
  JSON_OBJECT(
    'content', '# SS International Courier - Robots Exclusion Protocol\nUser-agent: *\nAllow: /\n\n# Protected Admin, Internal API & Authenticated Customer Portals\nDisallow: /admin\nDisallow: /admin/\nDisallow: /api\nDisallow: /api/\nDisallow: /customer\nDisallow: /customer/\nDisallow: /login\nDisallow: /register\nDisallow: /forgot-password\nDisallow: /track/*\n\n# Sitemap Index\nSitemap: https://ssinternationalcourier.com/sitemap.xml\n'
  ),
  NOW(3)
),
(
  'setting-usd-to-inr',
  'pricing',
  'usd_to_inr_rate',
  '84.0',
  NOW(3)
);

-- Seed Indicative Rate Cards (§65a) (SAFEGUARD: INSERT IGNORE to preserve customized rates)
INSERT IGNORE INTO `rate_cards` (`id`, `courier_code`, `courier_name`, `service_type`, `zone`, `zone_title`, `base_weight_grams`, `base_rate_paise`, `additional_weight_grams`, `additional_rate_paise`, `min_transit_days`, `max_transit_days`, `is_active`) VALUES
('rc-del-zone-a', 'DELHIVERY', 'Delhivery Express Air', 'EXPRESS', 'ZONE_A', 'Zone A — Intra-City Jaipur', 500, 5000, 500, 3000, 1, 1, 1),
('rc-del-zone-b', 'DELHIVERY', 'Delhivery Express Air', 'EXPRESS', 'ZONE_B', 'Zone B — Intra-State (Rajasthan)', 500, 7500, 500, 4000, 1, 2, 1),
('rc-del-zone-c', 'DELHIVERY', 'Delhivery Express Air', 'EXPRESS', 'ZONE_C', 'Zone C — Metro Corridors', 500, 11000, 500, 6000, 2, 3, 1),
('rc-del-zone-d', 'DELHIVERY', 'Delhivery Express Air', 'EXPRESS', 'ZONE_D', 'Zone D — Rest of India', 500, 13500, 500, 7500, 3, 4, 1),
('rc-del-zone-e', 'DELHIVERY', 'Delhivery Express Air', 'EXPRESS', 'ZONE_E', 'Zone E — Special Remote Zones', 500, 17500, 500, 9500, 4, 6, 1),
('rc-dtdc-zone-a', 'DTDC', 'DTDC Standard Surface', 'SURFACE', 'ZONE_A', 'Zone A — Intra-City Jaipur', 500, 4000, 1000, 2500, 1, 2, 1),
('rc-dtdc-zone-b', 'DTDC', 'DTDC Standard Surface', 'SURFACE', 'ZONE_B', 'Zone B — Intra-State (Rajasthan)', 500, 6000, 1000, 3500, 2, 3, 1),
('rc-dtdc-zone-c', 'DTDC', 'DTDC Standard Surface', 'SURFACE', 'ZONE_C', 'Zone C — Metro Corridors', 500, 8500, 1000, 4500, 3, 5, 1),
('rc-dtdc-zone-d', 'DTDC', 'DTDC Standard Surface', 'SURFACE', 'ZONE_D', 'Zone D — Rest of India', 500, 10500, 1000, 5500, 4, 6, 1),
('rc-dtdc-zone-e', 'DTDC', 'DTDC Standard Surface', 'SURFACE', 'ZONE_E', 'Zone E — Special Remote Zones', 500, 14000, 1000, 7500, 5, 7, 1);

-- Seed Default Notification Templates (Idempotent ON DUPLICATE KEY UPDATE)
INSERT INTO `notification_templates` (`id`, `event_key`, `channel`, `subject`, `body`, `sender_email`, `is_active`, `created_at`, `updated_at`) VALUES
('template-customer.welcome', 'customer.welcome', 'EMAIL', 'Welcome to {{companyName}} — Your Logistics Partner', 'Hello {{customerName}},\n\nWelcome to {{companyName}}! Your customer account is now active.\nYou can book consignments, track real-time dispatches, and access GST invoices anytime at {{trackingLink}}.\n\nHelpline: +91 8000151117 / +91 7689987368\nTeam {{companyName}}', 'support@sscourierservice.in', 1, NOW(3), NOW(3)),
('template-booking.created', 'booking.created', 'EMAIL', 'Booking Request Received — {{bookingId}}', 'Hello {{customerName}},\n\nWe have received your booking request #{{bookingId}}.\nOur operations hub will verify parcel dimensions, calculate applicable freight rates, and notify you as soon as your booking is confirmed.\n\nTrack booking status: {{trackingLink}}\n\nThank you for choosing {{companyName}}.', 'support@sscourierservice.in', 1, NOW(3), NOW(3)),
('template-booking.approved', 'booking.approved', 'EMAIL', 'Booking Approved & Dispatched — {{bookingId}}', 'Hello {{customerName}},\n\nGreat news! Your booking #{{bookingId}} has been approved.\nCourier Partner: {{courierName}}\nAWB Tracking No: {{awb}}\n\nTrack your shipment live: {{trackingLink}}\n\nTeam {{companyName}}', 'support@sscourierservice.in', 1, NOW(3), NOW(3)),
('template-booking.rejected', 'booking.rejected', 'EMAIL', 'Booking Request Update — {{bookingId}}', 'Hello {{customerName}},\n\nWe regret to inform you that booking #{{bookingId}} could not be accepted by our operations team.\nReason: Consignment details or serviceability criteria not met.\n\nPlease contact our helpline at +91 8000151117 for immediate assistance.\n\nTeam {{companyName}}', 'support@sscourierservice.in', 1, NOW(3), NOW(3)),
('template-shipment.created', 'shipment.created', 'EMAIL', 'Shipment Allocated — AWB {{awb}}', 'Hello {{customerName}},\n\nShipment for booking #{{bookingId}} has been created and handed over to {{courierName}}.\nAWB: {{awb}}\n\nLive tracking: {{trackingLink}}\n\nTeam {{companyName}}', 'support@sscourierservice.in', 1, NOW(3), NOW(3)),
('template-shipment.awb_generated', 'shipment.awb_generated', 'EMAIL', 'AWB Generated & Dispatched — AWB {{awb}}', 'Hello {{customerName}},\n\nYour parcel (AWB: {{awb}}) has been manifest-dispatched via {{courierName}}.\nEstimated transit is underway.\n\nLive tracking: {{trackingLink}}\n\nTeam {{companyName}}', 'support@sscourierservice.in', 1, NOW(3), NOW(3)),
('template-pickup.scheduled', 'pickup.scheduled', 'EMAIL', 'Pickup Scheduled — {{bookingId}}', 'Hello {{customerName}},\n\nA doorstep pickup has been scheduled for your consignment #{{bookingId}}.\nPlease keep the parcel securely packed with the printed shipping slip attached.\n\nTracking: {{trackingLink}}\nTeam {{companyName}}', 'support@sscourierservice.in', 1, NOW(3), NOW(3)),
('template-shipment.in_transit', 'shipment.in_transit', 'EMAIL', 'Shipment In Transit — AWB {{awb}}', 'Hello {{customerName}},\n\nYour consignment (AWB: {{awb}}) is currently in transit.\nCurrent Location: {{currentLocation}}\n\nLive tracking: {{trackingLink}}\nTeam {{companyName}}', 'support@sscourierservice.in', 1, NOW(3), NOW(3)),
('template-shipment.out_for_delivery', 'shipment.out_for_delivery', 'EMAIL', 'Out for Delivery Today — AWB {{awb}}', 'Hello {{customerName}},\n\nYour consignment (AWB: {{awb}}) is out for delivery today!\nPlease ensure someone is available at the delivery address.\n\nLive tracking: {{trackingLink}}\nTeam {{companyName}}', 'support@sscourierservice.in', 1, NOW(3), NOW(3)),
('template-shipment.delivered', 'shipment.delivered', 'EMAIL', 'Shipment Delivered Successfully — AWB {{awb}}', 'Hello {{customerName}},\n\nYour parcel (AWB: {{awb}}) has been delivered successfully!\nThank you for choosing {{companyName}} for your logistics needs.\n\nNeed support? Reach us at support@sscourierservice.in\nTeam {{companyName}}', 'support@sscourierservice.in', 1, NOW(3), NOW(3)),
('template-shipment.rto', 'shipment.rto', 'EMAIL', 'Shipment Return Initiated (RTO) — AWB {{awb}}', 'Hello {{customerName}},\n\nYour shipment (AWB: {{awb}}) could not be delivered and return to origin (RTO) has been initiated.\nReason: {{exceptionReason}}\n\nHelpline: +91 8000151117\nTeam {{companyName}}', 'support@sscourierservice.in', 1, NOW(3), NOW(3)),
('template-cod.collected', 'cod.collected', 'EMAIL', 'COD Amount Collected — AWB {{awb}}', 'Hello {{customerName}},\n\nCash on Delivery (COD) payment of {{amount}} for AWB {{awb}} has been collected successfully by our courier agent.\nRemittance settlement will be credited as per cycle.\n\nTeam {{companyName}}', 'support@sscourierservice.in', 1, NOW(3), NOW(3)),
('template-cod.remitted', 'cod.remitted', 'EMAIL', 'COD Remittance Settled — UTR {{utr}}', 'Hello {{customerName}},\n\nYour COD remittance of {{amount}} has been transferred to your registered bank account.\nBank Reference / UTR: {{utr}}\n\nThank you for shipping with {{companyName}}.\nTeam {{companyName}}', 'support@sscourierservice.in', 1, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `subject` = VALUES(`subject`), `body` = VALUES(`body`);

-- Seed Default Notification Rules (Idempotent ON DUPLICATE KEY UPDATE)
INSERT INTO `notification_rules` (`id`, `event_key`, `channel`, `enabled`, `created_at`, `updated_at`) VALUES
('rule-customer.welcome-email', 'customer.welcome', 'EMAIL', 1, NOW(3), NOW(3)),
('rule-booking.created-email', 'booking.created', 'EMAIL', 1, NOW(3), NOW(3)),
('rule-booking.approved-email', 'booking.approved', 'EMAIL', 1, NOW(3), NOW(3)),
('rule-booking.rejected-email', 'booking.rejected', 'EMAIL', 1, NOW(3), NOW(3)),
('rule-shipment.created-email', 'shipment.created', 'EMAIL', 1, NOW(3), NOW(3)),
('rule-shipment.awb_generated-email', 'shipment.awb_generated', 'EMAIL', 1, NOW(3), NOW(3)),
('rule-pickup.scheduled-email', 'pickup.scheduled', 'EMAIL', 1, NOW(3), NOW(3)),
('rule-shipment.in_transit-email', 'shipment.in_transit', 'EMAIL', 1, NOW(3), NOW(3)),
('rule-shipment.out_for_delivery-email', 'shipment.out_for_delivery', 'EMAIL', 1, NOW(3), NOW(3)),
('rule-shipment.delivered-email', 'shipment.delivered', 'EMAIL', 1, NOW(3), NOW(3)),
('rule-shipment.rto-email', 'shipment.rto', 'EMAIL', 1, NOW(3), NOW(3)),
('rule-cod.collected-email', 'cod.collected', 'EMAIL', 1, NOW(3), NOW(3)),
('rule-cod.remitted-email', 'cod.remitted', 'EMAIL', 1, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `enabled` = VALUES(`enabled`);

SET FOREIGN_KEY_CHECKS = 1;
