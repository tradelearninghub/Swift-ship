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
