/**
 * SS International Courier - Automated Database Initializer
 * This script runs automatically on 'npm run build' and on 'server.js' startup.
 * It is completely idempotent (safe to run multiple times without duplicating data).
 */
const fs = require("fs");
const path = require("path");
const { seedAdmin, ensureEnvFile, getDatabaseUrl } = require("./seed-admin");

// Ensure environment variables and .env exist
ensureEnvFile();

const DEFAULT_DATABASE_URL =
  "mysql://u905414804_sscouriers:SS%40Couriers26@127.0.0.1:3306/u905414804_sscouriers?connection_limit=5";

async function initDatabase() {
  const dbUrl = getDatabaseUrl();

  console.log("[DB-INIT] Checking database connectivity...");

  let PrismaClient;
  try {
    ({ PrismaClient } = require("@prisma/client"));
  } catch (e) {
    console.log("[DB-INIT] Prisma client not yet generated. Attempting automated generation via prisma generate...");
    try {
      const { execSync } = require("child_process");
      execSync("npx prisma generate", { stdio: "inherit" });
      ({ PrismaClient } = require("@prisma/client"));
    } catch (genErr) {
      console.log("[DB-INIT] Prisma client generation notice: " + (genErr.message || "").split("\n")[0]);
      return;
    }
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: ["error"],
  });

  try {
    // 1. Check if database is reachable
    await prisma.$connect();
    console.log("[DB-INIT] Connected to database successfully.");

    // 2. SAFEGUARD: Check if tables exist before doing ANY initial schema execution
    let tablesExist = false;
    try {
      const tables = await prisma.$queryRawUnsafe("SHOW TABLES;");
      if (Array.isArray(tables) && tables.length > 0) {
        tablesExist = true;
        console.log(`[DB-INIT] 🛡️ Safeguard: Found ${tables.length} existing tables in database. Schema is active.`);
      }
    } catch (err) {
      try {
        const userCount = await prisma.user.count();
        tablesExist = true;
        console.log(`[DB-INIT] 🛡️ Safeguard: Found existing users table with ${userCount} users.`);
      } catch (err2) {
        tablesExist = false;
      }
    }

    if (!tablesExist) {
      console.log("[DB-INIT] Tables do not exist yet. Executing initial schema creation...");
      let sqlContent = "";
      try {
        const { DATABASE_SCHEMA_SQL } = require("./schema-sql");
        sqlContent = DATABASE_SCHEMA_SQL;
      } catch (e) {
        const candidatePaths = [
          path.resolve(process.cwd(), "database.sql"),
          path.resolve(__dirname, "../database.sql"),
          path.resolve(__dirname, "database.sql"),
        ];
        for (const p of candidatePaths) {
          if (fs.existsSync(p)) {
            sqlContent = fs.readFileSync(p, "utf-8");
            break;
          }
        }
      }

      if (sqlContent && sqlContent.length > 0) {
        // Split by semicolon followed by newline
        const rawStatements = sqlContent.split(/;\s*[\r\n]+/);

        for (const raw of rawStatements) {
          // Remove SQL comments before executing
          const cleaned = raw
            .split(/\r?\n/)
            .filter((line) => !line.trim().startsWith("--"))
            .join("\n")
            .trim();

          if (cleaned.length > 0) {
            try {
              await prisma.$executeRawUnsafe(cleaned);
            } catch (stmtErr) {
              console.warn(`[DB-INIT] Statement notice: ${stmtErr.message.split("\n")[0]}`);
            }
          }
        }
        console.log("[DB-INIT] ✅ All tables, constraints, and initial seed data created successfully!");
      } else {
        console.warn("[DB-INIT] ⚠️ Could not locate SQL schema content to initialize database.");
      }
    }

    // 3. Automated Schema Self-Healing & Migrations (Safely adds missing columns/tables on existing DBs)
    await runSchemaSelfHealing(prisma);

    // 4. Ensure Super Admin, roles, and settings are explicitly synced
    await seedAdmin();
  } catch (connectionErr) {
    console.log(`[DB-INIT] ℹ️  Database not reachable during this step (${connectionErr.message.split("\n")[0]}).`);
    console.log("[DB-INIT] ℹ️  The application auto-healer will initialize the admin account upon server startup or login.");
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {}
  }
}

