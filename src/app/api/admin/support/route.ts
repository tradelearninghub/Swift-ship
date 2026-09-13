import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "support.view")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const tickets = await prisma.supportTicket.findMany({
      orderBy: { created_at: "desc" },
      take: 100,
      include: {
        raiser: { select: { name: true, email: true } },
        assignee: { select: { name: true } },
      },
    });

    // Enrich with booking numbers via separate query (no direct relation defined)
    const bookingIds = tickets.map((t) => t.booking_id).filter(Boolean) as string[];
    const bookings =
      bookingIds.length > 0
        ? await prisma.booking.findMany({
            where: { id: { in: bookingIds } },
            select: { id: true, booking_number: true },
          })
        : [];

    const bookingMap = new Map(bookings.map((b) => [b.id, b.booking_number]));

    const enriched = tickets.map((t) => ({
      ...t,
      booking_number: t.booking_id ? bookingMap.get(t.booking_id) || null : null,
      raised_by_name: t.raiser?.name || t.raised_by,
      assigned_to_name: t.assignee?.name || t.assigned_to || "Unassigned",
    }));

    return NextResponse.json({ tickets: enriched });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch support tickets", details: error.message },
      { status: 500 }
    );
  }
}

