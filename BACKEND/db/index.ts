import "dotenv/config";
import pg from "pg";
import { localDb } from "./file-store.js";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 3000,
    ssl: connectionString?.includes("sslmode=require") || process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
});

pool.on("error", (err) => {
    // Suppress unhandled idle pool errors so the process doesn't crash
    console.warn("[PostgreSQL Pool Warning]:", err instanceof Error ? err.message : err);
});

let isPostgresHealthy: boolean | null = null;
let lastCheckTime = 0;

export async function checkPostgresHealth(): Promise<boolean> {
    const now = Date.now();
    // Cache status for 10 seconds to prevent excessive connection attempts if offline
    if (isPostgresHealthy !== null && now - lastCheckTime < 10000) {
        return isPostgresHealthy;
    }

    lastCheckTime = now;
    if (!connectionString) {
        isPostgresHealthy = false;
        return false;
    }

    try {
        const client = await pool.connect();
        try {
            await client.query("SELECT 1;");
            isPostgresHealthy = true;
            return true;
        } finally {
            client.release();
        }
    } catch {
        isPostgresHealthy = false;
        return false;
    }
}

export function getDbEngine(): "postgresql" | "persistent_local" {
    return isPostgresHealthy ? "postgresql" : "persistent_local";
}

export async function testDirectPostgresConnection(): Promise<{ success: boolean; rows?: any[]; error?: string }> {
    if (!connectionString) {
        return { success: false, error: "DATABASE_URL environment variable is not defined" };
    }
    try {
        const client = await pool.connect();
        try {
            const res = await client.query("SELECT 1 AS alive;");
            return { success: true, rows: res.rows };
        } finally {
            client.release();
        }
    } catch (err: any) {
        let msg = err?.message?.trim();
        if (!msg && Array.isArray(err?.errors) && err.errors[0]?.message) {
            msg = err.errors[0].message;
        }
        if (!msg && err?.code) {
            msg = `connect ${err.code} on ${connectionString ? new URL(connectionString).host : "database"}`;
        }
        if (!msg) {
            msg = String(err);
        }
        return { success: false, error: msg };
    }
}

export async function initDatabaseSchema(): Promise<void> {
    const isUp = await checkPostgresHealth();
    if (!isUp) return;

    try {
        const client = await pool.connect();
        try {
            await client.query(`
                CREATE EXTENSION IF NOT EXISTS "pgcrypto";

                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    phone VARCHAR(20) UNIQUE,
                    password_hash TEXT,
                    role VARCHAR(20) DEFAULT 'user',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
                CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

                CREATE TABLE IF NOT EXISTS merchants (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID,
                    business_name VARCHAR(255),
                    owner_name VARCHAR(255),
                    name VARCHAR(255),
                    phone VARCHAR(20),
                    mobile VARCHAR(20),
                    email VARCHAR(255),
                    address TEXT,
                    category VARCHAR(100),
                    language VARCHAR(50) DEFAULT 'en',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS businesses (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
                    business_name VARCHAR(255) NOT NULL,
                    category VARCHAR(100),
                    business_category VARCHAR(100),
                    village VARCHAR(100),
                    district VARCHAR(100),
                    state VARCHAR(100),
                    location VARCHAR(255),
                    description TEXT,
                    address TEXT,
                    phone VARCHAR(20),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS ledger_entries (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    merchant_id UUID,
                    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
                    type VARCHAR(50),
                    entry_type VARCHAR(50),
                    description TEXT,
                    amount NUMERIC(14,2) NOT NULL DEFAULT 0,
                    entry_date DATE DEFAULT CURRENT_DATE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                ALTER TABLE merchants ADD COLUMN IF NOT EXISTS name VARCHAR(255);
                ALTER TABLE merchants ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255);
                ALTER TABLE merchants ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);
                ALTER TABLE merchants ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
                ALTER TABLE merchants ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);
                ALTER TABLE merchants ADD COLUMN IF NOT EXISTS email VARCHAR(255);
                ALTER TABLE merchants ADD COLUMN IF NOT EXISTS address TEXT;
                ALTER TABLE merchants ADD COLUMN IF NOT EXISTS category VARCHAR(100);
                ALTER TABLE merchants ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'en';

                ALTER TABLE businesses ADD COLUMN IF NOT EXISTS category VARCHAR(100);
                ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_category VARCHAR(100);
                ALTER TABLE businesses ADD COLUMN IF NOT EXISTS village VARCHAR(100);
                ALTER TABLE businesses ADD COLUMN IF NOT EXISTS district VARCHAR(100);
                ALTER TABLE businesses ADD COLUMN IF NOT EXISTS state VARCHAR(100);
                ALTER TABLE businesses ADD COLUMN IF NOT EXISTS location VARCHAR(255);
                ALTER TABLE businesses ADD COLUMN IF NOT EXISTS description TEXT;
                ALTER TABLE businesses ADD COLUMN IF NOT EXISTS address TEXT;
                ALTER TABLE businesses ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

                ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS merchant_id UUID;
                ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS type VARCHAR(50);
                ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS entry_type VARCHAR(50);
                ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS description TEXT;
                ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS amount NUMERIC(14,2) DEFAULT 0;
                ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS entry_date DATE DEFAULT CURRENT_DATE;

                CREATE TABLE IF NOT EXISTS problems (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    merchant_id UUID,
                    business_id UUID,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    category VARCHAR(100),
                    location VARCHAR(255),
                    priority VARCHAR(50) DEFAULT 'medium',
                    status VARCHAR(50) DEFAULT 'open',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS idx_problems_merchant_id ON problems(merchant_id);
                CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
            `);
            console.log("[DB] PostgreSQL schema checked and harmonized (including problems table).");
        } finally {
            client.release();
        }
    } catch (err) {
        console.warn("[DB] Schema harmonization note:", err instanceof Error ? err.message : err);
    }
}

export async function query<T extends pg.QueryResultRow = any>(
    text: string,
    params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
    const usePg = await checkPostgresHealth();

    if (usePg) {
        try {
            const res = await pool.query<T>(text, params);
            return { rows: res.rows, rowCount: res.rowCount ?? res.rows.length };
        } catch (err: any) {
            // If connection error during query, flag postgres as down and fallback to persistent local DB
            if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT" || err.message?.includes("Connection terminated")) {
                console.warn("[DB] PostgreSQL disconnected during query. Falling back to persistent local storage.");
                isPostgresHealthy = false;
                const fallbackRes = localDb.executeQuery(text, params);
                return { rows: fallbackRes.rows as T[], rowCount: fallbackRes.rowCount };
            }
            console.error("Database query error:", { text, error: err instanceof Error ? err.message : err });
            throw err;
        }
    }

    // Use persistent local database fallback
    const res = localDb.executeQuery(text, params);
    return { rows: res.rows as T[], rowCount: res.rowCount };
}

export async function getClient(): Promise<pg.PoolClient> {
    return await pool.connect();
}

export async function withTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const usePg = await checkPostgresHealth();

    if (usePg) {
        const client = await getClient();
        try {
            await client.query("BEGIN");
            const result = await callback(client);
            await client.query("COMMIT");
            return result;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    // Local persistent database fallback mock transaction
    const mockClient = {
        query: async (text: string, params?: any[]) => {
            const res = localDb.executeQuery(text, params);
            return { rows: res.rows, rowCount: res.rowCount };
        }
    };
    return await callback(mockClient);
}
