import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";

const AddressInputSchema = z.object({
  label: z.string().min(1, "Address label is required (e.g., Office, Home, Warehouse)"),
  contact_name: z.string().optional().nullable(),
  contact_mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number")
    .optional()
    .nullable()
    .or(z.literal("")),
  contact_email: z
    .string()
    .email("Invalid email address format")
    .optional()
    .nullable()
    .or(z.literal("")),
  address: z.string().min(5, "Street address must be at least 5 characters"),
  landmark: z.string().optional().nullable(),
  city: z.string().min(2, "City is required"),
  district: z.string().optional().nullable(),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be a 6-digit Indian postal code"),
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

    const customer = await resolveCustomer(session.id, session.mobile, session.name, session.email);

    const addresses = await prisma.customerAddress.findMany({
      where: { customer_id: customer.id },
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

    const body = await req.json();
    const validation = AddressInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const customer = await resolveCustomer(session.id, session.mobile, session.name, session.email);
    const data = validation.data;

    // Check existing count
    const existingCount = await prisma.customerAddress.count({
      where: { customer_id: customer.id },
    });

    // Make default if it's the first address or requested
    const shouldBeDefault = existingCount === 0 || !!data.is_default;

    const result = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.customerAddress.updateMany({
          where: { customer_id: customer.id },
          data: { is_default: false },
        });
      }

      return tx.customerAddress.create({
        data: {
          customer_id: customer.id,
          label: data.label.trim(),
          contact_name: data.contact_name?.trim() || null,
          contact_mobile: data.contact_mobile?.trim() || null,
          contact_email: data.contact_email?.trim() || null,
          address: data.address.trim(),
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
