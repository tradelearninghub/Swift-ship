import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";

const AddressUpdateSchema = z.object({
  label: z.string().min(1, "Address label is required").optional(),
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
  address: z.string().min(5, "Street address must be at least 5 characters").optional(),
  landmark: z.string().optional().nullable(),
  city: z.string().min(2, "City is required").optional(),
  district: z.string().optional().nullable(),
  state: z.string().min(2, "State is required").optional(),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be a 6-digit Indian postal code").optional(),
  is_default: z.boolean().optional(),
});

async function getAuthenticatedCustomer(userId: string, mobile: string) {
  return prisma.customer.findFirst({
    where: {
      OR: [{ user_id: userId }, { mobile }],
    },
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const customer = await getAuthenticatedCustomer(session.id, session.mobile);
    if (!customer) {
      return NextResponse.json({ error: "Customer record not found" }, { status: 404 });
    }

    const addressId = params.id;
    const existing = await prisma.customerAddress.findUnique({
      where: { id: addressId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Security check: Verify address belongs to this customer
    if (existing.customer_id !== customer.id) {
      return NextResponse.json({ error: "Forbidden: You do not have access to this address" }, { status: 403 });
    }

    const body = await req.json();
    const validation = AddressUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const updated = await prisma.$transaction(async (tx) => {
      if (data.is_default) {
        await tx.customerAddress.updateMany({
          where: {
            customer_id: customer.id,
            id: { not: addressId },
          },
          data: { is_default: false },
        });
      }

      return tx.customerAddress.update({
        where: { id: addressId },
        data: {
          ...(data.label !== undefined ? { label: data.label.trim() } : {}),
          ...(data.contact_name !== undefined ? { contact_name: data.contact_name?.trim() || null } : {}),
          ...(data.contact_mobile !== undefined ? { contact_mobile: data.contact_mobile?.trim() || null } : {}),
          ...(data.contact_email !== undefined ? { contact_email: data.contact_email?.trim() || null } : {}),
          ...(data.address !== undefined ? { address: data.address.trim() } : {}),
          ...(data.landmark !== undefined ? { landmark: data.landmark?.trim() || null } : {}),
          ...(data.city !== undefined ? { city: data.city.trim() } : {}),
          ...(data.district !== undefined ? { district: data.district?.trim() || null } : {}),
          ...(data.state !== undefined ? { state: data.state.trim() } : {}),
          ...(data.pincode !== undefined ? { pincode: data.pincode.trim() } : {}),
          ...(data.is_default !== undefined ? { is_default: data.is_default } : {}),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      address: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/customer/addresses/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update address", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const customer = await getAuthenticatedCustomer(session.id, session.mobile);
    if (!customer) {
      return NextResponse.json({ error: "Customer record not found" }, { status: 404 });
    }

    const addressId = params.id;
    const existing = await prisma.customerAddress.findUnique({
      where: { id: addressId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Security check: Verify address belongs to this customer
    if (existing.customer_id !== customer.id) {
      return NextResponse.json({ error: "Forbidden: You do not have access to this address" }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.customerAddress.delete({
        where: { id: addressId },
      });

      // If the deleted address was default, promote the newest remaining address to default
      if (existing.is_default) {
        const remaining = await tx.customerAddress.findFirst({
          where: { customer_id: customer.id },
          orderBy: { updated_at: "desc" },
        });

        if (remaining) {
          await tx.customerAddress.update({
            where: { id: remaining.id },
            data: { is_default: true },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Address removed successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/customer/addresses/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete address", details: error.message },
      { status: 500 }
    );
  }
}
