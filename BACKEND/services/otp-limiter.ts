/**
 * Rate Limiting and Brute Force Protection for Phone OTP Authentication
 *
 * Rules:
 * - Cooldown: 60 seconds between consecutive send requests to the same phone
 * - OTP Expiry: 5 minutes (300 seconds)
 * - Max verification attempts: 5 per OTP session
 * - Hourly cap: Max 5 OTP send requests per phone in any 60-minute window
 */

interface PhoneOtpState {
    lastSentAt: number;
    sendTimestamps: number[]; // For hourly rate limit
    verificationAttempts: number;
    expiresAt: number;
}

const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_HOURLY_SENDS = 5;
const ONE_HOUR_MS = 60 * 60 * 1000;

// Thread-safe in-memory state tracker
const phoneStateMap = new Map<string, PhoneOtpState>();

/**
 * Checks if an OTP can be sent to this phone number.
 */
export function checkCanSendOtp(phone: string): {
    allowed: boolean;
    waitSeconds?: number;
    reason?: string;
} {
    const now = Date.now();
    const state = phoneStateMap.get(phone);

    if (!state) {
        return { allowed: true };
    }

    // 1. Check 60-second resend cooldown
    const elapsedSinceLastSend = now - state.lastSentAt;
    if (elapsedSinceLastSend < RESEND_COOLDOWN_MS) {
        const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsedSinceLastSend) / 1000);
        return {
            allowed: false,
            waitSeconds,
            reason: `Please wait ${waitSeconds}s before requesting another OTP.`,
        };
    }

    // 2. Check hourly cap (filter to timestamps in the last 60 minutes)
    const recentSends = state.sendTimestamps.filter((ts) => now - ts < ONE_HOUR_MS);
    if (recentSends.length >= MAX_HOURLY_SENDS) {
        const oldestRecent = recentSends[0];
        const waitSeconds = Math.ceil((ONE_HOUR_MS - (now - oldestRecent)) / 1000);
        return {
            allowed: false,
            waitSeconds,
            reason: `Maximum hourly OTP limit reached. Please try again in ${Math.ceil(waitSeconds / 60)} minutes.`,
        };
    }

    return { allowed: true };
}

/**
 * Records that a new OTP was sent to this phone number.
 */
export function recordOtpSent(phone: string): void {
    const now = Date.now();
    const existing = phoneStateMap.get(phone);

    const recentSends = existing
        ? existing.sendTimestamps.filter((ts) => now - ts < ONE_HOUR_MS)
        : [];
    recentSends.push(now);

    phoneStateMap.set(phone, {
        lastSentAt: now,
        sendTimestamps: recentSends,
        verificationAttempts: 0,
        expiresAt: now + OTP_EXPIRY_MS,
    });
}

/**
 * Records a verification attempt and checks if further attempts are permitted.
 */
export function recordVerificationAttempt(phone: string): {
    allowed: boolean;
    remainingAttempts: number;
    isExpired: boolean;
    reason?: string;
} {
    const now = Date.now();
    const state = phoneStateMap.get(phone);

    if (!state) {
        return {
            allowed: false,
            remainingAttempts: 0,
            isExpired: true,
            reason: "No active OTP request found. Please request an OTP first.",
        };
    }

    // Check expiry
    if (now > state.expiresAt) {
        return {
            allowed: false,
            remainingAttempts: 0,
            isExpired: true,
            reason: "OTP has expired. Please request a new OTP.",
        };
    }

    // Check max attempts
    state.verificationAttempts += 1;
    const remainingAttempts = Math.max(0, MAX_VERIFY_ATTEMPTS - state.verificationAttempts);

    if (state.verificationAttempts > MAX_VERIFY_ATTEMPTS) {
        // Invalidate state on max attempt violation
        state.expiresAt = 0;
        return {
            allowed: false,
            remainingAttempts: 0,
            isExpired: true,
            reason: "Maximum verification attempts exceeded. Please request a new OTP.",
        };
    }

    return {
        allowed: true,
        remainingAttempts,
        isExpired: false,
    };
}

/**
 * Resets verification attempt tracker upon successful login.
 */
export function recordVerificationSuccess(phone: string): void {
    const state = phoneStateMap.get(phone);
    if (state) {
        // Keep sendTimestamps for hourly throttling, but clear verification state
        state.verificationAttempts = 0;
        state.expiresAt = 0;
    }
}

