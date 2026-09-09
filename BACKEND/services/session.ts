import crypto from "node:crypto";

export interface SessionPayload {
    userId: string;
    email: string;
    phone: string;
    name: string;
    role: string;
    merchantId?: string;
    createdAt: number;
    expiresAt: number;
}

const DEFAULT_SECRET = "graminsarthi_prod_hmac_secret_key_928172918237";
const SESSION_EXPIRY_SECONDS = 30 * 24 * 60 * 60; // 30 days

function getSecretKey(): string {
    return process.env.AUTH_SECRET || DEFAULT_SECRET;
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token for an authenticated user.
 */
export function createSessionToken(user: {
    id: string;
    email: string;
    phone?: string | null;
    name: string;
    role?: string | null;
    merchantId?: string | null;
}): string {
    const now = Date.now();
    const payload: SessionPayload = {
        userId: user.id,
        email: user.email,
        phone: user.phone || "",
        name: user.name,
        role: user.role || "user",
        merchantId: user.merchantId || undefined,
        createdAt: now,
        expiresAt: now + SESSION_EXPIRY_SECONDS * 1000,
    };

    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = crypto
        .createHmac("sha256", getSecretKey())
        .update(payloadB64)
        .digest("base64url");

    return `${payloadB64}.${signature}`;
}

/**
 * Validates and decodes an HMAC-SHA256 signed session token.
 */
export function verifySessionToken(token: string): SessionPayload | null {
    if (!token || typeof token !== "string" || !token.includes(".")) {
        return null;
    }

    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) {
        return null;
    }

    const expectedSig = crypto
        .createHmac("sha256", getSecretKey())
        .update(payloadB64)
        .digest("base64url");

    // Timing-safe comparison to prevent timing side-channel attacks
    try {
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expectedSig);
        if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
            return null;
        }
    } catch {
        return null;
    }

    try {
        const payload: SessionPayload = JSON.parse(
            Buffer.from(payloadB64, "base64url").toString("utf-8")
        );

        if (Date.now() > payload.expiresAt) {
            return null; // Expired
        }

        return payload;
    } catch {
        return null;
    }
}

/**
 * Parses HTTP request Cookie header into a key-value dictionary.
 */
export function parseCookies(cookieHeader?: string | null): Record<string, string> {
    const cookies: Record<string, string> = {};
    if (!cookieHeader) return cookies;

    const pairs = cookieHeader.split(";");
    for (const pair of pairs) {
        const idx = pair.indexOf("=");
        if (idx > 0) {
            const key = pair.slice(0, idx).trim();
            const val = pair.slice(idx + 1).trim();
            cookies[key] = decodeURIComponent(val);
        }
    }
    return cookies;
}

/**
 * Builds standard Set-Cookie header for the session token.
 */
export function buildSessionCookieHeader(token: string): string {
    const isProd = process.env.NODE_ENV === "production";
    const secureFlag = isProd ? "; Secure" : "";
    return `graminsarthi_session=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_EXPIRY_SECONDS}${secureFlag}`;
}

/**
 * Builds Set-Cookie header to clear the session cookie.
 */
export function buildClearSessionCookieHeader(): string {
    return "graminsarthi_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

