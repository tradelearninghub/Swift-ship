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
  `address` TEXT NOT NULL,
  `city` VARCHAR(191) NOT NULL,
  `state` VARCHAR(191) NOT NULL,
  `pincode` VARCHAR(191) NOT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `idx_address_cust` (`customer_id`),
  CONSTRAINT `fk_address_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bookings
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `booking_number` VARCHAR(191) NOT NULL UNIQUE,
  `customer_id` VARCHAR(191) NOT NULL,
  `source` ENUM('CUSTOMER', 'STAFF', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `created_by` VARCHAR(191) NOT NULL,
  `status` ENUM('DRAFT', 'REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'REQUESTED',
  `payment_type` ENUM('PREPAID', 'COD') NOT NULL DEFAULT 'PREPAID',
  `cod_amount` INT NOT NULL DEFAULT 0,
  `sender_name` VARCHAR(191) NOT NULL,
  `sender_mobile` VARCHAR(191) NOT NULL,
  `sender_email` VARCHAR(191) NULL,
  `sender_address` TEXT NOT NULL,
  `sender_city` VARCHAR(191) NOT NULL,
  `sender_state` VARCHAR(191) NOT NULL,
  `sender_pincode` VARCHAR(191) NOT NULL,
  `receiver_name` VARCHAR(191) NOT NULL,
  `receiver_mobile` VARCHAR(191) NOT NULL,
  `receiver_email` VARCHAR(191) NULL,
  `receiver_address` TEXT NOT NULL,
  `receiver_city` VARCHAR(191) NOT NULL,
  `receiver_state` VARCHAR(191) NOT NULL,
  `receiver_pincode` VARCHAR(191) NOT NULL,
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
  `submitted_weight_grams` INT NOT NULL,
  `submitted_length_cm` INT NOT NULL,
  `submitted_width_cm` INT NOT NULL,
  `submitted_height_cm` INT NOT NULL,
  `declared_value` INT NOT NULL DEFAULT 0,
  `verified_weight_grams` INT NULL,
  `verified_length_cm` INT NULL,
  `verified_width_cm` INT NULL,
  `verified_height_cm` INT NULL,
  `verified_by` VARCHAR(191) NULL,
  `verified_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `idx_parcels_booking` (`booking_id`),
  CONSTRAINT `fk_parcels_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_parcels_verifier` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Booking Charges
CREATE TABLE IF NOT EXISTS `booking_charges` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `booking_id` VARCHAR(191) NOT NULL UNIQUE,
  `shipping_charge` INT NOT NULL DEFAULT 0,
  `additional_charge` INT NOT NULL DEFAULT 0,
  `discount` INT NOT NULL DEFAULT 0,
  `tax` INT NOT NULL DEFAULT 0,
  `total` INT NOT NULL DEFAULT 0,
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

-- Seed Super Admin User (admin@swiftship.com / Admin@12345)
-- Bcrypt hash: $2a$10$iGgQ5yJkP1b09b5cZ4oUfO0sRqm1n0U9wG8w7WjG9k2l3m4n5o6p7
INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `password_hash`, `role_id`, `status`, `created_at`, `updated_at`)
VALUES (
  'user-super-admin-01',
  'Super Admin',
  'admin@swiftship.com',
  '9876543210',
  '$2a$10$wE0vL7M3p7Ecm0HfgUqjueJpX4jB0Wk9X3Q9hM5P1b09b5cZ4oUfO',
  'role-super-admin',
  'ACTIVE',
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE `status` = 'ACTIVE';

-- Seed Courier Partners
INSERT INTO `courier_partners` (`id`, `name`, `code`, `website`, `support_contact`, `status`, `capability_shipment_api`, `capability_tracking_api`, `capability_label_api`, `capability_pickup_api`, `capability_cancellation_api`, `created_at`, `updated_at`) VALUES
('cp-delhivery', 'Delhivery', 'DELHIVERY', 'https://www.delhivery.com', '+91 124 6719500', 'ACTIVE', 1, 1, 1, 1, 1, NOW(3), NOW(3)),
('cp-bluedart', 'Blue Dart', 'BLUEDART', 'https://www.bluedart.com', '1860 233 1234', 'ACTIVE', 1, 1, 1, 1, 1, NOW(3), NOW(3)),
('cp-dtdc', 'DTDC Express', 'DTDC', 'https://www.dtdc.in', '+91 80 2536 5032', 'ACTIVE', 1, 1, 0, 1, 0, NOW(3), NOW(3)),
('cp-xpressbees', 'XpressBees', 'XPRESSBEES', 'https://www.xpressbees.com', '+91 20 4911 1900', 'ACTIVE', 0, 1, 0, 0, 0, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `website` = VALUES(`website`);

-- Seed Default Company Profile Setting
INSERT INTO `settings` (`id`, `group`, `key`, `value`, `updated_at`) VALUES
(
  'setting-company-profile',
  'company_profile',
  'company_profile',
  JSON_OBJECT(
    'company_name', 'SS Courier Services Pvt. Ltd.',
    'tagline', 'Fast, Safe & Multi-Carrier Courier Logistics',
    'support_email', 'support@sscourierservice.in',
    'support_phone', '+91 98765 43210',
    'whatsapp', '+91 98765 43210',
    'address', 'Plot 42, Logistics Park, Sitapura Industrial Area',
    'city', 'Jaipur',
    'state', 'Rajasthan',
    'pincode', '302022',
    'operating_hours', 'Mon - Sat: 08:00 AM - 09:00 PM IST'
  ),
  NOW(3)
)
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updated_at` = NOW(3);

SET FOREIGN_KEY_CHECKS = 1;
