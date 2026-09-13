import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";

const BookingCreateSchema = z.object({
  // Customer identity (optional separate customer from sender)
  customer_name: z.string().optional(),
  customer_mobile: z.string().optional(),

  // Sender Details
  sender_name: z.string().min(2, "Sender name required"),
  sender_mobile: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile required"),
  sender_email: z.string().email().optional().or(z.literal("")),
  sender_address: z.string().min(5, "Full address required"),
  sender_landmark: z.string().optional(),
  sender_city: z.string().min(2, "City required"),
  sender_district: z.string().optional(),
  sender_state: z.string().min(2, "State required"),
  sender_pincode: z.string().regex(/^\d{6}$/, "Valid 6-digit pincode required"),

  // Receiver Details
  receiver_name: z.string().min(2, "Receiver name required"),
  receiver_mobile: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile required"),
  receiver_email: z.string().email().optional().or(z.literal("")),
  receiver_address: z.string().min(5, "Full delivery address required"),
  receiver_landmark: z.string().optional(),
  receiver_city: z.string().min(2, "City required"),
  receiver_district: z.string().optional(),
  receiver_state: z.string().min(2, "State required"),
  receiver_pincode: z.string().regex(/^\d{6}$/, "Valid 6-digit pincode required"),

  // Parcel Details
  parcel_type: z.string().min(2, "Parcel category required"),
  description: z.string().min(3, "Description required"),
  submitted_weight_grams: z.number().int().positive("Weight must be greater than 0"),
  submitted_length_cm: z.number().int().positive(),
  submitted_width_cm: z.number().int().positive(),
  submitted_height_cm: z.number().int().positive(),
  declared_value_paise: z.number().int().nonnegative(),

  // Payment
  payment_type: z.enum(["PREPAID", "COD"]),
  cod_amount_paise: z.number().int().nonnegative().default(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = BookingCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const session = await getSessionUser();

    // 1. Link Booking to Existing Customer by Mobile Number (§9)
    // Works across all sources: public web, staff manual booking, or authenticated customer
    const mobileToMatch = (data.customer_mobile || data.sender_mobile).trim();
    const nameToMatch = (data.customer_name || data.sender_name).trim();

    let customerId: string;

    const existingCustomer = await prisma.customer.findFirst({
      where: { mobile: mobileToMatch },
    });

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const createdCustomer = await prisma.customer.create({
        data: {
          name: nameToMatch,
          mobile: mobileToMatch,
          email: data.sender_email || null,
          status: "ACTIVE",
          account_type: "INDIVIDUAL",
        },
      });
      customerId = createdCustomer.id;
    }

    // Determine creator user ID (foreign key to users table)
    let createdById = session?.id;
    if (createdById) {
      const validUser = await prisma.user.findUnique({
        where: { id: createdById },
        select: { id: true },
      });
      if (!validUser) createdById = undefined;
    }

    if (!createdById) {
      const defaultAdmin = await prisma.user.findFirst({
        where: { role: { name: { in: ["SUPER_ADMIN", "ADMIN", "Super Admin", "Admin"] } } },
        select: { id: true },
      });
      createdById = defaultAdmin?.id;
    }

    // Fallback if no admin in DB
    if (!createdById) {
      const anyUser = await prisma.user.findFirst({ select: { id: true } });
      createdById = anyUser?.id || customerId;
    }

    // Generate human-readable booking number (e.g. BK-1035)
    const count = await prisma.booking.count();
    const bookingNumber = `BK-${1000 + count + 1}`;

    const newBooking = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          booking_number: bookingNumber,
          customer_id: customerId,
          source: session?.role ? "STAFF" : "CUSTOMER",
          created_by: createdById!,
          status: "REQUESTED",
          payment_type: data.payment_type,
          cod_amount: data.payment_type === "COD" ? data.cod_amount_paise : 0,

          // Sender Snapshot frozen at booking time (§73, §10, §11)
          sender_name: data.sender_name,
          sender_mobile: data.sender_mobile,
          sender_email: data.sender_email || null,
          sender_address: data.sender_address,
          sender_landmark: data.sender_landmark || null,
          sender_city: data.sender_city,
          sender_district: data.sender_district || null,
          sender_state: data.sender_state,
          sender_pincode: data.sender_pincode,

          // Receiver Snapshot frozen at booking time (§75, §10, §11)
          receiver_name: data.receiver_name,
          receiver_mobile: data.receiver_mobile,
          receiver_email: data.receiver_email || null,
          receiver_address: data.receiver_address,
          receiver_landmark: data.receiver_landmark || null,
          receiver_city: data.receiver_city,
          receiver_district: data.receiver_district || null,
          receiver_state: data.receiver_state,
          receiver_pincode: data.receiver_pincode,
        },
      });

      const parcel = await tx.bookingParcel.create({
        data: {
          booking_id: booking.id,
          parcel_type: data.parcel_type,
          description: data.description,
          submitted_weight_grams: data.submitted_weight_grams,
          submitted_length_cm: data.submitted_length_cm,
          submitted_width_cm: data.submitted_width_cm,
          submitted_height_cm: data.submitted_height_cm,
          declared_value: data.declared_value_paise,
        },
      });

      // Audit log entry
      await tx.activityLog.create({
        data: {
          actor_id: createdById,
          action: "booking.created",
          entity_type: "BOOKING",
          entity_id: booking.id,
          after: {
            booking_number: booking.booking_number,
            payment_type: booking.payment_type,
            cod_amount: booking.cod_amount,
            customer_id: customerId,
          },
        },
      });

      return { booking, parcel };
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: newBooking.booking.id,
        booking_number: newBooking.booking.booking_number,
        status: newBooking.booking.status,
        customer_id: customerId,
      },
    });
  } catch (error: any) {
    console.error("Booking Creation Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during booking creation" },
      { status: 500 }
    );
  }
}
