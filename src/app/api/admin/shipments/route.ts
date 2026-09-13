import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "shipment.view")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const searchQuery = req.nextUrl.searchParams.get("q") || "";
    const statusFilter = req.nextUrl.searchParams.get("status") || "";
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "100"), 200);

    const where: any = {};

    if (statusFilter && statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    if (searchQuery) {
      where.OR = [
        { awb: { contains: searchQuery } },
        { booking: { booking_number: { contains: searchQuery } } },
        { booking: { receiver_name: { contains: searchQuery } } },
        { courier_partner: { name: { contains: searchQuery } } },
      ];
    }

    const shipments = await prisma.shipment.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: limit,
      include: {
        booking: {
          select: {
            id: true,
            booking_number: true,
            sender_name: true,
            sender_city: true,
            receiver_name: true,
            receiver_city: true,
            payment_type: true,
            cod_amount: true,
          },
        },
        courier_partner: {
          select: { id: true, name: true, code: true },
        },
        tracking_events: {
          orderBy: { occurred_at: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({ shipments });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch shipments", details: error.message },
      { status: 500 }
    );
  }
}
