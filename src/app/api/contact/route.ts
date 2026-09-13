import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRealEmail } from "@/lib/email";
import { z } from "zod";

const ContactFormSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  subject: z.string().optional().default("Website Contact Inquiry"),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = ContactFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { name, email, mobile, subject, message } = validation.data;

    // 1. Resolve or create a User record to satisfy SupportTicket.raised_by foreign key
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { mobile }],
      },
    });

    if (!user) {
      // Find Customer role
      let role = await prisma.role.findFirst({
        where: { name: "CUSTOMER" },
      });

      if (!role) {
        role = await prisma.role.findFirst({
          where: { is_system_role: true },
        });
      }

      if (role) {
        try {
          user = await prisma.user.create({
            data: {
              name,
              email,
              mobile,
              password_hash: "$2a$10$NotAValidPasswordHashForGuestSubmissions123",
              role_id: role.id,
              status: "ACTIVE",
            },
          });
        } catch {
          // If creation fails due to duplicate race condition, fetch existing
          user = await prisma.user.findFirst({
            where: { OR: [{ email }, { mobile }] },
          });
        }
      }
    }

    // Fallback: If still no user, find any admin user to associate the ticket
    if (!user) {
      user = await prisma.user.findFirst();
    }

    if (!user) {
      return NextResponse.json(
        { error: "Database setup required before receiving messages" },
        { status: 500 }
      );
    }

    // 2. Persist SupportTicket record
    const ticket = await prisma.supportTicket.create({
      data: {
        raised_by: user.id,
        type: "OTHER",
        status: "OPEN",
        subject: `[Contact Form] ${subject}`,
        description: `Website Contact Form Submission\n\nName: ${name}\nMobile: ${mobile}\nEmail: ${email}\n\nMessage:\n${message}`,
      },
    });

    const ticketNumber = `TKT-${ticket.id.slice(0, 8).toUpperCase()}`;

    // 3. Dispatch confirmation/notification email if possible (non-blocking)
    try {
      sendRealEmail({
        to: email,
        subject: `We have received your inquiry [${ticketNumber}] — SS Courier service`,
        text: `Hello ${name},\n\nThank you for contacting SS Courier service. We have received your inquiry and our support team will respond promptly.\n\nTicket Reference: ${ticketNumber}\nSubject: ${subject}\n\nWarm regards,\nSS Courier service Support Team`,
      }).catch((err) => {
        console.warn("[CONTACT-EMAIL] Non-blocking acknowledgment mail error:", err.message);
      });
    } catch {
      // Ignore background email failures
    }

    return NextResponse.json({
      success: true,
      ticket_number: ticketNumber,
      message: "Your message has been sent successfully. We will be in touch shortly.",
    });
  } catch (error: any) {
    console.error("Contact Form Submission Error:", error);
    return NextResponse.json(
      { error: "Failed to submit message. Please try again or contact our helpline." },
      { status: 500 }
    );
  }
}
