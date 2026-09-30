import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "customer.view")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const searchQuery = req.nextUrl.searchParams.get("q") || "";
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "100"), 200);

    const customers = await prisma.customer.findMany({
      where: searchQuery
        ? {
            OR: [
              { name: { contains: searchQuery } },
              { mobile: { contains: searchQuery } },
              { email: { contains: searchQuery } },
            ],
          }
        : undefined,
      orderBy: { created_at: "desc" },
      take: limit,
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return NextResponse.json({ customers });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch customers", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (!hasPermission(session, "customer.create") && !hasPermission(session, "booking.create"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, mobile, email, account_type, gstin } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
    }
    if (!mobile || !mobile.trim()) {
      return NextResponse.json({ error: "Customer mobile number is required" }, { status: 400 });
    }

    const cleanedMobile = mobile.replace(/\D/g, "").slice(-10);
    if (cleanedMobile.length !== 10) {
      return NextResponse.json({ error: "Valid 10-digit mobile number is required" }, { status: 400 });
    }

    // Check if customer already exists with this mobile
    const existing = await prisma.customer.findFirst({
      where: { mobile: cleanedMobile },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Customer already exists with this mobile number",
        customer: existing,
      });
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        mobile: cleanedMobile,
        email: email?.trim() || null,
        account_type: account_type === "BUSINESS" ? "BUSINESS" : "INDIVIDUAL",
        gstin: gstin?.trim() || null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Customer created successfully",
      customer,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create customer", details: error.message },
      { status: 500 }
    );
  }
}

