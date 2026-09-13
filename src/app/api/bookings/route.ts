import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const searchParams = req.nextUrl.searchParams;

    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const customer_id = searchParams.get("customer_id");
    const limit = parseInt(searchParams.get("limit") || "50");

    const whereClause: any = {};

    // If customer, restrict to their customer ID
    if (session?.role === "CUSTOMER" && session.customerId) {
      whereClause.customer_id = session.customerId;
    } else if (customer_id) {
      whereClause.customer_id = customer_id;
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
        customer: true,
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

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleUpper = (session.role || "").toUpperCase();
    const isAdmin = roleUpper === "SUPER_ADMIN" || roleUpper === "ADMIN";
    if (!isAdmin && !hasPermission(session, "booking.delete")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let bookingId = req.nextUrl.searchParams.get("id");
    if (!bookingId) {
      try {
        const body = await req.json();
        bookingId = body.id || body.booking_number;
      } catch {}
    }

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingId }, { booking_number: bookingId }],
      },
      include: {
        shipment: {
          include: {
            cod_transaction: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      if (booking.shipment) {
        if (booking.shipment.cod_transaction) {
          await tx.codTransaction.delete({
            where: { id: booking.shipment.cod_transaction.id },
          }).catch(() => {});
        }
        await tx.shipmentTrackingEvent.deleteMany({
          where: { shipment_id: booking.shipment.id },
        }).catch(() => {});
        await tx.courierApiLog.deleteMany({
          where: { shipment_id: booking.shipment.id },
        }).catch(() => {});
        await tx.shipment.delete({
          where: { id: booking.shipment.id },
        }).catch(() => {});
      }

      await tx.payment.deleteMany({
        where: { booking_id: booking.id },
      }).catch(() => {});
      await tx.bookingCharge.deleteMany({
        where: { booking_id: booking.id },
      }).catch(() => {});
      await tx.bookingParcel.deleteMany({
        where: { booking_id: booking.id },
      }).catch(() => {});
      await tx.activityLog.deleteMany({
        where: { entity_type: "BOOKING", entity_id: booking.id },
      }).catch(() => {});
      await tx.supportTicket.deleteMany({
        where: { booking_id: booking.id },
      }).catch(() => {});

      await tx.booking.delete({
        where: { id: booking.id },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Booking ${booking.booking_number} deleted successfully`,
    });
  } catch (error: any) {
    console.error("Booking Delete Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete booking" },
      { status: 500 }
    );
  }
}

