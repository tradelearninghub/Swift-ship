import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasPermission } from "@/lib/auth";
import { z } from "zod";

const MilestoneSchema = z.object({
  status: z.enum([
    "AWB_GENERATED",
    "PICKED_UP",
    "AT_ORIGIN_HUB",
    "IN_TRANSIT",
    "AT_DESTINATION_HUB",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "FAILED_ATTEMPT",
    "RTO",
    "EXCEPTION",
    "CANCELLED",
  ]),
  location: z.string().min(1, "Location is required"),
  remarks: z.string().optional(),
  occurred_at: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleUpper = (session.role || "").toUpperCase();
    const isAdmin = roleUpper === "SUPER_ADMIN" || roleUpper === "ADMIN";
    if (!isAdmin && !hasPermission(session, "shipment.manage") && !hasPermission(session, "shipments.view")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const shipmentId = params.id;
    const body = await req.json();
    const validation = MilestoneSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { status, location, remarks, occurred_at } = validation.data;

    // Find shipment by ID or AWB or booking_id
    const shipment = await prisma.shipment.findFirst({
      where: {
        OR: [
          { id: shipmentId },
          { awb: shipmentId },
          { booking_id: shipmentId },
        ],
      },
      include: {
        booking: true,
        courier_partner: true,
      },
    });

    if (!shipment) {
      return NextResponse.json({ error: "Shipment record not found" }, { status: 404 });
    }

    const timestamp = occurred_at ? new Date(occurred_at) : new Date();

    // Friendly standard text if remarks are blank
    const statusLabels: Record<string, string> = {
      AWB_GENERATED: "Consignment booked and AWB generated",
      PICKED_UP: "Parcel picked up from sender location",
      AT_ORIGIN_HUB: "Shipment received at origin sorting facility",
      IN_TRANSIT: "Shipment in transit to destination hub",
      AT_DESTINATION_HUB: "Shipment reached delivery sorting center",
      OUT_FOR_DELIVERY: "Shipment is out for delivery with dispatch courier",
      DELIVERED: "Consignment successfully delivered to receiver",
      FAILED_ATTEMPT: "Delivery attempted; customer unavailable or rescheduled",
      RTO: "Shipment marked for Return to Origin (RTO)",
      EXCEPTION: "Shipment exception or transit delay reported",
      CANCELLED: "Consignment shipment cancelled",
    };

    const finalRawStatus = remarks?.trim() || statusLabels[status] || `Status updated to ${status}`;

    // Map custom in-house milestone to valid Prisma ShipmentStatus
    const prismaStatusMap: Record<string, any> = {
      AWB_GENERATED: "AWB_GENERATED",
      PICKED_UP: "PICKED_UP",
      AT_ORIGIN_HUB: "IN_TRANSIT",
      IN_TRANSIT: "IN_TRANSIT",
      AT_DESTINATION_HUB: "IN_TRANSIT",
      OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
      DELIVERED: "DELIVERED",
      FAILED_ATTEMPT: "EXCEPTION",
      RTO: "RTO",
      EXCEPTION: "EXCEPTION",
      CANCELLED: "CANCELLED",
    };

    const targetPrismaStatus = prismaStatusMap[status] || "IN_TRANSIT";

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create milestone tracking event
      const event = await tx.shipmentTrackingEvent.create({
        data: {
          shipment_id: shipment.id,
          status,
          raw_status: finalRawStatus,
          location,
          source: "MANUAL",
          occurred_at: timestamp,
        },
      });

      // 2. Update shipment status and last_synced_at
      const updatedShipment = await tx.shipment.update({
        where: { id: shipment.id },
        data: {
          status: targetPrismaStatus,
          last_synced_at: new Date(),
        },
      });

      // 3. Update parent booking if cancelled
      if (status === "CANCELLED") {
        await tx.booking.update({
          where: { id: shipment.booking_id },
          data: { status: "CANCELLED" },
        }).catch(() => {});
      }

      // 4. Audit log
      await tx.activityLog.create({
        data: {
          actor_id: session.id || null,
          action: "shipment.milestone_updated",
          entity_type: "SHIPMENT",
          entity_id: shipment.id,
          after: {
            status,
            location,
            remarks: finalRawStatus,
            awb: shipment.awb,
          },
        },
      }).catch(() => {});

      return { shipment: updatedShipment, event };
    });

    return NextResponse.json({
      success: true,
      message: `Milestone updated to ${status}`,
      shipment: result.shipment,
      event: result.event,
    });
  } catch (error: any) {
    console.error("Update Milestone Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update milestone" },
      { status: 500 }
    );
  }
}
