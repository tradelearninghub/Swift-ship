/**
 * SS Courier service - Automated Database Initializer
 * This script runs automatically on 'npm run build' and on 'server.js' startup.
 * It is completely idempotent (safe to run multiple times without duplicating data).
 */
const fs = require("fs");
const path = require("path");
const { seedAdmin, ensureEnvFile } = require("./seed-admin");

// Ensure environment variables and .env exist
ensureEnvFile();

async function initDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log("[DB-INIT] ⚠️  DATABASE_URL is not set in environment. Skipping database auto-init.");
    return;
  }

  console.log("[DB-INIT] Checking database connectivity...");

  let PrismaClient;
  try {
    ({ PrismaClient } = require("@prisma/client"));
  } catch (e) {
    console.log("[DB-INIT] Prisma client not yet generated. Skipping pre-build DB init.");
    return;
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

    // 2. Check if tables exist
    let tablesExist = false;
    try {
      const userCount = await prisma.user.count();
      tablesExist = true;
      console.log(`[DB-INIT] Found existing tables. Total users in DB: ${userCount}`);
    } catch (err) {
      tablesExist = false;
    }

    if (!tablesExist) {
      console.log("[DB-INIT] Tables do not exist yet. Executing full schema creation from database.sql...");
      const sqlFilePath = path.resolve(process.cwd(), "database.sql");
      if (fs.existsSync(sqlFilePath)) {
        const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");
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
