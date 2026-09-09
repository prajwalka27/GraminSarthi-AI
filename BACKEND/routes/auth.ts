import { normalizeIndianPhoneNumber, maskPhoneNumber } from "../utils/phone.js";
import { sendRealSmsOtp, verifyRealSmsOtp } from "../services/sms.js";
import {
    checkCanSendOtp,
    recordOtpSent,
    recordVerificationAttempt,
    recordVerificationSuccess,
} from "../services/otp-limiter.js";
import {
    createSessionToken,
    verifySessionToken,
    parseCookies,
    buildSessionCookieHeader,
    buildClearSessionCookieHeader,
} from "../services/session.js";
import { getMerchantByMobile, createMerchant, getMerchantById } from "./merchant.js";
import { getBusinessesByMerchant, createBusiness } from "./business.js";
import { ValidationError, AppError } from "../utils/validation.js";

export interface SendOtpRequest {
    phone: string;
}

export interface VerifyOtpRequest {
    phone: string;
    otp: string;
    name?: string;
    shopName?: string;
    category?: string;
}

/**
 * Handles POST /api/auth/send-otp
 * Validates Indian phone number, checks rate limiting, and sends real SMS OTP via configured provider.
 */
export async function handleSendOtp(body: any): Promise<{
    message: string;
    data: {
        phone: string;
        cooldownSeconds: number;
        expiresInSeconds: number;
    };
}> {
    const rawPhone = body?.phone || body?.mobile;
    const normalizedPhone = normalizeIndianPhoneNumber(rawPhone);

    // 1. Check rate limits & 60s cooldown
    const limitCheck = checkCanSendOtp(normalizedPhone);
    if (!limitCheck.allowed) {
        throw new AppError(limitCheck.reason || "Please wait before requesting another OTP", 429);
    }

    // 2. Dispatch real SMS OTP
    await sendRealSmsOtp(normalizedPhone);

    // 3. Record send timestamp
    recordOtpSent(normalizedPhone);

    return {
        message: "OTP sent successfully",
        data: {
            phone: maskPhoneNumber(normalizedPhone),
            cooldownSeconds: 60,
            expiresInSeconds: 300,
        },
    };
}

/**
 * Handles POST /api/auth/verify-otp
 * Verifies real SMS OTP, checks attempt caps, finds or creates merchant in database, issues session.
 */
export async function handleVerifyOtp(body: any): Promise<{
    message: string;
    token: string;
    cookieHeader: string;
    data: {
        merchant: any;
        business: any | null;
        token: string;
    };
}> {
    const rawPhone = body?.phone || body?.mobile;
    const normalizedPhone = normalizeIndianPhoneNumber(rawPhone);
    const otp = typeof body?.otp === "string" ? body.otp.trim() : String(body?.otp || "").trim();

    if (!otp || otp.length < 4 || otp.length > 8 || !/^\d+$/.test(otp)) {
        throw new ValidationError("Invalid OTP format. OTP must be a 4 to 8 digit numeric code.");
    }

    // 1. Check attempts & expiry
    const attempt = recordVerificationAttempt(normalizedPhone);
    if (!attempt.allowed) {
        if (attempt.isExpired) {
            throw new AppError("OTP expired", 400);
        }
        throw new AppError(attempt.reason || "Invalid OTP", 400);
    }

    // 2. Real provider OTP check
    const verifyResult = await verifyRealSmsOtp(normalizedPhone, otp);
    if (!verifyResult.verified) {
        if (verifyResult.message?.toLowerCase().includes("expired")) {
            throw new ValidationError("OTP expired");
        }
        throw new ValidationError("Invalid OTP");
    }

    // 3. Mark verification successful
    recordVerificationSuccess(normalizedPhone);

    // 4. Find or create merchant in PostgreSQL/store
    let merchant = await getMerchantByMobile(normalizedPhone);

    if (!merchant) {
        const ownerName = typeof body?.name === "string" && body.name.trim() ? body.name.trim() : "Merchant";
        const businessName = typeof body?.shopName === "string" && body.shopName.trim() ? body.shopName.trim() : `${ownerName}'s Store`;
        const category = typeof body?.category === "string" && body.category.trim() ? body.category.trim() : "Kirana / General Store";

        merchant = await createMerchant({
            ownerName,
            businessName,
            phone: normalizedPhone,
            category,
            language: body?.language || "en",
        });

        // Also provision initial default business for this verified merchant
        try {
            await createBusiness({
                merchantId: merchant.id,
                businessName,
                businessCategory: category,
            });
        } catch {
            // Ignore if business creation fails
        }
    }

    // 5. Fetch merchant's active businesses
    const businesses = await getBusinessesByMerchant(merchant.id);
    const activeBusiness = businesses.length > 0 ? businesses[0] : null;

    // 6. Generate cryptographic session token and cookie header
    const token = createSessionToken(merchant.id, normalizedPhone);
    const cookieHeader = buildSessionCookieHeader(token);

    return {
        message: "Phone number verified successfully",
        token,
        cookieHeader,
        data: {
            merchant,
            business: activeBusiness,
            token,
        },
    };
}

/**
 * Handles GET /api/auth/session or GET /api/auth/me
 */
export async function handleGetSession(
    cookieHeader?: string | null,
    authHeader?: string | null
): Promise<{
    authenticated: boolean;
    merchant: any | null;
    businesses: any[];
}> {
    let token: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7).trim();
    } else if (cookieHeader) {
        const cookies = parseCookies(cookieHeader);
        token = cookies["graminsarthi_session"] || null;
    }

    if (!token) {
        return { authenticated: false, merchant: null, businesses: [] };
    }

    const payload = verifySessionToken(token);
    if (!payload) {
        return { authenticated: false, merchant: null, businesses: [] };
    }

    const merchant = await getMerchantById(payload.merchantId);
    if (!merchant) {
        return { authenticated: false, merchant: null, businesses: [] };
    }

    const businesses = await getBusinessesByMerchant(merchant.id);

    return {
        authenticated: true,
        merchant,
        businesses,
    };
}

/**
 * Handles POST /api/auth/logout
 */
export function handleLogout(): {
    message: string;
    clearCookieHeader: string;
} {
    return {
        message: "Logged out successfully",
        clearCookieHeader: buildClearSessionCookieHeader(),
    };
}

