/**
 * Hostinger MySQL Database Connection Test
 * Usage: node test-db.js
 */
const fs = require("fs");
const path = require("path");

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

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

async function main() {
  console.log("--------------------------------------------------");
  console.log("Testing Hostinger MySQL Database Connection...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "[CONFIGURED]" : "[MISSING IN ENV]");
  console.log("--------------------------------------------------");

  try {
    await prisma.$connect();
    console.log("✅ Successfully connected to the MySQL database!");

    // Check existing tables / counts
    const userCount = await prisma.user.count();
    const roleCount = await prisma.role.count();
    const courierCount = await prisma.courierPartner.count();

    console.log(`📊 Database Statistics:`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Roles: ${roleCount}`);
    console.log(`   - Courier Partners: ${courierCount}`);

    if (roleCount === 0 && userCount === 0) {
      console.log("\n💡 Database is empty. Run seed command:");
      console.log("   npm run db:seed");
    } else {
      console.log("\n✅ Database is populated and ready for production!");
    }
  } catch (error) {
    console.error("\n❌ Database Connection Error:");
    console.error(error.message);
    console.log("\n🔍 Troubleshooting tips for Hostinger MySQL:");
    console.log(" 1. Check if database name and username in .env have the Hostinger prefix (e.g. u905414804_sscouriers)");
    console.log(" 2. Ensure the database user has ALL PRIVILEGES granted to the database in hPanel.");
    console.log(" 3. Host is usually '127.0.0.1' or 'localhost'. Port is 3306.");
    console.log(" 4. Verify password special characters are URL encoded ('@' -> '%40').");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
