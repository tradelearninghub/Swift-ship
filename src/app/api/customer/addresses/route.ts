import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";

const AddressInputSchema = z.object({
  customer_id: z.string().optional(),
  label: z.string().min(1, "Address label is required (e.g., Office, Home, Warehouse)"),
  source: z.enum(["CUSTOMER", "ADMIN"]).optional(),
  type: z.enum(["SENDER", "RECEIVER", "GENERAL"]).optional(),
  contact_name: z.string().optional().nullable(),
  contact_mobile: z.string().optional().nullable().or(z.literal("")),
  contact_email: z
    .string()
    .email("Invalid email address format")
    .optional()
    .nullable()
    .or(z.literal("")),
  country: z.string().optional().default("India"),
  address: z.string().min(3, "Street address is required"),
  address_line_2: z.string().optional().nullable(),
  address_line_3: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  city: z.string().min(1, "City is required"),
  district: z.string().optional().nullable(),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Postal / ZIP Code is required"),
  is_default: z.boolean().optional().default(false),
});

async function resolveCustomer(userId: string, mobile: string, name?: string, email?: string) {
  let customer = await prisma.customer.findFirst({
    where: {
      OR: [{ user_id: userId }, { mobile }],
    },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        user_id: userId,
        name: name || "Customer",
        mobile,
        email: email || null,
        status: "ACTIVE",
        account_type: "INDIVIDUAL",
      },
    });
  } else if (!customer.user_id && userId) {
    // Link customer to user if not previously linked
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { user_id: userId },
    });
  }

  return customer;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const roleUpper = (session.role || "").toUpperCase();
    const isStaffOrAdmin = roleUpper === "SUPER_ADMIN" || roleUpper === "ADMIN" || roleUpper === "STAFF";

    const requestedCustomerId = req.nextUrl.searchParams.get("customer_id");
    const addressWhere: any = {};

    if (isStaffOrAdmin && requestedCustomerId) {
      // Admin/Staff querying a customer's address book: return BOTH CUSTOMER & ADMIN added addresses (§5)
      addressWhere.customer_id = requestedCustomerId;
    } else {
      // Customer self-service portal: only return addresses with source = "CUSTOMER" (§5)
      const customer = await resolveCustomer(session.id, session.mobile, session.name, session.email);
      addressWhere.customer_id = customer.id;
      addressWhere.source = "CUSTOMER";
    }

    const addresses = await prisma.customerAddress.findMany({
      where: addressWhere,
      orderBy: [
        { is_default: "desc" },
        { updated_at: "desc" },
      ],
    });

    return NextResponse.json({ addresses });
  } catch (error: any) {
    console.error("GET /api/customer/addresses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const roleUpper = (session.role || "").toUpperCase();
    const isStaffOrAdmin = roleUpper === "SUPER_ADMIN" || roleUpper === "ADMIN" || roleUpper === "STAFF";

    const body = await req.json();
    const validation = AddressInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;
    let targetCustomerId: string;

    if (isStaffOrAdmin && data.customer_id) {
      targetCustomerId = data.customer_id;
    } else {
      const customer = await resolveCustomer(session.id, session.mobile, session.name, session.email);
      targetCustomerId = customer.id;
    }

    // Determine source: If added by staff/admin, mark as ADMIN (§5), else CUSTOMER
    const addressSource = isStaffOrAdmin ? (data.source || "ADMIN") : "CUSTOMER";

    // Check existing count
    const existingCount = await prisma.customerAddress.count({
      where: { customer_id: targetCustomerId },
    });

    // Make default if it's the first address or requested
    const shouldBeDefault = existingCount === 0 || !!data.is_default;

    const result = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.customerAddress.updateMany({
          where: { customer_id: targetCustomerId },
          data: { is_default: false },
        });
      }

      return tx.customerAddress.create({
        data: {
          customer_id: targetCustomerId,
          label: data.label.trim(),
          source: addressSource,
          type: data.type || "GENERAL",
          contact_name: data.contact_name?.trim() || null,
          contact_mobile: data.contact_mobile?.trim() || null,
          contact_email: data.contact_email?.trim() || null,
          country: data.country?.trim() || "India",
          address: data.address.trim(),
          address_line_2: data.address_line_2?.trim() || null,
          address_line_3: data.address_line_3?.trim() || null,
          landmark: data.landmark?.trim() || null,
          city: data.city.trim(),
          district: data.district?.trim() || null,
          state: data.state.trim(),
          pincode: data.pincode.trim(),
          is_default: shouldBeDefault,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Address saved successfully",
      address: result,
    });
  } catch (error: any) {
    console.error("POST /api/customer/addresses error:", error);
    return NextResponse.json(
      { error: "Failed to save address", details: error.message },
      { status: 500 }
    );
  }
}