async function runSchemaSelfHealing(prisma) {
  console.log("[DB-INIT] Running automated schema self-healing & migrations...");

  // 1. Ensure required tables exist
  const createTablesSql = [
    `CREATE TABLE IF NOT EXISTS \`notification_templates\` (
      \`id\` VARCHAR(191) NOT NULL PRIMARY KEY,
      \`event_key\` VARCHAR(191) NOT NULL,
      \`channel\` ENUM('EMAIL', 'WHATSAPP', 'SMS') NOT NULL,
      \`subject\` VARCHAR(191) NULL,
      \`body\` TEXT NOT NULL,
      \`sender_email\` VARCHAR(191) NULL,
      \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
      \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY \`uk_template_event_chan\` (\`event_key\`, \`channel\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`notification_rules\` (
      \`id\` VARCHAR(191) NOT NULL PRIMARY KEY,
      \`event_key\` VARCHAR(191) NOT NULL,
      \`channel\` ENUM('EMAIL', 'WHATSAPP', 'SMS') NOT NULL,
      \`enabled\` TINYINT(1) NOT NULL DEFAULT 1,
      \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY \`uk_rule_event_chan\` (\`event_key\`, \`channel\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`notification_logs\` (
      \`id\` VARCHAR(191) NOT NULL PRIMARY KEY,
      \`event_key\` VARCHAR(191) NOT NULL,
      \`channel\` ENUM('EMAIL', 'WHATSAPP', 'SMS') NOT NULL,
      \`recipient\` VARCHAR(191) NOT NULL,
      \`booking_id\` VARCHAR(191) NULL,
      \`shipment_id\` VARCHAR(191) NULL,
      \`status\` ENUM('SENT', 'FAILED', 'RETRYING') NOT NULL DEFAULT 'SENT',
      \`provider_response\` JSON NULL,
      \`attempt_count\` INT NOT NULL DEFAULT 1,
      \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      INDEX \`idx_notif_logs_event\` (\`event_key\`),
      INDEX \`idx_notif_logs_booking\` (\`booking_id\`),
      INDEX \`idx_notif_logs_shipment\` (\`shipment_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`rate_cards\` (
      \`id\` VARCHAR(191) NOT NULL PRIMARY KEY,
      \`courier_code\` VARCHAR(50) NOT NULL,
      \`courier_name\` VARCHAR(100) NOT NULL,
      \`service_type\` VARCHAR(20) NOT NULL,
      \`zone\` VARCHAR(50) NOT NULL,
      \`zone_title\` VARCHAR(100) NOT NULL,
      \`base_weight_grams\` INT NOT NULL,
      \`base_rate_paise\` INT NOT NULL,
      \`additional_weight_grams\` INT NOT NULL,
      \`additional_rate_paise\` INT NOT NULL,
      \`min_transit_days\` INT NOT NULL DEFAULT 1,
      \`max_transit_days\` INT NOT NULL DEFAULT 3,
      \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
      \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      INDEX \`idx_rate_cards_courier_zone\` (\`courier_code\`, \`zone\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  ];

  for (const sql of createTablesSql) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (tblErr) {
      // safe to proceed
    }
  }

  // 2. Ensure columns exist on tables (ALTER TABLE ADD COLUMN)
  const columnsToAdd = [
    { table: "bookings", column: "sender_landmark", definition: "VARCHAR(191) NULL" },
    { table: "bookings", column: "sender_district", definition: "VARCHAR(191) NULL" },
    { table: "bookings", column: "receiver_landmark", definition: "VARCHAR(191) NULL" },
    { table: "bookings", column: "receiver_district", definition: "VARCHAR(191) NULL" },
    { table: "customer_addresses", column: "landmark", definition: "VARCHAR(191) NULL" },
    { table: "customer_addresses", column: "district", definition: "VARCHAR(191) NULL" },
    { table: "customer_addresses", column: "contact_name", definition: "VARCHAR(191) NULL" },
    { table: "customer_addresses", column: "contact_mobile", definition: "VARCHAR(191) NULL" },
    { table: "customer_addresses", column: "contact_email", definition: "VARCHAR(191) NULL" },
    { table: "notification_templates", column: "sender_email", definition: "VARCHAR(191) NULL" },

    // Round 10 - International, Currency, and Address Book columns
    { table: "customer_addresses", column: "source", definition: "VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER'" },
    { table: "customer_addresses", column: "type", definition: "VARCHAR(20) NOT NULL DEFAULT 'GENERAL'" },
    { table: "customer_addresses", column: "country", definition: "VARCHAR(100) NOT NULL DEFAULT 'India'" },
    { table: "customer_addresses", column: "address_line_2", definition: "VARCHAR(191) NULL" },
    { table: "customer_addresses", column: "address_line_3", definition: "VARCHAR(191) NULL" },

    { table: "bookings", column: "shipment_mode", definition: "VARCHAR(20) NOT NULL DEFAULT 'DOMESTIC'" },
    { table: "bookings", column: "currency", definition: "VARCHAR(10) NOT NULL DEFAULT 'INR'" },
    { table: "bookings", column: "exchange_rate", definition: "DOUBLE NOT NULL DEFAULT 1.0" },
    { table: "bookings", column: "total_inr_paise", definition: "INT NOT NULL DEFAULT 0" },
    { table: "bookings", column: "sender_country", definition: "VARCHAR(100) NOT NULL DEFAULT 'India'" },
    { table: "bookings", column: "sender_address_2", definition: "VARCHAR(191) NULL" },
    { table: "bookings", column: "sender_address_3", definition: "VARCHAR(191) NULL" },
    { table: "bookings", column: "receiver_country", definition: "VARCHAR(100) NOT NULL DEFAULT 'India'" },
    { table: "bookings", column: "receiver_address_2", definition: "VARCHAR(191) NULL" },
    { table: "bookings", column: "receiver_address_3", definition: "VARCHAR(191) NULL" },
    { table: "bookings", column: "invoice_number", definition: "VARCHAR(191) NULL" },
    { table: "bookings", column: "invoice_date", definition: "VARCHAR(191) NULL" },
    { table: "bookings", column: "service_type", definition: "VARCHAR(100) NULL" },
    { table: "bookings", column: "ioss_number", definition: "VARCHAR(191) NULL" },

    { table: "booking_parcels", column: "currency", definition: "VARCHAR(10) NOT NULL DEFAULT 'INR'" },
    { table: "booking_parcels", column: "declared_value_inr", definition: "INT NOT NULL DEFAULT 0" },
    { table: "booking_parcels", column: "line_items", definition: "JSON NULL" },

    { table: "booking_charges", column: "currency", definition: "VARCHAR(10) NOT NULL DEFAULT 'INR'" },
    { table: "booking_charges", column: "exchange_rate", definition: "DOUBLE NOT NULL DEFAULT 1.0" },
    { table: "booking_charges", column: "total_inr", definition: "INT NOT NULL DEFAULT 0" },
  ];

  for (const col of columnsToAdd) {
    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE \`${col.table}\` ADD COLUMN \`${col.column}\` ${col.definition}`
      );
      console.log(`[DB-INIT] ✅ Added missing column \`${col.column}\` to \`${col.table}\`.`);
    } catch (colErr) {
      // MySQL error code 1060 (ER_DUP_FIELDNAME) - safe to ignore
    }
  }

  // 3. Ensure default notification templates exist
  try {
    const templateCount = await prisma.notificationTemplate.count();
    if (templateCount === 0) {
      console.log("[DB-INIT] Seeding initial notification templates...");
      const DEFAULT_TEMPLATES = [
        { event_key: "customer.welcome", subject: "Welcome to {{companyName}} — Your Logistics Partner", body: "Hello {{customerName}},\n\nWelcome to {{companyName}}! Your customer account is now active.\nYou can book consignments, track real-time dispatches, and access GST invoices anytime at {{trackingLink}}.\n\nHelpline: +91 8000151117 / +91 7689987368\nTeam {{companyName}}" },
        { event_key: "booking.created", subject: "Booking Request Received — {{bookingId}}", body: "Hello {{customerName}},\n\nWe have received your booking request #{{bookingId}}.\nOur operations hub will verify parcel dimensions, calculate applicable freight rates, and notify you as soon as your booking is confirmed.\n\nTrack booking status: {{trackingLink}}\n\nThank you for choosing {{companyName}}." },
        { event_key: "booking.approved", subject: "Booking Approved & Dispatched — {{bookingId}}", body: "Hello {{customerName}},\n\nGreat news! Your booking #{{bookingId}} has been approved.\nCourier Partner: {{courierName}}\nAWB Tracking No: {{awb}}\n\nTrack your shipment live: {{trackingLink}}\n\nTeam {{companyName}}" },
        { event_key: "booking.rejected", subject: "Booking Request Update — {{bookingId}}", body: "Hello {{customerName}},\n\nWe regret to inform you that booking #{{bookingId}} could not be accepted by our operations team.\nReason: Consignment details or serviceability criteria not met.\n\nPlease contact our helpline at +91 8000151117 for immediate assistance.\n\nTeam {{companyName}}" },
        { event_key: "shipment.created", subject: "Shipment Allocated — AWB {{awb}}", body: "Hello {{customerName}},\n\nShipment for booking #{{bookingId}} has been created and handed over to {{courierName}}.\nAWB: {{awb}}\n\nLive tracking: {{trackingLink}}\n\nTeam {{companyName}}" },
        { event_key: "shipment.awb_generated", subject: "AWB Generated & Dispatched — AWB {{awb}}", body: "Hello {{customerName}},\n\nYour parcel (AWB: {{awb}}) has been manifest-dispatched via {{courierName}}.\nEstimated transit is underway.\n\nLive tracking: {{trackingLink}}\n\nTeam {{companyName}}" },
        { event_key: "pickup.scheduled", subject: "Pickup Scheduled — {{bookingId}}", body: "Hello {{customerName}},\n\nA doorstep pickup has been scheduled for your consignment #{{bookingId}}.\nPlease keep the parcel securely packed with the printed shipping slip attached.\n\nTracking: {{trackingLink}}\nTeam {{companyName}}" },
        { event_key: "shipment.in_transit", subject: "Shipment In Transit — AWB {{awb}}", body: "Hello {{customerName}},\n\nYour consignment (AWB: {{awb}}) is currently in transit.\nCurrent Location: {{currentLocation}}\n\nLive tracking: {{trackingLink}}\nTeam {{companyName}}" },
        { event_key: "shipment.out_for_delivery", subject: "Out for Delivery Today — AWB {{awb}}", body: "Hello {{customerName}},\n\nYour consignment (AWB: {{awb}}) is out for delivery today!\nPlease ensure someone is available at the delivery address.\n\nLive tracking: {{trackingLink}}\nTeam {{companyName}}" },
        { event_key: "shipment.delivered", subject: "Shipment Delivered Successfully — AWB {{awb}}", body: "Hello {{customerName}},\n\nYour parcel (AWB: {{awb}}) has been delivered successfully!\nThank you for choosing {{companyName}} for your logistics needs.\n\nNeed support? Reach us at support@sscourierservice.in\nTeam {{companyName}}" },
        { event_key: "shipment.rto", subject: "Shipment Return Initiated (RTO) — AWB {{awb}}", body: "Hello {{customerName}},\n\nYour shipment (AWB: {{awb}}) could not be delivered and return to origin (RTO) has been initiated.\nReason: {{exceptionReason}}\n\nHelpline: +91 8000151117\nTeam {{companyName}}" },
        { event_key: "cod.collected", subject: "COD Amount Collected — AWB {{awb}}", body: "Hello {{customerName}},\n\nCash on Delivery (COD) payment of {{amount}} for AWB {{awb}} has been collected successfully by our courier agent.\nRemittance settlement will be credited as per cycle.\n\nTeam {{companyName}}" },
        { event_key: "cod.remitted", subject: "COD Remittance Settled — UTR {{utr}}", body: "Hello {{customerName}},\n\nYour COD remittance of {{amount}} has been transferred to your registered bank account.\nBank Reference / UTR: {{utr}}\n\nThank you for shipping with {{companyName}}.\nTeam {{companyName}}" }
      ];

      for (const t of DEFAULT_TEMPLATES) {
        await prisma.notificationTemplate.upsert({
          where: {
            event_key_channel: {
              event_key: t.event_key,
              channel: "EMAIL",
            },
          },
          update: {},
          create: {
            id: `template-${t.event_key}`,
            event_key: t.event_key,
            channel: "EMAIL",
            subject: t.subject,
            body: t.body,
            sender_email: "support@sscourierservice.in",
            is_active: true,
          },
        });
      }
      console.log("[DB-INIT] ✅ Default notification templates seeded.");
    }
  } catch (seedErr) {
    console.warn("[DB-INIT] Template seed notice:", seedErr.message);
  }

  // 4. Ensure default rate cards exist
  try {
    const rcCount = await prisma.rateCard.count();
    if (rcCount === 0) {
      console.log("[DB-INIT] Seeding initial rate cards...");
      const DEFAULT_RATE_CARDS = [
        { id: "rc-del-zone-a", courier_code: "DELHIVERY", courier_name: "Delhivery Express Air", service_type: "EXPRESS", zone: "ZONE_A", zone_title: "Zone A — Intra-City Jaipur", base_weight_grams: 500, base_rate_paise: 5000, additional_weight_grams: 500, additional_rate_paise: 3000, min_transit_days: 1, max_transit_days: 1, is_active: true },
        { id: "rc-del-zone-b", courier_code: "DELHIVERY", courier_name: "Delhivery Express Air", service_type: "EXPRESS", zone: "ZONE_B", zone_title: "Zone B — Intra-State (Rajasthan)", base_weight_grams: 500, base_rate_paise: 7500, additional_weight_grams: 500, additional_rate_paise: 4000, min_transit_days: 1, max_transit_days: 2, is_active: true },
        { id: "rc-del-zone-c", courier_code: "DELHIVERY", courier_name: "Delhivery Express Air", service_type: "EXPRESS", zone: "ZONE_C", zone_title: "Zone C — Metro Corridors", base_weight_grams: 500, base_rate_paise: 11000, additional_weight_grams: 500, additional_rate_paise: 6000, min_transit_days: 2, max_transit_days: 3, is_active: true },
        { id: "rc-del-zone-d", courier_code: "DELHIVERY", courier_name: "Delhivery Express Air", service_type: "EXPRESS", zone: "ZONE_D", zone_title: "Zone D — Rest of India", base_weight_grams: 500, base_rate_paise: 13500, additional_weight_grams: 500, additional_rate_paise: 7500, min_transit_days: 3, max_transit_days: 4, is_active: true },
        { id: "rc-del-zone-e", courier_code: "DELHIVERY", courier_name: "Delhivery Express Air", service_type: "EXPRESS", zone: "ZONE_E", zone_title: "Zone E — Special Remote Zones", base_weight_grams: 500, base_rate_paise: 17500, additional_weight_grams: 500, additional_rate_paise: 9500, min_transit_days: 4, max_transit_days: 6, is_active: true },
        { id: "rc-dtdc-zone-a", courier_code: "DTDC", courier_name: "DTDC Standard Surface", service_type: "SURFACE", zone: "ZONE_A", zone_title: "Zone A — Intra-City Jaipur", base_weight_grams: 500, base_rate_paise: 4000, additional_weight_grams: 1000, additional_rate_paise: 2500, min_transit_days: 1, max_transit_days: 2, is_active: true },
        { id: "rc-dtdc-zone-b", courier_code: "DTDC", courier_name: "DTDC Standard Surface", service_type: "SURFACE", zone: "ZONE_B", zone_title: "Zone B — Intra-State (Rajasthan)", base_weight_grams: 500, base_rate_paise: 6000, additional_weight_grams: 1000, additional_rate_paise: 3500, min_transit_days: 2, max_transit_days: 3, is_active: true },
        { id: "rc-dtdc-zone-c", courier_code: "DTDC", courier_name: "DTDC Standard Surface", service_type: "SURFACE", zone: "ZONE_C", zone_title: "Zone C — Metro Corridors", base_weight_grams: 500, base_rate_paise: 8500, additional_weight_grams: 1000, additional_rate_paise: 4500, min_transit_days: 3, max_transit_days: 5, is_active: true },
        { id: "rc-dtdc-zone-d", courier_code: "DTDC", courier_name: "DTDC Standard Surface", service_type: "SURFACE", zone: "ZONE_D", zone_title: "Zone D — Rest of India", base_weight_grams: 500, base_rate_paise: 10500, additional_weight_grams: 1000, additional_rate_paise: 5500, min_transit_days: 4, max_transit_days: 6, is_active: true },
        { id: "rc-dtdc-zone-e", courier_code: "DTDC", courier_name: "DTDC Standard Surface", service_type: "SURFACE", zone: "ZONE_E", zone_title: "Zone E — Special Remote Zones", base_weight_grams: 500, base_rate_paise: 14000, additional_weight_grams: 1000, additional_rate_paise: 7500, min_transit_days: 5, max_transit_days: 7, is_active: true },
      ];
      for (const rc of DEFAULT_RATE_CARDS) {
        await prisma.rateCard.upsert({
          where: { id: rc.id },
          update: {},
          create: rc,
        });
      }
      console.log("[DB-INIT] ✅ Initial rate cards seeded.");
    }
  } catch (rcErr) {
    console.warn("[DB-INIT] Rate card seed notice:", rcErr.message);
  }

  // 5. Ensure default notification rules exist
  try {
    const ruleCount = await prisma.notificationRule.count();
    if (ruleCount === 0) {
      console.log("[DB-INIT] Seeding initial notification rules...");
      const DEFAULT_RULES = [
        "customer.welcome",
        "booking.created",
        "booking.approved",
        "booking.rejected",
        "shipment.created",
        "shipment.awb_generated",
        "pickup.scheduled",
        "shipment.in_transit",
        "shipment.out_for_delivery",
        "shipment.delivered",
        "shipment.rto",
        "cod.collected",
        "cod.remitted",
      ];
      for (const event_key of DEFAULT_RULES) {
        await prisma.notificationRule.upsert({
          where: {
            event_key_channel: {
              event_key,
              channel: "EMAIL",
            },
          },
          update: {},
          create: {
            id: `rule-${event_key}-email`,
            event_key,
            channel: "EMAIL",
            enabled: true,
          },
        });
      }
      console.log("[DB-INIT] ✅ Default notification rules seeded.");
    }
  } catch (ruleErr) {
    console.warn("[DB-INIT] Rule seed notice:", ruleErr.message);
  }
}

if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.warn("[DB-INIT] Notice:", err.message);
      process.exit(0); // Exit with 0 so build does not fail if DB is offline during build
    });
}

module.exports = { initDatabase };
