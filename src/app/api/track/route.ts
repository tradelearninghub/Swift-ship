import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const awbParam = searchParams.get("awb")?.trim();
    const bookingIdParam = (searchParams.get("booking_id") || searchParams.get("order_id"))?.trim();
    const mobileParam = searchParams.get("mobile")?.trim();
    const pincodeParam = searchParams.get("pincode")?.trim();
    const query = searchParams.get("q")?.trim() || awbParam || bookingIdParam;

    // Helper to mask AWB for privacy in multi-result list (§27)
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

    // Option 1 & 2: Search by AWB or Booking Number / Order ID (Direct Lookup)
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
        // Check if there is an intake booking without a shipment assigned yet
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
            sender_mobile_masked: maskPhone(bookingOnly.sender_mobile),
            receiver_city: bookingOnly.receiver_city,
            receiver_state: bookingOnly.receiver_state,
            receiver_mobile_masked: maskPhone(bookingOnly.receiver_mobile),
            payment_type: bookingOnly.payment_type,
            created_at: bookingOnly.created_at,
            events: [
              {
                status: "REQUESTED",
                raw_status: "Booking request placed online — awaiting review",
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

    // Option 3: Search by Mobile Number + Pincode (§25-26)
    if (mobileParam) {
      const whereCondition = pincodeParam
        ? {
            OR: [
              { sender_mobile: mobileParam, sender_pincode: pincodeParam },
              { receiver_mobile: mobileParam, receiver_pincode: pincodeParam },
            ],
          }
        : {
            OR: [
              { sender_mobile: mobileParam },
              { receiver_mobile: mobileParam },
            ],
          };

      const bookings = await prisma.booking.findMany({
        where: whereCondition,
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
        take: 20,
      });

      if (bookings.length === 0) {
        return NextResponse.json({ found: false, results: [] }, { status: 404 });
      }

      // If exactly 1 match, return single shipment detail directly
      if (bookings.length === 1) {
        const b = bookings[0];
        const s = b.shipment;
        return NextResponse.json({
          found: true,
          type: "SINGLE",
          shipment: {
            awb: s?.awb || null,
            booking_number: b.booking_number,
            courier_name: s?.courier_partner.name || "Assigned Partner",
            status: s?.status || b.status,
            sender_city: b.sender_city,
            sender_state: b.sender_state,
            sender_mobile_masked: maskPhone(b.sender_mobile),
            receiver_city: b.receiver_city,
            receiver_state: b.receiver_state,
            receiver_mobile_masked: maskPhone(b.receiver_mobile),
            payment_type: b.payment_type,
            created_at: b.created_at,
            events: s?.tracking_events
              ? s.tracking_events.map((e) => ({
                  id: e.id,
                  status: e.status,
                  raw_status: e.raw_status,
                  location: e.location,
                  occurred_at: e.occurred_at,
                }))
              : [
                  {
                    status: b.status,
                    raw_status: "Shipment intake in progress",
                    location: b.sender_city,
                    occurred_at: b.created_at,
                  },
                ],
          },
        });
      }

      // If multiple matches, return privacy-masked list (§26-27)
      return NextResponse.json({
        found: true,
        type: "MULTIPLE",
        results: bookings.map((b) => ({
          booking_number: b.booking_number,
          awb_masked: maskAwb(b.shipment?.awb),
          courier_name: b.shipment?.courier_partner.name || "Assigned Partner",
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
      { error: "Please provide either ?awb=..., ?booking_id=..., or ?mobile=...&pincode=..." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Public Tracking API Error:", error);
    return NextResponse.json({ error: "Tracking query failed" }, { status: 500 });
  }
}
