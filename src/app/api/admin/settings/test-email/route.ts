import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, hasPermission } from "@/lib/auth";
import { sendTestEmail } from "@/lib/email";
import { z } from "zod";

const testEmailSchema = z.object({
  recipientEmail: z.string().email("Please provide a valid recipient email address"),
  host: z.string().optional(),
  port: z.union([z.string(), z.number()]).optional(),
  user: z.string().optional(),
  pass: z.string().optional(),
  fromEmail: z.string().optional(),
  fromName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "settings.manage")) {
      return NextResponse.json({ error: "Unauthorized: Admin settings permission required" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = testEmailSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { recipientEmail, host, port, user, pass, fromEmail, fromName } = parseResult.data;

    const customConfig: any = {};
    if (host) customConfig.host = host;
    if (port) customConfig.port = Number(port);
    if (user) customConfig.user = user;
    if (pass) customConfig.pass = pass;
    if (fromEmail) customConfig.fromEmail = fromEmail;
    if (fromName) customConfig.fromName = fromName;

    // Dispatch real email via identical Nodemailer transport pipeline
    const result = await sendTestEmail(recipientEmail, Object.keys(customConfig).length > 0 ? customConfig : undefined);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "SMTP transport error: Failed to deliver test message",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      recipient: recipientEmail,
      messageId: result.messageId,
      message: `Test email dispatched successfully to ${recipientEmail}`,
    });
  } catch (error: any) {
    console.error("Test Email API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to dispatch test email" },
      { status: 500 }
    );
  }
}
