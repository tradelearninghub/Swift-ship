export interface MockParcel {
  id: string;
  parcel_type: string;
  description: string;
  submitted_weight_grams: number;
  submitted_length_cm: number;
  submitted_width_cm: number;
  submitted_height_cm: number;
  declared_value: number; // in paise
  verified_weight_grams?: number;
  verified_length_cm?: number;
  verified_width_cm?: number;
  verified_height_cm?: number;
  verified_by?: string;
  verified_at?: string;
}

export interface MockBookingCharge {
  shipping_charge: number; // paise
  additional_charge: number; // paise
  discount: number; // paise
  tax: number; // paise
  total: number; // paise
  set_by: string;
  set_at: string;
}

export interface MockTrackingEvent {
  id: string;
  status: string;
  raw_status: string;
  location?: string;
  occurred_at: string;
  source: "POLL" | "WEBHOOK" | "MANUAL";
}

export interface MockShipment {
  id: string;
  booking_id: string;
  courier_partner_id: string;
  courier_name: string;
  awb?: string;
  awb_source: "API" | "MANUAL";
  status:
    | "PROCESSING"
    | "COURIER_ASSIGNED"
    | "AWB_GENERATED"
    | "PICKUP_SCHEDULED"
    | "PICKED_UP"
    | "IN_TRANSIT"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "RTO"
    | "EXCEPTION"
    | "CANCELLED";
  exception_reason?: string;
  tracking_token: string;
  idempotency_key: string;
  label_url?: string;
  last_synced_at?: string;
  tracking_events: MockTrackingEvent[];
}

export interface MockBooking {
  id: string;
  booking_number: string;
  customer_id: string;
  customer_name: string;
  customer_mobile: string;
  customer_email?: string;
  source: "CUSTOMER" | "STAFF" | "ADMIN";
  created_by_name: string;
  status:
    | "DRAFT"
    | "REQUESTED"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED";
  payment_type: "PREPAID" | "COD";
  cod_amount: number; // paise

  sender_name: string;
  sender_mobile: string;
  sender_email?: string;
  sender_address: string;
  sender_city: string;
  sender_state: string;
  sender_pincode: string;

  receiver_name: string;
  receiver_mobile: string;
  receiver_email?: string;
  receiver_address: string;
  receiver_city: string;
  receiver_state: string;
  receiver_pincode: string;

  parcels: MockParcel[];
  charges?: MockBookingCharge;
  shipment?: MockShipment;

