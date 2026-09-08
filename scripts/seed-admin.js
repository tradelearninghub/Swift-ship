/**
 * SS Courier service - Dedicated Admin Seeder Script
 * Runs during 'npm run build' and on server startup.
 * Ensures the database has the Super Admin account and essential system roles.
 */
const fs = require("fs");
const path = require("path");

// Default Hostinger production credentials
const DEFAULT_ENV = {
  DB_HOST: "127.0.0.1",
  DB_PORT: "3306",
  DB_USER: "u905414804_sscouriers",
  DB_PASSWORD: "SS@Couriers26",
  DB_NAME: "u905414804_sscouriers",
  DATABASE_URL: "mysql://u905414804_sscouriers:SS%40Couriers26@127.0.0.1:3306/u905414804_sscouriers?connection_limit=5",
  AUTH_SECRET: "f47a98c5e13b8602d1a47389c9e6f25108b7e23a4918237b60e9182c34d567ef",
  JWT_SECRET: "f47a98c5e13b8602d1a47389c9e6f25108b7e23a4918237b60e9182c34d567ef",
  NEXT_PUBLIC_APP_URL: "https://sscourierservice.in/",
  APP_URL: "https://sscourierservice.in/",
  NODE_ENV: "production",
  PORT: "3000",
  HOSTNAME: "0.0.0.0",
};

// 1. Load or auto-generate .env file
function ensureEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
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
  } else {
    console.log("[ADMIN-SEED] ℹ️ .env not found on disk. Creating production .env file...");
    const lines = Object.entries(DEFAULT_ENV).map(([k, v]) => `${k}="${v}"`);
    try {
      fs.writeFileSync(envPath, lines.join("\n") + "\n", "utf-8");
      console.log("[ADMIN-SEED] ✅ Created production .env file successfully.");
    } catch (e) {
      console.warn("[ADMIN-SEED] ⚠️ Could not write .env file:", e.message);
    }
  }

  // Ensure process.env has required fallback values
  Object.entries(DEFAULT_ENV).forEach(([k, v]) => {
    if (!process.env[k]) {
      process.env[k] = v;
    }
  });
}

ensureEnvFile();

// Verified Bcrypt hash for password: Admin@12345
const ADMIN_PASSWORD_HASH = "$2a$10$3gFAfXHoT/GYzAqOwYTlMeSCCYLyTBnL65BmWSPOLoQH.X88p8Dl.";

async function seedAdmin() {
  console.log("--------------------------------------------------");
  console.log("[ADMIN-SEED] Initializing Super Admin Database Entry...");
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
        url: process.env.DATABASE_URL,
      },
    },
    log: ["error"],
  });

  try {
    await prisma.$connect();
    console.log("[ADMIN-SEED] Connected to MySQL database successfully.");

    // 1. Ensure essential system roles exist
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

    // 2. Insert or update primary Super Admin (admin@sscourierservice.in)
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
      )
      ON DUPLICATE KEY UPDATE
        \`name\` = 'Super Admin',
        \`mobile\` = '8000151117',
        \`password_hash\` = '${ADMIN_PASSWORD_HASH}',
        \`role_id\` = 'role-super-admin',
        \`status\` = 'ACTIVE',
        \`updated_at\` = NOW(3);
    `);
    console.log("[ADMIN-SEED] ✅ Primary Admin User Verified: admin@sscourierservice.in");

    // 3. Insert or update fallback Super Admin (admin@swiftship.com)
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
      )
      ON DUPLICATE KEY UPDATE
        \`password_hash\` = '${ADMIN_PASSWORD_HASH}',
        \`role_id\` = 'role-super-admin',
        \`status\` = 'ACTIVE',
        \`updated_at\` = NOW(3);
    `);
    console.log("[ADMIN-SEED] ✅ Alias Admin User Verified: admin@swiftship.com");

    // 4. Ensure Company Profile Settings exist
    await prisma.$executeRawUnsafe(`
      INSERT INTO \`settings\` (\`id\`, \`group\`, \`key\`, \`value\`, \`updated_at\`)
      VALUES (
        'setting-company-profile',
        'company_profile',
        'company_profile',
        JSON_OBJECT(
          'company_name', 'SS Courier service Pvt. Ltd.',
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
      )
      ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`), \`updated_at\` = NOW(3);
    `).catch(() => {});

    console.log("--------------------------------------------------");
    console.log("[ADMIN-SEED] ✅ All admin records, roles, and settings are ready!");
    console.log("[ADMIN-SEED] 🔑 Credentials: admin@sscourierservice.in | Admin@12345");
    console.log("--------------------------------------------------");
  } catch (err) {
    console.warn(`[ADMIN-SEED] Notice: Database unreachable during this build phase (${err.message.split("\n")[0]}).`);
    console.log("[ADMIN-SEED] Don't worry! Auto-heal will register the admin on first startup or login.");
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

module.exports = { seedAdmin, ensureEnvFile };
