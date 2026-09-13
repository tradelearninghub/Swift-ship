import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const roleUpper = (session?.role || "").toUpperCase();
    const isAdmin = roleUpper === "SUPER_ADMIN" || roleUpper === "ADMIN";

    if (!session || (!isAdmin && !hasPermission(session, "support.view"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const statusParam = req.nextUrl.searchParams.get("status");
    const whereClause: any = {};
    if (statusParam && statusParam !== "ALL") {
      whereClause.status = statusParam;
    }

    const tickets = await prisma.supportTicket.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
      take: 100,
      include: {
        raiser: { select: { id: true, name: true, email: true, mobile: true } },
        assignee: { select: { id: true, name: true } },
        notes: {
          orderBy: { created_at: "desc" },
          include: { author: { select: { name: true } } },
        },
      },
    });

    // Enrich with booking numbers via separate query
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
      ticket_number: `TKT-${t.id.slice(0, 8).toUpperCase()}`,
      booking_number: t.booking_id ? bookingMap.get(t.booking_id) || null : null,
      raised_by_name: t.raiser?.name || t.raised_by,
      raised_by_email: t.raiser?.email,
      raised_by_mobile: t.raiser?.mobile,
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

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const roleUpper = (session?.role || "").toUpperCase();
    const isAdmin = roleUpper === "SUPER_ADMIN" || roleUpper === "ADMIN";

    if (!session || (!isAdmin && !hasPermission(session, "support.manage"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, note } = body;

    if (!id) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
    }

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
    });

    if (note && note.trim()) {
      let authorId = session.id;
      const validUser = await prisma.user.findUnique({ where: { id: authorId }, select: { id: true } });
      if (!validUser) {
        const anyAdmin = await prisma.user.findFirst({ select: { id: true } });
        authorId = anyAdmin?.id || authorId;
      }

      await prisma.supportTicketNote.create({
        data: {
          ticket_id: id,
          author_id: authorId,
          note: note.trim(),
        },
      });
    }

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update ticket" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const roleUpper = (session?.role || "").toUpperCase();
    const isAdmin = roleUpper === "SUPER_ADMIN" || roleUpper === "ADMIN";

    if (!session || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Ticket ID required" }, { status: 400 });
    }

    await prisma.supportTicket.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Ticket deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
