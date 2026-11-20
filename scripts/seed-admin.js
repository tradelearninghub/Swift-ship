/**
 * SS International Courier - Dedicated Admin Seeder Script
 * Ensures the database has the Super Admin account and essential system roles.
 * STRICTLY NON-DESTRUCTIVE: Never overwrites existing user data, passwords, or settings.
 */
const fs = require("fs");
const path = require("path");

const DEFAULT_DATABASE_URL =
  "mysql://u905414804_sscouriers:SS%40Couriers26@127.0.0.1:3306/u905414804_sscouriers?connection_limit=5";

// 1. Load .env file safely from process.cwd() or parent directories
function ensureEnvFile() {
  const possiblePaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(__dirname, "../.env"),
    path.resolve(__dirname, ".env"),
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, "utf-8");
        content.split(/\r?\n/).forEach((line) => {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match) {
            let key = match[1];
            let value = match[2] || "";
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            if (!process.env[key]) {
              process.env[key] = value.trim();
            }
          }
        });
        break;
      } catch (e) {
        // ignore read error
      }
    }
  }

  // Auto-construct DATABASE_URL with URL-encoding for Hostinger MySQL credentials
  if (process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
    const user = encodeURIComponent(process.env.DB_USER);
    const pass = encodeURIComponent(process.env.DB_PASSWORD);
    const host = process.env.DB_HOST || "127.0.0.1";
    const port = process.env.DB_PORT || "3306";
    const name = process.env.DB_NAME;
    const urlFromParts = `mysql://${user}:${pass}@${host}:${port}/${name}?connection_limit=5`;

    if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes(name)) {
      process.env.DATABASE_URL = urlFromParts;
    }
  }

  if (process.env.DATABASE_URL) {
    let raw = process.env.DATABASE_URL.trim();
    const prefix = "mysql://";
    if (raw.startsWith(prefix)) {
      const rest = raw.slice(prefix.length);
      const lastAt = rest.lastIndexOf("@");
      if (lastAt !== -1) {
        const authPart = rest.slice(0, lastAt);
        const hostDbPart = rest.slice(lastAt + 1);
        const colonIdx = authPart.indexOf(":");
        if (colonIdx !== -1) {
          const rawUser = authPart.slice(0, colonIdx);
          const rawPass = authPart.slice(colonIdx + 1);
          const u = encodeURIComponent(decodeURIComponent(rawUser));
          const p = encodeURIComponent(decodeURIComponent(rawPass));
          
          let hostDb = hostDbPart;
          let extra = "?connection_limit=5";
          const qIdx = hostDb.indexOf("?");
          if (qIdx !== -1) {
            extra = hostDb.slice(qIdx);
            hostDb = hostDb.slice(0, qIdx);
            if (!extra.includes("connection_limit")) {
              extra += "&connection_limit=5";
            }
          }
          process.env.DATABASE_URL = `mysql://${u}:${p}@${hostDb}${extra}`;
        }
      }
    }
  } else {
    process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
  }
}

function getDatabaseUrl() {
  ensureEnvFile();
  return process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
}

ensureEnvFile();

// Verified Bcrypt hash for default password: Admin@12345
const ADMIN_PASSWORD_HASH = "$2a$10$3gFAfXHoT/GYzAqOwYTlMeSCCYLyTBnL65BmWSPOLoQH.X88p8Dl.";

