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
      const dbCouriers = await prisma.courierPartner.findMany({
        include: {
          configurations: true,
        },
      });

      if (dbCouriers && dbCouriers.length > 0) {
        return NextResponse.json({ couriers: dbCouriers });
      }
    } catch {
      // Database not active or empty, fall back to mock
    }

    return NextResponse.json({ couriers: MOCK_COURIER_PARTNERS });
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
