import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool, withTransaction } from "./index.js";

export async function seedDb() {
    console.log("Seeding PostgreSQL database with test development data...");
    if (!process.env.DATABASE_URL) {
        console.error("Error: DATABASE_URL is not configured in BACKEND/.env");
        process.exit(1);
    }

    try {
        await withTransaction(async (client) => {
            const passwordHash = await bcrypt.hash("Password123!", 10);

            // 1. Create or retrieve test user
            const userRes = await client.query(
                `INSERT INTO users (name, email, phone, password_hash, role)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
                 RETURNING id, name, email;`,
                ["Ramesh Kumar", "ramesh.kumar@graminsarthi.in", "+919876543210", passwordHash, "merchant"]
            );
            const user = userRes.rows[0];
            console.log("Seeded User:", user.name, `(${user.id})`);

            // 2. Create or retrieve merchant
            let merchantRes = await client.query(
                `SELECT id FROM merchants WHERE phone = $1 LIMIT 1;`,
                ["+919876543210"]
            );
            let merchantId: string;

            if (merchantRes.rows.length === 0) {
                merchantRes = await client.query(
                    `INSERT INTO merchants (user_id, business_name, owner_name, phone, email, address, category, language)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     RETURNING id;`,
                    [
                        user.id,
                        "Sri Lakshmi Provisions",
                        "Ramesh Kumar",
                        "+919876543210",
                        "ramesh.kumar@graminsarthi.in",
                        "Main Road, Rampur Village",
                        "Grocery / Kirana",
                        "en"
                    ]
                );
                merchantId = merchantRes.rows[0].id;
                console.log("Seeded Merchant: Sri Lakshmi Provisions", `(${merchantId})`);
            } else {
                merchantId = merchantRes.rows[0].id;
                console.log("Existing Merchant found:", merchantId);
            }

            // 3. Create or retrieve business
            let bizRes = await client.query(
                `SELECT id FROM businesses WHERE merchant_id = $1 AND business_name = $2 LIMIT 1;`,
                [merchantId, "Sri Lakshmi Provisions"]
            );
            let businessId: string;

            if (bizRes.rows.length === 0) {
                bizRes = await client.query(
                    `INSERT INTO businesses (merchant_id, business_name, category, village, district, state, location, description)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     RETURNING id;`,
                    [
                        merchantId,
                        "Sri Lakshmi Provisions",
                        "Grocery / Kirana",
                        "Rampur",
                        "Varanasi",
                        "Uttar Pradesh",
                        "Near Gram Panchayat Office",
                        "Daily staples, grains, and FMCG store"
                    ]
                );
                businessId = bizRes.rows[0].id;
                console.log("Seeded Business: Sri Lakshmi Provisions", `(${businessId})`);
            } else {
                businessId = bizRes.rows[0].id;
                console.log("Existing Business found:", businessId);
            }

            // 4. Seed sample ledger entries if empty
            const ledgerCount = await client.query(
                `SELECT COUNT(*) FROM ledger_entries WHERE business_id = $1;`,
                [businessId]
            );

            if (parseInt(ledgerCount.rows[0].count, 10) === 0) {
                const today = new Date().toISOString().slice(0, 10);
                await client.query(
                    `INSERT INTO ledger_entries (merchant_id, business_id, type, amount, description, entry_date)
                     VALUES 
                        ($1, $2, 'SALE', 4500.00, 'Morning sales & groceries', $3),
                        ($1, $2, 'PURCHASE', 1800.00, 'Wholesale oil & flour purchase', $3),
                        ($1, $2, 'EXPENSE', 350.00, 'Shop electricity & supplies', $3);`,
                    [merchantId, businessId, today]
                );
                console.log("Seeded 3 ledger transactions (SALE: 4500, PURCHASE: 1800, EXPENSE: 350)");
            }
        });

        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Database seed failed:", error instanceof Error ? error.message : error);
        throw error;
    } finally {
        await pool.end();
    }
}

import { fileURLToPath } from "node:url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    seedDb().catch(() => process.exit(1));
}

