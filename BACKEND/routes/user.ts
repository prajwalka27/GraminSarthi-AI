import bcrypt from "bcryptjs";
import { query } from "../database/neon.js";
import { mapUser, type User } from "../types/index.js";

export type CreateUserInput = {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    role?: string;
};

export type UpdateUserInput = Partial<{
    name: string;
    phone: string;
    role: string;
}>;

export async function createUser(data: CreateUserInput): Promise<User> {
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : null;
    const res = await query(
        `INSERT INTO users (name, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, phone, role, created_at, updated_at;`,
        [data.name.trim(), data.email.trim().toLowerCase(), data.phone?.trim() || null, passwordHash, data.role || "user"]
    );
    return mapUser(res.rows[0]);
}

export async function getUserById(id: string): Promise<User | null> {
    const res = await query(
        `SELECT id, name, email, phone, role, created_at, updated_at
         FROM users
         WHERE id = $1;`,
        [id]
    );
    return res.rows.length > 0 ? mapUser(res.rows[0]) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const res = await query(
        `SELECT id, name, email, phone, role, created_at, updated_at
         FROM users
         WHERE email = $1;`,
        [email.trim().toLowerCase()]
    );
    return res.rows.length > 0 ? mapUser(res.rows[0]) : null;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
    const res = await query(
        `SELECT id, name, email, phone, role, created_at, updated_at
         FROM users
         WHERE phone = $1;`,
        [phone.trim()]
    );
    return res.rows.length > 0 ? mapUser(res.rows[0]) : null;
}

export async function getUsers(): Promise<User[]> {
    const res = await query(
        `SELECT id, name, email, phone, role, created_at, updated_at
         FROM users
         ORDER BY created_at DESC;`
    );
    return res.rows.map(mapUser);
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) {
        fields.push(`name = $${idx++}`);
        values.push(data.name.trim());
    }
    if (data.phone !== undefined) {
        fields.push(`phone = $${idx++}`);
        values.push(data.phone.trim());
    }
    if (data.role !== undefined) {
        fields.push(`role = $${idx++}`);
        values.push(data.role.trim());
    }

    if (fields.length === 0) {
        return getUserById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const res = await query(
        `UPDATE users
         SET ${fields.join(", ")}
         WHERE id = $${idx}
         RETURNING id, name, email, phone, role, created_at, updated_at;`,
        values
    );

    return res.rows.length > 0 ? mapUser(res.rows[0]) : null;
}

export async function deleteUser(id: string): Promise<User | null> {
    const res = await query(
        `DELETE FROM users
         WHERE id = $1
         RETURNING id, name, email, phone, role, created_at, updated_at;`,
        [id]
    );
    return res.rows.length > 0 ? mapUser(res.rows[0]) : null;
}

