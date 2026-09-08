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

export type CourierAdapterType = "PREBUILT" | "GENERIC_REST" | "CUSTOM_CODE";

export interface GenericRestFieldMapping {
  // Key: internal field, Value: courier payload json path / key
  [internalKey: string]: string;
}

export interface GenericRestConfig {
  baseUrl: string;
  authMethod: "API_KEY_HEADER" | "BEARER_TOKEN" | "BASIC_AUTH" | "NONE";
  authHeaderName?: string;
  authHeaderValue?: string; // or token
  apiKey?: string;
  apiSecret?: string;
  createShipment?: {
    path: string;
    method: "POST" | "PUT";
    fieldMapping: Record<string, string>;
    responseAwbPath: string; // e.g. "data.awb" or "waybill"
    responseLabelUrlPath?: string;
    responseRoutingCodePath?: string;
  };
  trackShipment?: {
    path: string; // e.g. "/api/v1/track/{awb}"
    method: "GET" | "POST";
    responseStatusPath: string;
    statusMap?: Record<string, string>; // external courier status string -> standard status
  };
}

export interface ICourierAdapter {
  code: string;
  name: string;
  adapterType?: CourierAdapterType;
  isAggregator?: boolean; // True for Shiprocket which aggregates multiple carriers

  createShipment(
    input: CourierCreateShipmentInput,
    credentials: Record<string, string>,
    config?: Record<string, any>
  ): Promise<CourierCreateShipmentResult>;

  trackShipment(
    awb: string,
    credentials: Record<string, string>,
    config?: Record<string, any>
  ): Promise<CourierTrackingResult>;

  cancelShipment(
    awb: string,
    credentials: Record<string, string>,
    config?: Record<string, any>
  ): Promise<{ success: boolean; message: string }>;

  testConnection(
    credentials: Record<string, string>,
    config?: Record<string, any>
  ): Promise<CourierTestConnectionResult>;
}

