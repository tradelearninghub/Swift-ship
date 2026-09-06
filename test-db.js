/**
 * Hostinger MySQL Database Connection Test
 * Usage: node test-db.js
 */
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
    console.log(" 1. Check if database name and username in .env have the Hostinger prefix (e.g. u123456789_dbname)");
    console.log(" 2. Ensure the database user has ALL PRIVILEGES granted to the database in hPanel.");
    console.log(" 3. Host is usually 'localhost' or '127.0.0.1'. Port is 3306.");
    console.log(" 4. Verify password doesn't contain special characters that need URL encoding.");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
