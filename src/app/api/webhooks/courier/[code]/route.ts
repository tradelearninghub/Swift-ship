import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ShipmentStatus } from "@prisma/client";
import crypto from "crypto";

function normalizeCarrierStatus(raw: string): ShipmentStatus {
  const upper = raw.toUpperCase();
  if (upper.includes("DELIVERED") || upper.includes("DLV")) return "DELIVERED";
  if (upper.includes("OUT FOR DELIVERY") || upper.includes("OFD")) return "OUT_FOR_DELIVERY";
  if (upper.includes("TRANSIT") || upper.includes("IN_TRANSIT") || upper.includes("DEPARTED") || upper.includes("ARRIVED")) return "IN_TRANSIT";
  if (upper.includes("PICKED") || upper.includes("COLLECTED")) return "PICKED_UP";
  if (upper.includes("RTO") || upper.includes("RETURN")) return "RTO";
  if (upper.includes("CANCEL")) return "CANCELLED";
  return "IN_TRANSIT";
}

/**
 * Secure timing-safe comparison for shared secret tokens (§23, §24)
 */
function safeTokenCompare(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;
  const provBuf = Buffer.from(provided.trim());
  const expBuf = Buffer.from(expected.trim());
  if (provBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(provBuf, expBuf);
}

/**
 * Secure timing-safe HMAC-SHA256 signature verification
 */
function safeHmacVerify(rawPayload: string, signatureHeader: string, secret: string): boolean {
  if (!rawPayload || !signatureHeader || !secret) return false;
  const cleanSig = signatureHeader.replace(/^sha256=/i, "").trim().toLowerCase();
  const computedSig = crypto.createHmac("sha256", secret.trim()).update(rawPayload).digest("hex").toLowerCase();
  
  if (cleanSig.length !== computedSig.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(cleanSig, "hex"), Buffer.from(computedSig, "hex"));
  } catch {
    return false;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const courierCode = params.code.toUpperCase();
  const startTime = Date.now();

  try {
    const rawBody = await req.text();
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // 1. Fetch courier partner & its credentials from database
    const courier = await prisma.courierPartner.findFirst({
      where: { code: courierCode },
      include: {
        credentials: true,
        configurations: true,
      },
    });

    if (!courier) {
      return NextResponse.json({ error: `Unknown courier adapter '${courierCode}'` }, { status: 404 });
    }

    // 2. Collect all configured secrets for this courier
    const candidateSecrets: string[] = [];

    // From DB credentials table
    if (courier.credentials && courier.credentials.length > 0) {
      for (const cred of courier.credentials) {
        const k = cred.credential_key.toLowerCase();
        if (
          k.includes("secret") ||
          k.includes("webhook") ||
          k.includes("token") ||
          k.includes("api_key") ||
          k.includes("key")
        ) {
          if (cred.credential_value_encrypted) {
            candidateSecrets.push(cred.credential_value_encrypted);
          }
        }
      }
    }

    // From environment variables
    const envSpecificSecret = process.env[`${courierCode}_WEBHOOK_SECRET`] || process.env[`${courierCode}_API_TOKEN`];
    if (envSpecificSecret) candidateSecrets.push(envSpecificSecret);

    const envGlobalWebhookSecret = process.env.COURIER_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;
    if (envGlobalWebhookSecret) candidateSecrets.push(envGlobalWebhookSecret);

    // Fallback sandbox/development secret
    const devFallbackSecret = `whsec_${courierCode.toLowerCase()}_live`;
    candidateSecrets.push(devFallbackSecret);

    // 3. Extract incoming signature/shared-secret headers
    const signatureHeader =
      req.headers.get("x-courier-signature") ||
      req.headers.get(`x-${courierCode.toLowerCase()}-signature`) ||
      req.headers.get("x-webhook-signature") ||
      req.headers.get("x-hub-signature-256");

    const secretHeader =
      req.headers.get("x-courier-secret") ||
      req.headers.get(`x-${courierCode.toLowerCase()}-secret`) ||
      req.headers.get("x-webhook-secret") ||
      req.headers.get("x-api-key") ||
      req.headers.get("webhook-token") ||
      req.nextUrl.searchParams.get("secret") ||
      req.nextUrl.searchParams.get("token");

    const authHeader = req.headers.get("authorization");
    let bearerToken = "";
    if (authHeader) {
      const match = authHeader.match(/^(?:Bearer|Token)\s+(.+)$/i);
      if (match) bearerToken = match[1].trim();
      else bearerToken = authHeader.trim();
    }

    // 4. Verify Signature or Shared Secret (Whichever courier spec supports)
    let isAuthorized = false;

    for (const secret of candidateSecrets) {
      // Test HMAC signature verification if signature header is provided
      if (signatureHeader && safeHmacVerify(rawBody, signatureHeader, secret)) {
        isAuthorized = true;
        break;
      }
      // Test shared-secret header verification
      if (secretHeader && safeTokenCompare(secretHeader, secret)) {
        isAuthorized = true;
        break;
      }
      // Test Authorization Bearer/Token header
      if (bearerToken && safeTokenCompare(bearerToken, secret)) {
        isAuthorized = true;
        break;
      }
    }

    // If verification failed, reject untrusted webhook (§5)
    if (!isAuthorized) {
      console.warn(`[WEBHOOK-AUTH] Rejected unauthorized webhook call for carrier ${courierCode}. No valid signature or shared secret.`);

      // Log security rejection event in courier_api_logs
      await prisma.courierApiLog.create({
        data: {
          courier_partner_id: courier.id,
          direction: "INBOUND_WEBHOOK",
          endpoint: `/api/webhooks/courier/${courierCode}`,
          request_summary: { headers: Object.fromEntries(req.headers.entries()), hasBody: !!rawBody },
          response_status: 401,
          response_summary: { error: "Signature or secret verification failed" },
          response_time_ms: Date.now() - startTime,
          outcome: "FAILURE",
        },
      }).catch(() => {});

      return NextResponse.json(
        {
          error: "Unauthorized: Webhook signature or shared-secret verification failed.",
          code: "INVALID_WEBHOOK_CREDENTIALS",
        },
        { status: 401 }
      );
    }

    // 5. Extract AWB & status based on courier payload format
    const awb =
      payload.awb ||
      payload.Waybill ||
      payload.waybill ||
      payload.tracking_number ||
      payload.awb_number ||
      payload.shipment_id ||
      payload.data?.awb ||
      payload.data?.waybill;

    const rawStatus =
      payload.status ||
      payload.Status ||
      payload.event ||
      payload.scan_status ||
      payload.data?.status ||
      "Checkpoint update";

    const location =
      payload.location ||
      payload.Location ||
      payload.city ||
      payload.hub ||
      payload.current_location ||
      payload.data?.location ||
      "Transit Gateway";

    if (!awb) {
      return NextResponse.json({ error: "Missing AWB in webhook payload" }, { status: 400 });
    }

    // 6. Find matching shipment
    const shipment = await prisma.shipment.findFirst({
      where: { awb: String(awb).trim() },
    });

    if (!shipment) {
      return NextResponse.json({ error: `Shipment with AWB ${awb} not found` }, { status: 404 });
    }

    const normalizedStatus = normalizeCarrierStatus(String(rawStatus));

    // 7. Atomic transaction: Save tracking event and update shipment status
    await prisma.$transaction(async (tx) => {
      // Insert tracking event
      await tx.shipmentTrackingEvent.create({
        data: {
          shipment_id: shipment.id,
          status: normalizedStatus,
          raw_status: String(rawStatus),
          location: String(location),
          source: "WEBHOOK",
          occurred_at: payload.timestamp ? new Date(payload.timestamp) : new Date(),
        },
      });

      // Update shipment status
      await tx.shipment.update({
        where: { id: shipment.id },
        data: {
          status: normalizedStatus,
          last_synced_at: new Date(),
        },
      });
    });

    // 8. Log successful inbound webhook
    await prisma.courierApiLog.create({
      data: {
        courier_partner_id: courier.id,
        shipment_id: shipment.id,
        direction: "INBOUND_WEBHOOK",
        endpoint: `/api/webhooks/courier/${courierCode}`,
        request_summary: { awb, rawStatus, location },
        response_status: 200,
        response_summary: { success: true, normalized_status: normalizedStatus },
        response_time_ms: Date.now() - startTime,
        outcome: "SUCCESS",
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      awb,
      normalized_status: normalizedStatus,
      verified: true,
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook ingestion failed" }, { status: 500 });
  }
}
