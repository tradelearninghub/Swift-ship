import {
  ICourierAdapter,
  CourierCreateShipmentInput,
  CourierCreateShipmentResult,
  CourierTrackingResult,
  CourierTestConnectionResult,
} from "./types";

export class MockManualAdapter implements ICourierAdapter {
  code = "MANUAL";
  name = "Manual Courier Partner";

  async createShipment(
    input: CourierCreateShipmentInput,
    credentials: Record<string, string>
  ): Promise<CourierCreateShipmentResult> {
    const awb = `MNL${Math.floor(10000000 + Math.random() * 90000000)}`;
    return {
      success: true,
      awb,
      labelUrl: `/api/labels/${awb}.pdf`,
      routingCode: "DIRECT-SURFACE",
      rawResponse: { mode: "MANUAL", awb },
    };
  }

  async trackShipment(
    awb: string,
    credentials: Record<string, string>
  ): Promise<CourierTrackingResult> {
    return {
      success: true,
      awb,
      currentStatus: "IN_TRANSIT",
      events: [
        {
          status: "BOOKED",
          rawStatus: "Consignment created",
          occurredAt: new Date(Date.now() - 86400000),
        },
      ],
      rawResponse: { mode: "MANUAL" },
    };
  }

  async cancelShipment(
    awb: string,
    credentials: Record<string, string>
  ): Promise<{ success: boolean; message: string }> {
    return { success: true, message: `Shipment ${awb} cancelled manually.` };
  }

  async testConnection(
    credentials: Record<string, string>
  ): Promise<CourierTestConnectionResult> {
    return {
      success: true,
      authSuccess: true,
      trackingReachable: true,
      responseTimeMs: 25,
      message: "Manual fallback adapter is operational.",
    };
  }
}
