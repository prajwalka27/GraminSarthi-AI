import { query } from "../database/neon.js";
import { getMerchantById } from "./merchant.js";
import { getBusinessById } from "./business.js";
import { validateRequiredString, NotFoundError } from "../utils/validation.js";
import { computeFinancialsFromEntries, type FinancialBreakdown } from "../utils/calculations.js";

export interface DashboardResponse {
    business: {
        id: string;
        name: string;
        category: string;
    };
    today: FinancialBreakdown;
    monthly: {
        grossSales: number;
        purchaseCosts: number;
        expenses: number;
        netProfit: number;
        operatingMargin: number;
        ledgerEntryCount: number;
    };
    cashFlow: {
        cashInflow: number;
        cashOutflow: number;
        netCashFlow: number;
    };
}

/**
 * Returns dashboard metrics for a specific business, calculating today and monthly metrics
 * directly from Neon database records.
 */
export async function getBusinessDashboard(businessId: string, merchantId?: string): Promise<DashboardResponse> {
    const cleanBizId = validateRequiredString(businessId, "businessId");

    const business = await getBusinessById(cleanBizId, merchantId);
    if (!business) {
        throw new NotFoundError(`Business '${cleanBizId}'`);
    }

    const todayDate = new Date().toISOString().slice(0, 10);
    const currentMonth = todayDate.slice(0, 7); // 'YYYY-MM'

    // Fetch all entries for this business
    const res = await query(
        `SELECT * FROM ledger_entries
         WHERE business_id = $1
         ORDER BY entry_date DESC;`,
        [cleanBizId]
    );

    const allEntries = res.rows;
    const todayEntries = allEntries.filter((e: any) => String(e.entry_date || "").slice(0, 10) === todayDate);
    const monthEntries = allEntries.filter((e: any) => String(e.entry_date || "").slice(0, 7) === currentMonth);

    const todayFinancials = computeFinancialsFromEntries(todayEntries);
    const monthlyFinancials = computeFinancialsFromEntries(monthEntries);

    // Cash flow
    let cashInflow = 0;
    let cashOutflow = 0;
    for (const e of allEntries) {
        const t = String(e.type || "").toUpperCase().trim();
        const amt = Number(e.amount) || 0;
        if (t === "SALE" || t === "INCOME" || t === "CASH_COLLECTED") {
            cashInflow += amt;
        } else {
            cashOutflow += amt;
        }
    }

    return {
        business: {
            id: business.id,
            name: business.businessName,
            category: business.businessCategory,
        },
        today: todayFinancials,
        monthly: {
            grossSales: monthlyFinancials.grossSales,
            purchaseCosts: monthlyFinancials.purchaseCosts,
            expenses: monthlyFinancials.totalExpenses,
            netProfit: monthlyFinancials.netProfit,
            operatingMargin: monthlyFinancials.operatingMargin,
            ledgerEntryCount: monthEntries.length,
        },
        cashFlow: {
            cashInflow: Math.round(cashInflow * 100) / 100,
            cashOutflow: Math.round(cashOutflow * 100) / 100,
            netCashFlow: Math.round((cashInflow - cashOutflow) * 100) / 100,
        },
    };
}

/**
 * Merchant-level dashboard summary aggregating all businesses owned by a merchant.
 */
export async function getDashboardSummary(merchantId: string) {
    const cleanId = validateRequiredString(merchantId, "merchantId");
    const merchant = await getMerchantById(cleanId);
    if (!merchant) return null;

    const bizCountRes = await query(
        `SELECT COUNT(*)::INTEGER as count FROM businesses WHERE merchant_id = $1;`,
        [cleanId]
    );
    const businessCount = Number(bizCountRes.rows[0]?.count) || 0;

    const ledgerRes = await query(
        `SELECT * FROM ledger_entries WHERE merchant_id = $1;`,
        [cleanId]
    );

    const financials = computeFinancialsFromEntries(ledgerRes.rows);

    return {
        merchant,
        businessCount,
        totalIncome: financials.grossSales,
        purchaseCosts: financials.purchaseCosts,
        totalExpense: financials.totalExpenses,
        grossProfit: financials.grossProfit,
        netProfit: financials.netProfit,
        operatingMargin: financials.operatingMargin,
        ledgerEntryCount: financials.ledgerEntryCount,
    };
}
