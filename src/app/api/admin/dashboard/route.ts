import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasPermission } from "@/lib/auth";
import { getStartOfTodayIST } from "@/lib/datetime";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "dashboard.view")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const startOfTodayIST = getStartOfTodayIST();

    const [
      todayBookings,
      newRequests,
      processing,
      inTransit,
      delivered,
      rtoReturns,
      codPending,
      codSettled,
      recentBookings,
    ] = await Promise.all([
      // Today's bookings count (IST day boundary: 00:00:00+05:30)
      prisma.booking.count({
        where: { created_at: { gte: startOfTodayIST } },
      }),
      // New / Requested
      prisma.booking.count({ where: { status: "REQUESTED" } }),
      // Under review or approved (processing)
      prisma.booking.count({
        where: { status: { in: ["UNDER_REVIEW", "APPROVED"] } },
      }),
      // In transit shipments
      prisma.shipment.count({
        where: { status: { in: ["IN_TRANSIT", "OUT_FOR_DELIVERY", "PICKED_UP"] } },
      }),
      // Delivered
      prisma.shipment.count({ where: { status: "DELIVERED" } }),
      // RTO / Returns
      prisma.shipment.count({ where: { status: "RTO" } }),
      // COD pending
      prisma.codSettlement.aggregate({
        where: { status: { not: "RECONCILED" } },
        _sum: { total_amount: true },
      }),
      // COD settled
      prisma.codSettlement.aggregate({
        where: { status: "RECONCILED" },
        _sum: { reconciled_amount: true },
      }),
      // Recent bookings for dashboard table
      prisma.booking.findMany({
        where: { status: "REQUESTED" },
        orderBy: { created_at: "desc" },
        take: 5,
        include: {
          customer: { select: { name: true, mobile: true } },
          parcels: { select: { submitted_weight_grams: true }, take: 1 },
        },
      }),
    ]);

    return NextResponse.json({
      kpis: {
        today_bookings: todayBookings,
        new_requests: newRequests,
        processing,
        in_transit: inTransit,
        delivered,
        rto_returns: rtoReturns,
        cod_pending_paise: codPending._sum.total_amount || 0,
        cod_settled_paise: codSettled._sum.reconciled_amount || 0,
      },
      recent_pending: recentBookings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard data", details: error.message },
      { status: 500 }
    );
  }
}
