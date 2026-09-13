import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasPermission } from "@/lib/auth";

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
        parcels: true,
        charges: true,
        customer: true,
        shipment: {
          include: {
            courier_partner: true,
            tracking_events: {
              orderBy: { occurred_at: "desc" },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    if (!isAdmin && !hasPermission(session, "booking.delete")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const bookingId = params.id;
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
      // 1. Clean up shipment & children
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

      // 2. Clean up child records
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

      // 3. Delete Booking
      await tx.booking.delete({
        where: { id: booking.id },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Booking ${booking.booking_number} deleted successfully`,
    });
  } catch (error: any) {
    console.error("Booking Deletion Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete booking" },
      { status: 500 }
    );
  }
}
