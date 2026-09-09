import "dotenv/config";
import http from "node:http";
import { query, getDbEngine, testDirectPostgresConnection, initDatabaseSchema } from "./database/neon.js";
import { createUser, deleteUser, getUserById, getUserByEmail, getUserByPhone, getUsers, updateUser } from "./routes/user.js";
import { createMerchant, deleteMerchant, getMerchantById, getMerchantByMobile, getMerchants, updateMerchant } from "./routes/merchant.js";
import { createBusiness, deleteBusiness, getBusinessById, getBusinessesByMerchant, updateBusiness } from "./routes/business.js";
import { calculateFinancials, createLedgerEntry, deleteLedgerEntry, getLedgerEntries, getLedgerEntryById, updateLedgerEntry } from "./routes/ledger.js";
import { getBusinessDashboard, getDashboardSummary } from "./routes/dashboard.js";
import { getDailyReport, getMonthlyReport, getSummaryReport } from "./routes/reports.js";
import { analyzeBusinessAI } from "./routes/ai.js";
import { createProblem, deleteProblem, getProblemById, getProblems, updateProblem } from "./routes/problems.js";
import { handleSendOtp, handleVerifyOtp, handleGetSession, handleLogout } from "./routes/auth.js";
import { AppError } from "./utils/validation.js";
import { sendSuccess, sendList, sendError, sendJson, setCorsHeaders } from "./utils/response.js";

const PORT = Number(process.env.PORT) || 5000;
const MAX_BODY_BYTES = 1024 * 1024; // 1 MB limit

type JsonObject = Record<string, unknown>;

async function readJSON(req: http.IncomingMessage): Promise<JsonObject> {
    let raw = "";
    let byteCount = 0;
    for await (const chunk of req) {
        byteCount += chunk.length;
        if (byteCount > MAX_BODY_BYTES) {
            throw new AppError("Request body exceeded maximum allowed size (1MB)", 413, "PAYLOAD_TOO_LARGE");
        }
        raw += chunk.toString();
    }
    if (!raw.trim()) return {};
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new AppError("Malformed JSON in request body", 400, "INVALID_JSON");
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new AppError("Request body must be a JSON object", 400, "INVALID_JSON_OBJECT");
    }
    return parsed as JsonObject;
}

