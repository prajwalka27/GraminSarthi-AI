import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "..", "data", "graminsarthi_db.json");

export interface LocalDbData {
    users: any[];
    merchants: any[];
    businesses: any[];
    ledger_entries: any[];
    problems: any[];
}

function getDefaultSeed(): LocalDbData {
    const merchantId = "m-demo-001";
    const businessId = "b-demo-001";
    const today = new Date().toISOString().slice(0, 10);

    return {
        users: [
            {
                id: "u-demo-001",
                name: "Ramesh Kumar",
                email: "ramesh.kumar@graminsarthi.in",
                phone: "+919876543210",
                password_hash: "$2a$10$wVbB3D6hCj5vY8JpY9U/4.6j8iXoYk6w9WnU.r/Q7F.0M9H3G8J6e",
                role: "merchant",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ],
        merchants: [
            {
                id: merchantId,
                user_id: "u-demo-001",
                business_name: "Sri Lakshmi Provisions",
                owner_name: "Ramesh Kumar",
                phone: "+919876543210",
                email: "ramesh.kumar@graminsarthi.in",
                address: "Main Road, Rampur Village",
                category: "Grocery / Kirana",
                language: "en",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ],
        businesses: [
            {
                id: businessId,
                merchant_id: merchantId,
                business_name: "Sri Lakshmi Provisions",
                category: "Grocery / Kirana",
                village: "Rampur",
                district: "Varanasi",
                state: "Uttar Pradesh",
                location: "Near Gram Panchayat Office",
                description: "Daily staples, grains, and FMCG store",
                address: "Main Road, Rampur Village",
                phone: "+919876543210",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ],
        ledger_entries: [
            {
                id: "le-demo-001",
                merchant_id: merchantId,
                business_id: businessId,
                type: "SALE",
                description: "Morning grocery & rice sales",
                amount: 4500,
                entry_date: today,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: "le-demo-002",
                merchant_id: merchantId,
                business_id: businessId,
                type: "PURCHASE",
                description: "Wholesale cooking oil & lentils",
                amount: 1800,
                entry_date: today,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: "le-demo-003",
                merchant_id: merchantId,
                business_id: businessId,
                type: "EXPENSE",
                description: "Shop electricity bill",
                amount: 350,
                entry_date: today,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ],
        problems: [
            {
                id: "prob-demo-001",
                merchant_id: merchantId,
                business_id: businessId,
                title: "Cold storage compressor failure for evening dairy batch",
                description: "Deep freezer temperature fluctuating above 12°C, risking milk spoil in 4 hours.",
                category: "Equipment",
                location: "Dairy section, booth 2",
                priority: "high",
                status: "open",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: "prob-demo-002",
                merchant_id: merchantId,
                business_id: businessId,
                title: "Wholesale wheat flour shipment delayed on Mandi Highway",
                description: "Supplier truck stuck due to culvert repair; need alternative local miller dispatch.",
                category: "Supply Chain",
                location: "Mandi Road",
                priority: "medium",
                status: "in_progress",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ]
    };
}

function applySqlSet(target: any, sql: string, params: any[]) {
    const setMatch = sql.match(/SET\s+([\s\S]+?)\s+WHERE/i);
    if (!setMatch) return;
    const assignments = setMatch[1].split(",");
    for (const a of assignments) {
        const parts = a.split("=");
        if (parts.length === 2) {
            const col = parts[0].trim().toLowerCase();
            const valExpr = parts[1].trim();
            if (valExpr.toUpperCase() === "CURRENT_TIMESTAMP") {
                target[col] = new Date().toISOString();
                continue;
            }
            const pMatch = valExpr.match(/\$(\d+)/);
            if (pMatch) {
                const pIdx = parseInt(pMatch[1], 10) - 1;
                let val = params[pIdx];
                if (col === "amount") val = Number(val);
                target[col] = val;
            }
        }
    }
}

class FileDatabase {
    private data: LocalDbData;

    constructor() {
        this.data = this.load();
    }

    private load(): LocalDbData {
        try {
            const dataDir = path.dirname(DB_FILE);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            if (fs.existsSync(DB_FILE)) {
                const content = fs.readFileSync(DB_FILE, "utf-8");
                const parsed = JSON.parse(content);
                return {
                    users: Array.isArray(parsed.users) ? parsed.users : [],
                    merchants: Array.isArray(parsed.merchants) ? parsed.merchants : [],
                    businesses: Array.isArray(parsed.businesses) ? parsed.businesses : [],
                    ledger_entries: Array.isArray(parsed.ledger_entries) ? parsed.ledger_entries : [],
                    problems: Array.isArray(parsed.problems) ? parsed.problems : [],
                };
            }
        } catch (err) {
            console.warn("Could not read persistent DB file, initializing with defaults:", err);
        }

        const initial = getDefaultSeed();
        this.save(initial);
        return initial;
    }

    private save(dataToSave?: LocalDbData) {
        try {
            const dataDir = path.dirname(DB_FILE);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), "utf-8");
        } catch (err) {
            console.error("Failed to write to persistent DB file:", err);
        }
    }

    public executeQuery(text: string, params: any[] = []): { rows: any[]; rowCount: number } {
        const sql = text.trim();
        const upper = sql.toUpperCase();

        // 1. SELECT 1;
        if (upper.startsWith("SELECT 1")) {
            return { rows: [{ "?column?": 1 }], rowCount: 1 };
        }

        // 2. MERCHANTS
        if (upper.includes("FROM MERCHANTS") || upper.includes("INTO MERCHANTS") || upper.includes("UPDATE MERCHANTS") || upper.includes("DELETE FROM MERCHANTS")) {
            return this.handleMerchants(sql, params);
        }

        // 3. BUSINESSES
        if (upper.includes("FROM BUSINESSES") || upper.includes("INTO BUSINESSES") || upper.includes("UPDATE BUSINESSES") || upper.includes("DELETE FROM BUSINESSES")) {
            return this.handleBusinesses(sql, params);
        }

        // 4. LEDGER ENTRIES
        if (upper.includes("FROM LEDGER_ENTRIES") || upper.includes("INTO LEDGER_ENTRIES") || upper.includes("UPDATE LEDGER_ENTRIES") || upper.includes("DELETE FROM LEDGER_ENTRIES")) {
            return this.handleLedger(sql, params);
        }

        // 5. USERS
        if (upper.includes("FROM USERS") || upper.includes("INTO USERS") || upper.includes("UPDATE USERS") || upper.includes("DELETE FROM USERS")) {
            return this.handleUsers(sql, params);
        }

        // 6. PROBLEMS
        if (upper.includes("FROM PROBLEMS") || upper.includes("INTO PROBLEMS") || upper.includes("UPDATE PROBLEMS") || upper.includes("DELETE FROM PROBLEMS")) {
            return this.handleProblems(sql, params);
        }

        return { rows: [], rowCount: 0 };
    }

    private handleMerchants(sql: string, params: any[]) {
        const upper = sql.toUpperCase();

        if (upper.startsWith("INSERT INTO MERCHANTS")) {
            const now = new Date().toISOString();
            const is10 = params.length >= 10;
            const merchant = {
                id: randomUUID(),
                user_id: params[0] || null,
                business_name: params[1] || "",
                owner_name: params[2] || "",
                name: is10 ? params[3] : params[2] || "",
                phone: is10 ? params[4] : params[3] || "",
                mobile: is10 ? params[5] : params[3] || "",
                email: (is10 ? params[6] : params[4]) || null,
                address: (is10 ? params[7] : params[5]) || null,
                category: (is10 ? params[8] : params[6]) || null,
                language: (is10 ? params[9] : params[7]) || "en",
                created_at: now,
                updated_at: now,
            };
            this.data.merchants.unshift(merchant);
            this.save();
            return { rows: [merchant], rowCount: 1 };
        }

        if (upper.startsWith("SELECT * FROM MERCHANTS") && upper.includes("WHERE ID = $1")) {
            const m = this.data.merchants.find(item => item.id === params[0]);
            return { rows: m ? [m] : [], rowCount: m ? 1 : 0 };
        }

        if (upper.startsWith("SELECT * FROM MERCHANTS") && (upper.includes("PHONE") || upper.includes("MOBILE"))) {
            const targetPhone = String(params[0] || "").trim();
            const targetDigits = String(params[1] || targetPhone).replace(/\D/g, "");

            const m = this.data.merchants.find(item => {
                const p = String(item.phone || item.mobile || "");
                const d = p.replace(/\D/g, "");
                return p === targetPhone || (targetDigits && d.endsWith(targetDigits.slice(-10)));
            });
            return { rows: m ? [m] : [], rowCount: m ? 1 : 0 };
        }

        if (upper.startsWith("SELECT * FROM MERCHANTS")) {
            return { rows: [...this.data.merchants], rowCount: this.data.merchants.length };
        }

        if (upper.startsWith("UPDATE MERCHANTS")) {
            const id = params[params.length - 1];
            const m = this.data.merchants.find(item => item.id === id);
            if (!m) return { rows: [], rowCount: 0 };

            applySqlSet(m, sql, params);
            m.updated_at = new Date().toISOString();
            this.save();
            return { rows: [m], rowCount: 1 };
        }

        if (upper.startsWith("DELETE FROM MERCHANTS")) {
            const id = params[0];
            const idx = this.data.merchants.findIndex(item => item.id === id);
            if (idx === -1) return { rows: [], rowCount: 0 };
            const deleted = this.data.merchants.splice(idx, 1)[0];
            // Cascade delete businesses and ledger
            const deletedBizIds = this.data.businesses.filter(b => b.merchant_id === id).map(b => b.id);
            this.data.businesses = this.data.businesses.filter(b => b.merchant_id !== id);
            this.data.ledger_entries = this.data.ledger_entries.filter(l => l.merchant_id !== id && !deletedBizIds.includes(l.business_id));
            this.save();
            return { rows: [deleted], rowCount: 1 };
        }

        return { rows: [], rowCount: 0 };
    }

    private handleBusinesses(sql: string, params: any[]) {
        const upper = sql.toUpperCase();

        if (upper.startsWith("INSERT INTO BUSINESSES")) {
            const now = new Date().toISOString();
            const is11 = params.length >= 11;
            const b = {
                id: randomUUID(),
                merchant_id: params[0],
                business_name: params[1],
                category: params[2] || null,
                business_category: is11 ? params[3] : params[2] || null,
                village: (is11 ? params[4] : params[3]) || null,
                district: (is11 ? params[5] : params[4]) || null,
                state: (is11 ? params[6] : params[5]) || null,
                location: (is11 ? params[7] : params[6]) || null,
                description: (is11 ? params[8] : params[7]) || null,
                address: (is11 ? params[9] : params[8]) || null,
                phone: (is11 ? params[10] : params[9]) || null,
                created_at: now,
                updated_at: now,
            };
            this.data.businesses.unshift(b);
            this.save();
            return { rows: [b], rowCount: 1 };
        }

        if (upper.includes("COUNT(") && upper.includes("FROM BUSINESSES")) {
            const list = params[0] ? this.data.businesses.filter(item => item.merchant_id === params[0]) : this.data.businesses;
            return { rows: [{ count: list.length }], rowCount: 1 };
        }

        if (upper.startsWith("SELECT * FROM BUSINESSES") && upper.includes("WHERE MERCHANT_ID = $1")) {
            const list = this.data.businesses.filter(item => item.merchant_id === params[0]);
            return { rows: list, rowCount: list.length };
        }

        if (upper.startsWith("SELECT * FROM BUSINESSES") && upper.includes("WHERE ID = $1 AND MERCHANT_ID = $2")) {
            const b = this.data.businesses.find(item => item.id === params[0] && item.merchant_id === params[1]);
            return { rows: b ? [b] : [], rowCount: b ? 1 : 0 };
        }

        if (upper.startsWith("SELECT * FROM BUSINESSES") && upper.includes("WHERE ID = $1")) {
            const b = this.data.businesses.find(item => item.id === params[0]);
            return { rows: b ? [b] : [], rowCount: b ? 1 : 0 };
        }

        if (upper.startsWith("UPDATE BUSINESSES")) {
            const hasMerchant = upper.includes("MERCHANT_ID");
            const id = hasMerchant ? params[params.length - 2] : params[params.length - 1];
            const merchantId = hasMerchant ? params[params.length - 1] : undefined;
            const b = this.data.businesses.find(item => item.id === id && (!merchantId || item.merchant_id === merchantId));
            if (!b) return { rows: [], rowCount: 0 };
            applySqlSet(b, sql, params);
            b.updated_at = new Date().toISOString();
            this.save();
            return { rows: [b], rowCount: 1 };
        }

        if (upper.startsWith("DELETE FROM BUSINESSES")) {
            const id = params[0];
            const merchantId = params.length > 1 ? params[1] : undefined;
            const idx = this.data.businesses.findIndex(item => item.id === id && (!merchantId || item.merchant_id === merchantId));
            if (idx === -1) return { rows: [], rowCount: 0 };
            const deleted = this.data.businesses.splice(idx, 1)[0];
            this.data.ledger_entries = this.data.ledger_entries.filter(l => l.business_id !== id);
            this.save();
            return { rows: [deleted], rowCount: 1 };
        }

        return { rows: [], rowCount: 0 };
    }

    private handleLedger(sql: string, params: any[]) {
        const upper = sql.toUpperCase();

        if (upper.startsWith("INSERT INTO LEDGER_ENTRIES")) {
            const now = new Date().toISOString();
            const is7 = params.length >= 7;
            const entry = {
                id: randomUUID(),
                merchant_id: params[0],
                business_id: params[1],
                type: String(params[2]).toUpperCase(),
                entry_type: is7 ? String(params[3]).toUpperCase() : String(params[2]).toUpperCase(),
                amount: Number(is7 ? params[4] : params[3]),
                description: (is7 ? params[5] : params[4]) || null,
                entry_date: (is7 ? params[6] : params[5]) || now.slice(0, 10),
                created_at: now,
                updated_at: now,
            };
            this.data.ledger_entries.unshift(entry);
            this.save();
            return { rows: [entry], rowCount: 1 };
        }

        // Financials calculation query
        if (upper.includes("COALESCE(SUM(") || upper.includes("AS GROSS_SALES")) {
            let filtered = this.data.ledger_entries;
            if (params.length >= 2) {
                filtered = filtered.filter(e => e.business_id === params[0] && e.merchant_id === params[1]);
            } else if (params.length === 1) {
                filtered = filtered.filter(e => e.merchant_id === params[0]);
            }

            let gross_sales = 0;
            let purchase_costs = 0;
            let total_expenses = 0;

            for (const e of filtered) {
                const t = String(e.type || "").toUpperCase();
                const amt = Number(e.amount) || 0;
                if (t === "SALE" || t === "INCOME") gross_sales += amt;
                else if (t === "PURCHASE" || t === "STOCK_COST") purchase_costs += amt;
                else total_expenses += amt;
            }

            return {
                rows: [{
                    gross_sales,
                    purchase_costs,
                    total_expenses,
                    ledger_entry_count: filtered.length,
                }],
                rowCount: 1,
            };
        }

        if (upper.includes("COUNT(*)") && upper.includes("FROM LEDGER_ENTRIES")) {
            let filtered = this.data.ledger_entries;
            if (params.length > 0) {
                filtered = filtered.filter(e => e.business_id === params[0] || e.merchant_id === params[0]);
            }
            return { rows: [{ count: String(filtered.length) }], rowCount: 1 };
        }

        if (upper.startsWith("SELECT") && upper.includes("FROM LEDGER_ENTRIES")) {
            let list = [...this.data.ledger_entries];
            if (upper.includes("WHERE ID = $1 AND MERCHANT_ID = $2")) {
                const e = list.find(item => item.id === params[0] && item.merchant_id === params[1]);
                return { rows: e ? [e] : [], rowCount: e ? 1 : 0 };
            }
            if (upper.includes("WHERE ID = $1")) {
                const e = list.find(item => item.id === params[0]);
                return { rows: e ? [e] : [], rowCount: e ? 1 : 0 };
            }
            if (upper.includes("BUSINESS_ID = $1 AND MERCHANT_ID = $2")) {
                list = list.filter(e => e.business_id === params[0] && e.merchant_id === params[1]);
            } else if (upper.includes("BUSINESS_ID = $1")) {
                list = list.filter(e => e.business_id === params[0]);
            }
            if (upper.includes("ENTRY_DATE = $2") || upper.includes("ENTRY_DATE = $3")) {
                const targetDate = params.find(p => typeof p === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p));
                if (targetDate) list = list.filter(e => e.entry_date === targetDate);
            }
            if (upper.includes("ENTRY_DATE >=") || upper.includes("BETWEEN") || upper.includes("ENTRY_DATE <=")) {
                const dateParams = params.filter(p => typeof p === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p));
                if (dateParams.length >= 2) {
                    list = list.filter(e => e.entry_date >= dateParams[0] && e.entry_date <= dateParams[1]);
                } else if (dateParams.length === 1 && upper.includes(">=")) {
                    list = list.filter(e => e.entry_date >= dateParams[0]);
                }
            }
            list.sort((a, b) => (b.entry_date || "").localeCompare(a.entry_date || "") || (b.created_at || "").localeCompare(a.created_at || ""));
            return { rows: list, rowCount: list.length };
        }

        if (upper.startsWith("UPDATE LEDGER_ENTRIES")) {
            const hasMerchant = upper.includes("MERCHANT_ID");
            const id = hasMerchant ? params[params.length - 2] : params[params.length - 1];
            const merchantId = hasMerchant ? params[params.length - 1] : undefined;
            const e = this.data.ledger_entries.find(item => item.id === id && (!merchantId || item.merchant_id === merchantId));
            if (!e) return { rows: [], rowCount: 0 };
            applySqlSet(e, sql, params);
            e.updated_at = new Date().toISOString();
            this.save();
            return { rows: [e], rowCount: 1 };
        }

        if (upper.startsWith("DELETE FROM LEDGER_ENTRIES")) {
            const id = params[0];
            const merchantId = params.length > 1 ? params[1] : undefined;
            const idx = this.data.ledger_entries.findIndex(item => item.id === id && (!merchantId || item.merchant_id === merchantId));
            if (idx === -1) return { rows: [], rowCount: 0 };
            const deleted = this.data.ledger_entries.splice(idx, 1)[0];
            this.save();
            return { rows: [deleted], rowCount: 1 };
        }

        return { rows: [], rowCount: 0 };
    }

    private handleUsers(sql: string, params: any[]) {
        const upper = sql.toUpperCase();

        if (upper.startsWith("INSERT INTO USERS")) {
            // [name, email, phone, passwordHash, role]
            const name = params[0];
            const email = (params[1] || "").toLowerCase().trim();
            const phone = params[2] ? String(params[2]).trim() : null;
            const passwordHash = params[3];
            const role = params[4] || "user";

            // Enforce email uniqueness
            if (this.data.users.some(u => (u.email || "").toLowerCase() === email)) {
                const err: any = new Error("Email already registered");
                err.code = "23505";
                err.constraint = "users_email_key";
                throw err;
            }

            // Enforce phone uniqueness
            if (phone && this.data.users.some(u => u.phone === phone)) {
                const err: any = new Error("Phone number already registered");
                err.code = "23505";
                err.constraint = "users_phone_key";
                throw err;
            }

            const now = new Date().toISOString();
            const user = {
                id: randomUUID(),
                name,
                email,
                phone,
                password_hash: passwordHash,
                role,
                created_at: now,
                updated_at: now,
            };
            this.data.users.unshift(user);
            this.save();
            return { rows: [user], rowCount: 1 };
        }

        if (upper.startsWith("SELECT") && upper.includes("FROM USERS")) {
            if (upper.includes("WHERE ID = $1") || upper.includes("ID = $1")) {
                const u = this.data.users.find(item => item.id === params[0]);
                return { rows: u ? [u] : [], rowCount: u ? 1 : 0 };
            }

            if (upper.includes("EMAIL")) {
                const searchEmail = String(params[0] || "").toLowerCase().trim();
                const u = this.data.users.find(item => (item.email || "").toLowerCase() === searchEmail);
                return { rows: u ? [u] : [], rowCount: u ? 1 : 0 };
            }

            if (upper.includes("PHONE")) {
                const searchPhone = String(params[0] || "").trim();
                const u = this.data.users.find(item => item.phone === searchPhone);
                return { rows: u ? [u] : [], rowCount: u ? 1 : 0 };
            }

            return { rows: [...this.data.users], rowCount: this.data.users.length };
        }

        if (upper.startsWith("UPDATE USERS")) {
            const id = params[params.length - 1];
            const u = this.data.users.find(item => item.id === id);
            if (!u) return { rows: [], rowCount: 0 };
            applySqlSet(u, sql, params);
            u.updated_at = new Date().toISOString();
            this.save();
            return { rows: [u], rowCount: 1 };
        }

        if (upper.startsWith("DELETE FROM USERS")) {
            const idx = this.data.users.findIndex(item => item.id === params[0]);
            if (idx === -1) return { rows: [], rowCount: 0 };
            const deleted = this.data.users.splice(idx, 1)[0];
            this.save();
            return { rows: [deleted], rowCount: 1 };
        }

        return { rows: [], rowCount: 0 };
    }

    private handleProblems(sql: string, params: any[]) {
        if (!this.data.problems) this.data.problems = [];
        const upper = sql.toUpperCase();

        if (upper.startsWith("INSERT INTO PROBLEMS")) {
            const now = new Date().toISOString();
            const prob = {
                id: randomUUID(),
                merchant_id: params[0] || null,
                business_id: params[1] || null,
                title: params[2],
                description: params[3] || null,
                category: params[4] || "General",
                location: params[5] || null,
                priority: params[6] || "medium",
                status: params[7] || "open",
                created_at: now,
                updated_at: now,
            };
            this.data.problems.unshift(prob);
            this.save();
            return { rows: [prob], rowCount: 1 };
        }

        if (upper.includes("COUNT(*)") && upper.includes("FROM PROBLEMS")) {
            let filtered = this.data.problems;
            if (params.length > 0) {
                filtered = filtered.filter(p => p.merchant_id === params[0] || p.business_id === params[0]);
            }
            return { rows: [{ count: String(filtered.length) }], rowCount: 1 };
        }

        if (upper.startsWith("SELECT * FROM PROBLEMS") && upper.includes("WHERE ID = $1")) {
            const p = this.data.problems.find(item => item.id === params[0]);
            return { rows: p ? [p] : [], rowCount: p ? 1 : 0 };
        }

        if (upper.startsWith("SELECT * FROM PROBLEMS")) {
            let list = [...this.data.problems];
            if (upper.includes("MERCHANT_ID = $")) {
                const mId = params.find(param => typeof param === "string" && (param.startsWith("m-") || param.length > 20));
                if (mId) list = list.filter(item => item.merchant_id === mId);
            }
            if (upper.includes("LOWER(STATUS) = $")) {
                const statusParam = params.find(param => ["open", "in_progress", "resolved", "closed"].includes(String(param).toLowerCase()));
                if (statusParam) list = list.filter(item => item.status?.toLowerCase() === statusParam.toLowerCase());
            }
            return { rows: list, rowCount: list.length };
        }

        if (upper.startsWith("UPDATE PROBLEMS")) {
            const id = params[params.length - 1];
            const p = this.data.problems.find(item => item.id === id);
            if (!p) return { rows: [], rowCount: 0 };
            applySqlSet(p, sql, params);
            p.updated_at = new Date().toISOString();
            this.save();
            return { rows: [p], rowCount: 1 };
        }

        if (upper.startsWith("DELETE FROM PROBLEMS")) {
            const id = params[0];
            const idx = this.data.problems.findIndex(item => item.id === id);
            if (idx === -1) return { rows: [], rowCount: 0 };
            const deleted = this.data.problems.splice(idx, 1)[0];
            this.save();
            return { rows: [deleted], rowCount: 1 };
        }

        return { rows: [], rowCount: 0 };
    }
}

export const localDb = new FileDatabase();

