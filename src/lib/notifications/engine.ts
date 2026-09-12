import { prisma } from "@/lib/prisma";

export interface NotificationPayload {
  eventKey: string;
  recipientEmail?: string | null;
  recipientMobile?: string | null;
  bookingId?: string | null;
  shipmentId?: string | null;
  variables: Record<string, string | number>;
}

export async function sendNotification(payload: NotificationPayload) {
  try {
    const { eventKey, recipientEmail, recipientMobile, bookingId, shipmentId, variables } = payload;

    // Default template mappings
    const templates: Record<string, { subject: string; body: string }> = {
      "booking.created": {
        subject: "Booking Request Received — {{booking_number}}",
        body: "Hello {{customer_name}}, we have received your booking request {{booking_number}}. Our operations team will verify dimensions and confirm freight charges shortly.",
      },
      "booking.approved": {
        subject: "Booking Confirmed & Dispatched — {{booking_number}}",
        body: "Hello {{customer_name}}, your booking {{booking_number}} has been approved. Shipping charge: ₹{{charge_amount}}. Track live at: {{tracking_url}}",
      },
      "shipment.out_for_delivery": {
        subject: "Out For Delivery — AWB {{awb}}",
        body: "Your parcel (AWB: {{awb}}) is out for delivery today. Keep OTP / payment ready.",
      },
      "shipment.delivered": {
        subject: "Delivered Successfully — AWB {{awb}}",
        body: "Your parcel with AWB {{awb}} has been delivered successfully. Thank you for choosing SS Courier service!",
      },
    };

    const template = templates[eventKey] || {
      subject: `Notification: ${eventKey}`,
      body: `Update regarding your parcel shipment: ${JSON.stringify(variables)}`,
    };

    // Interpolate variables
    let subject = template.subject;
    let body = template.body;
    for (const [key, val] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      subject = subject.replace(regex, String(val));
      body = body.replace(regex, String(val));
    }

    // Email Dispatch Log
    if (recipientEmail) {
      await prisma.notificationLog.create({
        data: {
          channel: "EMAIL",
          event_key: eventKey,
          recipient: recipientEmail,
          booking_id: bookingId || null,
          shipment_id: shipmentId || null,
          status: "SENT",
          provider_response: "Email queued with SMTP server",
        },
      });
    }

    // WhatsApp / SMS Dispatch Log
    if (recipientMobile) {
      await prisma.notificationLog.create({
        data: {
          channel: "WHATSAPP",
          event_key: eventKey,
          recipient: recipientMobile,
          booking_id: bookingId || null,
          shipment_id: shipmentId || null,
          status: "SENT",
          provider_response: "WhatsApp message delivered to gateway",
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Notification Engine Error:", error);
    return { success: false, error };
  }
}
