import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ShipmentStatus } from "@prisma/client";

function normalizeCarrierStatus(raw: string): ShipmentStatus {
  const upper = raw.toUpperCase();
  if (upper.includes("DELIVERED") || upper.includes("DLV")) return "DELIVERED";
  if (upper.includes("OUT FOR DELIVERY") || upper.includes("OFD")) return "OUT_FOR_DELIVERY";
  if (upper.includes("TRANSIT") || upper.includes("IN_TRANSIT") || upper.includes("DEPARTED") || upper.includes("ARRIVED")) return "IN_TRANSIT";
  if (upper.includes("PICKED") || upper.includes("COLLECTED")) return "PICKED_UP";
  if (upper.includes("RTO") || upper.includes("RETURN")) return "RTO";
  if (upper.includes("CANCEL")) return "CANCELLED";
  return "IN_TRANSIT";
}

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const courierCode = params.code.toUpperCase();
    const payload = await req.json();

    // Find courier partner
    const courier = await prisma.courierPartner.findFirst({
      where: { code: courierCode },
    });

    if (!courier) {
      return NextResponse.json({ error: "Unknown courier adapter" }, { status: 404 });
    }

    // Extract AWB & status based on courier format
    const awb = payload.awb || payload.Waybill || payload.waybill || payload.tracking_number;
    const rawStatus = payload.status || payload.Status || payload.event || "Checkpoint update";
    const location = payload.location || payload.Location || payload.city || "Transit Gateway";

    if (!awb) {
      return NextResponse.json({ error: "Missing AWB in webhook payload" }, { status: 400 });
    }

    // Find matching shipment
    const shipment = await prisma.shipment.findFirst({
      where: { awb },
    });

    if (!shipment) {
      return NextResponse.json({ error: `Shipment with AWB ${awb} not found` }, { status: 404 });
    }

    const normalizedStatus = normalizeCarrierStatus(rawStatus);

    await prisma.$transaction(async (tx) => {
      // 1. Insert tracking event
      await tx.shipmentTrackingEvent.create({
        data: {
          shipment_id: shipment.id,
          status: normalizedStatus,
          raw_status: rawStatus,
          location,
          source: "WEBHOOK",
          occurred_at: new Date(),
        },
      });

      // 2. Update shipment status
      await tx.shipment.update({
        where: { id: shipment.id },
        data: {
          status: normalizedStatus,
        },
      });
    });

    return NextResponse.json({ success: true, awb, normalized_status: normalizedStatus });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook ingestion failed" }, { status: 500 });
  }
}
