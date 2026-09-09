import { query } from "../database/neon.js";
import { mapMerchant, type Merchant } from "../types/index.js";
import { validateRequiredString, validateOptionalString } from "../utils/validation.js";

export type MerchantInput = {
    userId?: string | null;
    name?: string;
    businessName?: string;
    ownerName?: string;
    mobile?: string;
    phone?: string;
    email?: string;
    address?: string;
    category?: string;
    language?: string;
};

export async function createMerchant(data: MerchantInput): Promise<Merchant> {
    const rawName = data.name || data.ownerName;
    const rawMobile = data.mobile || data.phone;
    const ownerName = validateRequiredString(rawName, "name or ownerName");
    const phone = validateRequiredString(rawMobile, "mobile or phone");
    const businessName = validateOptionalString(data.businessName) || ownerName;
    const email = validateOptionalString(data.email) || null;
    const address = validateOptionalString(data.address) || null;
    const category = validateOptionalString(data.category) || null;
    const language = validateOptionalString(data.language) || "en";
    const userId = validateOptionalString(data.userId) || null;

    const res = await query(
        `INSERT INTO merchants (user_id, business_name, owner_name, name, phone, mobile, email, address, category, language)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *;`,
        [userId, businessName, ownerName, ownerName, phone, phone, email, address, category, language]
    );

    return mapMerchant(res.rows[0]);
}

export async function getMerchants(): Promise<Merchant[]> {
    const res = await query(
        `SELECT * FROM merchants
         ORDER BY created_at DESC;`
    );
    return res.rows.map(mapMerchant);
}

export async function getMerchantById(id: string): Promise<Merchant | null> {
    const cleanId = id.trim();
    const res = await query(
        `SELECT * FROM merchants
         WHERE id = $1;`,
        [cleanId]
    );
    return res.rows.length > 0 ? mapMerchant(res.rows[0]) : null;
}

export async function getMerchantByMobile(mobile: string): Promise<Merchant | null> {
    const clean = mobile.trim();
    const digits = clean.replace(/\D/g, "");

    const res = await query(
        `SELECT * FROM merchants
         WHERE phone = $1 
            OR mobile = $1
            OR (LENGTH($2) >= 10 AND RIGHT(REGEXP_REPLACE(COALESCE(phone, mobile, ''), '\\D', '', 'g'), 10) = RIGHT($2, 10))
         LIMIT 1;`,
        [clean, digits]
    );

    return res.rows.length > 0 ? mapMerchant(res.rows[0]) : null;
}

export async function updateMerchant(id: string, data: Partial<MerchantInput>): Promise<Merchant | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.businessName !== undefined || data.name !== undefined) {
        fields.push(`business_name = $${idx++}`);
        values.push(validateOptionalString(data.businessName || data.name));
    }
    if (data.ownerName !== undefined || data.name !== undefined) {
        fields.push(`owner_name = $${idx++}`);
        values.push(validateOptionalString(data.ownerName || data.name));
    }
    if (data.phone !== undefined || data.mobile !== undefined) {
        fields.push(`phone = $${idx++}`);
        values.push(validateOptionalString(data.phone || data.mobile));
    }
    if (data.email !== undefined) {
        fields.push(`email = $${idx++}`);
        values.push(validateOptionalString(data.email) || null);
    }
    if (data.address !== undefined) {
        fields.push(`address = $${idx++}`);
        values.push(validateOptionalString(data.address) || null);
    }
    if (data.category !== undefined) {
        fields.push(`category = $${idx++}`);
        values.push(validateOptionalString(data.category) || null);
    }
    if (data.language !== undefined) {
        fields.push(`language = $${idx++}`);
        values.push(validateOptionalString(data.language) || "en");
    }

    if (fields.length === 0) {
        return getMerchantById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id.trim());

    const res = await query(
        `UPDATE merchants
         SET ${fields.join(", ")}
         WHERE id = $${idx}
         RETURNING *;`,
        values
    );

    return res.rows.length > 0 ? mapMerchant(res.rows[0]) : null;
}

export async function deleteMerchant(id: string): Promise<Merchant | null> {
    const cleanId = id.trim();
    const res = await query(
        `DELETE FROM merchants
         WHERE id = $1
         RETURNING *;`,
        [cleanId]
    );
    return res.rows.length > 0 ? mapMerchant(res.rows[0]) : null;
}
