import { query } from "../database/neon.js";
import { mapLedgerEntry, type LedgerEntry } from "../types/index.js";
import { getBusinessById } from "./business.js";
import {
    validateRequiredString,
    validateNonNegativeNumber,
    validateDate,
    validateEntryType,
    validateOptionalString,
    NotFoundError,
    ForbiddenError
} from "../utils/validation.js";
import { computeFinancialsFromEntries, type FinancialBreakdown } from "../utils/calculations.js";

export type LedgerInput = {
    businessId: string;
    merchantId?: string;
    type?: string;
    entryType?: string;
    amount: number;
    description?: string;
    entryDate?: string;
};

export async function createLedgerEntry(data: LedgerInput): Promise<LedgerEntry> {
    const businessId = validateRequiredString(data.businessId, "businessId");
    const amount = validateNonNegativeNumber(data.amount, "amount");
    const rawType = data.entryType || data.type;
    const entryType = validateEntryType(rawType, "entryType");
    const entryDate = validateDate(data.entryDate, "entryDate") || new Date().toISOString().slice(0, 10);
    const description = validateOptionalString(data.description) || entryType;

    // Verify business exists and resolve merchantId
    const business = await getBusinessById(businessId, data.merchantId);
    if (!business) {
        throw new NotFoundError(`Business '${businessId}'`);
    }
    const merchantId = business.merchantId;

    const res = await query(
        `INSERT INTO ledger_entries (merchant_id, business_id, type, entry_type, amount, description, entry_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *;`,
        [merchantId, businessId, entryType, entryType, amount, description, entryDate]
    );

    return mapLedgerEntry(res.rows[0]);
}

export async function getLedgerEntries(businessId: string, merchantId?: string): Promise<LedgerEntry[]> {
    const cleanBizId = validateRequiredString(businessId, "businessId");

    const business = await getBusinessById(cleanBizId, merchantId);
    if (!business) {
        throw new NotFoundError(`Business '${cleanBizId}'`);
    }

    let whereClause = "WHERE business_id = $1";
    const params: any[] = [cleanBizId];

    if (merchantId) {
        whereClause += " AND merchant_id = $2";
        params.push(merchantId.trim());
    }

    const res = await query(
        `SELECT * FROM ledger_entries
         ${whereClause}
         ORDER BY entry_date DESC, created_at DESC;`,
        params
    );

    return res.rows.map(mapLedgerEntry);
}

export async function getLedgerEntryById(
    ledgerId: string,
    businessId?: string,
    merchantId?: string
): Promise<LedgerEntry | null> {
    const cleanId = validateRequiredString(ledgerId, "id");

    const conditions = ["id = $1"];
    const params: any[] = [cleanId];
    let idx = 2;

    if (businessId) {
        conditions.push(`business_id = $${idx++}`);
        params.push(businessId.trim());
    }
    if (merchantId) {
        conditions.push(`merchant_id = $${idx++}`);
        params.push(merchantId.trim());
    }

    const res = await query(
        `SELECT * FROM ledger_entries
         WHERE ${conditions.join(" AND ")};`,
        params
    );

    return res.rows.length > 0 ? mapLedgerEntry(res.rows[0]) : null;
}

export async function updateLedgerEntry(
    ledgerId: string,
    data: Partial<Omit<LedgerInput, "businessId">>,
    merchantId?: string
): Promise<LedgerEntry | null> {
    const cleanId = validateRequiredString(ledgerId, "id");

    const existing = await getLedgerEntryById(cleanId, undefined, merchantId);
    if (!existing) {
        throw new NotFoundError(`Ledger entry '${cleanId}'`);
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const rawType = data.entryType || data.type;
    if (rawType !== undefined) {
        const entryType = validateEntryType(rawType, "entryType");
        fields.push(`type = $${idx++}`);
        values.push(entryType);
    }
    if (data.amount !== undefined) {
        const amt = validateNonNegativeNumber(data.amount, "amount");
        fields.push(`amount = $${idx++}`);
        values.push(amt);
    }
    if (data.description !== undefined) {
        fields.push(`description = $${idx++}`);
        values.push(validateOptionalString(data.description) || null);
    }
    if (data.entryDate !== undefined) {
        const dt = validateDate(data.entryDate, "entryDate");
        fields.push(`entry_date = $${idx++}`);
        values.push(dt);
    }

    if (fields.length === 0) {
        return existing;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(cleanId);

    let whereClause = `WHERE id = $${idx++}`;
    if (merchantId) {
        whereClause += ` AND merchant_id = $${idx++}`;
        values.push(merchantId.trim());
    }

    const res = await query(
        `UPDATE ledger_entries
         SET ${fields.join(", ")}
         ${whereClause}
         RETURNING *;`,
        values
    );

    return res.rows.length > 0 ? mapLedgerEntry(res.rows[0]) : null;
}

export async function deleteLedgerEntry(ledgerId: string, merchantId?: string): Promise<LedgerEntry | null> {
    const cleanId = validateRequiredString(ledgerId, "id");

    let whereClause = "WHERE id = $1";
    const params: any[] = [cleanId];

    if (merchantId) {
        whereClause += " AND merchant_id = $2";
        params.push(merchantId.trim());
    }

    const res = await query(
        `DELETE FROM ledger_entries
         ${whereClause}
         RETURNING *;`,
        params
    );

    return res.rows.length > 0 ? mapLedgerEntry(res.rows[0]) : null;
}

export async function calculateFinancials(businessId: string, merchantId?: string): Promise<FinancialBreakdown> {
    const cleanBizId = validateRequiredString(businessId, "businessId");
    const entries = await getLedgerEntries(cleanBizId, merchantId);
    return computeFinancialsFromEntries(entries);
}
