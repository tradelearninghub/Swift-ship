import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasPermission } from "@/lib/auth";
import { getCourierAdapter } from "@/lib/couriers/registry";
import crypto from "crypto";
import { z } from "zod";

const ReviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "CANCEL"]),
  rejection_reason: z.string().optional().nullable(),

  // Verified weights & dimensions
  verified_weight_grams: z.number().int().positive().optional().nullable(),
  verified_length_cm: z.number().int().positive().optional().nullable(),
  verified_width_cm: z.number().int().positive().optional().nullable(),
  verified_height_cm: z.number().int().positive().optional().nullable(),

  // Manual Shipping Charges in paise
  shipping_charge_paise: z.number().int().nonnegative().optional().nullable().default(0),
  additional_charge_paise: z.number().int().nonnegative().optional().nullable().default(0),
  discount_paise: z.number().int().nonnegative().optional().nullable().default(0),
  tax_paise: z.number().int().nonnegative().optional().nullable().default(0),

  // Assigned Courier Partner
  courier_partner_id: z.string().optional().nullable(),
  manual_awb: z.string().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingId = params.id;
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingId }, { booking_number: bookingId }],
      },
      include: {
        parcels: true,
        charges: true,
        customer: true,
        shipment: {
          include: {
            courier_partner: true,
            tracking_events: {
              orderBy: { occurred_at: "desc" },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("Admin Booking Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch booking details" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleUpper = (session.role || "").toUpperCase();
    const isAdmin = roleUpper === "SUPER_ADMIN" || roleUpper === "ADMIN";
    if (!isAdmin && !hasPermission(session, "booking.approve") && !hasPermission(session, "booking.reject")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const bookingId = params.id;
    const rawBody = await req.json();

    // Sanitize any NaN or string numbers before parsing
    const body: any = {
      action: rawBody.action,
      rejection_reason: rawBody.rejection_reason,
      verified_weight_grams: rawBody.verified_weight_grams ? Number(rawBody.verified_weight_grams) : undefined,
      verified_length_cm: rawBody.verified_length_cm ? Number(rawBody.verified_length_cm) : undefined,
      verified_width_cm: rawBody.verified_width_cm ? Number(rawBody.verified_width_cm) : undefined,
      verified_height_cm: rawBody.verified_height_cm ? Number(rawBody.verified_height_cm) : undefined,
      shipping_charge_paise: Number(rawBody.shipping_charge_paise) || 0,
      additional_charge_paise: Number(rawBody.additional_charge_paise) || 0,
      discount_paise: Number(rawBody.discount_paise) || 0,
      tax_paise: Number(rawBody.tax_paise) || 0,
      courier_partner_id: rawBody.courier_partner_id || undefined,
      manual_awb: rawBody.manual_awb || undefined,
    };

    const validation = ReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify session user exists in database to avoid foreign key errors
    const validUser = session.id
      ? await prisma.user.findUnique({ where: { id: session.id }, select: { id: true } })
      : null;
    const actorId = validUser?.id || null;

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
      const reason = (data.rejection_reason || "").trim() || "Rejected by admin";

      const updatedBooking = await prisma.$transaction(async (tx) => {
        const b = await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: newStatus,
            rejection_reason: reason,
          },
        });

        await tx.activityLog.create({
          data: {
            actor_id: actorId,
            action: `booking.${data.action.toLowerCase()}`,
            entity_type: "BOOKING",
            entity_id: booking.id,
            after: { status: newStatus, reason },
          },
        });

        return b;
      });

      return NextResponse.json({
        success: true,
        booking: updatedBooking,
        result: { booking: updatedBooking },
      });
    }

    // Process APPROVAL
    const totalPaise =
      (data.shipping_charge_paise || 0) +
      (data.additional_charge_paise || 0) +
      (data.tax_paise || 0) -
      (data.discount_paise || 0);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update parcel verified metrics
      if (booking.parcels && booking.parcels.length > 0) {
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
            verified_by: actorId,
          },
        });
      }

      // 2. Upsert manual charges (if actorId is valid)
      if (actorId) {
        await tx.bookingCharge.upsert({
          where: { booking_id: booking.id },
          update: {
            shipping_charge: data.shipping_charge_paise || 0,
            additional_charge: data.additional_charge_paise || 0,
            discount: data.discount_paise || 0,
            tax: data.tax_paise || 0,
            total: totalPaise,
            set_by: actorId,
          },
          create: {
            booking_id: booking.id,
            shipping_charge: data.shipping_charge_paise || 0,
            additional_charge: data.additional_charge_paise || 0,
            discount: data.discount_paise || 0,
            tax: data.tax_paise || 0,
            total: totalPaise,
            set_by: actorId,
          },
        });
      }

      // 3. Update Booking status to APPROVED
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: "APPROVED",
          reviewed_by: actorId,
          reviewed_at: new Date(),
        },
      });

      // 4. Generate Shipment / AWB if courier partner assigned
      let shipmentRecord: any = null;
      if (data.courier_partner_id) {
        const partner = await tx.courierPartner.findUnique({
          where: { id: data.courier_partner_id },
        });

        if (partner) {
          const parcel0 = booking.parcels?.[0];
          let awb = data.manual_awb || "";
          let awbSource: "API" | "MANUAL" = "MANUAL";

          if (!awb && partner.capability_shipment_api) {
            try {
              const adapter = getCourierAdapter(partner.code);
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

              if (createResult?.awb) {
                awb = createResult.awb;
                awbSource = "API";
              }
            } catch (courierErr) {
              console.warn("Courier adapter call failed; using domestic fallback AWB:", courierErr);
            }
          }

          if (!awb) {
            const prefix = partner.code === "IN_HOUSE" ? "SSC-" : `${(partner.code || "SSC").substring(0, 3).toUpperCase()}`;
            awb = `${prefix}${Math.floor(10000000 + Math.random() * 90000000)}`;
          }

          // Upsert shipment to prevent duplicate key errors on repeated approvals
          const existingShipment = await tx.shipment.findUnique({
            where: { booking_id: booking.id },
          });

          if (existingShipment) {
            shipmentRecord = await tx.shipment.update({
              where: { id: existingShipment.id },
              data: {
                courier_partner_id: partner.id,
                awb: awb || existingShipment.awb,
                awb_source: awbSource,
                status: "AWB_GENERATED",
              },
            });
          } else {
            const trackingToken = crypto.randomBytes(16).toString("hex");
            const idempotencyKey = `idemp_${booking.id}_${partner.id}_${Date.now()}`;

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
      }

      // 5. Activity audit log
      await tx.activityLog.create({
        data: {
          actor_id: actorId,
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

    return NextResponse.json({
      success: true,
      booking: result.booking,
      shipment: result.shipment,
      result,
    });
  } catch (error: any) {
    console.error("Admin Booking Review Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process booking review" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleUpper = (session.role || "").toUpperCase();
    const isAdmin = roleUpper === "SUPER_ADMIN" || roleUpper === "ADMIN";
    if (!isAdmin && !hasPermission(session, "booking.delete")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const bookingId = params.id;
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingId }, { booking_number: bookingId }],
      },
      include: {
        shipment: {
          include: {
            cod_transaction: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Clean up shipment & children
      if (booking.shipment) {
        if (booking.shipment.cod_transaction) {
          await tx.codTransaction.delete({
            where: { id: booking.shipment.cod_transaction.id },
          }).catch(() => {});
        }
        await tx.shipmentTrackingEvent.deleteMany({
          where: { shipment_id: booking.shipment.id },
        }).catch(() => {});
        await tx.courierApiLog.deleteMany({
          where: { shipment_id: booking.shipment.id },
        }).catch(() => {});
        await tx.shipment.delete({
          where: { id: booking.shipment.id },
        }).catch(() => {});
      }

      // 2. Clean up child records
      await tx.payment.deleteMany({
        where: { booking_id: booking.id },
      }).catch(() => {});
      await tx.bookingCharge.deleteMany({
        where: { booking_id: booking.id },
      }).catch(() => {});
      await tx.bookingParcel.deleteMany({
        where: { booking_id: booking.id },
      }).catch(() => {});
      await tx.activityLog.deleteMany({
        where: { entity_type: "BOOKING", entity_id: booking.id },
      }).catch(() => {});
      await tx.supportTicket.deleteMany({
        where: { booking_id: booking.id },
      }).catch(() => {});

      // 3. Delete Booking
      await tx.booking.delete({
        where: { id: booking.id },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Booking ${booking.booking_number} deleted successfully`,
    });
  } catch (error: any) {
    console.error("Admin Booking Delete Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete booking" },
      { status: 500 }
    );
  }
}
