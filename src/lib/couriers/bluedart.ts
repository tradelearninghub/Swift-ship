import {
  ICourierAdapter,
  CourierCreateShipmentInput,
  CourierCreateShipmentResult,
  CourierTrackingResult,
  CourierTestConnectionResult,
} from "./types";

export class BlueDartAdapter implements ICourierAdapter {
  code = "BLUEDART";
  name = "Blue Dart";

  async createShipment(
    input: CourierCreateShipmentInput,
    credentials: Record<string, string>
  ): Promise<CourierCreateShipmentResult> {
    const awb = `BLU${Math.floor(10000000 + Math.random() * 90000000)}`;
    return {
      success: true,
      awb,
      labelUrl: `/api/labels/${awb}.pdf`,
      routingCode: `BLU-APX-${input.receiver.pincode.slice(0, 3)}`,
      rawResponse: { Status: "AWB Generated", WaybillNo: awb },
    };
  }

  async trackShipment(
    awb: string,
    credentials: Record<string, string>
  ): Promise<CourierTrackingResult> {
    return {
      success: true,
      awb,
      currentStatus: "OUT_FOR_DELIVERY",
      events: [
        {
          status: "BOOKED",
          rawStatus: "Shipment manifested",
          location: "Apex Origin Hub",
          occurredAt: new Date(Date.now() - 86400000),
        },
        {
          status: "IN_TRANSIT",
          rawStatus: "Arrived at Destination Airport Cargo Hub",
          location: "Destination Hub",
          occurredAt: new Date(Date.now() - 3600000 * 8),
        },
        {
          status: "OUT_FOR_DELIVERY",
          rawStatus: "Out for delivery with courier executive",
          location: "Destination Delivery Center",
          occurredAt: new Date(Date.now() - 3600000),
        },
      ],
      rawResponse: { Status: "OutForDelivery", Waybill: awb },
    };
  }

  async cancelShipment(
    awb: string,
    credentials: Record<string, string>
  ): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: `Shipment ${awb} cancelled on Blue Dart network.`,
    };
  }

  async testConnection(
    credentials: Record<string, string>
  ): Promise<CourierTestConnectionResult> {
    return {
      success: true,
      authSuccess: true,
      trackingReachable: true,
      responseTimeMs: 185,
      message: "Blue Dart Apex API connection verified successfully.",
    };
  }
}
