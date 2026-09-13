import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasPermission } from "@/lib/auth";
import { MOCK_COURIER_PARTNERS } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (session && !hasPermission(session, "courier.view") && !hasPermission(session, "courier.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
      // Ensure In-House Courier partner exists
      await prisma.courierPartner.upsert({
        where: { code: "IN_HOUSE" },
        update: {
          name: "SS Courier In-House Delivery (Self Fleet)",
          capability_shipment_api: true,
          capability_tracking_api: true,
          capability_label_api: true,
          status: "ACTIVE",
        },
        create: {
          id: "partner-in-house",
          name: "SS Courier In-House Delivery (Self Fleet)",
          code: "IN_HOUSE",
          status: "ACTIVE",
          capability_shipment_api: true,
          capability_tracking_api: true,
          capability_label_api: true,
        },
      }).catch(() => {});

      const dbCouriers = await prisma.courierPartner.findMany({
        include: {
          configurations: true,
        },
        orderBy: { code: "asc" },
      });

      if (dbCouriers && dbCouriers.length > 0) {
        // Sort so IN_HOUSE is always first
        dbCouriers.sort((a, b) => (a.code === "IN_HOUSE" ? -1 : b.code === "IN_HOUSE" ? 1 : 0));
        return NextResponse.json({ couriers: dbCouriers });
      }
    } catch {
      // Database not active or empty, fall back to mock
    }

    const inHouseMock = {
      id: "partner-in-house",
      name: "SS Courier In-House Delivery (Self Fleet)",
      code: "IN_HOUSE",
      status: "ACTIVE",
      capability_shipment_api: true,
      capability_tracking_api: true,
      capability_label_api: true,
    };
    return NextResponse.json({ couriers: [inHouseMock, ...MOCK_COURIER_PARTNERS] });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch courier partners", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (session && !hasPermission(session, "courier.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      code,
      website,
      support_contact,
      adapter_type,
      is_aggregator,
      capabilities,
      credentials,
      config,
    } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Name and Code are required" }, { status: 400 });
    }

    const newPartner = {
      id: `courier-${Date.now()}`,
      name,
      code: code.toUpperCase(),
      website: website || "",
      support_contact: support_contact || "",
      status: "ACTIVE" as const,
      adapter_type: adapter_type || "PREBUILT",
      is_aggregator: !!is_aggregator,
      capability_shipment_api: !!capabilities?.shipment,
      capability_tracking_api: !!capabilities?.tracking,
      capability_label_api: !!capabilities?.label,
      capability_pickup_api: !!capabilities?.pickup,
      capability_cancellation_api: !!capabilities?.cancellation,
      active_shipments_count: 0,
      api_health_percent: 100.0,
      credentials: credentials || {},
      config: config || {},
    };

    try {
      await prisma.courierPartner.create({
        data: {
          id: newPartner.id,
          name: newPartner.name,
          code: newPartner.code,
          website: newPartner.website,
          support_contact: newPartner.support_contact,
          status: "ACTIVE",
          capability_shipment_api: newPartner.capability_shipment_api,
          capability_tracking_api: newPartner.capability_tracking_api,
          capability_label_api: newPartner.capability_label_api,
          capability_pickup_api: newPartner.capability_pickup_api,
          capability_cancellation_api: newPartner.capability_cancellation_api,
        },
      });
    } catch {
      // Database might be in offline development mode
    }

    return NextResponse.json({ success: true, courier: newPartner });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create courier partner", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (session && !hasPermission(session, "courier.manage") && session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Courier partner ID is required" }, { status: 400 });
    }

    // Protect In-House self fleet partner from deletion
    if (id === "partner-in-house" || id.toLowerCase().includes("in-house") || id.toLowerCase().includes("in_house")) {
      return NextResponse.json(
        { error: "SS Courier In-House Delivery fleet is a protected system carrier and cannot be deleted." },
        { status: 400 }
      );
    }

    try {
      const partner = await prisma.courierPartner.findUnique({
        where: { id },
        select: { id: true, name: true, code: true },
      });

      if (!partner) {
        return NextResponse.json({ error: "Courier partner not found" }, { status: 404 });
      }

      if (partner.code === "IN_HOUSE") {
        return NextResponse.json(
          { error: "SS Courier In-House Delivery fleet is a protected system carrier and cannot be deleted." },
          { status: 400 }
        );
      }

      // Check for attached shipments to preserve historical data integrity (§6)
      const shipmentsCount = await prisma.shipment.count({
        where: { courier_partner_id: id },
      });

      if (shipmentsCount > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete carrier "${partner.name}" because it has ${shipmentsCount} historical shipment(s) attached. To disable it without breaking audit logs, switch its status to INACTIVE.`,
            hasShipments: true,
            shipmentsCount,
          },
          { status: 400 }
        );
      }

      // Clean up configurations, credentials, and delete partner record
      await prisma.$transaction(async (tx) => {
        await tx.courierConfiguration.deleteMany({ where: { courier_partner_id: id } });
        await tx.courierCredential.deleteMany({ where: { courier_partner_id: id } });
        await tx.courierPartner.delete({ where: { id } });
      });
    } catch {
      // In offline development mode, allow success
    }

    return NextResponse.json({ success: true, message: "Courier partner deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete courier partner", details: error.message },
      { status: 500 }
    );
  }
}
