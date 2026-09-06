export interface CourierCreateShipmentInput {
  bookingId: string;
  bookingNumber: string;
  sender: {
    name: string;
    mobile: string;
    email?: string | null;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  receiver: {
    name: string;
    mobile: string;
    email?: string | null;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  parcel: {
    weightGrams: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    declaredValuePaise: number;
    description: string;
  };
  paymentType: "PREPAID" | "COD";
  codAmountPaise: number;
}

export interface CourierCreateShipmentResult {
  success: boolean;
  awb: string;
  labelUrl?: string;
  routingCode?: string;
  rawResponse: any;
  error?: string;
}

export interface CourierTrackingEvent {
  status: string; // normalized
  rawStatus: string;
  location?: string;
  occurredAt: Date;
}

export interface CourierTrackingResult {
  success: boolean;
  awb: string;
  currentStatus: string;
  events: CourierTrackingEvent[];
  rawResponse: any;
  error?: string;
}

export interface CourierTestConnectionResult {
  success: boolean;
  authSuccess: boolean;
  trackingReachable: boolean;
  responseTimeMs: number;
  message: string;
  rawResponse?: any;
}

export interface ICourierAdapter {
  code: string;
  name: string;

  createShipment(
    input: CourierCreateShipmentInput,
    credentials: Record<string, string>
  ): Promise<CourierCreateShipmentResult>;

  trackShipment(
    awb: string,
    credentials: Record<string, string>
  ): Promise<CourierTrackingResult>;

  cancelShipment(
    awb: string,
    credentials: Record<string, string>
  ): Promise<{ success: boolean; message: string }>;

  testConnection(
    credentials: Record<string, string>
  ): Promise<CourierTestConnectionResult>;
}
