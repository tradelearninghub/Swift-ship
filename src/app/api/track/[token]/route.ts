import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const rawToken = params.token ? decodeURIComponent(params.token).trim() : "";
    if (!rawToken) {
      return NextResponse.json({ error: "Missing tracking token" }, { status: 400 });
    }

    // Helper to mask AWB for privacy (§27)
    const maskAwb = (awb?: string | null) => {
      if (!awb) return "Allocating";
      if (awb.length <= 4) return "••••";
      return `${awb.slice(0, 3)}••••${awb.slice(-3)}`;
    };

    // Helper to mask mobile number (§27)
    const maskPhone = (phone?: string | null) => {
      if (!phone || phone.length < 6) return "••••••";
      return `${phone.slice(0, 2)}••••••${phone.slice(-2)}`;
    };

    // Normalize token for potential booking number match if prefixed with tok_
    const normalizedBookingNumber = rawToken.startsWith("tok_")
      ? rawToken.slice(4).toUpperCase()
      : rawToken.toUpperCase();

    // 1. Resolve Token via Shipment table (matches tracking_token, awb, or booking_number)
    const shipment = await prisma.shipment.findFirst({
      where: {
        OR: [
          { tracking_token: rawToken },
          { tracking_token: rawToken.toLowerCase() },
          { awb: rawToken.toUpperCase() },
          { booking: { booking_number: rawToken.toUpperCase() } },
          { booking: { booking_number: normalizedBookingNumber } },
        ],
      },
      include: {
        booking: {
          include: { parcels: true },
        },
        courier_partner: true,
        tracking_events: {
          orderBy: { occurred_at: "asc" },
        },
      },
    });

    if (shipment) {
      const b = shipment.booking;
      return NextResponse.json({
        found: true,
        token: rawToken,
        shipment: {
          awb_masked: maskAwb(shipment.awb),
          booking_number: b.booking_number,
          courier_name: shipment.courier_partner.name,
          status: shipment.status,
          sender_city: b.sender_city,
          sender_state: b.sender_state,
          sender_mobile_masked: maskPhone(b.sender_mobile),
          receiver_city: b.receiver_city,
          receiver_state: b.receiver_state,
          receiver_mobile_masked: maskPhone(b.receiver_mobile),
          payment_type: b.payment_type,
          created_at: b.created_at,
          events: shipment.tracking_events.map((e) => ({
            id: e.id,
            status: e.status,
            raw_status: e.raw_status,
            location: e.location,
            occurred_at: e.occurred_at,
          })),
        },
      });
    }

    // 2. Check if token maps to a booking pending review / dispatch
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { booking_number: rawToken.toUpperCase() },
          { booking_number: normalizedBookingNumber },
          { id: rawToken },
        ],
      },
    });

    if (booking) {
      return NextResponse.json({
        found: true,
        token: rawToken,
        shipment: {
          awb_masked: "Pending Allocation",
          booking_number: booking.booking_number,
          courier_name: "Operations Intake",
          status: booking.status,
          sender_city: booking.sender_city,
          sender_state: booking.sender_state,
          sender_mobile_masked: maskPhone(booking.sender_mobile),
          receiver_city: booking.receiver_city,
          receiver_state: booking.receiver_state,
          receiver_mobile_masked: maskPhone(booking.receiver_mobile),
          payment_type: booking.payment_type,
          created_at: booking.created_at,
          events: [
            {
              status: "REQUESTED",
              raw_status: "Booking request received — awaiting weight verification and partner assignment",
              location: booking.sender_city,
              occurred_at: booking.created_at,
            },
          ],
        },
      });
    }

    return NextResponse.json(
      { found: false, error: `No active consignment found for tracking token '${rawToken}'` },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("QR Token Tracking API Error:", error);
    return NextResponse.json({ error: "Failed to resolve tracking token" }, { status: 500 });
  }
}
