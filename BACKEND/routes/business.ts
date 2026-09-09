import { query } from "../database/neon.js";
import { mapBusiness, type Business } from "../types/index.js";
import { getMerchantById } from "./merchant.js";
import { validateRequiredString, validateOptionalString, NotFoundError, ForbiddenError } from "../utils/validation.js";

export type BusinessInput = {
    merchantId: string;
    businessName: string;
    businessCategory?: string;
    category?: string;
    village?: string;
    district?: string;
    state?: string;
    location?: string;
    description?: string;
    address?: string;
    phone?: string;
};

export async function createBusiness(data: BusinessInput): Promise<Business> {
    const merchantId = validateRequiredString(data.merchantId, "merchantId");
    const businessName = validateRequiredString(data.businessName, "businessName");
    const category = validateRequiredString(data.businessCategory || data.category || "General", "businessCategory");

    const merchant = await getMerchantById(merchantId);
    if (!merchant) {
        throw new NotFoundError(`Merchant '${merchantId}'`);
    }

    const res = await query(
        `INSERT INTO businesses (merchant_id, business_name, category, business_category, village, district, state, location, description, address, phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *;`,
        [
            merchantId,
            businessName,
            category,
            category,
            validateOptionalString(data.village) || null,
            validateOptionalString(data.district) || null,
            validateOptionalString(data.state) || null,
            validateOptionalString(data.location) || null,
            validateOptionalString(data.description) || null,
            validateOptionalString(data.address) || null,
            validateOptionalString(data.phone) || null,
        ]
    );

    return mapBusiness(res.rows[0]);
}

export async function getBusinessesByMerchant(merchantId: string): Promise<Business[]> {
    const cleanMerchantId = validateRequiredString(merchantId, "merchantId");
    const res = await query(
        `SELECT * FROM businesses
         WHERE merchant_id = $1
         ORDER BY created_at DESC;`,
        [cleanMerchantId]
    );
    return res.rows.map(mapBusiness);
}

export async function getBusinessById(businessId: string, merchantId?: string): Promise<Business | null> {
    const cleanBizId = validateRequiredString(businessId, "businessId");

    if (merchantId) {
        const cleanMerchantId = validateRequiredString(merchantId, "merchantId");
        const res = await query(
            `SELECT * FROM businesses
             WHERE id = $1 AND merchant_id = $2;`,
            [cleanBizId, cleanMerchantId]
        );
        return res.rows.length > 0 ? mapBusiness(res.rows[0]) : null;
    }

    const res = await query(
        `SELECT * FROM businesses
         WHERE id = $1;`,
        [cleanBizId]
    );
    return res.rows.length > 0 ? mapBusiness(res.rows[0]) : null;
}

export async function updateBusiness(
    businessId: string,
    merchantId?: string,
    data: Partial<Omit<BusinessInput, "merchantId">> = {}
): Promise<Business | null> {
    const cleanBizId = validateRequiredString(businessId, "businessId");

    // If merchantId is provided, enforce ownership check
    if (merchantId) {
        const existing = await getBusinessById(cleanBizId, merchantId);
        if (!existing) {
            throw new ForbiddenError("Business not found or does not belong to specified merchant");
        }
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.businessName !== undefined) {
        fields.push(`business_name = $${idx++}`);
        values.push(validateRequiredString(data.businessName, "businessName"));
    }
    const cat = data.businessCategory || data.category;
    if (cat !== undefined) {
        fields.push(`category = $${idx++}`);
        values.push(validateRequiredString(cat, "businessCategory"));
    }
    if (data.village !== undefined) {
        fields.push(`village = $${idx++}`);
        values.push(validateOptionalString(data.village) || null);
    }
    if (data.district !== undefined) {
        fields.push(`district = $${idx++}`);
        values.push(validateOptionalString(data.district) || null);
    }
    if (data.state !== undefined) {
        fields.push(`state = $${idx++}`);
        values.push(validateOptionalString(data.state) || null);
    }
    if (data.location !== undefined) {
        fields.push(`location = $${idx++}`);
        values.push(validateOptionalString(data.location) || null);
    }
    if (data.description !== undefined) {
        fields.push(`description = $${idx++}`);
        values.push(validateOptionalString(data.description) || null);
    }
    if (data.address !== undefined) {
        fields.push(`address = $${idx++}`);
        values.push(validateOptionalString(data.address) || null);
    }
    if (data.phone !== undefined) {
        fields.push(`phone = $${idx++}`);
        values.push(validateOptionalString(data.phone) || null);
    }

    if (fields.length === 0) {
        return getBusinessById(cleanBizId, merchantId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(cleanBizId);

    let whereClause = `WHERE id = $${idx++}`;
    if (merchantId) {
        whereClause += ` AND merchant_id = $${idx++}`;
        values.push(merchantId.trim());
    }

    const res = await query(
        `UPDATE businesses
         SET ${fields.join(", ")}
         ${whereClause}
         RETURNING *;`,
        values
    );

    return res.rows.length > 0 ? mapBusiness(res.rows[0]) : null;
}

export async function deleteBusiness(businessId: string, merchantId?: string): Promise<Business | null> {
    const cleanBizId = validateRequiredString(businessId, "businessId");

    let whereClause = "WHERE id = $1";
    const params: any[] = [cleanBizId];

    if (merchantId) {
        whereClause += " AND merchant_id = $2";
        params.push(merchantId.trim());
    }

    const res = await query(
        `DELETE FROM businesses
         ${whereClause}
         RETURNING *;`,
        params
    );

    return res.rows.length > 0 ? mapBusiness(res.rows[0]) : null;
}
