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
    const format = req.nextUrl.searchParams.get("format") || "json";

    // ── CSV Export Mode ──────────────────────────────────────────────────────
    if (format === "csv") {
      let headers: string[] = [];
      let rows: string[] = [];

      if (reportType === "BOOKINGS") {
        const bookings = await prisma.booking.findMany({
          orderBy: { created_at: "desc" },
          take: 1000,
          include: {
            customer: { select: { name: true, mobile: true } },
            shipment: { select: { awb: true, status: true, courier_partner: { select: { name: true } } } },
            charges: { select: { total: true } },
          },
        });
        headers = ["Booking ID", "Date", "Customer", "Mobile", "Origin", "Destination", "Payment Type", "COD Amount (₹)", "Shipping Charge (₹)", "Courier", "AWB", "Status"];
        rows = bookings.map((b) =>
          [
            b.booking_number,
            new Date(b.created_at).toLocaleDateString("en-IN"),
            b.customer?.name || b.sender_name,
            b.customer?.mobile || b.sender_mobile,
            `${b.sender_city} ${b.sender_pincode}`,
            `${b.receiver_city} ${b.receiver_pincode}`,
            b.payment_type,
            b.payment_type === "COD" ? (b.cod_amount / 100).toFixed(2) : "0",
            b.charges ? (b.charges.total / 100).toFixed(2) : "",
            b.shipment?.courier_partner?.name || "",
            b.shipment?.awb || "",
            b.shipment?.status || b.status,
          ]
            .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
            .join(",")
        );
      } else if (reportType === "SHIPMENTS") {
        const shipments = await prisma.shipment.findMany({
          orderBy: { created_at: "desc" },
          take: 1000,
          include: {
            booking: { select: { booking_number: true, sender_city: true, receiver_city: true } },
            courier_partner: { select: { name: true } },
          },
        });
        headers = ["AWB", "Booking ID", "Courier", "Origin", "Destination", "Status", "Created At"];
        rows = shipments.map((s) =>
          [
            s.awb,
            s.booking?.booking_number || "",
            s.courier_partner?.name || "",
            s.booking?.sender_city || "",
            s.booking?.receiver_city || "",
            s.status,
            new Date(s.created_at).toLocaleDateString("en-IN"),
          ]
            .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
            .join(",")
        );
      } else if (reportType === "COD") {
        const codBookings = await prisma.booking.findMany({
          where: { payment_type: "COD" },
          orderBy: { created_at: "desc" },
          take: 1000,
          include: {
            customer: { select: { name: true } },
            shipment: { select: { awb: true, status: true, courier_partner: { select: { name: true } } } },
          },
        });
        headers = ["Booking ID", "Date", "Customer", "COD Amount (₹)", "Courier", "AWB", "Shipment Status"];
        rows = codBookings.map((b) =>
          [
            b.booking_number,
            new Date(b.created_at).toLocaleDateString("en-IN"),
            b.customer?.name || b.sender_name,
            (b.cod_amount / 100).toFixed(2),
            b.shipment?.courier_partner?.name || "",
            b.shipment?.awb || "",
            b.shipment?.status || b.status,
          ]
            .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
            .join(",")
        );
      } else {
        headers = ["Info"];
        rows = [`"Export for '${reportType}' report type not yet available."`];
      }

      const csv = [headers.map((h) => `"${h}"`).join(","), ...rows].join("\n");
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="ss-courier-${reportType.toLowerCase()}-report.csv"`,
        },
      });
    }

    // ── JSON Summary Mode (existing) ─────────────────────────────────────────
    const totalBookings = await prisma.booking.count();
    const requestedBookings = await prisma.booking.count({ where: { status: "REQUESTED" } });
    const approvedBookings = await prisma.booking.count({ where: { status: "APPROVED" } });
    const totalShipments = await prisma.shipment.count();
    const deliveredShipments = await prisma.shipment.count({ where: { status: "DELIVERED" } });
    const inTransitShipments = await prisma.shipment.count({ where: { status: "IN_TRANSIT" } });

    const charges = await prisma.bookingCharge.aggregate({
      _sum: {
        shipping_charge: true,
        additional_charge: true,
        tax: true,
        discount: true,
        total: true,
      },
    });

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

