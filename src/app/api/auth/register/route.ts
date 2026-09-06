import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  RegisterInputSchema,
  hashPassword,
  signToken,
  setAuthCookie,
  SessionUser,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = RegisterInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { name, email, mobile, password, account_type, gstin } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { mobile }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email or mobile number already exists" },
        { status: 409 }
      );
    }

    // Fetch or create CUSTOMER role
    let customerRole = await prisma.role.findFirst({
      where: { name: "CUSTOMER" },
    });

    if (!customerRole) {
      customerRole = await prisma.role.create({
        data: {
          name: "CUSTOMER",
          is_system_role: true,
        },
      });
    }

    const password_hash = await hashPassword(password);

    // Create user and customer profile in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          mobile,
          password_hash,
          role_id: customerRole.id,
          status: "ACTIVE",
        },
      });

      const customer = await tx.customer.create({
        data: {
          user_id: user.id,
          name,
          email,
          mobile,
          account_type: account_type as "INDIVIDUAL" | "BUSINESS",
          gstin: account_type === "BUSINESS" ? gstin : null,
          status: "ACTIVE",
        },
      });

      return { user, customer };
    });

    const sessionPayload: SessionUser = {
      id: newUser.user.id,
      name: newUser.user.name,
      email: newUser.user.email,
      mobile: newUser.user.mobile,
      role: "CUSTOMER",
      permissions: ["booking.create", "booking.view"],
      accountType: newUser.customer.account_type,
      customerId: newUser.customer.id,
    };

    const token = signToken(sessionPayload);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: sessionPayload,
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
