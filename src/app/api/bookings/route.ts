import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const searchParams = req.nextUrl.searchParams;

    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    const whereClause: any = {};

    // If customer, restrict to their customer ID
    if (session?.role === "CUSTOMER" && session.customerId) {
      whereClause.customer_id = session.customerId;
    }

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { booking_number: { contains: search } },
        { receiver_name: { contains: search } },
        { sender_city: { contains: search } },
        { receiver_city: { contains: search } },
        { shipment: { awb: { contains: search } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        parcels: true,
        charges: true,
        shipment: {
          include: {
            courier_partner: true,
            tracking_events: {
              orderBy: { occurred_at: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: limit,
    });

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error("Fetch Bookings Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve bookings" },
      { status: 500 }
    );
  }
}
