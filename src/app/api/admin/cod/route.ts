import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "cod.view")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Aggregate COD totals
    const codBookingsAgg = await prisma.booking.aggregate({
      where: { payment_type: "COD" },
      _sum: { cod_amount: true },
      _count: { id: true },
    });

    const codSettled = await prisma.codSettlement.aggregate({
      where: { status: "RECONCILED" },
      _sum: { reconciled_amount: true },
    });

    const codPending = await prisma.codSettlement.aggregate({
      where: { status: { not: "RECONCILED" } },
      _sum: { total_amount: true },
    });

    // Fetch recent batches
    const batches = await prisma.codSettlement.findMany({
      orderBy: { created_at: "desc" },
      take: 50,
      include: {
        courier_partner: { select: { name: true } },
        _count: { select: { cod_transactions: true } },
      },
    });

    return NextResponse.json({
      totals: {
        total_cod_dispatched: codBookingsAgg._sum.cod_amount || 0,
        pending_remittance: codPending._sum.total_amount || 0,
        reconciled_paid: codSettled._sum.reconciled_amount || 0,
        total_cod_bookings: codBookingsAgg._count.id || 0,
      },
      batches,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch COD data", details: error.message },
      { status: 500 }
    );
  }
}
