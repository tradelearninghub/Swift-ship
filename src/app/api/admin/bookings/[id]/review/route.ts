import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasPermission } from "@/lib/auth";
import { getCourierAdapter, logCourierApiCall } from "@/lib/couriers/registry";
import crypto from "crypto";
import { z } from "zod";

const ReviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "CANCEL"]),
  rejection_reason: z.string().optional(),

  // Verified weights & dimensions (§15)
  verified_weight_grams: z.number().int().positive().optional(),
  verified_length_cm: z.number().int().positive().optional(),
  verified_width_cm: z.number().int().positive().optional(),
  verified_height_cm: z.number().int().positive().optional(),

  // Manual Shipping Charges in paise (§16)
  shipping_charge_paise: z.number().int().nonnegative().default(0),
  additional_charge_paise: z.number().int().nonnegative().default(0),
  discount_paise: z.number().int().nonnegative().default(0),
  tax_paise: z.number().int().nonnegative().default(0),

  // Assigned Courier Partner
  courier_partner_id: z.string().optional(),
  manual_awb: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "booking.approve")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const bookingId = params.id;
    const body = await req.json();
    const validation = ReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Find booking
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingId }, { booking_number: bookingId }],
      },
      include: {
        parcels: true,
        charges: true,
        customer: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Handle Rejection / Cancellation
    if (data.action === "REJECT" || data.action === "CANCEL") {
      const newStatus = data.action === "REJECT" ? "REJECTED" : "CANCELLED";
      const updatedBooking = await prisma.$transaction(async (tx) => {
        const b = await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: newStatus,
            rejection_reason: data.rejection_reason || null,
          },
        });

        await tx.activityLog.create({
          data: {
            actor_id: session.id,
            action: `booking.${data.action.toLowerCase()}`,
            entity_type: "BOOKING",
            entity_id: booking.id,
            after: { status: newStatus, reason: data.rejection_reason },
          },
        });

        return b;
      });

      return NextResponse.json({ success: true, booking: updatedBooking });
    }

    // Process APPROVAL
    const totalPaise =
      data.shipping_charge_paise +
      data.additional_charge_paise +
      data.tax_paise -
      data.discount_paise;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update parcel verified metrics
      if (booking.parcels.length > 0) {
        await tx.bookingParcel.update({
          where: { id: booking.parcels[0].id },
          data: {
            verified_weight_grams:
              data.verified_weight_grams || booking.parcels[0].submitted_weight_grams,
            verified_length_cm:
              data.verified_length_cm || booking.parcels[0].submitted_length_cm,
            verified_width_cm:
              data.verified_width_cm || booking.parcels[0].submitted_width_cm,
            verified_height_cm:
              data.verified_height_cm || booking.parcels[0].submitted_height_cm,
            verified_by: session.id,
          },
        });
      }

      // 2. Upsert manual charges
      await tx.bookingCharge.upsert({
        where: { booking_id: booking.id },
        update: {
          shipping_charge: data.shipping_charge_paise,
          additional_charge: data.additional_charge_paise,
          discount: data.discount_paise,
          tax: data.tax_paise,
          total: totalPaise,
          set_by: session.id,
        },
        create: {
          booking_id: booking.id,
          shipping_charge: data.shipping_charge_paise,
          additional_charge: data.additional_charge_paise,
          discount: data.discount_paise,
          tax: data.tax_paise,
          total: totalPaise,
          set_by: session.id,
        },
      });

      // 3. Update Booking status to APPROVED
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: "APPROVED",
          reviewed_by: session.id,
          reviewed_at: new Date(),
        },
      });

      // 4. Generate Shipment / AWB if courier partner assigned
      let shipmentRecord = null;
      if (data.courier_partner_id) {
        const partner = await tx.courierPartner.findUnique({
          where: { id: data.courier_partner_id },
        });

        if (partner) {
          const adapter = getCourierAdapter(partner.code);
          const parcel0 = booking.parcels[0];

          let awb = data.manual_awb;
          let awbSource: "API" | "MANUAL" = "MANUAL";

          if (!awb && partner.capability_shipment_api) {
            const createResult = await adapter.createShipment(
              {
                bookingId: booking.id,
                bookingNumber: booking.booking_number,
                sender: {
                  name: booking.sender_name,
                  mobile: booking.sender_mobile,
                  email: booking.sender_email,
                  address: booking.sender_address,
                  city: booking.sender_city,
                  state: booking.sender_state,
                  pincode: booking.sender_pincode,
                },
                receiver: {
                  name: booking.receiver_name,
                  mobile: booking.receiver_mobile,
                  email: booking.receiver_email,
                  address: booking.receiver_address,
                  city: booking.receiver_city,
                  state: booking.receiver_state,
                  pincode: booking.receiver_pincode,
                },
                parcel: {
                  weightGrams:
                    data.verified_weight_grams || parcel0?.submitted_weight_grams || 500,
                  lengthCm:
                    data.verified_length_cm || parcel0?.submitted_length_cm || 10,
                  widthCm:
                    data.verified_width_cm || parcel0?.submitted_width_cm || 10,
                  heightCm:
                    data.verified_height_cm || parcel0?.submitted_height_cm || 10,
                  declaredValuePaise: parcel0?.declared_value || 0,
                  description: parcel0?.description || "Parcel",
                },
                paymentType: booking.payment_type as "PREPAID" | "COD",
                codAmountPaise: booking.cod_amount,
              },
              {}
            );

            awb = createResult.awb;
            awbSource = "API";
          }

          if (!awb) {
            awb = `SWF${Math.floor(10000000 + Math.random() * 90000000)}`;
          }

          // Cryptographically secure tracking token & idempotency key
          const trackingToken = crypto.randomBytes(16).toString("hex");
          const idempotencyKey = `idemp_${booking.id}_${partner.id}`;

          shipmentRecord = await tx.shipment.create({
            data: {
              booking_id: booking.id,
              courier_partner_id: partner.id,
              awb,
              awb_source: awbSource,
              status: "AWB_GENERATED",
              tracking_token: trackingToken,
              idempotency_key: idempotencyKey,
            },
          });

          // Initial tracking milestone
          await tx.shipmentTrackingEvent.create({
            data: {
              shipment_id: shipmentRecord.id,
              status: "AWB_GENERATED",
              raw_status: "Consignment booked and AWB generated",
              location: `${booking.sender_city} Sorting Hub`,
              source: "MANUAL",
              occurred_at: new Date(),
            },
          });
        }
      }

      // 5. Activity audit log
      await tx.activityLog.create({
        data: {
          actor_id: session.id,
          action: "booking.approved",
          entity_type: "BOOKING",
          entity_id: booking.id,
          after: {
            status: "APPROVED",
            charges_total: totalPaise,
            courier_partner_id: data.courier_partner_id,
            shipment_id: shipmentRecord?.id,
          },
        },
      });

      return { booking: updatedBooking, shipment: shipmentRecord };
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Admin Booking Review Error:", error);
    return NextResponse.json(
      { error: "Failed to process booking review" },
      { status: 500 }
    );
  }
}
