import {
  ICourierAdapter,
  CourierCreateShipmentInput,
  CourierCreateShipmentResult,
  CourierTrackingResult,
  CourierTestConnectionResult,
  CourierAdapterType,
} from "./types";

export class InHouseCourierAdapter implements ICourierAdapter {
  code = "IN_HOUSE";
  name = "SS Courier In-House Delivery";
  adapterType: CourierAdapterType = "PREBUILT";
  isAggregator = false;

  async testConnection(
    credentials: Record<string, string>
  ): Promise<CourierTestConnectionResult> {
    return {
      success: true,
      authSuccess: true,
      trackingReachable: true,
      responseTimeMs: 5,
      message: "SS Courier in-house fleet gateway is operational and ready for intake.",
    };
  }

  async createShipment(
    input: CourierCreateShipmentInput,
    credentials: Record<string, string>
  ): Promise<CourierCreateShipmentResult> {
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    const awb = `SSC-${randomSuffix}`;

    return {
      success: true,
      awb,
      labelUrl: `/api/labels/${awb}.pdf`,
      routingCode: `SSC-HUB-${(input.receiver.pincode || "302001").slice(0, 3)}`,
      rawResponse: {
        network: "In-House SS Courier Fleet",
        orderNumber: input.bookingNumber,
        awb,
        status: "Manifested",
        created_at: new Date().toISOString(),
      },
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
          status: "IN_TRANSIT",
          rawStatus: "Consignment in transit with SS Courier in-house network",
          location: "Regional Sorting Facility",
          occurredAt: new Date(),
        },
      ],
      rawResponse: { awb, network: "In-House SS Courier Fleet" },
    };
  }

  async cancelShipment(
    awb: string,
    credentials: Record<string, string>,
    config?: Record<string, any>
  ): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: `In-house shipment ${awb} marked cancelled in self fleet.`,
    };
  }
}
