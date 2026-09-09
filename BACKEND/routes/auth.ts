import bcrypt from "bcryptjs";
import { query } from "../database/neon.js";
import { normalizeIndianPhoneNumber } from "../utils/phone.js";
import {
    validateFullName,
    validateEmail,
    validatePassword,
    ValidationError,
    AppError,
} from "../utils/validation.js";
import {
    createSessionToken,
    verifySessionToken,
    parseCookies,
    buildSessionCookieHeader,
    buildClearSessionCookieHeader,
} from "../services/session.js";
import { createMerchant } from "./merchant.js";
import { createBusiness, getBusinessesByMerchant } from "./business.js";

export interface RegisterRequest {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    statusCode: number;
    message: string;
    cookieHeader?: string;
    token?: string;
    user?: {
        id: string;
        name: string;
        email: string;
        phone?: string | null;
        role: string;
        merchantId?: string;
        businessId?: string;
    };
}

/**
 * Handles POST /api/auth/register
 * 1. Validates full name, email, Indian phone format, and password strength
 * 2. Checks email uniqueness
 * 3. Checks phone uniqueness
 * 4. Hashes password with bcrypt
 * 5. Saves customer to PostgreSQL users table
 * 6. Sets up initial merchant & business profile
 */
export async function handleRegister(body: any): Promise<AuthResponse> {
    const rawName = body?.name;
    const rawEmail = body?.email;
    const rawPhone = body?.phone || body?.mobile;
    const rawPassword = body?.password;

    // 1. Validation
    const cleanName = validateFullName(rawName);
    const normalizedEmail = validateEmail(rawEmail);
    const normalizedPhone = normalizeIndianPhoneNumber(rawPhone);
    const validPassword = validatePassword(rawPassword);

    // 2. Check email uniqueness
    try {
        const existingEmail = await query(
            `SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1;`,
            [normalizedEmail]
        );
        if (existingEmail.rows && existingEmail.rows.length > 0) {
            return {
                success: false,
                statusCode: 400,
                message: "Email already registered",
            };
        }
    } catch (err: any) {
        if (err.message === "Email already registered") {
            return { success: false, statusCode: 400, message: "Email already registered" };
        }
    }

    // 3. Check phone uniqueness
    try {
        const existingPhone = await query(
            `SELECT id FROM users WHERE phone = $1 LIMIT 1;`,
            [normalizedPhone]
        );
        if (existingPhone.rows && existingPhone.rows.length > 0) {
            return {
                success: false,
                statusCode: 400,
                message: "Phone number already registered",
            };
        }
    } catch (err: any) {
        if (err.message === "Phone number already registered") {
            return { success: false, statusCode: 400, message: "Phone number already registered" };
        }
    }

    // 4. Hash password with bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(validPassword, 10);

    // 5. Insert into users table
    let newUser: any;
    try {
        const userRes = await query(
            `INSERT INTO users (name, email, phone, password_hash, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email, phone, role, created_at, updated_at;`,
            [cleanName, normalizedEmail, normalizedPhone, passwordHash, "user"]
        );
        newUser = userRes.rows[0];
    } catch (err: any) {
        if (err.code === "23505" || err.message?.includes("already registered") || err.message?.includes("duplicate key")) {
            if (err.message?.includes("phone") || err.constraint?.includes("phone")) {
                return { success: false, statusCode: 400, message: "Phone number already registered" };
            }
            return { success: false, statusCode: 400, message: "Email already registered" };
        }
        throw err;
    }

    // 6. Automatically create merchant and default business record for full-stack continuity
    try {
        const merchant = await createMerchant({
            userId: newUser.id,
            name: cleanName,
            ownerName: cleanName,
            businessName: `${cleanName}'s Store`,
            phone: normalizedPhone,
            mobile: normalizedPhone,
            email: normalizedEmail,
            category: "General Store",
            language: "en",
        });

        await createBusiness({
            merchantId: merchant.id,
            businessName: `${cleanName}'s Store`,
            businessCategory: "General Store",
        });
    } catch (err) {
        console.warn("[Auth] Notice initializing merchant profile:", err instanceof Error ? err.message : err);
    }

    return {
        success: true,
        statusCode: 201,
        message: "Account created successfully",
    };
}

/**
 * Handles POST /api/auth/login
 * 1. Validates email and password presence
 * 2. Fetches user by LOWER(email)
 * 3. Verifies password with bcrypt.compare
 * 4. Signs cryptographic session token
 * 5. Issues HTTP-only session cookie
 */