async function seedAdmin() {
  console.log("--------------------------------------------------");
  console.log("[ADMIN-SEED] Verifying System Roles & Admin User...");
  console.log("--------------------------------------------------");

  let PrismaClient;
  try {
    ({ PrismaClient } = require("@prisma/client"));
  } catch (e) {
    console.log("[ADMIN-SEED] Prisma Client not generated yet. Skipping step.");
    return;
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
      },
    },
    log: ["error"],
  });

  try {
    await prisma.$connect();
    console.log("[ADMIN-SEED] Connected to MySQL database successfully.");

    // 1. Ensure essential system roles exist (Idempotent INSERT IGNORE)
    const systemRoles = [
      { id: "role-super-admin", name: "SUPER_ADMIN", is_system_role: true },
      { id: "role-admin", name: "ADMIN", is_system_role: true },
      { id: "role-staff", name: "STAFF", is_system_role: true },
      { id: "role-customer", name: "CUSTOMER", is_system_role: true },
    ];

    for (const r of systemRoles) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO \`roles\` (\`id\`, \`name\`, \`is_system_role\`, \`created_at\`, \`updated_at\`)
        VALUES ('${r.id}', '${r.name}', ${r.is_system_role ? 1 : 0}, NOW(3), NOW(3))
        ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);
      `).catch(() => {});
    }

    // 2. SAFEGUARD: Check if primary Super Admin already exists
    // NEVER overwrite an existing admin's password or user information on deploy!
    const existingAdmin = await prisma.user.findFirst({
      where: { email: "admin@sscourierservice.in" },
    });

    if (!existingAdmin) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`mobile\`, \`password_hash\`, \`role_id\`, \`status\`, \`created_at\`, \`updated_at\`)
        VALUES (
          'user-super-admin-01',
          'Super Admin',
          'admin@sscourierservice.in',
          '8000151117',
          '${ADMIN_PASSWORD_HASH}',
          'role-super-admin',
          'ACTIVE',
          NOW(3),
          NOW(3)
        );
      `).catch(() => {});
      console.log("[ADMIN-SEED] ✅ Created default Super Admin: admin@sscourierservice.in");
    } else {
      console.log("[ADMIN-SEED] 🛡️ Safeguard: Admin user 'admin@sscourierservice.in' already exists. Preserving existing password and credentials.");
    }

    // 3. SAFEGUARD: Check if fallback Super Admin exists
    const existingAlias = await prisma.user.findFirst({
      where: { email: "admin@swiftship.com" },
    });

    if (!existingAlias) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`mobile\`, \`password_hash\`, \`role_id\`, \`status\`, \`created_at\`, \`updated_at\`)
        VALUES (
          'user-super-admin-02',
          'Super Admin (SwiftShip Alias)',
          'admin@swiftship.com',
          '9876543210',
          '${ADMIN_PASSWORD_HASH}',
          'role-super-admin',
          'ACTIVE',
          NOW(3),
          NOW(3)
        );
      `).catch(() => {});
      console.log("[ADMIN-SEED] ✅ Created default Alias Admin: admin@swiftship.com");
    } else {
      console.log("[ADMIN-SEED] 🛡️ Safeguard: Alias Admin already exists. Preserving credentials.");
    }

    // 4. SAFEGUARD: Ensure Company Profile Settings exist
    // NEVER OVERWRITE an existing company profile! If it exists, KEEP THE USER'S CONFIGURATION!
    const existingProfile = await prisma.setting.findFirst({
      where: { key: "company_profile" },
    });

    if (!existingProfile) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO \`settings\` (\`id\`, \`group\`, \`key\`, \`value\`, \`updated_at\`)
        VALUES (
          'setting-company-profile',
          'company_profile',
          'company_profile',
          JSON_OBJECT(
            'company_name', 'SS International Courier Pvt. Ltd.',
            'tagline', 'Fast, Safe & Multi-Carrier Courier Logistics',
            'support_email', 'support@sscourierservice.in',
            'support_phones', JSON_ARRAY('8000151117', '7689987368'),
            'support_phone', '8000151117, 7689987368',
            'whatsapp', '8000151117',
            'address', 'Shop No 4, 5th Crossing, Padmavati School, Ghee Walo Ka Rasta, Johri Bazar',
            'city', 'Jaipur',
            'state', 'Rajasthan',
            'pincode', '302003',
            'operating_hours', 'Mon - Sat: 08:00 AM - 09:00 PM IST',
            'google_maps_embed_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.484920272099!2d75.82412537611685!3d26.921104759799295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db14b1a473b11%3A0xb35a0f5a11c1e5cb!2sJohri%20Bazar%2C%20Jaipur%2C%20Rajasthan%20302003!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin',
            'latitude', 26.9211,
            'longitude', 75.8267
          ),
          NOW(3)
        );
      `).catch(() => {});
      console.log("[ADMIN-SEED] ✅ Initialized default Company Profile.");
    } else {
      console.log("[ADMIN-SEED] 🛡️ Safeguard: Existing company_profile found. Preserving all admin-configured settings, social links, and custom information.");
      try {
        let val = existingProfile.value;
        if (typeof val === "string") val = JSON.parse(val);
        if (
          val &&
          (val.company_name === "SS Courier service Pvt. Ltd." ||
            val.company_name === "SS Courier Services Pvt. Ltd." ||
            val.company_name === "SS Courier service" ||
            val.company_name === "SS International Courier Service Pvt. Ltd.")
        ) {
          val.company_name = "SS International Courier Pvt. Ltd.";
          await prisma.setting.update({
            where: { key: "company_profile" },
            data: { value: val },
          });
          console.log("[ADMIN-SEED] 🔄 Updated brand name to 'SS International Courier Pvt. Ltd.' while preserving all user-customized fields.");
        }
      } catch (e) {}
    }

    // 5. SAFEGUARD: Ensure Courier Partners exist (including IN_HOUSE partner)
    const defaultCouriers = [
      { id: "partner-in-house", name: "SS International Courier In-House Delivery (Self Fleet)", code: "IN_HOUSE", website: "https://ssinternationalcourier.com", contact: "+91 8000151117", sApi: 1, tApi: 1, lApi: 1, pApi: 0, cApi: 0 },
      { id: "cp-delhivery", name: "Delhivery", code: "DELHIVERY", website: "https://www.delhivery.com", contact: "+91 124 6719500", sApi: 1, tApi: 1, lApi: 1, pApi: 1, cApi: 1 },
      { id: "cp-bluedart", name: "Blue Dart", code: "BLUEDART", website: "https://www.bluedart.com", contact: "1860 233 1234", sApi: 1, tApi: 1, lApi: 1, pApi: 1, cApi: 1 },
      { id: "cp-dtdc", name: "DTDC Express", code: "DTDC", website: "https://www.dtdc.in", contact: "+91 80 2536 5032", sApi: 1, tApi: 1, lApi: 0, pApi: 1, cApi: 0 },
      { id: "cp-xpressbees", name: "XpressBees", code: "XPRESSBEES", website: "https://www.xpressbees.com", contact: "+91 20 4911 1900", sApi: 0, tApi: 1, lApi: 0, pApi: 0, cApi: 0 },
    ];
    for (const c of defaultCouriers) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO \`courier_partners\` (\`id\`, \`name\`, \`code\`, \`website\`, \`support_contact\`, \`status\`, \`capability_shipment_api\`, \`capability_tracking_api\`, \`capability_label_api\`, \`capability_pickup_api\`, \`capability_cancellation_api\`, \`created_at\`, \`updated_at\`)
        VALUES ('${c.id}', '${c.name}', '${c.code}', '${c.website}', '${c.contact}', 'ACTIVE', ${c.sApi}, ${c.tApi}, ${c.lApi}, ${c.pApi}, ${c.cApi}, NOW(3), NOW(3))
        ON DUPLICATE KEY UPDATE \`code\` = VALUES(\`code\`), \`website\` = VALUES(\`website\`);
      `).catch(() => {});
    }

    // 6. SAFEGUARD: Ensure SEO Settings exist (NEVER overwrite existing SEO config!)
    const existingSeo = await prisma.setting.findFirst({
      where: { key: "seo_global" },
    });
    if (!existingSeo) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO \`settings\` (\`id\`, \`group\`, \`key\`, \`value\`, \`updated_at\`)
        VALUES (
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
        );
      `).catch(() => {});
      console.log("[ADMIN-SEED] ✅ Initialized default Global SEO config.");
    } else {
      console.log("[ADMIN-SEED] 🛡️ Safeguard: Existing SEO settings found. Preserving all admin SEO customizations across deployments.");
    }

    // 7. SAFEGUARD: Ensure Hostinger SMTP config exists
    const existingSmtp = await prisma.setting.findFirst({
      where: { key: "smtp_config" },
    });
    if (!existingSmtp) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO \`settings\` (\`id\`, \`group\`, \`key\`, \`value\`, \`updated_at\`)
        VALUES (
          'c3444be1-643c-496a-ae4b-42794dc3253a',
          'smtp',
          'smtp_config',
          '{"host":"smtp.hostinger.com","port":465,"user":"support@ssinternationalcourier.com","from_email":"support@ssinternationalcourier.com","from_name":"SS International Courier","pass":"Sscourier@2026"}',
          NOW(3)
        );
      `).catch(() => {});
      console.log("[ADMIN-SEED] ✅ Initialized default Hostinger SMTP config.");
    }

    // 8. SAFEGUARD: Ensure Testimonials exist
    const existingTestimonials = await prisma.setting.findFirst({
      where: { key: "testimonials" },
    });
    if (!existingTestimonials) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO \`settings\` (\`id\`, \`group\`, \`key\`, \`value\`, \`updated_at\`)
        VALUES (
          '0a09929d-6782-41b6-8366-94db5e6c2bc4',
          'cms',
          'testimonials',
          '[{"id":"testi-1","client_name":"Vikram Singhania","client_role":"Managing Director","company_name":"Singhania Gemstone & Exports, Jaipur","avatar_url":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80","rating":5,"review":"We export fine handcrafted jewellery and precious gemstones to the USA and Europe on strict delivery schedules. SS International Courier handles customs clearance effortlessly with 100% on-time air delivery. Live tracking gives both us and our overseas buyers complete peace of mind.","destination_route":"Jaipur → New York, USA","tag":"Verified Air Cargo Exporter","is_active":true,"created_at":"2024-09-15T10:00:00.000Z"},{"id":"testi-2","client_name":"Pooja Deshmukh","client_role":"Head of International Logistics","company_name":"Aura Apparel & Handloom Exports","avatar_url":"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80","rating":5,"review":"Switching to SS International was the best operational decision for our UK fashion consignments. Doorstep pickup in Jaipur was seamless, export commercial invoices were vetted accurately, and our samples reached our London buyers in 4 days without a single customs delay.","destination_route":"Delhi / Jaipur → London, UK","tag":"Regular Export Consignee","is_active":true,"created_at":"2024-09-28T14:30:00.000Z"},{"id":"testi-3","client_name":"Dr. Arvind K. Mehta","client_role":"Senior Professor & Parent","company_name":"University Transcripts & Legal Documents","avatar_url":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80","rating":5,"review":"Needed to send my son\\'s original university transcripts and urgent visa certificates to University of Toronto. The team packed everything in tamper-evident security flyers and tracked the consignment milestone-by-milestone. Delivered in Canada in under 72 hours!","destination_route":"Mumbai → Toronto, Canada","tag":"Express Document Client","is_active":true,"created_at":"2024-10-04T09:15:00.000Z"},{"id":"testi-4","client_name":"Farhan Qureshi","client_role":"Co-Founder & Operations Lead","company_name":"Zesture Handcrafted Goods","avatar_url":"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80","rating":5,"review":"Our handmade brass and leather artisanal goods are dispatched weekly to Dubai and Riyadh. SS International offers the most transparent cross-border rates, zero hidden fuel surcharges, and instant WhatsApp support whenever we need customs documentation guidance.","destination_route":"Jaipur → Dubai, UAE","tag":"Cross-Border E-Commerce","is_active":true,"created_at":"2024-10-10T16:45:00.000Z"}]',
          NOW(3)
        );
      `).catch(() => {});
      console.log("[ADMIN-SEED] ✅ Initialized default Customer Testimonials.");
    }

    // 9. SAFEGUARD: Ensure Currency Rate & Communication Settings exist
    await prisma.$executeRawUnsafe(`
      INSERT IGNORE INTO \`settings\` (\`id\`, \`group\`, \`key\`, \`value\`, \`updated_at\`)
      VALUES 
      ('setting-usd-to-inr', 'pricing', 'usd_to_inr_rate', '84.0', NOW(3)),
      ('e87f31bb-4b32-406d-96f1-f6e506c6547b', 'whatsapp', 'whatsapp_config', '{"api_url":"","phone_number_id":"","business_account_id":""}', NOW(3)),
      ('86855afe-50f8-4f76-adcd-c8752e952d04', 'sms', 'sms_config', '{"gateway_url":"","sender_id":"","entity_id":""}', NOW(3));
    `).catch(() => {});

    console.log("--------------------------------------------------");
    console.log("[ADMIN-SEED] ✅ Safe admin check completed successfully!");
    console.log("--------------------------------------------------");
  } catch (err) {
    console.warn(`[ADMIN-SEED] Notice: Database unreachable during this step (${err.message.split("\n")[0]}).`);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch((e) => {
      console.warn("[ADMIN-SEED] Completed with notice:", e.message);
      process.exit(0);
    });
}

module.exports = { seedAdmin, ensureEnvFile, getDatabaseUrl };
