import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const ResetPasswordSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  code: z.string().min(4, "Verification code is required"),
  new_password: z.string().min(8, "New password must be at least 8 characters long"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = ResetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { identifier, new_password } = validation.data;
    const cleanId = identifier.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanId }, { mobile: cleanId }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found matching this user" },
        { status: 404 }
      );
    }

    // Generate new bcrypt hash
    const newHash = await hashPassword(new_password);

    // Update password hash in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: newHash,
        updated_at: new Date(),
      },
    });

    try {
      await prisma.activityLog.create({
        data: {
          actor_id: user.id,
          action: "auth.password_reset_completed",
          entity_type: "USER",
          entity_id: user.id,
          after: { updated_at: new Date().toISOString() },
        },
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: "Password reset successful. You can now log in with your new password.",
    });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
