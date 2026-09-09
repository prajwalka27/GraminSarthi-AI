import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool, withTransaction, initDatabaseSchema } from "./index.js";

export async function seedDb() {
    console.log("==================================================");
    console.log("Seeding PostgreSQL database with development records...");
    console.log("==================================================");

    if (!process.env.DATABASE_URL) {
        console.error("Error: DATABASE_URL is not configured in BACKEND/.env");
        process.exit(1);
    }

    try {
        await initDatabaseSchema();

        await withTransaction(async (client) => {
            const passwordHash = await bcrypt.hash("Password123!", 10);

            // 1. Seed Merchant 1: Ramesh Kumar (Kirana)
            const u1 = await client.query(
                `INSERT INTO users (name, email, phone, password_hash, role)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
                 RETURNING id, name, email;`,
                ["Ramesh Kumar", "ramesh.kumar@graminsarthi.in", "+919876543210", passwordHash, "merchant"]
            );

            let m1 = await client.query(`SELECT id FROM merchants WHERE phone = $1 LIMIT 1;`, ["+919876543210"]);
            let merchantId1: string;
            if (m1.rows.length === 0) {
                const newM = await client.query(
                    `INSERT INTO merchants (user_id, business_name, owner_name, name, phone, mobile, email, address, category, language)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;`,
                    [u1.rows[0].id, "Sri Lakshmi Provisions", "Ramesh Kumar", "Ramesh Kumar", "+919876543210", "+919876543210", "ramesh.kumar@graminsarthi.in", "Main Road, Rampur Village", "Grocery / Kirana", "en"]
                );
                merchantId1 = newM.rows[0].id;
            } else {
                merchantId1 = m1.rows[0].id;
            }

            let b1 = await client.query(`SELECT id FROM businesses WHERE merchant_id = $1 AND business_name = $2 LIMIT 1;`, [merchantId1, "Sri Lakshmi Provisions"]);
            let businessId1: string;
            if (b1.rows.length === 0) {
                const newB = await client.query(
                    `INSERT INTO businesses (merchant_id, business_name, category, business_category, village, district, state, location, description)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;`,
                    [merchantId1, "Sri Lakshmi Provisions", "Grocery / Kirana", "Grocery / Kirana", "Rampur", "Varanasi", "Uttar Pradesh", "Near Gram Panchayat Office", "Daily staples, grains, and FMCG store"]
                );
                businessId1 = newB.rows[0].id;
            } else {
                businessId1 = b1.rows[0].id;
            }

            // 2. Seed Merchant 2: Gopal Yadav (Dairy Point)
            let m2 = await client.query(`SELECT id FROM merchants WHERE phone = $1 LIMIT 1;`, ["+919876543211"]);
            let merchantId2: string;
            if (m2.rows.length === 0) {
                const newM = await client.query(
                    `INSERT INTO merchants (business_name, owner_name, name, phone, mobile, email, address, category, language)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;`,
                    ["Gopal Dairy Point", "Gopal Yadav", "Gopal Yadav", "+919876543211", "+919876543211", "gopal.dairy@graminsarthi.in", "West Rampur, Near Milk Chilling Booth", "Dairy & Milk Point", "hi"]
                );
                merchantId2 = newM.rows[0].id;
            } else {
                merchantId2 = m2.rows[0].id;
            }

            let b2 = await client.query(`SELECT id FROM businesses WHERE merchant_id = $1 LIMIT 1;`, [merchantId2]);
            let businessId2: string;
            if (b2.rows.length === 0) {
                const newB = await client.query(
                    `INSERT INTO businesses (merchant_id, business_name, category, business_category, village, district, state, description)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;`,
                    [merchantId2, "Gopal Dairy Point", "Dairy & Milk Point", "Dairy & Milk Point", "Rampur", "Varanasi", "Uttar Pradesh", "Fresh milk, curd, paneer, and bilona ghee"]
                );
                businessId2 = newB.rows[0].id;
            } else {
                businessId2 = b2.rows[0].id;
            }

            // 3. Seed Ledger Transactions
            const lCount = await client.query(`SELECT COUNT(*) FROM ledger_entries WHERE business_id = $1;`, [businessId1]);
            const ledgerCount = parseInt(lCount?.rows?.[0]?.count ?? String(lCount?.rows?.length ?? 0), 10);
            if (ledgerCount === 0) {
                const today = new Date().toISOString().slice(0, 10);
                await client.query(
                    `INSERT INTO ledger_entries (merchant_id, business_id, type, amount, description, entry_date)
                     VALUES 
                        ($1, $2, 'SALE', 5400.00, 'Morning sales & flour bags', $3),
                        ($1, $2, 'PURCHASE', 2200.00, 'Wholesale cooking oil supply', $3),
                        ($1, $2, 'EXPENSE', 400.00, 'Shop power & transit cost', $3);`,
                    [merchantId1, businessId1, today]
                );
                console.log("✓ Seeded ledger entries for Sri Lakshmi Provisions");
            }

            // 4. Seed Problems / Issues
            const pCount = await client.query(`SELECT COUNT(*) FROM problems WHERE merchant_id = $1;`, [merchantId1]);
            const problemCount = parseInt(pCount?.rows?.[0]?.count ?? String(pCount?.rows?.length ?? 0), 10);
            if (problemCount === 0) {
                await client.query(
                    `INSERT INTO problems (merchant_id, business_id, title, description, category, location, priority, status)
                     VALUES
                        ($1, $2, 'Cold storage compressor failure for evening dairy batch', 'Freezer temperature fluctuating above 12°C, risking milk spoilage.', 'Equipment', 'Dairy section, booth 2', 'high', 'open'),
                        ($1, $2, 'Wholesale wheat flour shipment delayed on Mandi Highway', 'Supplier truck stuck due to culvert repair; need alternative local miller dispatch.', 'Supply Chain', 'Mandi Road', 'medium', 'in_progress'),
                        ($1, $2, 'Voltage fluctuations damaging electronic weighing scale', 'High voltage spikes observed during evening grid switchover.', 'Infrastructure', 'Billing counter', 'high', 'open');`,
                    [merchantId1, businessId1]
                );
                console.log("✓ Seeded 3 real-style problem records");
            }
        });

        console.log("==================================================");
        console.log("PostgreSQL database seeded successfully!");
        console.log("==================================================");
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
