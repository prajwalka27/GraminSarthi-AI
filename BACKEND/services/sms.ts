import "dotenv/config";
import { AppError } from "../utils/validation.js";

export interface SendOtpResult {
    success: boolean;
    provider: string;
    message?: string;
    serviceSid?: string;
}

export interface VerifyOtpResult {
    verified: boolean;
    provider: string;
    message?: string;
}

/**
 * Validates whether the configured SMS provider has required credentials in environment.
 */
export function getActiveSmsProvider(): {
    provider: "twilio" | "msg91";
    isConfigured: boolean;
    missingKeys: string[];
} {
    const raw = (process.env.SMS_PROVIDER || "twilio").toLowerCase().trim();

    if (raw === "msg91") {
        const missing: string[] = [];
        if (!process.env.MSG91_AUTH_KEY) missing.push("MSG91_AUTH_KEY");
        if (!process.env.MSG91_TEMPLATE_ID) missing.push("MSG91_TEMPLATE_ID");
        return {
            provider: "msg91",
            isConfigured: missing.length === 0,
            missingKeys: missing,
        };
    }

    // Default: Twilio Verify
    const missing: string[] = [];
    if (!process.env.TWILIO_ACCOUNT_SID) missing.push("TWILIO_ACCOUNT_SID");
    if (!process.env.TWILIO_AUTH_TOKEN) missing.push("TWILIO_AUTH_TOKEN");
    if (!process.env.TWILIO_VERIFY_SERVICE_SID) missing.push("TWILIO_VERIFY_SERVICE_SID");

    return {
        provider: "twilio",
        isConfigured: missing.length === 0,
        missingKeys: missing,
    };
}

/**
 * Sends a real SMS OTP to the normalized phone number (+91XXXXXXXXXX) using the configured SMS provider.
 * Strict zero-log policy: Never prints OTP to terminal or logs.
 */
export async function sendRealSmsOtp(normalizedPhone: string): Promise<SendOtpResult> {
    const { provider, isConfigured, missingKeys } = getActiveSmsProvider();

    if (!isConfigured) {
        throw new AppError(
            `SMS OTP service is not configured. Missing required environment variables: ${missingKeys.join(", ")}. Please configure these in BACKEND/.env.`,
            503,
            "SMS_NOT_CONFIGURED"
        );
    }

    if (provider === "twilio") {
        return sendTwilioVerifyOtp(normalizedPhone);
    } else if (provider === "msg91") {
        return sendMsg91Otp(normalizedPhone);
    }

    throw new AppError(`Unsupported SMS provider: '${provider}'`, 400);
}

/**
 * Verifies the user-entered OTP with the real SMS provider.
 */
export async function verifyRealSmsOtp(normalizedPhone: string, otpCode: string): Promise<VerifyOtpResult> {
    const { provider, isConfigured, missingKeys } = getActiveSmsProvider();

    if (!isConfigured) {
        throw new AppError(
            `SMS OTP service is not configured. Missing required environment variables: ${missingKeys.join(", ")}. Please configure these in BACKEND/.env.`,
            503,
            "SMS_NOT_CONFIGURED"
        );
    }

    if (provider === "twilio") {
        return verifyTwilioVerifyOtp(normalizedPhone, otpCode);
    } else if (provider === "msg91") {
        return verifyMsg91Otp(normalizedPhone, otpCode);
    }

    throw new Error(`Unsupported SMS provider: '${provider}'`);
}

// =============================================================================
// TWILIO VERIFY API IMPLEMENTATION
// Uses Twilio's official Verify v2 REST API over standard HTTPS.
// =============================================================================

async function sendTwilioVerifyOtp(phone: string): Promise<SendOtpResult> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;

    const url = `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`;
    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const body = new URLSearchParams({
        To: phone,
        Channel: "sms",
    });

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Basic ${basicAuth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
        const errorMsg = json?.message || `Twilio Verify failed with HTTP ${res.status}`;
        throw new Error(`Twilio SMS error: ${errorMsg}`);
    }

    return {
        success: true,
        provider: "twilio",
        serviceSid,
        message: "SMS OTP sent successfully via Twilio Verify",
    };
}

async function verifyTwilioVerifyOtp(phone: string, code: string): Promise<VerifyOtpResult> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;

    const url = `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`;
    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const body = new URLSearchParams({
        To: phone,
        Code: code.trim(),
    });

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Basic ${basicAuth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
        const errorMsg = json?.message || `Twilio VerificationCheck failed with HTTP ${res.status}`;
        return {
            verified: false,
            provider: "twilio",
            message: errorMsg,
        };
    }

    const isApproved = json?.status === "approved" && Boolean(json?.valid);

    return {
        verified: isApproved,
        provider: "twilio",
        message: isApproved ? "OTP verified successfully" : "Invalid OTP code",
    };
}

// =============================================================================
// MSG91 SEND-OTP API IMPLEMENTATION
// Uses MSG91's official v5 OTP REST API for Indian domestic SMS delivery.
// =============================================================================

async function sendMsg91Otp(phone: string): Promise<SendOtpResult> {
    const authKey = process.env.MSG91_AUTH_KEY!;
    const templateId = process.env.MSG91_TEMPLATE_ID!;

    // MSG91 expects digits with country code without plus (e.g. 919876543210)
    const mobileDigits = phone.replace(/\D/g, "");

    const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${mobileDigits}&authkey=${authKey}&otp_length=6&otp_expiry=5`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || json?.type === "error") {
        const msg = json?.message || `MSG91 failed with HTTP ${res.status}`;
        throw new Error(`MSG91 SMS error: ${msg}`);
    }

    return {
        success: true,
        provider: "msg91",
        message: "SMS OTP sent successfully via MSG91",
    };
}

async function verifyMsg91Otp(phone: string, code: string): Promise<VerifyOtpResult> {
    const authKey = process.env.MSG91_AUTH_KEY!;
    const mobileDigits = phone.replace(/\D/g, "");

    const url = `https://control.msg91.com/api/v5/otp/verify?otp=${encodeURIComponent(code.trim())}&mobile=${mobileDigits}&authkey=${authKey}`;

    const res = await fetch(url, {
        method: "GET",
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || json?.type === "error") {
        return {
            verified: false,
            provider: "msg91",
            message: json?.message || "Invalid OTP code",
        };
    }

    const isApproved = json?.type === "success";

    return {
        verified: isApproved,
        provider: "msg91",
        message: isApproved ? "OTP verified successfully" : "Invalid OTP code",
    };
}
