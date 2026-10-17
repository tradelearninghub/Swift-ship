import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getThirdPartyTrackingUrl } from "@/lib/trackingUrls";
import { saveTrackingMetadata, getTrackingMetadata, BookingTrackingMetadata } from "@/lib/trackingMetadata";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingId = params.id;
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingId }, { booking_number: bookingId }],
      },
      include: {
        shipment: {
          include: { courier_partner: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const meta: Partial<BookingTrackingMetadata> =
      (await getTrackingMetadata(booking.booking_number)) ||
      (await getTrackingMetadata(booking.id)) ||
      {};

    return NextResponse.json({
      success: true,
      booking_id: booking.id,
      booking_number: booking.booking_number,
      manual_awb: meta.manual_awb || booking.shipment?.awb || "",
      awb_date: meta.awb_date || new Date().toISOString().split("T")[0],
      courier_code: meta.courier_code || booking.shipment?.courier_partner?.code || "DHL",
      courier_name: meta.courier_name || booking.shipment?.courier_partner?.name || "DHL Express",
      third_party_tracking_id: meta.third_party_tracking_id || "",
      third_party_tracking_url: meta.third_party_tracking_url || "",
      shipment_status: booking.shipment?.status || booking.status,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to load tracking details" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingId = params.id;
    const body = await req.json();
    const {
      courier_code,
      courier_name,
      third_party_tracking_id,
      third_party_tracking_url,
      manual_awb,
      awb_date,
      status,
    } = body;

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingId }, { booking_number: bookingId }],
      },
      include: {
        shipment: { include: { courier_partner: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const cCode = (courier_code || "DHL").toUpperCase();
    const cName = courier_name || courier_code || "DHL Express";
    const trackingId = (third_party_tracking_id || "").trim();

    // Compute or validate tracking URL
    const finalTrackingUrl =
      (third_party_tracking_url || "").trim() ||
      (trackingId ? getThirdPartyTrackingUrl(cCode || cName, trackingId) : "");

    // Find or create courier partner in DB
    let courierPartner = await prisma.courierPartner.findFirst({
      where: {
        OR: [{ code: cCode }, { name: cName }],
      },
    });

    if (!courierPartner) {
      try {
        courierPartner = await prisma.courierPartner.create({
          data: {
            name: cName,
            code: cCode,
            status: "ACTIVE",
            capability_tracking_api: true,
          },
        });
      } catch {
        courierPartner = await prisma.courierPartner.findFirst({
          where: { status: "ACTIVE" },
        });
      }
    }

    const partnerId = courierPartner?.id;
    const effectiveAwb = (manual_awb || "").trim() || trackingId || booking.shipment?.awb || `AWB-${Date.now()}`;
    const newStatus = status || (trackingId ? "IN_TRANSIT" : "AWB_GENERATED");

    // Upsert shipment
    let shipment = booking.shipment;
    if (shipment) {
      shipment = await prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          courier_partner_id: partnerId || shipment.courier_partner_id,
          awb: effectiveAwb,
          awb_source: manual_awb ? "MANUAL" : "API",
          label_url: finalTrackingUrl || shipment.label_url,
          status: newStatus as any,
        },
        include: { courier_partner: true },
      });
    } else if (partnerId) {
      shipment = await prisma.shipment.create({
        data: {
          booking_id: booking.id,
          courier_partner_id: partnerId,
          awb: effectiveAwb,
          awb_source: manual_awb ? "MANUAL" : "API",
          label_url: finalTrackingUrl,
          status: newStatus as any,
          tracking_token: crypto.randomBytes(16).toString("hex"),
          idempotency_key: `idemp_${booking.id}_${Date.now()}`,
        },
        include: { courier_partner: true },
      });
    }

    // Update booking status if approved
    if (booking.status === "REQUESTED" || booking.status === "UNDER_REVIEW") {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "APPROVED" },
      });
    }

    // Add milestone event if tracking ID is assigned
    if (shipment && trackingId) {
      try {
        await prisma.shipmentTrackingEvent.create({
          data: {
            shipment_id: shipment.id,
            status: "DISPATCHED",
            raw_status: `Consignment handed over to ${cName}. Carrier Tracking ID: ${trackingId}`,
            location: `${booking.sender_city} Hub`,
            occurred_at: new Date(),
          },
        });
      } catch {}
    }

    // Save tracking metadata
    const meta = await saveTrackingMetadata(booking.id, booking.booking_number, {
      manual_awb: (manual_awb || "").trim() || effectiveAwb,
      awb_date: (awb_date || "").trim() || new Date().toISOString().split("T")[0],
      courier_code: cCode,
      courier_name: cName,
      third_party_tracking_id: trackingId,
      third_party_tracking_url: finalTrackingUrl,
    });

    return NextResponse.json({
      success: true,
      message: "Tracking information updated successfully",
      tracking: meta,
      shipment,
    });
  } catch (error: any) {
    console.error("Update Tracking Error:", error);
    return NextResponse.json({ error: "Failed to update tracking details" }, { status: 500 });
  }
}
