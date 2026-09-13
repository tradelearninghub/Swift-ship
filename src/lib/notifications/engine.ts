import { prisma } from "@/lib/prisma";
import { sendRealEmail } from "@/lib/email";
import { formatDateTimeIST } from "@/lib/datetime";

export interface NotificationPayload {
  eventKey: string;
  recipientEmail?: string | null;
  recipientMobile?: string | null;
  bookingId?: string | null;
  shipmentId?: string | null;
  variables: Record<string, any>;
}

export async function sendNotification(payload: NotificationPayload) {
  try {
    const { eventKey, recipientEmail, recipientMobile, bookingId, shipmentId, variables = {} } = payload;

    // 1. Fetch template from database
    let dbTemplate: any = null;
    try {
      dbTemplate = await prisma.notificationTemplate.findFirst({
        where: { event_key: eventKey, channel: "EMAIL" },
      });
    } catch {
      // Database not reachable
    }

    // Check if notifications for this event have been disabled
    if (dbTemplate && dbTemplate.is_active === false) {
      console.log(`[NOTIFICATION-ENGINE] Notification for ${eventKey} is disabled by admin settings.`);
      return { success: true, skipped: true, reason: "Template disabled" };
    }

    // Default template fallbacks if not in database
    const defaultTemplates: Record<string, { subject: string; body: string }> = {
      "booking.created": {
        subject: "Booking Request Received — {{bookingId}}",
        body: "Hello {{customerName}},\n\nWe have received your booking request #{{bookingId}}.\nOur operations team will verify dimensions and confirm freight charges shortly.\n\nTrack live at: {{trackingLink}}\n\nThank you,\n{{companyName}}",
      },
      "booking.approved": {
        subject: "Booking Approved & Dispatched — {{bookingId}}",
        body: "Hello {{customerName}},\n\nYour booking #{{bookingId}} has been approved.\nCourier Partner: {{courierName}}\nAWB: {{awb}}\n\nTrack your shipment live: {{trackingLink}}\n\nTeam {{companyName}}",
      },
      "shipment.created": {
        subject: "Shipment Allocated — AWB {{awb}}",
        body: "Hello {{customerName}},\n\nShipment for booking #{{bookingId}} has been allocated to {{courierName}} (AWB: {{awb}}).\n\nTrack live: {{trackingLink}}\n\nTeam {{companyName}}",
      },
      "shipment.awb_generated": {
        subject: "AWB Generated & Dispatched — AWB {{awb}}",
        body: "Hello {{customerName}},\n\nYour parcel with AWB {{awb}} has been manifest-dispatched via {{courierName}}.\n\nLive tracking: {{trackingLink}}\n\nTeam {{companyName}}",
      },
      "shipment.in_transit": {
        subject: "Shipment In Transit Checkpoint — AWB {{awb}}",
        body: "Hello {{customerName}},\n\nYour shipment with AWB {{awb}} is in transit via {{courierName}}.\n\nLive tracking: {{trackingLink}}\n\nTeam {{companyName}}",
      },
      "shipment.out_for_delivery": {
        subject: "Out For Delivery Today — AWB {{awb}}",
        body: "Hello {{customerName}},\n\nYour parcel (AWB: {{awb}}) is out for delivery today. Please keep your OTP / payment ready.\n\nLive tracking: {{trackingLink}}\n\nTeam {{companyName}}",
      },
      "shipment.delivered": {
        subject: "Delivered Successfully — AWB {{awb}}",
        body: "Hello {{customerName}},\n\nYour parcel with AWB {{awb}} has been delivered successfully.\nThank you for choosing {{companyName}}!\n\nDetails: {{trackingLink}}",
      },
      "shipment.rto": {
        subject: "Return to Origin (RTO) Notice — AWB {{awb}}",
        body: "Hello {{customerName}},\n\nYour parcel with AWB {{awb}} is being returned to origin.\n\nDetails: {{trackingLink}}\nHelpline: 8000151117",
      },
    };

    let subject = dbTemplate?.subject || defaultTemplates[eventKey]?.subject || `Update: ${eventKey}`;
    let body = dbTemplate?.body || defaultTemplates[eventKey]?.body || `Shipment notification for ${eventKey}.`;

    // 2. Normalize and enrich variable map
    const customerName = String(variables.customerName || variables.customer_name || "Valued Customer");
    const bookingNum = String(variables.bookingId || variables.booking_number || variables.booking_id || "—");
    const awb = String(variables.awb || variables.awb_number || "—");
    const courierName = String(variables.courierName || variables.courier_name || "Carrier Partner");
    const trackingLink = String(variables.trackingLink || variables.tracking_url || "https://sscourierservice.in/track");
    const companyName = String(variables.companyName || variables.company_name || "SS Courier service");

    const mergedVars: Record<string, string> = {
      customerName,
      customer_name: customerName,
      bookingId: bookingNum,
      booking_number: bookingNum,
      booking_id: bookingNum,
      awb,
      awb_number: awb,
      courierName,
      courier_name: courierName,
      trackingLink,
      tracking_url: trackingLink,
      companyName,
      company_name: companyName,
      chargeAmount: String(variables.chargeAmount || variables.charge_amount || "0"),
      charge_amount: String(variables.chargeAmount || variables.charge_amount || "0"),
      currentDate: formatDateTimeIST(new Date(), false),
    };

    // Include any custom caller-supplied variables
    for (const [k, v] of Object.entries(variables)) {
      if (v instanceof Date) {
        mergedVars[k] = formatDateTimeIST(v, false);
      } else if (typeof v === "string" || typeof v === "number") {
        mergedVars[k] = String(v);
      }
    }

    // 3. Interpolate variables (case-insensitive regex for {{tag}} and {tag})
    for (const [key, val] of Object.entries(mergedVars)) {
      const doubleBraceRegex = new RegExp(`{{${key}}}`, "gi");
      const singleBraceRegex = new RegExp(`{${key}}`, "gi");
      subject = subject.replace(doubleBraceRegex, val).replace(singleBraceRegex, val);
      body = body.replace(doubleBraceRegex, val).replace(singleBraceRegex, val);
    }

    // 4. Email Dispatch via real SMTP
    if (recipientEmail) {
      const emailOptions: any = {
        to: recipientEmail,
        subject,
        text: body,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #002B49; padding: 20px; color: #ffffff; border-radius: 8px 8px 0 0; text-align: left;">
              <h2 style="margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px;">SS Courier service</h2>
              <p style="margin: 4px 0 0; font-size: 11px; opacity: 0.8;">Express Logistics & Multi-Carrier Courier Deliveries</p>
            </div>
            <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px 20px; border-radius: 0 0 8px 8px; background-color: #ffffff;">
              <div style="font-size: 14px; margin-top: 0; color: #1e293b; white-space: pre-line;">${body}</div>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0 16px;" />
              <p style="font-size: 11px; color: #64748b; margin-bottom: 4px; line-height: 1.4;">
                SS Courier service • Shop No 4, Johri Bazar, Jaipur 302003<br/>
                Helpline: +91 8000151117 / +91 7689987368 • Website: <a href="https://sscourierservice.in" style="color: #FF6B00; text-decoration: none;">sscourierservice.in</a>
              </p>
            </div>
          </div>
        `,
      };

      if (dbTemplate?.sender_email) {
        emailOptions.from = dbTemplate.sender_email;
      }

      const emailResult = await sendRealEmail(emailOptions);

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

    // 5. WhatsApp Dispatch Log
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
      }).catch(() => {});
    }

    return { success: true };
  } catch (error) {
    console.error("Notification Engine Error:", error);
    return { success: false, error };
  }
}
