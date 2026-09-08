import { prisma } from "@/lib/prisma";
import { ICourierAdapter } from "./types";
import { DelhiveryAdapter } from "./delhivery";
import { BlueDartAdapter } from "./bluedart";
import { DTDCAdapter } from "./dtdc";
import { ShiprocketAdapter } from "./shiprocket";
import { XpressBeesAdapter } from "./xpressbees";
import { GenericRestAdapter } from "./genericRest";
import { MockManualAdapter } from "./mock";

const adapters: Record<string, ICourierAdapter> = {
  DELHIVERY: new DelhiveryAdapter(),
  BLUEDART: new BlueDartAdapter(),
  DTDC: new DTDCAdapter(),
  SHIPROCKET: new ShiprocketAdapter(),
  XPRESSBEES: new XpressBeesAdapter(),
  GENERIC_REST: new GenericRestAdapter(),
  MANUAL: new MockManualAdapter(),
};

export function getCourierAdapter(code: string): ICourierAdapter {
  const upper = (code || "").toUpperCase();
  if (adapters[upper]) return adapters[upper];
  if (upper.startsWith("GENERIC")) return adapters["GENERIC_REST"];
  return adapters["MANUAL"];
}

export function getAllSupportedAdapters(): {
  code: string;
  name: string;
  type: "PREBUILT" | "GENERIC_REST" | "CUSTOM_CODE";
  isAggregator?: boolean;
}[] {
  return [
    { code: "DELHIVERY", name: "Delhivery", type: "PREBUILT", isAggregator: false },
    { code: "DTDC", name: "DTDC Express", type: "PREBUILT", isAggregator: false },
    { code: "SHIPROCKET", name: "Shiprocket (Aggregator)", type: "PREBUILT", isAggregator: true },
    { code: "XPRESSBEES", name: "XpressBees Logistics", type: "PREBUILT", isAggregator: false },
    { code: "GENERIC_REST", name: "Generic REST Connector", type: "GENERIC_REST", isAggregator: false },
    { code: "CUSTOM_OTHER", name: "Custom Carrier (Developer Code)", type: "CUSTOM_CODE", isAggregator: false },
  ];
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
