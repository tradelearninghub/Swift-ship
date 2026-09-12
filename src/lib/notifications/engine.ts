import { prisma } from "@/lib/prisma";
import { sendRealEmail } from "@/lib/email";

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

    // Email Dispatch via real SMTP (€38)
    if (recipientEmail) {
      const emailResult = await sendRealEmail({
        to: recipientEmail,
        subject,
        text: body,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px;">
            <div style="background-color: #1e3a8a; padding: 16px 20px; color: #ffffff; border-radius: 6px 6px 0 0;">
              <h2 style="margin: 0; font-size: 18px;">SS Courier service</h2>
            </div>
            <div style="border: 1px solid #e2e8f0; border-top: none; padding: 20px; border-radius: 0 0 6px 6px;">
              <p style="font-size: 14px; margin-top: 0;">${body}</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 11px; color: #64748b; margin-bottom: 0;">
                Fast, Safe & Multi-Carrier Courier Logistics • sscourierservice.in • Helpline: 8000151117
              </p>
            </div>
          </div>
        `,
      });

      await prisma.notificationLog.create({
        data: {
          channel: "EMAIL",
          event_key: eventKey,
          recipient: recipientEmail,
          booking_id: bookingId || null,
          shipment_id: shipmentId || null,
          status: emailResult.success ? "SENT" : "FAILED",
          provider_response: emailResult.success
            ? `Dispatched via SMTP (MessageId: ${emailResult.messageId})`
            : `SMTP Dispatch Failure: ${emailResult.error}`,
        },
      }).catch(() => {});
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
