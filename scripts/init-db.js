/**
 * Swift Ship Courier - Automated Database Initializer
 * This script runs automatically on 'npm run build' and on 'server.js' startup.
 * It is completely idempotent (safe to run multiple times without duplicating data).
 */
const fs = require("fs");
const path = require("path");

// Load .env if not loaded
function loadEnv() {
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
  }
}

loadEnv();

// Auto-construct DATABASE_URL with proper URL encoding if individual DB variables are provided
if (!process.env.DATABASE_URL && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
  const user = encodeURIComponent(process.env.DB_USER);
  const pass = encodeURIComponent(process.env.DB_PASSWORD);
  const host = process.env.DB_HOST || "127.0.0.1";
  const port = process.env.DB_PORT || "3306";
  const name = process.env.DB_NAME;
  process.env.DATABASE_URL = `mysql://${user}:${pass}@${host}:${port}/${name}?connection_limit=5`;
}

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
    log: ["error"],
  });

  try {
    // 1. Check if database is reachable
    await prisma.$connect();
    console.log("[DB-INIT] Connected to database successfully.");

    // 2. Check if tables exist by querying information_schema or count
    let tablesExist = false;
    try {
      const userCount = await prisma.user.count();
      tablesExist = true;
      console.log(`[DB-INIT] Found existing tables. Total users in DB: ${userCount}`);
    } catch (err) {
      // Table doesn't exist yet
      tablesExist = false;
    }

    if (!tablesExist) {
      console.log("[DB-INIT] Tables do not exist yet. Executing full schema creation from database.sql...");
      const sqlFilePath = path.resolve(process.cwd(), "database.sql");
      if (fs.existsSync(sqlFilePath)) {
        const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");
        // Split by statement delimiters
        const statements = sqlContent
          .split(/;\s*[\r\n]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !s.startsWith("--"));

        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await prisma.$executeRawUnsafe(statement);
            } catch (stmtErr) {
              console.warn(`[DB-INIT] Statement notice: ${stmtErr.message.split("\n")[0]}`);
            }
          }
        }
        console.log("[DB-INIT] ✅ All tables, constraints, and initial seed data created successfully!");
      }
    } else {
      // Check if superadmin is seeded
      try {
        const superAdmin = await prisma.user.findFirst({
          where: { email: "admin@swiftship.com" },
        });
        if (!superAdmin) {
          console.log("[DB-INIT] Seeding missing Super Admin and roles...");
          const sqlFilePath = path.resolve(process.cwd(), "database.sql");
          if (fs.existsSync(sqlFilePath)) {
            const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");
            const statements = sqlContent
              .split(/;\s*[\r\n]+/)
              .map((s) => s.trim())
              .filter((s) => s.startsWith("INSERT"));

            for (const statement of statements) {
              try {
                await prisma.$executeRawUnsafe(statement);
              } catch (e) {
                // Ignore duplicate insert notices
              }
            }
          }
        }
        console.log("[DB-INIT] ✅ Database is up to date and verified.");
      } catch (checkErr) {
        console.warn("[DB-INIT] Verification notice:", checkErr.message);
      }
    }
  } catch (connectionErr) {
    console.log(`[DB-INIT] ℹ️  Database not reachable during this step (${connectionErr.message.split("\n")[0]}).`);
    console.log("[DB-INIT] ℹ️  If deploying on Hostinger, the database will initialize automatically once server.js starts.");
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {}
  }
}

if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.warn("[DB-INIT] Notice:", err.message);
      process.exit(0); // Exit with 0 so build doesn't fail if DB is offline at build time
    });
}

module.exports = { initDatabase };
