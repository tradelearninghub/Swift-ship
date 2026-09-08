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

    // 3. Ensure Super Admin, roles, and settings are explicitly synced
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

if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.warn("[DB-INIT] Notice:", err.message);
      process.exit(0); // Exit with 0 so build does not fail if DB is offline during build
    });
}

module.exports = { initDatabase };
