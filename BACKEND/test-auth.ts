import { normalizeIndianPhoneNumber, isValidIndianMobile, maskPhoneNumber } from "./utils/phone.js";

const BACKEND = "http://localhost:5000";

async function runTests() {
    console.log("==================================================");
    console.log("REAL PHONE-NUMBER AUTHENTICATION TEST SUITE");
    console.log("==================================================\n");

    // 1. Phone Normalization Unit Tests
    console.log("--- 1. Testing Indian Phone Number Normalization ---");
    const validCases: [string, string][] = [
        ["9876543210", "+919876543210"],
        ["+919876543210", "+919876543210"],
        ["919876543210", "+919876543210"],
        ["09876543210", "+919876543210"],
        ["+91 98765 43210", "+919876543210"],
        ["98765-43210", "+919876543210"],
        ["7890123456", "+917890123456"],
        ["6999999999", "+916999999999"],
        ["8123456789", "+918123456789"],
    ];

    for (const [input, expected] of validCases) {
        const normalized = normalizeIndianPhoneNumber(input);
        if (normalized !== expected) {
            throw new Error(`Failed to normalize "${input}": expected "${expected}", got "${normalized}"`);
        }
        console.log(`  ✓ "${input}" -> "${normalized}"`);
    }

    const invalidCases = [
        "1234567890", // starts with 1 (not 6,7,8,9)
        "5123456789", // starts with 5
        "98765",      // too short
        "987654321000", // too long
        "abcdefghij", // non-numeric
        "",           // empty
    ];

    console.log("\n--- 2. Testing Invalid Indian Phone Numbers Rejection ---");
    for (const input of invalidCases) {
        let threw = false;
        try {
            normalizeIndianPhoneNumber(input);
        } catch {
            threw = true;
        }
        if (!threw) {
            throw new Error(`Expected invalid number "${input}" to throw ValidationError`);
        }
        console.log(`  ✓ Successfully rejected invalid: "${input}"`);
    }

    console.log("\n--- 3. Testing Masking Helper ---");
    const masked = maskPhoneNumber("+919876543210");
    if (masked !== "+91******3210") {
        throw new Error(`Expected "+91******3210", got "${masked}"`);
    }
    console.log(`  ✓ Masked: "${masked}"`);

    // 2. Health Endpoint Check
    console.log("\n--- 4. Checking Existing /api/health Endpoint ---");
    const healthRes = await fetch(`${BACKEND}/api/health`);
    const health = (await healthRes.json()) as any;
    console.log("  ✓ Health:", health);
    if (!health.success || health.data?.message !== "Backend is running") {
        throw new Error("Health endpoint regression detected!");
    }

    // 3. Testing POST /api/auth/send-otp with invalid phone
    console.log("\n--- 5. Testing POST /api/auth/send-otp with invalid phone ---");
    const badSendRes = await fetch(`${BACKEND}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "12345" }),
    });
    const badSendJson = (await badSendRes.json()) as any;
    console.log(`  ✓ HTTP ${badSendRes.status}:`, badSendJson.message);
    if (badSendRes.status !== 400 || badSendJson.success !== false) {
        throw new Error("Expected 400 for invalid phone number");
    }

    // 4. Testing POST /api/auth/send-otp with valid phone when SMS provider is not yet configured
    console.log("\n--- 6. Testing Real SMS Provider Configuration Guard ---");
    const sendRes = await fetch(`${BACKEND}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "9876543210" }),
    });
    const sendJson = (await sendRes.json()) as any;
    console.log(`  ✓ Response HTTP ${sendRes.status}:`, sendJson.message);
    // As per user requirement: "If SMS credentials are not configured, clearly return an error such as:
    // { "success": false, "message": "SMS OTP service is not configured" }. Do not show a fake OTP."
    if (!sendJson.message?.includes("SMS OTP service is not configured")) {
        throw new Error(`Expected missing provider error message, got: ${JSON.stringify(sendJson)}`);
    }
    console.log("  ✓ Verified: Real SMS credentials check is active. No fake/mock OTP is returned!");

    // 5. Testing POST /api/auth/verify-otp with bad OTP format
    console.log("\n--- 7. Testing POST /api/auth/verify-otp format validation ---");
    const verifyFormatRes = await fetch(`${BACKEND}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "9876543210", otp: "abc" }),
    });
    const verifyFormatJson = (await verifyFormatRes.json()) as any;
    console.log(`  ✓ HTTP ${verifyFormatRes.status}:`, verifyFormatJson.message);
    if (verifyFormatRes.status !== 400 || verifyFormatJson.success !== false) {
        throw new Error("Expected 400 for invalid OTP format");
    }

    // 6. Testing GET /api/auth/session when unauthenticated
    console.log("\n--- 8. Testing GET /api/auth/session without token ---");
    const sessionRes = await fetch(`${BACKEND}/api/auth/session`);
    const sessionJson = (await sessionRes.json()) as any;
    console.log("  ✓ Session response:", sessionJson);
    if (sessionJson.data?.authenticated !== false) {
        throw new Error("Expected authenticated: false for unauthenticated user");
    }

    // 7. Testing POST /api/auth/logout
    console.log("\n--- 9. Testing POST /api/auth/logout ---");
    const logoutRes = await fetch(`${BACKEND}/api/auth/logout`, { method: "POST" });
    const logoutJson = (await logoutRes.json()) as any;
    const setCookie = logoutRes.headers.get("set-cookie");
    console.log("  ✓ Logout:", logoutJson.data?.message, "| Set-Cookie:", setCookie ? "cleared" : "none");

    // 8. Testing Rate Limiting & Cooldown Unit Tests
    console.log("\n--- 10. Testing Rate Limiting & 60s Resend Cooldown ---");
    const { checkCanSendOtp, recordOtpSent, recordVerificationAttempt } = await import("./services/otp-limiter.js");
    const testPhone = "+919999999999";
    const initialCheck = checkCanSendOtp(testPhone);
    if (!initialCheck.allowed) throw new Error("Expected initial send to be allowed");
    recordOtpSent(testPhone);

    const immediateRetry = checkCanSendOtp(testPhone);
    console.log("  ✓ Immediate retry allowed:", immediateRetry.allowed, "| Wait seconds:", immediateRetry.waitSeconds);
    if (immediateRetry.allowed !== false || !immediateRetry.waitSeconds) {
        throw new Error("Expected immediate retry to be blocked by cooldown");
    }

    console.log("\n--- 11. Testing Brute-Force Verification Limit (5 attempts max) ---");
    for (let attempt = 1; attempt <= 5; attempt++) {
        const res = recordVerificationAttempt(testPhone);
        if (!res.allowed) throw new Error(`Expected attempt ${attempt} to be allowed`);
        console.log(`  ✓ Attempt ${attempt} recorded, remaining attempts: ${res.remainingAttempts}`);
    }
    const sixthAttempt = recordVerificationAttempt(testPhone);
    console.log("  ✓ 6th attempt allowed:", sixthAttempt.allowed, "| Reason:", sixthAttempt.reason);
    if (sixthAttempt.allowed !== false) {
        throw new Error("Expected 6th attempt to be blocked due to maximum attempts exceeded");
    }

    console.log("\n==================================================");
    console.log("ALL REAL PHONE AUTHENTICATION TESTS PASSED 100%!");
    console.log("==================================================");
}

runTests().catch((err) => {
    console.error("Test Suite Failed:", err);
    process.exit(1);
});
