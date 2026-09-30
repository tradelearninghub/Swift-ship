import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getUsdToInrRate } from "@/lib/settings";
import { z } from "zod";

const LineItemSchema = z.object({
  name: z.string().min(1, "Item description required"),
  sku: z.string().optional().nullable(),
  quantity: z.number().int().positive().default(1),
  unit_price: z.number().nonnegative().default(0),
  hsn_code: z.string().optional().nullable(),
  tax_rate: z.number().nonnegative().optional().default(0),
  total: z.number().nonnegative().optional().default(0),
});

const BookingCreateSchema = z.object({
  // Shipment Mode & Currency (§1, §3)
  shipment_mode: z.enum(["DOMESTIC", "INTERNATIONAL"]).optional().default("DOMESTIC"),
  currency: z.enum(["INR", "USD"]).optional().default("INR"),
  exchange_rate: z.number().positive().optional(),

  // Customer identity
  customer_name: z.string().optional(),
  customer_mobile: z.string().optional(),

  // Sender Details
  sender_name: z.string().min(2, "Sender name required"),
  sender_mobile: z.string().min(6, "Valid mobile required"),
  sender_email: z.string().email().optional().or(z.literal("")),
  sender_country: z.string().optional().default("India"),
  sender_address: z.string().min(3, "Full address required"),
  sender_address_2: z.string().optional().nullable(),
  sender_address_3: z.string().optional().nullable(),
  sender_landmark: z.string().optional().nullable(),
  sender_city: z.string().min(1, "City required"),
  sender_district: z.string().optional().nullable(),
  sender_state: z.string().min(1, "State required"),
  sender_pincode: z.string().min(2, "Postal/ZIP code required"),

  // Receiver Details
  receiver_name: z.string().min(2, "Receiver name required"),
  receiver_mobile: z.string().min(5, "Valid mobile required"),
  receiver_email: z.string().email().optional().or(z.literal("")),
  receiver_country: z.string().optional().default("India"),
  receiver_address: z.string().min(3, "Full delivery address required"),
  receiver_address_2: z.string().optional().nullable(),
  receiver_address_3: z.string().optional().nullable(),
  receiver_landmark: z.string().optional().nullable(),
  receiver_city: z.string().min(1, "City required"),
  receiver_district: z.string().optional().nullable(),
  receiver_state: z.string().min(1, "State required"),
  receiver_pincode: z.string().min(2, "Postal/ZIP code required"),

  // International Commercial / Customs (§2)
  invoice_number: z.string().optional().nullable(),
  invoice_date: z.string().optional().nullable(),
  service_type: z.string().optional().nullable(),
  ioss_number: z.string().optional().nullable(),
  line_items: z.array(LineItemSchema).optional().nullable(),

  // Parcel Details
  parcel_type: z.string().min(2, "Parcel category required"),
  description: z.string().min(3, "Description required"),
  submitted_weight_grams: z.number().int().positive("Weight must be greater than 0"),
  submitted_length_cm: z.number().int().positive(),
  submitted_width_cm: z.number().int().positive(),
  submitted_height_cm: z.number().int().positive(),
  declared_value_paise: z.number().int().nonnegative(),

  // Payment
  payment_type: z.enum(["PREPAID", "COD"]).default("PREPAID"),
  cod_amount_paise: z.number().int().nonnegative().default(0),

  // Address Book persistence (§Customer Saved Address Book, §5)
  save_sender_address: z.boolean().optional(),
  sender_address_label: z.string().optional(),
  save_receiver_address: z.boolean().optional(),
  receiver_address_label: z.string().optional(),
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
    const isStaffOrAdmin = !!(session?.role && (session.role as string).toUpperCase() !== "CUSTOMER");

    // Currency & Exchange Rate Handling (§3)
    const currency = data.currency || "INR";
    const refRate = await getUsdToInrRate();
    const exchangeRate = currency === "USD" ? (data.exchange_rate || refRate) : 1.0;

    // Calculate declared value in INR paise
    const declaredValueOriginal = data.declared_value_paise;
    const declaredValueInr = currency === "USD"
      ? Math.round(declaredValueOriginal * exchangeRate)
      : declaredValueOriginal;

    // 1. Link Booking to Existing Customer by Mobile Number (§9)
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

    if (!createdById) {
      const anyUser = await prisma.user.findFirst({ select: { id: true } });
      createdById = anyUser?.id || customerId;
    }

    // Generate human-readable booking number (e.g. BK-1035 or BK-INT-1035)
    const count = await prisma.booking.count();
    const prefix = data.shipment_mode === "INTERNATIONAL" ? "BK-INT" : "BK";
    const bookingNumber = `${prefix}-${1000 + count + 1}`;

    const newBooking = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          booking_number: bookingNumber,
          customer_id: customerId,
          source: isStaffOrAdmin ? "STAFF" : "CUSTOMER",
          shipment_mode: data.shipment_mode,
          currency: currency,
          exchange_rate: exchangeRate,
          total_inr_paise: declaredValueInr,
          created_by: createdById!,
          status: "REQUESTED",
          payment_type: data.payment_type,
          cod_amount: data.payment_type === "COD" ? data.cod_amount_paise : 0,

          // Sender Snapshot frozen at booking time
          sender_name: data.sender_name,
          sender_mobile: data.sender_mobile,
          sender_email: data.sender_email || null,
          sender_country: data.sender_country || "India",
          sender_address: data.sender_address,
          sender_address_2: data.sender_address_2 || null,
          sender_address_3: data.sender_address_3 || null,
          sender_landmark: data.sender_landmark || null,
          sender_city: data.sender_city,
          sender_district: data.sender_district || null,
          sender_state: data.sender_state,
          sender_pincode: data.sender_pincode,

          // Receiver Snapshot frozen at booking time
          receiver_name: data.receiver_name,
          receiver_mobile: data.receiver_mobile,
          receiver_email: data.receiver_email || null,
          receiver_country: data.receiver_country || "India",
          receiver_address: data.receiver_address,
          receiver_address_2: data.receiver_address_2 || null,
          receiver_address_3: data.receiver_address_3 || null,
          receiver_landmark: data.receiver_landmark || null,
          receiver_city: data.receiver_city,
          receiver_district: data.receiver_district || null,
          receiver_state: data.receiver_state,
          receiver_pincode: data.receiver_pincode,

          // International customs snapshot
          invoice_number: data.invoice_number || null,
          invoice_date: data.invoice_date || null,
          service_type: data.service_type || null,
          ioss_number: data.ioss_number || null,
        },
      });

      const parcel = await tx.bookingParcel.create({
        data: {
          booking_id: booking.id,
          parcel_type: data.parcel_type,
          description: data.description,
          currency: currency,
          submitted_weight_grams: data.submitted_weight_grams,
          submitted_length_cm: data.submitted_length_cm,
          submitted_width_cm: data.submitted_width_cm,
          submitted_height_cm: data.submitted_height_cm,
          declared_value: declaredValueOriginal,
          declared_value_inr: declaredValueInr,
          line_items: data.line_items ? (data.line_items as any) : undefined,
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
            shipment_mode: booking.shipment_mode,
            currency: booking.currency,
            payment_type: booking.payment_type,
            customer_id: customerId,
          },
        },
      });

      // Address Book Persistence (§5 & §6):
      // If added by staff/admin, marked as source = "ADMIN"
      const addressSource = isStaffOrAdmin ? "ADMIN" : "CUSTOMER";

      // Persist Sender Address to Address Book if requested
      if (data.save_sender_address && customerId) {
        try {
          const existingSenderAddr = await tx.customerAddress.findFirst({
            where: {
              customer_id: customerId,
              address: data.sender_address.trim(),
              pincode: data.sender_pincode.trim(),
              country: data.sender_country?.trim() || "India",
            },
          });
          if (!existingSenderAddr) {
            const hasDefault = await tx.customerAddress.count({
              where: { customer_id: customerId, is_default: true },
            });
            await tx.customerAddress.create({
              data: {
                customer_id: customerId,
                label: data.sender_address_label?.trim() || `${data.sender_city} Pickup`,
                source: addressSource,
                type: "SENDER",
                contact_name: data.sender_name.trim(),
                contact_mobile: data.sender_mobile.trim(),
                contact_email: data.sender_email?.trim() || null,
                country: data.sender_country?.trim() || "India",
                address: data.sender_address.trim(),
                address_line_2: data.sender_address_2?.trim() || null,
                address_line_3: data.sender_address_3?.trim() || null,
                landmark: data.sender_landmark?.trim() || null,
                city: data.sender_city.trim(),
                district: data.sender_district?.trim() || null,
                state: data.sender_state.trim(),
                pincode: data.sender_pincode.trim(),
                is_default: hasDefault === 0,
              },
            });
          }
        } catch (addrErr) {
          console.warn("Could not save sender address to address book:", addrErr);
        }
      }

      // Persist Receiver Address to Customer's Address Book (§6, option a)
      if (data.save_receiver_address && customerId) {
        try {
          const existingReceiverAddr = await tx.customerAddress.findFirst({
            where: {
              customer_id: customerId,
              address: data.receiver_address.trim(),
              pincode: data.receiver_pincode.trim(),
              country: data.receiver_country?.trim() || "India",
            },
          });
          if (!existingReceiverAddr) {
            await tx.customerAddress.create({
              data: {
                customer_id: customerId,
                label: data.receiver_address_label?.trim() || `Recipient: ${data.receiver_name} (${data.receiver_city})`,
                source: addressSource,
                type: "RECEIVER",
                contact_name: data.receiver_name.trim(),
                contact_mobile: data.receiver_mobile.trim(),
                contact_email: data.receiver_email?.trim() || null,
                country: data.receiver_country?.trim() || "India",
                address: data.receiver_address.trim(),
                address_line_2: data.receiver_address_2?.trim() || null,
                address_line_3: data.receiver_address_3?.trim() || null,
                landmark: data.receiver_landmark?.trim() || null,
                city: data.receiver_city.trim(),
                district: data.receiver_district?.trim() || null,
                state: data.receiver_state.trim(),
                pincode: data.receiver_pincode.trim(),
                is_default: false,
              },
            });
          }
        } catch (addrErr) {
          console.warn("Could not save receiver address to address book:", addrErr);
        }
      }

      return booking;
    });

    return NextResponse.json({
      success: true,
      message: "Booking request created successfully",
      booking: newBooking,
    });
  } catch (error: any) {
    console.error("Booking Creation API Error:", error);
    return NextResponse.json(
      { error: "Failed to create booking", details: error.message },
      { status: 500 }
    );
  }
}

