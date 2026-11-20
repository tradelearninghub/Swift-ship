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

  // 3. Seed Default Super Admin Users (Safeguard: Never overwrite existing credentials)
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { email: "admin@sscourierservice.in" },
  });
  if (!existingSuperAdmin) {
    const defaultPasswordHash = await bcrypt.hash("Admin@12345", 10);
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "admin@sscourierservice.in",
        mobile: "8000151117",
        password_hash: defaultPasswordHash,
        role_id: superAdminRole.id,
        status: "ACTIVE",
      },
    });
  }

  const existingAlias = await prisma.user.findFirst({
    where: { email: "admin@swiftship.com" },
  });
  if (!existingAlias) {
    const defaultPasswordHash = await bcrypt.hash("Admin@12345", 10);
    await prisma.user.create({
      data: {
        name: "Super Admin (SwiftShip Alias)",
        email: "admin@swiftship.com",
        mobile: "9876543210",
        password_hash: defaultPasswordHash,
        role_id: superAdminRole.id,
        status: "ACTIVE",
      },
    });
  }

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
    {
      code: "IN_HOUSE",
      name: "SS International Courier In-House Delivery (Self Fleet)",
      website: "https://ssinternationalcourier.com",
      support_contact: "+91 8000151117",
      capability_shipment_api: true,
      capability_tracking_api: true,
      capability_label_api: true,
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

  // 5. Seed Company Settings (Safeguard: Never overwrite existing admin configuration)
  const existingCompanyProfile = await prisma.setting.findFirst({
    where: { key: "company_profile" },
  });

  if (!existingCompanyProfile) {
    await prisma.setting.create({
      data: {
        group: "company_profile",
        key: "company_profile",
        value: {
          company_name: "SS International Courier Pvt. Ltd.",
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
  }

  // 6. Safe Seed: SEO Configuration (Safeguard: Never reset admin SEO settings on deploy)
  const existingSeoGlobal = await prisma.setting.findFirst({ where: { key: "seo_global" } });
  if (!existingSeoGlobal) {
    await prisma.setting.create({
      data: {
        group: "seo",
        key: "seo_global",
        value: {
          site_name: "SS International Courier",
          title_template: "%s | SS International Courier",
          default_meta_description:
            "Fast, customs-cleared global parcel dispatch across 220+ countries with automated commercial invoices, live tracking, and door-to-door transit.",
          default_share_image: "/images/ss-logo.jpg",
          canonical_base_url: "https://ssinternationalcourier.com",
          favicon: "/favicon.ico",
        },
      },
    });
  }

  const existingSeoRobots = await prisma.setting.findFirst({ where: { key: "seo_robots" } });
  if (!existingSeoRobots) {
    await prisma.setting.create({
      data: {
        group: "seo",
        key: "seo_robots",
        value: {
          content: `# SS International Courier - Robots Exclusion Protocol\nUser-agent: *\nAllow: /\n\n# Protected Admin, Internal API & Authenticated Customer Portals\nDisallow: /admin\nDisallow: /admin/\nDisallow: /api\nDisallow: /api/\nDisallow: /customer\nDisallow: /customer/\nDisallow: /login\nDisallow: /register\nDisallow: /forgot-password\nDisallow: /track/*\n\n# Sitemap Index\nSitemap: https://ssinternationalcourier.com/sitemap.xml\n`,
        },
      },
    });
  }

  // 7. Safe Seed: Hostinger SMTP Config
  const existingSmtp = await prisma.setting.findFirst({ where: { key: "smtp_config" } });
  if (!existingSmtp) {
    await prisma.setting.create({
      data: {
        group: "smtp",
        key: "smtp_config",
        value: {
          host: "smtp.hostinger.com",
          port: 465,
          user: "support@ssinternationalcourier.com",
          from_email: "support@ssinternationalcourier.com",
          from_name: "SS International Courier",
          pass: "Sscourier@2026",
        },
      },
    });
  }

  // 8. Safe Seed: Customer Testimonials
  const existingTestimonials = await prisma.setting.findFirst({ where: { key: "testimonials" } });
  if (!existingTestimonials) {
    await prisma.setting.create({
      data: {
        group: "cms",
        key: "testimonials",
        value: [
          {
            id: "testi-1",
            client_name: "Vikram Singhania",
            client_role: "Managing Director",
            company_name: "Singhania Gemstone & Exports, Jaipur",
            avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
            rating: 5,
            review: "We export fine handcrafted jewellery and precious gemstones to the USA and Europe on strict delivery schedules. SS International Courier handles customs clearance effortlessly with 100% on-time air delivery. Live tracking gives both us and our overseas buyers complete peace of mind.",
            destination_route: "Jaipur → New York, USA",
            tag: "Verified Air Cargo Exporter",
            is_active: true,
            created_at: "2024-09-15T10:00:00.000Z",
          },
          {
            id: "testi-2",
            client_name: "Pooja Deshmukh",
            client_role: "Head of International Logistics",
            company_name: "Aura Apparel & Handloom Exports",
            avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
            rating: 5,
            review: "Switching to SS International was the best operational decision for our UK fashion consignments. Doorstep pickup in Jaipur was seamless, export commercial invoices were vetted accurately, and our samples reached our London buyers in 4 days without a single customs delay.",
            destination_route: "Delhi / Jaipur → London, UK",
            tag: "Regular Export Consignee",
            is_active: true,
            created_at: "2024-09-28T14:30:00.000Z",
          },
          {
            id: "testi-3",
            client_name: "Dr. Arvind K. Mehta",
            client_role: "Senior Professor & Parent",
            company_name: "University Transcripts & Legal Documents",
            avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
            rating: 5,
            review: "Needed to send my son's original university transcripts and urgent visa certificates to University of Toronto. The team packed everything in tamper-evident security flyers and tracked the consignment milestone-by-milestone. Delivered in Canada in under 72 hours!",
            destination_route: "Mumbai → Toronto, Canada",
            tag: "Express Document Client",
            is_active: true,
            created_at: "2024-10-04T09:15:00.000Z",
          },
          {
            id: "testi-4",
            client_name: "Farhan Qureshi",
            client_role: "Co-Founder & Operations Lead",
            company_name: "Zesture Handcrafted Goods",
            avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
            rating: 5,
            review: "Our handmade brass and leather artisanal goods are dispatched weekly to Dubai and Riyadh. SS International offers the most transparent cross-border rates, zero hidden fuel surcharges, and instant WhatsApp support whenever we need customs documentation guidance.",
            destination_route: "Jaipur → Dubai, UAE",
            tag: "Cross-Border E-Commerce",
            is_active: true,
            created_at: "2024-10-10T16:45:00.000Z",
          },
        ],
      },
    });
  }

  // 9. Safe Seed: USD to INR rate
  const existingUsd = await prisma.setting.findFirst({ where: { key: "usd_to_inr_rate" } });
  if (!existingUsd) {
    await prisma.setting.create({
      data: {
        group: "pricing",
        key: "usd_to_inr_rate",
        value: "84.0",
      },
    });
  }

  // 10. Safe Seed: Indicative Rate Cards
  const rcCount = await prisma.rateCard.count();
  if (rcCount === 0) {
    const rateCards = [
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
    for (const rc of rateCards) {
      await prisma.rateCard.upsert({
        where: { id: rc.id },
        update: {},
        create: rc,
      });
    }
  }

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
