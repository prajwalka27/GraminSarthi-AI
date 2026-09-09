import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDb() {
    console.log("Initializing PostgreSQL database schema...");
    if (!process.env.DATABASE_URL) {
        console.error("Error: DATABASE_URL environment variable is not set in BACKEND/.env");
        process.exit(1);
    }

    try {
        const schemaPath = path.join(__dirname, "schema.sql");
        const schemaSql = fs.readFileSync(schemaPath, "utf-8");

        await pool.query(schemaSql);
        console.log("Database schema initialized successfully!");
        console.log("Tables created/verified: users, merchants, businesses, ledger_entries");
    } catch (error) {
        console.error("Failed to initialize database schema:", error instanceof Error ? error.message : error);
        throw error;
    } finally {
        await pool.end();
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    initDb().catch(() => process.exit(1));
}

