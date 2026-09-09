/**
 * Reusable validation utilities for GraminSarthi-AI backend
 */

export class AppError extends Error {
    public statusCode: number;
    public code: string;

    constructor(message: string, statusCode = 400, code = "BAD_REQUEST") {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, "VALIDATION_ERROR");
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 404, "NOT_FOUND");
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "Access denied: Resource not owned by requested entity") {
        super(message, 403, "FORBIDDEN");
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, "CONFLICT");
    }
}

export const VALID_ENTRY_TYPES = [
    "SALE",
    "CASH_COLLECTED",
    "PURCHASE",
    "RENT",
    "POWER",
    "LABOR",
    "INTEREST",
    "OTHER_EXPENSE",
    "INCOME",
    "EXPENSE",
    "STOCK_COST",
    "OVERHEAD"
] as const;

export type ValidEntryType = typeof VALID_ENTRY_TYPES[number];

export function validateRequiredString(value: unknown, fieldName: string, minLength = 1): string {
    if (typeof value !== "string" || value.trim().length < minLength) {
        throw new ValidationError(`${fieldName} is required and must be a non-empty string`);
    }
    return value.trim();
}

export function validateOptionalString(value: unknown): string | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string") return String(value).trim();
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

export function validateNonNegativeNumber(value: unknown, fieldName: string): number {
    const num = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(num) || num < 0) {
        throw new ValidationError(`${fieldName} must be a valid non-negative number`);
    }
    return num;
}

export function validateDate(value: unknown, fieldName = "date"): string | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string") {
        throw new ValidationError(`${fieldName} must be a string formatted as YYYY-MM-DD`);
    }
    const trimmed = value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed) || Number.isNaN(Date.parse(`${trimmed}T00:00:00Z`))) {
        throw new ValidationError(`${fieldName} must be a valid date in YYYY-MM-DD format`);
    }
    return trimmed;
}

export function validateMonth(value: unknown, fieldName = "month"): string | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string") {
        throw new ValidationError(`${fieldName} must be a string formatted as YYYY-MM`);
    }
    const trimmed = value.trim();
    if (!/^\d{4}-\d{2}$/.test(trimmed)) {
        throw new ValidationError(`${fieldName} must be a valid month in YYYY-MM format`);
    }
    return trimmed;
}

export function validateEntryType(value: unknown, fieldName = "entryType"): ValidEntryType {
    if (typeof value !== "string") {
        throw new ValidationError(`${fieldName} is required`);
    }
    const normalized = value.trim().toUpperCase() as ValidEntryType;
    if (!VALID_ENTRY_TYPES.includes(normalized)) {
        throw new ValidationError(
            `Invalid ${fieldName} '${value}'. Allowed types: ${VALID_ENTRY_TYPES.join(", ")}`
        );
    }
    return normalized;
}

export function validateId(value: unknown, fieldName = "id"): string {
    if (typeof value !== "string" || !value.trim()) {
        throw new ValidationError(`Valid ${fieldName} is required`);
    }
    return value.trim();
}