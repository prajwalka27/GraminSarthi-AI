import { query } from "../database/neon.js";
import { mapProblem, type Problem } from "../types/index.js";
import { validateRequiredString, validateOptionalString } from "../utils/validation.js";

export type ProblemInput = {
    merchantId?: string | null;
    businessId?: string | null;
    title: string;
    description?: string | null;
    category?: string | null;
    location?: string | null;
    priority?: string | null;
    status?: string | null;
};

export async function createProblem(data: ProblemInput): Promise<Problem> {
    const title = validateRequiredString(data.title, "title");
    const description = validateOptionalString(data.description) || null;
    const category = validateOptionalString(data.category) || "General";
    const location = validateOptionalString(data.location) || null;
    const priority = (validateOptionalString(data.priority) || "medium").toLowerCase();
    const status = (validateOptionalString(data.status) || "open").toLowerCase();
    const merchantId = validateOptionalString(data.merchantId) || null;
    const businessId = validateOptionalString(data.businessId) || null;

    const res = await query(
        `INSERT INTO problems (merchant_id, business_id, title, description, category, location, priority, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *;`,
        [merchantId, businessId, title, description, category, location, priority, status]
    );

    return mapProblem(res.rows[0]);
}

export async function getProblems(filters?: {
    merchantId?: string;
    businessId?: string;
    status?: string;
    priority?: string;
    category?: string;
}): Promise<Problem[]> {
    let sql = `SELECT * FROM problems WHERE 1=1`;
    const params: any[] = [];

    if (filters?.merchantId) {
        params.push(filters.merchantId.trim());
        sql += ` AND merchant_id = $${params.length}`;
    }

    if (filters?.businessId) {
        params.push(filters.businessId.trim());
        sql += ` AND business_id = $${params.length}`;
    }

    if (filters?.status) {
        params.push(filters.status.trim().toLowerCase());
        sql += ` AND LOWER(status) = $${params.length}`;
    }

    if (filters?.priority) {
        params.push(filters.priority.trim().toLowerCase());
        sql += ` AND LOWER(priority) = $${params.length}`;
    }

    if (filters?.category) {
        params.push(filters.category.trim());
        sql += ` AND category = $${params.length}`;
    }

    sql += ` ORDER BY created_at DESC;`;

    const res = await query(sql, params);
    return res.rows.map(mapProblem);
}

export async function getProblemById(id: string): Promise<Problem | null> {
    const cleanId = id.trim();
    const res = await query(
        `SELECT * FROM problems WHERE id = $1;`,
        [cleanId]
    );
    return res.rows.length > 0 ? mapProblem(res.rows[0]) : null;
}

export async function updateProblem(id: string, updates: Partial<ProblemInput>): Promise<Problem | null> {
    const existing = await getProblemById(id);
    if (!existing) return null;

    const title = updates.title !== undefined ? validateRequiredString(updates.title, "title") : existing.title;
    const description = updates.description !== undefined ? (validateOptionalString(updates.description) || null) : existing.description;
    const category = updates.category !== undefined ? (validateOptionalString(updates.category) || "General") : existing.category;
    const location = updates.location !== undefined ? (validateOptionalString(updates.location) || null) : existing.location;
    const priority = updates.priority !== undefined ? (validateOptionalString(updates.priority) || "medium").toLowerCase() : existing.priority;
    const status = updates.status !== undefined ? (validateOptionalString(updates.status) || "open").toLowerCase() : existing.status;
    const merchantId = updates.merchantId !== undefined ? (validateOptionalString(updates.merchantId) || null) : existing.merchantId;
    const businessId = updates.businessId !== undefined ? (validateOptionalString(updates.businessId) || null) : existing.businessId;

    const res = await query(
        `UPDATE problems
         SET title = $1, description = $2, category = $3, location = $4, priority = $5, status = $6, merchant_id = $7, business_id = $8, updated_at = NOW()
         WHERE id = $9
         RETURNING *;`,
        [title, description, category, location, priority, status, merchantId, businessId, id.trim()]
    );

    return res.rows.length > 0 ? mapProblem(res.rows[0]) : null;
}

export async function deleteProblem(id: string): Promise<Problem | null> {
    const cleanId = id.trim();
    const res = await query(
        `DELETE FROM problems WHERE id = $1 RETURNING *;`,
        [cleanId]
    );
    return res.rows.length > 0 ? mapProblem(res.rows[0]) : null;
}
