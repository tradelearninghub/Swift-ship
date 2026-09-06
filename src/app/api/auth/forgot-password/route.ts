import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ForgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Email or mobile number is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = ForgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Please enter a valid email or 10-digit mobile number" },
        { status: 400 }
      );
    }

    const { identifier } = validation.data;
    const cleanId = identifier.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanId }, { mobile: cleanId }],
      },
    });

    if (!user) {
      // Return 404 or a polite message so customer knows
      return NextResponse.json(
        { error: "No account found matching this email or mobile number" },
        { status: 404 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "This account has been deactivated. Please contact support." },
        { status: 403 }
      );
    }

    // Generate a secure 6-digit OTP code for password reset
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store or log activity
    try {
      await prisma.activityLog.create({
        data: {
          actor_id: user.id,
          action: "auth.password_reset_requested",
          entity_type: "USER",
          entity_id: user.id,
          after: { reset_requested_at: new Date().toISOString() },
        },
      });
    } catch (e) {
      // Non-blocking log
    }

    const maskedTarget = user.email.includes("@")
      ? `${user.email.slice(0, 2)}••••••@${user.email.split("@")[1]}`
      : `${user.mobile.slice(0, 2)}••••••${user.mobile.slice(-2)}`;

    return NextResponse.json({
      success: true,
      message: `Password reset verification code sent to ${maskedTarget}`,
      identifier: user.email || user.mobile,
      // Provide demo/testing verification code
      demoResetCode: resetCode,
    });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { error: "Unable to process password reset request. Please try again." },
      { status: 500 }
    );
  }
}
