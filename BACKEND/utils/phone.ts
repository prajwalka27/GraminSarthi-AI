import { ValidationError } from "./validation.js";

/**
 * Validates and normalizes Indian mobile numbers into standard E.164 format: +91XXXXXXXXXX
 *
 * Supported valid input formats:
 * - 9876543210 (10 digits)
 * - 09876543210 (11 digits with leading zero)
 * - 919876543210 (12 digits with country code)
 * - +919876543210 (E.164 format)
 * - Formatted with spaces, hyphens, or parentheses: "+91 98765-43210", "(+91) 98765 43210"
 *
 * Validation rules per TRAI Indian National Numbering Plan:
 * - Indian mobile subscriber numbers are exactly 10 digits
 * - The first subscriber digit must start with 6, 7, 8, or 9
 */
export function normalizeIndianPhoneNumber(input: unknown): string {
    if (typeof input !== "string" || !input.trim()) {
        throw new ValidationError("Phone number is required and must be a string");
    }

    const cleaned = input.trim().replace(/[\s\-\(\)\.]/g, "");

    // Extract subscriber digits
    let digits = cleaned;
    if (digits.startsWith("+91")) {
        digits = digits.slice(3);
    } else if (digits.startsWith("91") && digits.length === 12) {
        digits = digits.slice(2);
    } else if (digits.startsWith("0") && digits.length === 11) {
        digits = digits.slice(1);
    }

    // Must be exactly 10 numeric digits
    if (!/^\d{10}$/.test(digits)) {
        throw new ValidationError(
            "Invalid Indian mobile number. Mobile number must contain exactly 10 digits."
        );
    }

    // Must start with 6, 7, 8, or 9
    const firstDigit = digits[0];
    if (!["6", "7", "8", "9"].includes(firstDigit)) {
        throw new ValidationError(
            "Invalid Indian mobile number. Valid Indian mobile numbers must begin with 6, 7, 8, or 9."
        );
    }

    return `+91${digits}`;
}

/**
 * Checks if a phone number is a valid Indian mobile number without throwing
 */
export function isValidIndianMobile(input: unknown): boolean {
    try {
        normalizeIndianPhoneNumber(input);
        return true;
    } catch {
        return false;
    }
}

/**
 * Masks a phone number for user-facing security display:
 * Example: +919876543210 -> +91******3210
 */
export function maskPhoneNumber(phone: string): string {
    const clean = phone.trim();
    if (clean.length < 8) return clean;
    const prefix = clean.startsWith("+91") ? "+91" : "";
    const digits = clean.replace(/\D/g, "");
    if (digits.length >= 10) {
        const last4 = digits.slice(-4);
        return `${prefix}******${last4}`;
    }
    return clean;
}

