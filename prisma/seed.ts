import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Swift Ship Courier database...");

  // 1. Seed Roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: {
      name: "SUPER_ADMIN",
      is_system_role: true,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      is_system_role: true,
    },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: "STAFF" },
    update: {},
    create: {
      name: "STAFF",
      is_system_role: true,
    },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: "CUSTOMER" },
    update: {},
    create: {
      name: "CUSTOMER",
      is_system_role: true,
    },
  });

  // 2. Seed Permissions
  const permissionsList = [
    { key: "booking.view", description: "View bookings", group: "Booking" },
    { key: "booking.create", description: "Create bookings", group: "Booking" },
    { key: "booking.edit", description: "Edit booking details", group: "Booking" },
    { key: "booking.approve", description: "Approve and rate bookings", group: "Booking" },
    { key: "booking.reject", description: "Reject bookings", group: "Booking" },
    { key: "booking.cancel", description: "Cancel bookings", group: "Booking" },
    { key: "shipment.view", description: "View shipments", group: "Shipment" },
    { key: "shipment.process", description: "Process shipments and AWBs", group: "Shipment" },
    { key: "courier.view", description: "View courier partners", group: "Courier" },
    { key: "courier.manage", description: "Manage couriers and credentials", group: "Courier" },
    { key: "customer.view", description: "View customers", group: "Customer" },
    { key: "customer.manage", description: "Manage customers", group: "Customer" },
    { key: "cod.view", description: "View COD transactions", group: "COD" },
    { key: "cod.manage", description: "Manage COD settlements", group: "COD" },
    { key: "payment.view", description: "View payments", group: "Payment" },
    { key: "payment.manage", description: "Manage payments", group: "Payment" },
    { key: "reports.view", description: "View reports", group: "Reports" },
    { key: "settings.view", description: "View settings", group: "Settings" },
    { key: "settings.manage", description: "Manage settings", group: "Settings" },
    { key: "users.manage", description: "Manage staff and roles", group: "Staff" },
  ];

  for (const p of permissionsList) {
    const perm = await prisma.permission.upsert({
      where: { key: p.key },
      update: { description: p.description, group: p.group },
      create: {
        key: p.key,
        description: p.description,
        group: p.group,
      },
    });

    // Link all to Super Admin and Admin
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: superAdminRole.id,
          permission_id: perm.id,
        },
      },
      update: {},
      create: {
        role_id: superAdminRole.id,
        permission_id: perm.id,
      },
    });

    if (!p.key.startsWith("settings.") && !p.key.startsWith("users.")) {
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: adminRole.id,
            permission_id: perm.id,
          },
        },
        update: {},
        create: {
          role_id: adminRole.id,
          permission_id: perm.id,
        },
      });
    }

    if (
      p.key.startsWith("booking.view") ||
      p.key.startsWith("booking.create") ||
      p.key.startsWith("shipment.view") ||
      p.key.startsWith("customer.view")
    ) {
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: staffRole.id,
            permission_id: perm.id,
          },
        },
        update: {},
        create: {
          role_id: staffRole.id,
          permission_id: perm.id,
        },
      });
    }
  }

  // 3. Seed Default Super Admin Users
  const defaultPasswordHash = await bcrypt.hash("Admin@12345", 10);
  await prisma.user.upsert({
    where: { email: "admin@sscourierservice.in" },
    update: { password_hash: defaultPasswordHash, role_id: superAdminRole.id, status: "ACTIVE" },
    create: {
      name: "Super Admin",
      email: "admin@sscourierservice.in",
      mobile: "8000151117",
      password_hash: defaultPasswordHash,
      role_id: superAdminRole.id,
      status: "ACTIVE",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@swiftship.com" },
    update: { password_hash: defaultPasswordHash, role_id: superAdminRole.id, status: "ACTIVE" },
    create: {
      name: "Super Admin (SwiftShip Alias)",
      email: "admin@swiftship.com",
      mobile: "9876543210",
      password_hash: defaultPasswordHash,
      role_id: superAdminRole.id,
      status: "ACTIVE",
    },
  });

  // 4. Seed Default Courier Partners
  const couriers = [
    {
      code: "DELHIVERY",
      name: "Delhivery",
      website: "https://www.delhivery.com",
      support_contact: "+91 124 6719500",
      capability_shipment_api: true,
      capability_tracking_api: true,
      capability_label_api: true,
      capability_pickup_api: true,
      capability_cancellation_api: true,
    },
    {
      code: "BLUEDART",
      name: "Blue Dart",
      website: "https://www.bluedart.com",
      support_contact: "1860 233 1234",
      capability_shipment_api: true,
      capability_tracking_api: true,
      capability_label_api: true,
      capability_pickup_api: true,
      capability_cancellation_api: true,
    },
    {
      code: "DTDC",
      name: "DTDC Express",
      website: "https://www.dtdc.in",
      support_contact: "+91 80 2536 5032",
      capability_shipment_api: true,
      capability_tracking_api: true,
      capability_label_api: false,
      capability_pickup_api: true,
      capability_cancellation_api: false,
    },
    {
      code: "XPRESSBEES",
      name: "XpressBees",
      website: "https://www.xpressbees.com",
      support_contact: "+91 20 4911 1900",
      capability_shipment_api: false,
      capability_tracking_api: true,
      capability_label_api: false,
      capability_pickup_api: false,
      capability_cancellation_api: false,
    },
  ];

  for (const c of couriers) {
    await prisma.courierPartner.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

  // 5. Seed Company Settings
  await prisma.setting.upsert({
    where: { key: "company_profile" },
    update: {
      value: {
        company_name: "SS Courier service Pvt. Ltd.",
        tagline: "Fast, Safe & Multi-Carrier Courier Logistics",
        support_email: "support@sscourierservice.in",
        support_phones: ["8000151117", "7689987368"],
        support_phone: "8000151117, 7689987368",
        whatsapp: "8000151117",
        address: "Shop No 4, 5th Crossing, Padmavati School, Ghee Walo Ka Rasta, Johri Bazar",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302003",
        operating_hours: "Mon - Sat: 08:00 AM - 09:00 PM IST",
        google_maps_embed_url:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.484920272099!2d75.82412537611685!3d26.921104759799295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db14b1a473b11%3A0xb35a0f5a11c1e5cb!2sJohri%20Bazar%2C%20Jaipur%2C%20Rajasthan%20302003!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin",
        latitude: 26.9211,
        longitude: 75.8267,
      },
    },
    create: {
      group: "company_profile",
      key: "company_profile",
      value: {
        company_name: "SS Courier Services Pvt. Ltd.",
        tagline: "Fast, Safe & Multi-Carrier Courier Logistics",
        support_email: "support@sscourierservice.in",
        support_phones: ["8000151117", "7689987368"],
        support_phone: "8000151117, 7689987368",
        whatsapp: "8000151117",
        address: "Shop No 4, 5th Crossing, Padmavati School, Ghee Walo Ka Rasta, Johri Bazar",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302003",
        operating_hours: "Mon - Sat: 08:00 AM - 09:00 PM IST",
        google_maps_embed_url:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.484920272099!2d75.82412537611685!3d26.921104759799295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db14b1a473b11%3A0xb35a0f5a11c1e5cb!2sJohri%20Bazar%2C%20Jaipur%2C%20Rajasthan%20302003!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin",
        latitude: 26.9211,
        longitude: 75.8267,
      },
    },
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
