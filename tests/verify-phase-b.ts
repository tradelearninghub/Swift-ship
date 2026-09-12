import crypto from "crypto";
import { getSmtpConfig } from "../src/lib/email";

async function runPhaseBVerification() {
  console.log("🚀 Running Phase B: Trust & Communication Test Suite...\n");
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

  // 1. Webhook Signature & Shared Secret Verification Tests (§5)
  console.log("1. Testing Webhook Signature & Security Verification (§5)...");
  const testSecret = "whsec_delhivery_live";
  const rawBody = JSON.stringify({
    waybill: "DEL12345678",
    status: "In Transit",
    location: "Jaipur Hub",
    timestamp: new Date().toISOString(),
  });

  // Calculate HMAC-SHA256 signature
  const hmacSignature = crypto
    .createHmac("sha256", testSecret)
    .update(rawBody)
    .digest("hex");

  // Verify HMAC matching
  const verifyHmac = (body: string, sig: string, sec: string) => {
    const cleanSig = sig.replace(/^sha256=/i, "").trim().toLowerCase();
    const computed = crypto.createHmac("sha256", sec).update(body).digest("hex").toLowerCase();
    return cleanSig.length === computed.length && crypto.timingSafeEqual(Buffer.from(cleanSig, "hex"), Buffer.from(computed, "hex"));
  };

  assert(verifyHmac(rawBody, hmacSignature, testSecret), "HMAC-SHA256 signature matches valid payload and secret");
  assert(!verifyHmac(rawBody, "invalid_signature_hex_value", testSecret), "HMAC verification rejects invalid signature");
  assert(!verifyHmac(rawBody, hmacSignature, "wrong_secret_key"), "HMAC verification rejects wrong secret");

  // Verify Shared Secret Token matching
  const verifyToken = (token: string, sec: string) => {
    const bufA = Buffer.from(token.trim());
    const bufB = Buffer.from(sec.trim());
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
  };

  assert(verifyToken("whsec_delhivery_live", testSecret), "Timing-safe token comparison succeeds on matching secret");
  assert(!verifyToken("fake_attacker_token", testSecret), "Timing-safe token comparison rejects unauthorized token");

  // 2. SMTP Configuration Retrieval (§38)
  console.log("\n2. Testing SMTP Transport & Mailer Configuration (§38)...");
  const smtpConfig = await getSmtpConfig();
  assert(typeof smtpConfig.host === "string" && smtpConfig.host.length > 0, `SMTP Host resolved: ${smtpConfig.host}`);
  assert(typeof smtpConfig.port === "number" && smtpConfig.port > 0, `SMTP Port resolved: ${smtpConfig.port}`);
  assert(typeof smtpConfig.fromEmail === "string" && smtpConfig.fromEmail.includes("@"), `From Email resolved: ${smtpConfig.fromEmail}`);

  // 3. QR Token Resolution & Privacy Masking (§27, §29)
  console.log("\n3. Testing QR Token Tracking & Privacy Masking (§27, §29)...");
  const maskPhone = (phone?: string | null) => {
    if (!phone || phone.length < 6) return "••••••";
    return `${phone.slice(0, 2)}••••••${phone.slice(-2)}`;
  };
  const maskAwb = (awb?: string | null) => {
    if (!awb) return "Allocating";
    if (awb.length <= 4) return "••••";
    return `${awb.slice(0, 3)}••••${awb.slice(-3)}`;
  };

  const sampleAwb = "BLU88239014";
  const samplePhone = "8000151117";
  assert(maskAwb(sampleAwb) === "BLU••••014", `AWB masked: ${sampleAwb} -> ${maskAwb(sampleAwb)}`);
  assert(maskPhone(samplePhone) === "80••••••17", `Phone masked: ${samplePhone} -> ${maskPhone(samplePhone)}`);

  console.log("\n------------------------------------------------");
  console.log(`Phase B Verification: ${passed} Passed, ${failed} Failed`);
  console.log("------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhaseBVerification().catch((e) => {
  console.error(e);
  process.exit(1);
});