export async function handleLogin(body: any): Promise<AuthResponse> {
    const rawEmail = body?.email;
    const rawPassword = body?.password;

    if (!rawEmail || typeof rawEmail !== "string" || !rawEmail.trim()) {
        return {
            success: false,
            statusCode: 400,
            message: "Email address is required",
        };
    }

    if (!rawPassword || typeof rawPassword !== "string" || !rawPassword) {
        return {
            success: false,
            statusCode: 400,
            message: "Password is required",
        };
    }

    const normalizedEmail = rawEmail.trim().toLowerCase();

    // 1. Fetch user including password_hash
    const userRes = await query(
        `SELECT id, name, email, phone, password_hash, role
         FROM users
         WHERE LOWER(email) = LOWER($1)
         LIMIT 1;`,
        [normalizedEmail]
    );

    if (!userRes.rows || userRes.rows.length === 0) {
        return {
            success: false,
            statusCode: 401,
            message: "Invalid email or password",
        };
    }

    const user = userRes.rows[0];

    if (!user.password_hash) {
        return {
            success: false,
            statusCode: 401,
            message: "Invalid email or password",
        };
    }

    // 2. Compare password with bcrypt
    const isMatch = await bcrypt.compare(rawPassword, user.password_hash);
    if (!isMatch) {
        return {
            success: false,
            statusCode: 401,
            message: "Invalid email or password",
        };
    }

    // 3. Resolve merchant and active business ID
    let merchantId: string | undefined;
    let businessId: string | undefined;
    try {
        const mRes = await query(
            `SELECT id FROM merchants WHERE user_id = $1 OR phone = $2 LIMIT 1;`,
            [user.id, user.phone]
        );
        if (mRes.rows.length > 0) {
            merchantId = mRes.rows[0].id;
            const bList = await getBusinessesByMerchant(merchantId!);
            if (bList.length > 0) {
                businessId = bList[0].id;
            }
        }
    } catch {
        // Continue if merchant link lookup fails
    }

    // 4. Create HMAC session token and cookie header
    const token = createSessionToken({
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        merchantId,
    });

    const cookieHeader = buildSessionCookieHeader(token);

    return {
        success: true,
        statusCode: 200,
        message: "Login successful",
        cookieHeader,
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role || "user",
            merchantId,
            businessId,
        },
    };
}

/**
 * Handles GET /api/auth/me or GET /api/auth/session
 * Returns profile of the currently logged-in customer.
 */
export async function handleGetSession(
    cookieHeader?: string | null,
    authHeader?: string | null
): Promise<AuthResponse> {
    let token: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7).trim();
    } else if (cookieHeader) {
        const cookies = parseCookies(cookieHeader);
        token = cookies["graminsarthi_session"] || null;
    }

    if (!token) {
        return {
            success: false,
            statusCode: 401,
            message: "Not authenticated",
        };
    }

    const payload = verifySessionToken(token);
    if (!payload) {
        return {
            success: false,
            statusCode: 401,
            message: "Not authenticated",
        };
    }

    // Verify user still exists in database
    const userRes = await query(
        `SELECT id, name, email, phone, role
         FROM users
         WHERE id = $1
         LIMIT 1;`,
        [payload.userId]
    );

    if (!userRes.rows || userRes.rows.length === 0) {
        return {
            success: false,
            statusCode: 401,
            message: "Not authenticated",
        };
    }

    const user = userRes.rows[0];

    // Find linked merchant and business
    let merchantId = payload.merchantId;
    let businessId: string | undefined;
    try {
        if (!merchantId) {
            const mRes = await query(
                `SELECT id FROM merchants WHERE user_id = $1 OR phone = $2 LIMIT 1;`,
                [user.id, user.phone]
            );
            if (mRes.rows.length > 0) merchantId = mRes.rows[0].id;
        }
        if (merchantId) {
            const bList = await getBusinessesByMerchant(merchantId);
            if (bList.length > 0) businessId = bList[0].id;
        }
    } catch {
        // ignore
    }

    return {
        success: true,
        statusCode: 200,
        message: "Authenticated",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role || "user",
            merchantId,
            businessId,
        },
    };
}

/**
 * Handles POST /api/auth/logout
 * Invalidate session and clear HTTP-only cookie.
 */
export function handleLogout(): {
    success: boolean;
    statusCode: number;
    message: string;
    clearCookieHeader: string;
} {
    return {
        success: true,
        statusCode: 200,
        message: "Logged out successfully",
        clearCookieHeader: buildClearSessionCookieHeader(),
    };
}
