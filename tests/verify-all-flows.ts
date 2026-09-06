import { hashPassword, verifyPassword, signToken, verifyToken, SessionUser } from "../src/lib/auth";
import { DelhiveryAdapter } from "../src/lib/couriers/delhivery";
import { BlueDartAdapter } from "../src/lib/couriers/bluedart";
import { MockManualAdapter } from "../src/lib/couriers/mock";
import { getCourierAdapter } from "../src/lib/couriers/registry";
import { formatPaiseToRupees, formatGramsToKg } from "../src/lib/utils";

async function runVerificationTests() {
  console.log("🚀 Running Swift Ship Platform Verification Test Suite...\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Password Hashing & Verification Test
  console.log("1. Testing Authentication & Session Signing...");
  const rawPassword = "TestPassword@2026";
  const hash = await hashPassword(rawPassword);
  assert(await verifyPassword(rawPassword, hash), "Bcrypt password hashing and verification");
  assert(!(await verifyPassword("WrongPassword", hash)), "Bcrypt rejection on invalid password");

  // 2. JWT Session Token Test
  const mockUser: SessionUser = {
    id: "usr-test-1",
    name: "Rahul Sharma",
    email: "rahul@example.com",
    mobile: "9876543210",
    role: "SUPER_ADMIN",
    permissions: ["booking.create", "booking.approve", "settings.manage"],
  };
  const token = signToken(mockUser);
  const decoded = verifyToken(token);
  assert(decoded?.id === mockUser.id && decoded?.role === "SUPER_ADMIN", "JWT Token Signing & Verification");

  // 3. Money in Paise Formatting Test (§25)
  console.log("\n2. Testing Financial & Metric Helpers...");
  assert(formatPaiseToRupees(15050) === "₹150.50", "Paise to Rupees conversion (15050 paise -> ₹150.50)");
  assert(formatPaiseToRupees(0) === "₹0.00", "Zero paise formatting");
  assert(formatGramsToKg(2500) === "2.50 kg", "Grams to Kg conversion (2500g -> 2.50 kg)");

  // 4. Courier Adapters & Diagnostics Test (§19–24)
  console.log("\n3. Testing Courier Partner Adapters...");
  const delhivery = getCourierAdapter("DELHIVERY");
  assert(delhivery instanceof DelhiveryAdapter, "Delhivery Adapter resolution from registry");

  const bluedart = getCourierAdapter("BLUEDART");
  assert(bluedart instanceof BlueDartAdapter, "Blue Dart Adapter resolution from registry");

  const manual = getCourierAdapter("UNKNOWN_CODE");
  assert(manual instanceof MockManualAdapter, "Fallback to Mock/Manual Adapter on unknown code");

  // Test Shipment creation on Delhivery adapter
  const shipmentRes = await delhivery.createShipment(
    {
      bookingId: "bk-test-1",
      bookingNumber: "BK-1001",
      sender: {
        name: "Sender Name",
        mobile: "9876543210",
        address: "Tonk Road",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302022",
      },
      receiver: {
        name: "Receiver Name",
        mobile: "9812345678",
        address: "Whitefield",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560066",
      },
      parcel: {
        weightGrams: 2000,
        lengthCm: 20,
        widthCm: 15,
        heightCm: 10,
        declaredValuePaise: 250000,
        description: "Electronics",
      },
      paymentType: "PREPAID",
      codAmountPaise: 0,
    },
    {}
  );
  assert(shipmentRes.success && shipmentRes.awb.startsWith("DEL"), "Delhivery Shipment AWB Generation");

  // Test connection diagnostic (§23)
  const diag = await delhivery.testConnection({});
  assert(diag.authSuccess && diag.trackingReachable, "Courier Test Connection Diagnostic (§23)");

  console.log("\n------------------------------------------------");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerificationTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