  rejection_reason?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MockCourierPartner {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
  website: string;
  support_contact: string;
  status: "ACTIVE" | "INACTIVE";
  capability_shipment_api: boolean;
  capability_tracking_api: boolean;
  capability_label_api: boolean;
  capability_pickup_api: boolean;
  capability_cancellation_api: boolean;
  active_shipments_count: number;
  api_health_percent: number;
}

export interface MockCodSettlement {
  id: string;
  courier_partner_name: string;
  reference_utr: string;
  total_amount: number; // paise
  reconciled_amount: number; // paise
  status: "PENDING" | "RECONCILED" | "DISCREPANCY";
  settled_at: string;
  transaction_count: number;
}

export interface MockSupportTicket {
  id: string;
  ticket_number: string;
  booking_number?: string;
  raised_by_name: string;
  type: "WEIGHT_DISPUTE" | "DELAY" | "DAMAGE" | "OTHER";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  assigned_to_name?: string;
  subject: string;
  description: string;
  created_at: string;
  notes_count: number;
}

// -----------------------------------------------------------------------------
// Sample Mock Data
// -----------------------------------------------------------------------------

export const MOCK_COURIER_PARTNERS: MockCourierPartner[] = [
  {
    id: "courier-1",
    name: "Delhivery",
    code: "DELHIVERY",
    website: "https://www.delhivery.com",
    support_contact: "+91 124 6719500",
    status: "ACTIVE",
    capability_shipment_api: true,
    capability_tracking_api: true,
    capability_label_api: true,
    capability_pickup_api: true,
    capability_cancellation_api: true,
    active_shipments_count: 28,
    api_health_percent: 99.8,
  },
  {
    id: "courier-2",
    name: "Blue Dart",
    code: "BLUEDART",
    website: "https://www.bluedart.com",
    support_contact: "1860 233 1234",
    status: "ACTIVE",
    capability_shipment_api: true,
    capability_tracking_api: true,
    capability_label_api: true,
    capability_pickup_api: true,
    capability_cancellation_api: true,
    active_shipments_count: 14,
    api_health_percent: 98.9,
  },
  {
    id: "courier-3",
    name: "DTDC Express",
    code: "DTDC",
    website: "https://www.dtdc.in",
    support_contact: "+91 80 2536 5032",
    status: "ACTIVE",
    capability_shipment_api: true,
    capability_tracking_api: true,
    capability_label_api: false,
    capability_pickup_api: true,
    capability_cancellation_api: false,
    active_shipments_count: 8,
    api_health_percent: 99.2,
  },
  {
    id: "courier-4",
    name: "XpressBees",
    code: "XPRESSBEES",
    website: "https://www.xpressbees.com",
    support_contact: "+91 20 4911 1900",
    status: "INACTIVE",
    capability_shipment_api: false,
    capability_tracking_api: true,
    capability_label_api: false,
    capability_pickup_api: false,
    capability_cancellation_api: false,
    active_shipments_count: 0,
    api_health_percent: 94.0,
  },
];

export const MOCK_BOOKINGS: MockBooking[] = [
  {
    id: "bk-1031",
    booking_number: "BK-1031",
    customer_id: "cust-1",
    customer_name: "Rahul Sharma",
    customer_mobile: "9876543210",
    customer_email: "rahul.sharma@example.com",
    source: "CUSTOMER",
    created_by_name: "Rahul Sharma",
    status: "REQUESTED",
    payment_type: "COD",
    cod_amount: 350000, // ₹3,500.00
    sender_name: "Rahul Sharma",
    sender_mobile: "9876543210",
    sender_email: "rahul.sharma@example.com",
    sender_address: "Flat 402, Royal Palms, Tonk Road",
    sender_city: "Jaipur",
    sender_state: "Rajasthan",
    sender_pincode: "302022",
    receiver_name: "Anand Gupta",
    receiver_mobile: "9812345678",
    receiver_email: "anand.gupta@example.com",
    receiver_address: "Villa 12, Palm Meadows, Whitefield",
    receiver_city: "Bengaluru",
    receiver_state: "Karnataka",
    receiver_pincode: "560066",
    parcels: [
      {
        id: "p-101",
        parcel_type: "Electronics / Accessories",
        description: "Wireless Headphones with protective travel case",
        submitted_weight_grams: 2500,
        submitted_length_cm: 25,
        submitted_width_cm: 20,
        submitted_height_cm: 15,
        declared_value: 350000,
      },
    ],
    created_at: "2026-09-02T10:15:00.000Z",
    updated_at: "2026-09-02T10:15:00.000Z",
  },
  {
    id: "bk-1030",
    booking_number: "BK-1030",
    customer_id: "cust-2",
    customer_name: "Pooja Verma",
    customer_mobile: "9823412345",
    customer_email: "pooja.v@example.com",
    source: "CUSTOMER",
    created_by_name: "Pooja Verma",
    status: "UNDER_REVIEW",
    payment_type: "PREPAID",
    cod_amount: 0,
    sender_name: "Pooja Verma",
    sender_mobile: "9823412345",
    sender_address: "12, Civil Lines",
    sender_city: "Jaipur",
    sender_state: "Rajasthan",
    sender_pincode: "302001",
    receiver_name: "Vikram Malhotra",
    receiver_mobile: "9988776655",
    receiver_address: "B-44, Greater Kailash 1",
    receiver_city: "New Delhi",
    receiver_state: "Delhi",
    receiver_pincode: "110048",
    parcels: [
      {
        id: "p-102",
        parcel_type: "Documents / Legal Files",
        description: "Property deeds and signed agreements",
        submitted_weight_grams: 800,
        submitted_length_cm: 15,
        submitted_width_cm: 10,
        submitted_height_cm: 5,
        declared_value: 50000,
        verified_weight_grams: 850,
        verified_length_cm: 16,
        verified_width_cm: 11,
        verified_height_cm: 5,
        verified_by: "Admin Staff",
        verified_at: "2026-09-02T11:00:00.000Z",
      },
    ],
    reviewed_by_name: "Admin Staff",
    reviewed_at: "2026-09-02T11:00:00.000Z",
    created_at: "2026-09-02T09:30:00.000Z",
    updated_at: "2026-09-02T11:00:00.000Z",
  },
  {
    id: "bk-1025",
    booking_number: "BK-1025",
    customer_id: "cust-1",
    customer_name: "Rahul Sharma",
    customer_mobile: "9876543210",
    customer_email: "rahul.sharma@example.com",
    source: "CUSTOMER",
    created_by_name: "Rahul Sharma",
    status: "APPROVED",
    payment_type: "COD",
    cod_amount: 200000, // ₹2,000.00
    sender_name: "Rahul Sharma",
    sender_mobile: "9876543210",
    sender_address: "Flat 402, Royal Palms, Tonk Road",
    sender_city: "Jaipur",
    sender_state: "Rajasthan",
    sender_pincode: "302022",
    receiver_name: "Deepak Mehta",
    receiver_mobile: "9845012345",
    receiver_address: "702, Sea Green Apartments, Bandra West",
    receiver_city: "Mumbai",
    receiver_state: "Maharashtra",
    receiver_pincode: "400050",
    parcels: [
      {
        id: "p-103",
        parcel_type: "Apparel / Textiles",
        description: "Handcrafted Jaipuri Quilts",
        submitted_weight_grams: 2000,
        submitted_length_cm: 20,
        submitted_width_cm: 20,
        submitted_height_cm: 20,
        declared_value: 200000,
        verified_weight_grams: 2500,
        verified_length_cm: 25,
        verified_width_cm: 22,
        verified_height_cm: 20,
        verified_by: "Super Admin",
        verified_at: "2026-08-31T14:20:00.000Z",
      },
    ],
    charges: {
      shipping_charge: 15000, // ₹150.00
      additional_charge: 2000, // ₹20.00
      discount: 0,
      tax: 3000, // ₹30.00
      total: 20000, // ₹200.00
      set_by: "Super Admin",
      set_at: "2026-08-31T14:20:00.000Z",
    },
    shipment: {
      id: "sh-501",
      booking_id: "bk-1025",
      courier_partner_id: "courier-1",
      courier_name: "Delhivery",
      awb: "DEL98234123",
      awb_source: "API",
      status: "IN_TRANSIT",
      tracking_token: "tok_del_98234123_sec_99a",
      idempotency_key: "idemp_bk-1025",
      label_url: "/labels/DEL98234123.pdf",
      last_synced_at: "2026-09-02T12:30:00.000Z",
      tracking_events: [
        {
          id: "ev-1",
          status: "BOOKED",
          raw_status: "Manifested",
          location: "Jaipur Sorting Hub",
          occurred_at: "2026-08-31T15:00:00.000Z",
          source: "POLL",
        },
        {
          id: "ev-2",
          status: "PICKED_UP",
          raw_status: "Picked up by Courier Agent",
          location: "Jaipur Tonk Road Hub",
          occurred_at: "2026-09-01T10:30:00.000Z",
          source: "POLL",
        },
        {
          id: "ev-3",
          status: "IN_TRANSIT",
          raw_status: "Departed Facility towards Mumbai Central Hub",
          location: "Ahmedabad Transit Gateway",
          occurred_at: "2026-09-02T04:15:00.000Z",
          source: "POLL",
        },
      ],
    },
    reviewed_by_name: "Super Admin",
    reviewed_at: "2026-08-31T14:20:00.000Z",
    created_at: "2026-08-31T12:00:00.000Z",
    updated_at: "2026-09-02T04:15:00.000Z",
  },
  {
    id: "bk-1018",
    booking_number: "BK-1018",
    customer_id: "cust-1",
    customer_name: "Rahul Sharma",
    customer_mobile: "9876543210",
    customer_email: "rahul.sharma@example.com",
    source: "CUSTOMER",
    created_by_name: "Rahul Sharma",
    status: "APPROVED",
    payment_type: "PREPAID",
    cod_amount: 0,
    sender_name: "Rahul Sharma",
    sender_mobile: "9876543210",
    sender_address: "Flat 402, Royal Palms, Tonk Road",
    sender_city: "Jaipur",
    sender_state: "Rajasthan",
    sender_pincode: "302022",
    receiver_name: "Amit Saxena",
    receiver_mobile: "9711223344",
    receiver_address: "A-12, Sector 62",
    receiver_city: "Noida",
    receiver_state: "Uttar Pradesh",
    receiver_pincode: "201301",
    parcels: [
      {
        id: "p-104",
        parcel_type: "Books & Stationeries",
        description: "Competitive Exam Preparation Books",
        submitted_weight_grams: 1200,
        submitted_length_cm: 20,
        submitted_width_cm: 15,
        submitted_height_cm: 10,
        declared_value: 120000,
        verified_weight_grams: 1200,
        verified_length_cm: 20,
        verified_width_cm: 15,
        verified_height_cm: 10,
        verified_by: "Admin Staff",
        verified_at: "2026-08-28T10:00:00.000Z",
      },
    ],
    charges: {
      shipping_charge: 11000,
      additional_charge: 0,
      discount: 1000,
      tax: 1800,
      total: 11800,
      set_by: "Admin Staff",
      set_at: "2026-08-28T10:00:00.000Z",
    },
    shipment: {
      id: "sh-502",
      booking_id: "bk-1018",
      courier_partner_id: "courier-2",
      courier_name: "Blue Dart",
      awb: "BLU77491021",
      awb_source: "API",
      status: "DELIVERED",
      tracking_token: "tok_blu_77491021_sec_88b",
      idempotency_key: "idemp_bk-1018",
      label_url: "/labels/BLU77491021.pdf",
      last_synced_at: "2026-08-30T16:45:00.000Z",
      tracking_events: [
        {
          id: "ev-10",
          status: "BOOKED",
          raw_status: "Shipment manifested",
          location: "Jaipur Apex Hub",
          occurred_at: "2026-08-28T11:00:00.000Z",
          source: "POLL",
        },
        {
          id: "ev-11",
          status: "PICKED_UP",
          raw_status: "Package collected",
          location: "Jaipur Hub",
          occurred_at: "2026-08-28T16:00:00.000Z",
          source: "POLL",
        },
        {
          id: "ev-12",
          status: "IN_TRANSIT",
          raw_status: "Reached Delhi Hub",
          location: "Delhi Airport Cargo",
          occurred_at: "2026-08-29T08:00:00.000Z",
          source: "POLL",
        },
        {
          id: "ev-13",
          status: "OUT_FOR_DELIVERY",
          raw_status: "Out for delivery with Courier Executive",
          location: "Noida Sector 62 DC",
          occurred_at: "2026-08-30T09:30:00.000Z",
          source: "POLL",
        },
        {
          id: "ev-14",
          status: "DELIVERED",
          raw_status: "Delivered to recipient (Signed by Amit)",
          location: "Noida Sector 62",
          occurred_at: "2026-08-30T14:15:00.000Z",
          source: "WEBHOOK",
        },
      ],
    },
    reviewed_by_name: "Admin Staff",
    reviewed_at: "2026-08-28T10:00:00.000Z",
    created_at: "2026-08-28T08:30:00.000Z",
    updated_at: "2026-08-30T14:15:00.000Z",
  },
  {
    id: "bk-1009",
    booking_number: "BK-1009",
    customer_id: "cust-3",
    customer_name: "Karan Johar Enterprises",
    customer_mobile: "9876543210", // Matching sender mobile for disambiguation test
    source: "STAFF",
    created_by_name: "Admin Staff",
    status: "APPROVED",
    payment_type: "COD",
    cod_amount: 150000,
    sender_name: "Karan Johar",
    sender_mobile: "9876543210",
    sender_address: "Plot 88, Malviya Nagar",
    sender_city: "Jaipur",
    sender_state: "Rajasthan",
    sender_pincode: "302022",
    receiver_name: "Ramesh Bafna",
    receiver_mobile: "9820011223",
    receiver_address: "Charni Road, Opera House",
    receiver_city: "Mumbai",
    receiver_state: "Maharashtra",
    receiver_pincode: "400004",
    parcels: [
      {
        id: "p-105",
        parcel_type: "Jewellery Samples / Imitation",
        description: "Brass and copper ornament samples",
        submitted_weight_grams: 500,
        submitted_length_cm: 10,
        submitted_width_cm: 10,
        submitted_height_cm: 8,
        declared_value: 150000,
        verified_weight_grams: 500,
        verified_length_cm: 10,
        verified_width_cm: 10,
        verified_height_cm: 8,
        verified_by: "Admin Staff",
        verified_at: "2026-08-20T11:00:00.000Z",
      },
    ],
    charges: {
      shipping_charge: 9000,
      additional_charge: 1000,
      discount: 0,
      tax: 1800,
      total: 11800,
      set_by: "Admin Staff",
      set_at: "2026-08-20T11:00:00.000Z",
    },
    shipment: {
      id: "sh-503",
      booking_id: "bk-1009",
      courier_partner_id: "courier-3",
      courier_name: "DTDC Express",
      awb: "DTD99182310",
      awb_source: "API",
      status: "DELIVERED",
      tracking_token: "tok_dtd_99182310_sec_77c",
      idempotency_key: "idemp_bk-1009",
      last_synced_at: "2026-08-24T18:00:00.000Z",
      tracking_events: [
        {
          id: "ev-20",
          status: "BOOKED",
          raw_status: "Booked at origin branch",
          location: "Jaipur Malviya Nagar",
          occurred_at: "2026-08-20T11:30:00.000Z",
          source: "POLL",
        },
        {
          id: "ev-21",
          status: "DELIVERED",
          raw_status: "Delivered to customer",
          location: "Mumbai Opera House",
          occurred_at: "2026-08-24T17:30:00.000Z",
          source: "POLL",
        },
      ],
    },
    created_at: "2026-08-20T10:00:00.000Z",
    updated_at: "2026-08-24T17:30:00.000Z",
  },
];

export const MOCK_COD_SETTLEMENTS: MockCodSettlement[] = [
  {
    id: "batch-101",
    courier_partner_name: "Delhivery",
    reference_utr: "UTR-DEL-20260901-8849",
    total_amount: 14500000, // ₹1,45,000.00
    reconciled_amount: 14500000,
    status: "RECONCILED",
    settled_at: "2026-09-01T15:30:00.000Z",
    transaction_count: 32,
  },
  {
    id: "batch-102",
    courier_partner_name: "Blue Dart",
    reference_utr: "UTR-BLU-20260830-4412",
    total_amount: 3740000, // ₹37,400.00
    reconciled_amount: 3740000,
    status: "RECONCILED",
    settled_at: "2026-08-30T12:00:00.000Z",
    transaction_count: 14,
  },
  {
    id: "batch-103",
    courier_partner_name: "DTDC Express",
    reference_utr: "UTR-DTD-20260902-1920",
    total_amount: 4520000, // ₹45,200.00
    reconciled_amount: 4200000, // ₹3,200 discrepancy
    status: "DISCREPANCY",
    settled_at: "2026-09-02T09:00:00.000Z",
    transaction_count: 11,
  },
];

export const MOCK_SUPPORT_TICKETS: MockSupportTicket[] = [
  {
    id: "tick-1",
    ticket_number: "TCK-4091",
    booking_number: "BK-1025",
    raised_by_name: "Rahul Sharma",
    type: "WEIGHT_DISPUTE",
    status: "OPEN",
    assigned_to_name: "Operations Lead",
    subject: "Chargeable weight discrepancy on handcrafted quilts",
    description:
      "Customer submitted 2.0 kg but parcel was weighed at 2.5 kg at sorting hub. Customer requesting calibration verification photo.",
    created_at: "2026-09-01T16:00:00.000Z",
    notes_count: 3,
  },
  {
    id: "tick-2",
    ticket_number: "TCK-4088",
    booking_number: "BK-1012",
    raised_by_name: "Meera Patel",
    type: "DELAY",
    status: "IN_PROGRESS",
    assigned_to_name: "Support Executive",
    subject: "Shipment stuck at Ahmedabad hub for 48 hours",
    description: "Courier tracking indicates weather delay in transit corridor.",
    created_at: "2026-08-31T11:20:00.000Z",
    notes_count: 5,
  },
];

export const MOCK_COMPANY_SETTINGS = {
  company_name: "SS Courier service Pvt. Ltd.",
  brand_tagline: "Fast, Safe & Multi-Carrier Courier Logistics",
  support_email: "support@sscourierservice.in",
  support_phone: "8000151117, 7689987368",
  support_phones: ["8000151117", "7689987368"],
  whatsapp_number: "8000151117",
  address: "Shop No 4, 5th Crossing, Padmavati School, Ghee Walo Ka Rasta, Johri Bazar",
  city: "Jaipur",
  state: "Rajasthan",
  pincode: "302003",
  operating_hours: "Mon - Sat: 08:00 AM - 09:00 PM IST",
  google_maps_embed_url:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.484920272099!2d75.82412537611685!3d26.921104759799295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db14b1a473b11%3A0xb35a0f5a11c1e5cb!2sJohri%20Bazar%2C%20Jaipur%2C%20Rajasthan%20302003!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin",
  latitude: 26.9211,
  longitude: 75.8267,
  max_declared_value_paise: 50000000, // ₹5,00,000 max cap
};

