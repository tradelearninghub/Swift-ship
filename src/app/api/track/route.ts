import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim();
    const mobile = searchParams.get("mobile")?.trim();
    const pincode = searchParams.get("pincode")?.trim();

    // Mode 1: Direct AWB or Booking Number Lookup
    if (query) {
      const shipment = await prisma.shipment.findFirst({
        where: {
          OR: [
            { awb: query },
            { booking: { booking_number: query } },
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

      if (!shipment) {
        // Check if there is an intake booking without a shipment yet
        const bookingOnly = await prisma.booking.findFirst({
          where: { booking_number: query },
          include: { parcels: true },
        });

        if (!bookingOnly) {
          return NextResponse.json({ found: false, results: [] }, { status: 404 });
        }

        return NextResponse.json({
          found: true,
          type: "SINGLE",
          shipment: {
            booking_number: bookingOnly.booking_number,
            status: bookingOnly.status,
            sender_city: bookingOnly.sender_city,
            sender_state: bookingOnly.sender_state,
            receiver_city: bookingOnly.receiver_city,
            receiver_state: bookingOnly.receiver_state,
            payment_type: bookingOnly.payment_type,
            created_at: bookingOnly.created_at,
            events: [
              {
                status: "REQUESTED",
                raw_status: "Booking request placed online",
                location: `${bookingOnly.sender_city}`,
                occurred_at: bookingOnly.created_at,
              },
            ],
          },
        });
      }

      // Format privacy-masked response (§27)
      const b = shipment.booking;
      return NextResponse.json({
        found: true,
        type: "SINGLE",
        shipment: {
          awb: shipment.awb,
          booking_number: b.booking_number,
          courier_name: shipment.courier_partner.name,
          status: shipment.status,
          sender_city: b.sender_city,
          sender_state: b.sender_state,
          sender_mobile_masked: `${b.sender_mobile.slice(0, 2)}••••••${b.sender_mobile.slice(-2)}`,
          receiver_city: b.receiver_city,
          receiver_state: b.receiver_state,
          receiver_mobile_masked: `${b.receiver_mobile.slice(0, 2)}••••••${b.receiver_mobile.slice(-2)}`,
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

    // Mode 2: Mobile + Pincode Lookup (§25)
    if (mobile && pincode) {
      const bookings = await prisma.booking.findMany({
        where: {
          OR: [
            { sender_mobile: mobile, sender_pincode: pincode },
            { receiver_mobile: mobile, receiver_pincode: pincode },
          ],
        },
        include: {
          shipment: {
            include: {
              courier_partner: true,
              tracking_events: {
                orderBy: { occurred_at: "asc" },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 10,
      });

      if (bookings.length === 0) {
        return NextResponse.json({ found: false, results: [] }, { status: 404 });
      }

      return NextResponse.json({
        found: true,
        type: "MULTIPLE",
        results: bookings.map((b) => ({
          booking_number: b.booking_number,
          awb: b.shipment?.awb || null,
          courier_name: b.shipment?.courier_partner.name || "Assigned shortly",
          status: b.shipment?.status || b.status,
          sender_city: b.sender_city,
          receiver_city: b.receiver_city,
          payment_type: b.payment_type,
          created_at: b.created_at,
          events_count: b.shipment?.tracking_events.length || 1,
        })),
      });
    }

    return NextResponse.json(
      { error: "Provide either ?q=AWB or ?mobile=98...&pincode=30..." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Public Tracking API Error:", error);
    return NextResponse.json({ error: "Tracking query failed" }, { status: 500 });
  }
}
