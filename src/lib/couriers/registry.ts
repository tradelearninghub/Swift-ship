import { prisma } from "@/lib/prisma";
import { ICourierAdapter } from "./types";
import { DelhiveryAdapter } from "./delhivery";
import { BlueDartAdapter } from "./bluedart";
import { MockManualAdapter } from "./mock";

const adapters: Record<string, ICourierAdapter> = {
  DELHIVERY: new DelhiveryAdapter(),
  BLUEDART: new BlueDartAdapter(),
  MANUAL: new MockManualAdapter(),
  DTDC: new MockManualAdapter(),
  XPRESSBEES: new MockManualAdapter(),
};

export function getCourierAdapter(code: string): ICourierAdapter {
  const upper = code.toUpperCase();
  return adapters[upper] || adapters["MANUAL"];
}

export async function logCourierApiCall(params: {
  courierPartnerId: string;
  shipmentId?: string | null;
  endpoint: string;
  requestPayload: any;
  responsePayload: any;
  httpStatus: number;
  durationMs: number;
  isSuccess: boolean;
}) {
  try {
    await prisma.courierApiLog.create({
      data: {
        courier_partner_id: params.courierPartnerId,
        shipment_id: params.shipmentId || null,
        direction: "OUTBOUND",
        endpoint: params.endpoint,
        request_summary: params.requestPayload || {},
        response_status: params.httpStatus,
        response_summary: params.responsePayload || {},
        response_time_ms: params.durationMs,
        outcome: params.isSuccess ? "SUCCESS" : "FAILURE",
      },
    });
  } catch (err) {
    console.error("Failed to write CourierApiLog:", err);
  }
}