const server = http.createServer(async (req, res) => {
    try {
        setCorsHeaders(res);
        setCorsHeaders(res, req);

        if (req.method === "OPTIONS") {
            res.writeHead(204);
            res.end();
            return;
        }

        const url = new URL(req.url || "/", `http://localhost:${PORT}`);
        const parts = url.pathname.split("/").filter(Boolean);

        // ==========================================
        // 1. HEALTH CHECKS
        // ==========================================
        if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/api" || url.pathname === "/api/health")) {
            sendJson(res, 200, {
                success: true,
                message: "Backend is running",
                data: { message: "Backend is running" },
                endpoints: [
                    "GET /api/health",
                    "GET /api/health/db",
                    "POST /api/auth/send-otp",
                    "POST /api/auth/verify-otp",
                    "GET /api/auth/me",
                    "POST /api/auth/logout",
                    "GET /api/merchant",
                    "POST /api/merchant",
                    "GET /api/business",
                    "POST /api/business",
                    "GET /api/ledger",
                    "POST /api/ledger",
                    "POST /api/ledger/calculate",
                    "GET /api/dashboard",
                    "POST /api/ai/analyze",
                    "GET /api/problems",
                    "POST /api/problems",
                    "GET /api/problems/:id",
                    "PUT /api/problems/:id",
                    "DELETE /api/problems/:id",
                ],
            });
            return;
        }

        if (req.method === "GET" && url.pathname === "/api/health/db") {
            const dbCheck = await testDirectPostgresConnection();
            if (dbCheck.success) {
                sendSuccess(res, {
                    database: "connected",
                    engine: "postgresql",
                    testQuery: "SELECT 1 AS alive",
                    result: dbCheck.rows?.[0] || { alive: 1 }
                });
            } else {
                sendError(res, `Database connection failed: ${dbCheck.error}`, 503);
            }
            return;
        }

        // ==========================================
        // 1.5 AUTH API (REAL SMS OTP & SESSIONS)
        // ==========================================
        if (parts[0] === "api" && parts[1] === "auth") {
            const authAction = parts[2];

            // POST /api/auth/send-otp
            if (authAction === "send-otp") {
                if (req.method !== "POST") {
                    return sendError(res, "Method Not Allowed. Send POST /api/auth/send-otp with JSON: {\"phone\": \"9876543210\"}", 405);
                }
                const input = await readJSON(req);
                const result = await handleSendOtp(input);
                sendJson(res, 200, {
                    success: true,
                    message: "OTP sent successfully",
                    data: result.data,
                });
                return;
            }

            // POST /api/auth/verify-otp
            if (authAction === "verify-otp") {
                if (req.method !== "POST") {
                    return sendError(res, "Method Not Allowed. Send POST /api/auth/verify-otp with JSON: {\"phone\": \"9876543210\", \"otp\": \"123456\"}", 405);
                }
                const input = await readJSON(req);
                const result = await handleVerifyOtp(input);
                res.setHeader("Set-Cookie", result.cookieHeader);
                sendJson(res, 200, {
                    success: true,
                    message: "Phone number verified successfully",
                    data: result.data,
                });
                return;
            }

            // GET /api/auth/session or GET /api/auth/me
            if (authAction === "session" || authAction === "me") {
                if (req.method !== "GET") {
                    return sendError(res, "Method Not Allowed. Use GET", 405);
                }
                const result = await handleGetSession(req.headers.cookie, req.headers.authorization);
                sendJson(res, 200, {
                    success: true,
                    data: result,
                });
                return;
            }

            // POST /api/auth/logout
            if (authAction === "logout") {
                if (req.method !== "POST") {
                    return sendError(res, "Method Not Allowed. Use POST", 405);
                }
                const result = handleLogout();
                res.setHeader("Set-Cookie", result.clearCookieHeader);
                sendJson(res, 200, {
                    success: true,
                    message: "Logged out successfully",
                });
                return;
            }

            // GET /api/auth catalog
            sendJson(res, 200, {
                success: true,
                message: "GraminSarthi Authentication API",
                endpoints: {
                    "POST /api/auth/send-otp": "Send real SMS OTP to phone",
                    "POST /api/auth/verify-otp": "Verify received SMS OTP and login/register",
                    "GET /api/auth/me": "Get current session profile",
                    "POST /api/auth/logout": "Clear session cookie",
                },
            });
            return;
        }

        // ==========================================
        // 2. USER API
        // ==========================================
        if (parts[0] === "api" && (parts[1] === "user" || parts[1] === "users")) {
            if (req.method === "GET" && parts.length === 2 && parts[1] === "users") {
                const users = await getUsers();
                sendList(res, users);
                return;
            }

            if (req.method === "GET" && parts.length === 2 && parts[1] === "user") {
                const id = url.searchParams.get("id");
                const email = url.searchParams.get("email");
                const phone = url.searchParams.get("phone");
                if (id) {
                    const user = await getUserById(id);
                    if (!user) return sendError(res, "User not found", 404);
                    return sendSuccess(res, user);
                }
                if (email) {
                    const user = await getUserByEmail(email);
                    if (!user) return sendError(res, "User not found", 404);
                    return sendSuccess(res, user);
                }
                if (phone) {
                    const user = await getUserByPhone(phone);
                    if (!user) return sendError(res, "User not found", 404);
                    return sendSuccess(res, user);
                }
                const users = await getUsers();
                sendList(res, users);
                return;
            }

            if (req.method === "POST" && parts.length === 2) {
                const input = await readJSON(req);
                if (typeof input.name !== "string" || !input.name.trim() || typeof input.email !== "string" || !input.email.trim()) {
                    return sendError(res, "Name and email are required", 400);
                }
                const user = await createUser({
                    name: input.name.trim(),
                    email: input.email.trim(),
                    phone: typeof input.phone === "string" ? input.phone.trim() : undefined,
                    password: typeof input.password === "string" ? input.password : undefined,
                    role: typeof input.role === "string" ? input.role : undefined,
                });
                sendSuccess(res, user, 201);
                return;
            }

            if (parts.length === 3) {
                const userId = parts[2];
                if (req.method === "GET") {
                    const user = await getUserById(userId);
                    if (!user) return sendError(res, "User not found", 404);
                    sendSuccess(res, user);
                    return;
                }
                if (req.method === "PUT") {
                    const input = await readJSON(req);
                    const user = await updateUser(userId, {
                        name: typeof input.name === "string" ? input.name : undefined,
                        phone: typeof input.phone === "string" ? input.phone : undefined,
                        role: typeof input.role === "string" ? input.role : undefined,
                    });
                    if (!user) return sendError(res, "User not found", 404);
                    sendSuccess(res, user);
                    return;
                }
                if (req.method === "DELETE") {
                    const user = await deleteUser(userId);
                    if (!user) return sendError(res, "User not found", 404);
                    sendSuccess(res, { message: "User deleted successfully", user });
                    return;
                }
            }
        }

        // ==========================================
        // 3. MERCHANT API
        // ==========================================
        if (parts[0] === "api" && (parts[1] === "merchant" || parts[1] === "merchants")) {
            if (req.method === "GET" && parts.length === 2) {
                const id = url.searchParams.get("id");
                const mobile = url.searchParams.get("mobile");
                if (id) {
                    const merchant = await getMerchantById(id);
                    if (!merchant) return sendError(res, "Merchant not found", 404);
                    sendSuccess(res, merchant);
                    return;
                }
                if (mobile) {
                    const merchant = await getMerchantByMobile(mobile);
                    // Retain compatibility with existing frontend which expects null if not found
                    sendSuccess(res, merchant);
                    return;
                }
                const merchants = await getMerchants();
                sendList(res, merchants);
                return;
            }

            if (req.method === "POST" && parts.length === 2) {
                const input = await readJSON(req);
                const merchant = await createMerchant(input as any);
                sendSuccess(res, merchant, 201);
                return;
            }

            if (parts.length === 3) {
                const merchantId = parts[2];
                if (req.method === "GET") {
                    const merchant = await getMerchantById(merchantId);
                    if (!merchant) return sendError(res, "Merchant not found", 404);
                    sendSuccess(res, merchant);
                    return;
                }
                if (req.method === "PUT") {
                    const input = await readJSON(req);
                    const merchant = await updateMerchant(merchantId, input as any);
                    if (!merchant) return sendError(res, "Merchant not found", 404);
                    sendSuccess(res, merchant);
                    return;
                }
                if (req.method === "DELETE") {
                    const merchant = await deleteMerchant(merchantId);
                    if (!merchant) return sendError(res, "Merchant not found", 404);
                    sendSuccess(res, { message: "Merchant deleted successfully", merchant });
                    return;
                }
            }
        }

        // ==========================================
        // 4. BUSINESS API
        // ==========================================
        if (parts[0] === "api" && parts[1] === "business") {
            if (req.method === "GET" && parts.length === 2) {
                const merchantId = url.searchParams.get("merchantId");
                if (!merchantId) return sendError(res, "merchantId query parameter is required", 400);
                const businesses = await getBusinessesByMerchant(merchantId);
                sendList(res, businesses);
                return;
            }

            if (req.method === "POST" && parts.length === 2) {
                const input = await readJSON(req);
                const business = await createBusiness(input as any);
                sendSuccess(res, business, 201);
                return;
            }

            if (parts.length === 3) {
                const businessId = parts[2];
                const merchantId = url.searchParams.get("merchantId") || undefined;

                if (req.method === "GET") {
                    const business = await getBusinessById(businessId, merchantId);
                    if (!business) return sendError(res, "Business not found or not owned by merchant", 404);
                    sendSuccess(res, business);
                    return;
                }

                if (req.method === "PUT") {
                    const input = await readJSON(req);
                    const effectiveMerchantId = typeof input.merchantId === "string" ? input.merchantId : merchantId;
                    const business = await updateBusiness(businessId, effectiveMerchantId, input as any);
                    if (!business) return sendError(res, "Business not found or not owned by merchant", 404);
                    sendSuccess(res, business);
                    return;
                }

                if (req.method === "DELETE") {
                    const business = await deleteBusiness(businessId, merchantId);
                    if (!business) return sendError(res, "Business not found or not owned by merchant", 404);
                    sendSuccess(res, { message: "Business deleted successfully", business });
                    return;
                }
            }
        }

        // ==========================================
        // 5. LEDGER API
        // ==========================================
        if (parts[0] === "api" && parts[1] === "ledger") {
            // Special calculation route for existing frontend
            if (req.method === "POST" && parts.length === 3 && parts[2] === "calculate") {
                const input = await readJSON(req);
                const businessId = typeof input.businessId === "string" ? input.businessId : "";
                const merchantId = typeof input.merchantId === "string" ? input.merchantId : undefined;
                if (!businessId) return sendError(res, "businessId is required", 400);

                const financials = await calculateFinancials(businessId, merchantId);
                sendSuccess(res, financials);
                return;
            }

            if (req.method === "GET" && parts.length === 2) {
                const businessId = url.searchParams.get("businessId");
                const merchantId = url.searchParams.get("merchantId") || undefined;
                if (!businessId) return sendError(res, "businessId query parameter is required", 400);

                const entries = await getLedgerEntries(businessId, merchantId);
                sendList(res, entries);
                return;
            }

            if (req.method === "POST" && parts.length === 2) {
                const input = await readJSON(req);
                const entry = await createLedgerEntry(input as any);
                sendSuccess(res, entry, 201);
                return;
            }

            if (parts.length === 3) {
                const ledgerId = parts[2];
                const merchantId = url.searchParams.get("merchantId") || undefined;
                const businessId = url.searchParams.get("businessId") || undefined;

                if (req.method === "GET") {
                    const entry = await getLedgerEntryById(ledgerId, businessId, merchantId);
                    if (!entry) return sendError(res, "Ledger entry not found", 404);
                    sendSuccess(res, entry);
                    return;
                }

                if (req.method === "PUT") {
                    const input = await readJSON(req);
                    const effectiveMerchantId = typeof input.merchantId === "string" ? input.merchantId : merchantId;
                    const entry = await updateLedgerEntry(ledgerId, input as any, effectiveMerchantId);
                    if (!entry) return sendError(res, "Ledger entry not found", 404);
                    sendSuccess(res, entry);
                    return;
                }

                if (req.method === "DELETE") {
                    const entry = await deleteLedgerEntry(ledgerId, merchantId);
                    if (!entry) return sendError(res, "Ledger entry not found", 404);
                    sendSuccess(res, { message: "Ledger entry deleted successfully", entry });
                    return;
                }
            }
        }

        // ==========================================
        // 6. DASHBOARD API
        // ==========================================
        if (parts[0] === "api" && parts[1] === "dashboard") {
            // GET /api/dashboard?businessId=... or ?merchantId=...
            if (req.method === "GET" && parts.length === 2) {
                const businessId = url.searchParams.get("businessId");
                const merchantId = url.searchParams.get("merchantId") || undefined;
                if (businessId) {
                    const dashboard = await getBusinessDashboard(businessId, merchantId);
                    sendSuccess(res, dashboard);
                    return;
                }
                if (merchantId) {
                    const summary = await getDashboardSummary(merchantId);
                    if (!summary) return sendError(res, "Merchant not found", 404);
                    sendSuccess(res, summary);
                    return;
                }
                return sendError(res, "businessId or merchantId query parameter is required", 400);
            }

            // GET /api/dashboard/:merchantId (merchant level summary)
            if (req.method === "GET" && parts.length === 3) {
                const merchantId = parts[2];
                const summary = await getDashboardSummary(merchantId);
                if (!summary) return sendError(res, "Merchant not found", 404);
                sendSuccess(res, summary);
                return;
            }
        }

        // ==========================================
        // 7. REPORTS API
        // ==========================================
        if (parts[0] === "api" && parts[1] === "reports") {
            const reportType = parts[2];
            const businessId = url.searchParams.get("businessId");
            if (!businessId) return sendError(res, "businessId query parameter is required", 400);

            if (req.method === "GET") {
                if (reportType === "daily") {
                    const date = url.searchParams.get("date") || undefined;
                    const report = await getDailyReport(businessId, date);
                    sendSuccess(res, report);
                    return;
                }

                if (reportType === "monthly") {
                    const month = url.searchParams.get("month") || undefined;
                    const report = await getMonthlyReport(businessId, month);
                    sendSuccess(res, report);
                    return;
                }

                if (reportType === "summary") {
                    const startDate = url.searchParams.get("startDate") || undefined;
                    const endDate = url.searchParams.get("endDate") || undefined;
                    const report = await getSummaryReport(businessId, startDate, endDate);
                    sendSuccess(res, report);
                    return;
                }
            }
        }

        // ==========================================
        // 8. AI API
        // ==========================================
        if (parts[0] === "api" && parts[1] === "ai") {
            const action = parts[2];
            if (action === "analyze" || action === "insights") {
                if (req.method === "POST") {
                    const input = await readJSON(req);
                    const businessId = typeof input.businessId === "string" ? input.businessId : url.searchParams.get("businessId");
                    if (!businessId) return sendError(res, "businessId is required", 400);

                    const analysis = await analyzeBusinessAI(businessId, input);
                    sendSuccess(res, analysis);
                    return;
                }
                if (req.method === "GET") {
                    const businessId = url.searchParams.get("businessId");
                    if (!businessId) return sendError(res, "businessId query parameter is required", 400);

                    const analysis = await analyzeBusinessAI(businessId, {});
                    sendSuccess(res, analysis);
                    return;
                }
            }
        }

        // ==========================================
        // 9. PROBLEMS / ISSUES API
        // ==========================================
        if (parts[0] === "api" && parts[1] === "problems") {
            // GET /api/problems (list with optional filters)
            if (req.method === "GET" && parts.length === 2) {
                const merchantId = url.searchParams.get("merchantId") || undefined;
                const businessId = url.searchParams.get("businessId") || undefined;
                const status = url.searchParams.get("status") || undefined;
                const priority = url.searchParams.get("priority") || undefined;
                const category = url.searchParams.get("category") || undefined;

                const problems = await getProblems({ merchantId, businessId, status, priority, category });
                sendList(res, problems);
                return;
            }

            // POST /api/problems (create problem)
            if (req.method === "POST" && parts.length === 2) {
                const input = await readJSON(req);
                const problem = await createProblem(input as any);
                sendSuccess(res, problem, 201);
                return;
            }

            // /api/problems/:id
            if (parts.length === 3) {
                const problemId = parts[2];

                if (req.method === "GET") {
                    const problem = await getProblemById(problemId);
                    if (!problem) return sendError(res, "Problem not found", 404);
                    sendSuccess(res, problem);
                    return;
                }

                if (req.method === "PUT") {
                    const input = await readJSON(req);
                    const problem = await updateProblem(problemId, input as any);
                    if (!problem) return sendError(res, "Problem not found", 404);
                    sendSuccess(res, problem);
                    return;
                }

                if (req.method === "DELETE") {
                    const problem = await deleteProblem(problemId);
                    if (!problem) return sendError(res, "Problem not found", 404);
                    sendSuccess(res, { message: "Problem deleted successfully", problem });
                    return;
                }
            }
        }

        // 404 Route Not Found
        sendError(res, `Route not found: ${req.method} ${url.pathname}`, 404);
    } catch (caught: any) {
        if (caught instanceof AppError) {
            return sendError(res, caught.message, caught.statusCode);
        }
        console.error("Unhandled Server Error:", caught instanceof Error ? caught.message : caught);
        sendError(res, "Internal server error", 500);
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraminSarthi AI backend running at http://localhost:${PORT}`);
    initDatabaseSchema().catch((err) => {
        console.warn("[DB] Note on schema initialization:", err instanceof Error ? err.message : err);
    });
});
