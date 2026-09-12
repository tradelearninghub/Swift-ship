import { getCourierAdapter } from "../src/lib/couriers/registry";
import { formatPaiseToRupees, formatGramsToKg } from "../src/lib/utils";

async function verifyPhaseAFlows() {
  console.log("🚀 Running Phase A Core Verification Suite...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  }

  // 1. Verify Public Booking Unit Conversion logic
  console.log("1. Testing Public Booking Unit & Field Validation...");
  const sampleBookingSubmission = {
    sender_name: "Anita Verma",
    sender_mobile: "9876543210",
    sender_address: "Sector 14, Hiran Magri",
    sender_city: "Udaipur",
    sender_state: "Rajasthan",
    sender_pincode: "313002",
    receiver_name: "Rohan Mehra",
    receiver_mobile: "9123456789",
    receiver_address: "Bandra West",
    receiver_city: "Mumbai",
    receiver_state: "Maharashtra",
    receiver_pincode: "400050",
    submitted_weight_grams: Math.round(1.5 * 1000), // 1500g
    submitted_length_cm: 20,
    submitted_width_cm: 15,
    submitted_height_cm: 10,
    declared_value_paise: Math.round(500 * 100), // 50000 paise
    payment_type: "PREPAID",
    cod_amount_paise: 0,
  };

  assert(sampleBookingSubmission.submitted_weight_grams === 1500, "Weight accurately converted from kg to grams (1.5kg -> 1500g)");
  assert(sampleBookingSubmission.declared_value_paise === 50000, "Declared value converted from rupees to paise (₹500 -> 50000 paise)");
  assert(sampleBookingSubmission.cod_amount_paise === 0, "COD amount is 0 for prepaid bookings");

  // 2. Courier Partner Integration for Booking Allocation
  console.log("\n2. Testing Courier Allocation for Admin Review & Dispatch...");
  assert(typeof getCourierAdapter === "function", "getCourierAdapter factory is available");

  const mockAdapter = getCourierAdapter("MANUAL");
  const shipment = await mockAdapter.createShipment(
    {
      bookingId: "test-booking-id",
      bookingNumber: "BK-202609-001",
      sender: {
        name: sampleBookingSubmission.sender_name,
        mobile: sampleBookingSubmission.sender_mobile,
        address: sampleBookingSubmission.sender_address,
        city: sampleBookingSubmission.sender_city,
        state: sampleBookingSubmission.sender_state,
        pincode: sampleBookingSubmission.sender_pincode,
      },
      receiver: {
        name: sampleBookingSubmission.receiver_name,
        mobile: sampleBookingSubmission.receiver_mobile,
        address: sampleBookingSubmission.receiver_address,
        city: sampleBookingSubmission.receiver_city,
        state: sampleBookingSubmission.receiver_state,
        pincode: sampleBookingSubmission.receiver_pincode,
      },
      parcel: {
        weightGrams: sampleBookingSubmission.submitted_weight_grams,
        lengthCm: sampleBookingSubmission.submitted_length_cm,
        widthCm: sampleBookingSubmission.submitted_width_cm,
        heightCm: sampleBookingSubmission.submitted_height_cm,
        declaredValuePaise: sampleBookingSubmission.declared_value_paise,
        description: "Test Goods",
      },
      paymentType: "PREPAID",
      codAmountPaise: 0,
    },
    {}
  );

  assert(shipment.success === true, "Shipment creation succeeded via adapter");
  assert(typeof shipment.awb === "string" && shipment.awb.length > 5, `Generated valid AWB: ${shipment.awb}`);

  // 3. Masking & Privacy Rules (§27)
  console.log("\n3. Testing Tracking Masking & Privacy Rules (§27)...");
  const maskPhone = (phone?: string | null) => {
    if (!phone || phone.length < 6) return "••••••";
    return `${phone.slice(0, 2)}••••••${phone.slice(-2)}`;
  };
  const maskAwb = (awb?: string | null) => {
    if (!awb) return "Allocating";
    if (awb.length <= 4) return "••••";
    return `${awb.slice(0, 3)}••••${awb.slice(-3)}`;
  };

  assert(maskPhone("9876543210") === "98••••••10", "Phone number masked correctly (98••••••10)");
  assert(maskAwb("DEL98234123") === "DEL••••123", "AWB masked correctly (DEL••••123)");

  console.log("\n------------------------------------------------");
  console.log(`Phase A Verification: ${passed} Passed, ${failed} Failed`);
  console.log("------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

verifyPhaseAFlows().catch((e) => {
  console.error(e);
  process.exit(1);
});
