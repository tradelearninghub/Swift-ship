import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  LoginInputSchema,
  verifyPassword,
  signToken,
  setAuthCookie,
  SessionUser,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = LoginInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { identifier, password } = validation.data;

    // Find user by email or mobile
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { mobile: identifier }],
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        permission_overrides: {
          include: {
            permission: true,
          },
        },
        customer_profile: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Invalid credentials or disabled account" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Build permissions list (role permissions + overrides)
    const rolePermissions = user.role.permissions.map((rp) => rp.permission.key);
    const overridesGranted = user.permission_overrides
      .filter((o) => o.granted)
      .map((o) => o.permission.key);
    const overridesDenied = new Set(
      user.permission_overrides.filter((o) => !o.granted).map((o) => o.permission.key)
    );

    const effectivePermissions = Array.from(
      new Set([...rolePermissions, ...overridesGranted])
    ).filter((p) => !overridesDenied.has(p));

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    const sessionPayload: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role.name,
      permissions: effectivePermissions,
      accountType: user.customer_profile?.account_type,
      customerId: user.customer_profile?.id,
    };

    const token = signToken(sessionPayload);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: sessionPayload,
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}
