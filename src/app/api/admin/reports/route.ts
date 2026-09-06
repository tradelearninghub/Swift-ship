import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "reports.view")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const reportType = req.nextUrl.searchParams.get("type") || "SUMMARY";

    // 1. Total counts
    const totalBookings = await prisma.booking.count();
    const requestedBookings = await prisma.booking.count({ where: { status: "REQUESTED" } });
    const approvedBookings = await prisma.booking.count({ where: { status: "APPROVED" } });
    const totalShipments = await prisma.shipment.count();
    const deliveredShipments = await prisma.shipment.count({ where: { status: "DELIVERED" } });
    const inTransitShipments = await prisma.shipment.count({ where: { status: "IN_TRANSIT" } });

    // 2. Financials in paise
    const charges = await prisma.bookingCharge.aggregate({
      _sum: {
        shipping_charge: true,
        additional_charge: true,
        tax: true,
        discount: true,
        total: true,
      },
    });

    // 3. Couriers active count
    const couriers = await prisma.courierPartner.findMany({
      include: {
        _count: {
          select: { shipments: true },
        },
      },
    });

    return NextResponse.json({
      summary: {
        totalBookings,
        requestedBookings,
        approvedBookings,
        totalShipments,
        deliveredShipments,
        inTransitShipments,
        totalRevenuePaise: charges._sum.total || 0,
        totalShippingPaise: charges._sum.shipping_charge || 0,
        totalTaxPaise: charges._sum.tax || 0,
        courierPerformance: couriers.map((c) => ({
          code: c.code,
          name: c.name,
          shipmentsCount: c._count.shipments,
          status: c.status,
        })),
      },
    });
  } catch (error: any) {
    console.error("Reports API Error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
