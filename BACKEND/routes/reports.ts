import { query } from "../database/neon.js";
import { getBusinessById } from "./business.js";
import { validateRequiredString, validateDate, validateMonth, NotFoundError } from "../utils/validation.js";
import { computeFinancialsFromEntries, computeCashFlow, type FinancialBreakdown, type CashFlowBreakdown } from "../utils/calculations.js";
import { mapLedgerEntry } from "../types/index.js";

export interface DailyReportResponse {
    businessId: string;
    businessName: string;
    date: string;
    financials: FinancialBreakdown;
    cashFlow: CashFlowBreakdown;
    entries: any[];
}

export interface MonthlyReportResponse {
    businessId: string;
    businessName: string;
    month: string;
    financials: FinancialBreakdown;
    cashFlow: CashFlowBreakdown;
    dailyBreakdown: Array<{
        date: string;
        grossSales: number;
        expenses: number;
        netProfit: number;
        entryCount: number;
    }>;
}

export interface SummaryReportResponse {
    businessId: string;
    businessName: string;
    period: {
        startDate: string;
        endDate: string;
    };
    financials: FinancialBreakdown;
    cashFlow: CashFlowBreakdown;
    averageDailySales: number;
}

/**
 * Daily financial report for a specific business and date.
 */
export async function getDailyReport(businessId: string, date?: string): Promise<DailyReportResponse> {
    const cleanBizId = validateRequiredString(businessId, "businessId");
    const targetDate = validateDate(date, "date") || new Date().toISOString().slice(0, 10);

    const business = await getBusinessById(cleanBizId);
    if (!business) {
        throw new NotFoundError(`Business '${cleanBizId}'`);
    }

    const res = await query(
        `SELECT * FROM ledger_entries
         WHERE business_id = $1 AND entry_date = $2
         ORDER BY created_at DESC;`,
        [cleanBizId, targetDate]
    );

    const rows = res.rows;
    const financials = computeFinancialsFromEntries(rows);
    const cashFlow = computeCashFlow(rows);

    return {
        businessId: business.id,
        businessName: business.businessName,
        date: targetDate,
        financials,
        cashFlow,
        entries: rows.map(mapLedgerEntry),
    };
}

/**
 * Monthly financial report with daily aggregation breakdown.
 */
export async function getMonthlyReport(businessId: string, month?: string): Promise<MonthlyReportResponse> {
    const cleanBizId = validateRequiredString(businessId, "businessId");
    const targetMonth = validateMonth(month, "month") || new Date().toISOString().slice(0, 7);

    const business = await getBusinessById(cleanBizId);
    if (!business) {
        throw new NotFoundError(`Business '${cleanBizId}'`);
    }

    const res = await query(
        `SELECT * FROM ledger_entries
         WHERE business_id = $1
         ORDER BY entry_date ASC;`,
        [cleanBizId]
    );

    const allMonthEntries = res.rows.filter((r: any) => String(r.entry_date || "").startsWith(targetMonth));
    const financials = computeFinancialsFromEntries(allMonthEntries);
    const cashFlow = computeCashFlow(allMonthEntries);

    // Group by date
    const dailyMap = new Map<string, any[]>();
    for (const entry of allMonthEntries) {
        const d = String(entry.entry_date || "").slice(0, 10);
        if (!dailyMap.has(d)) dailyMap.set(d, []);
        dailyMap.get(d)!.push(entry);
    }

    const dailyBreakdown = Array.from(dailyMap.entries()).map(([date, entries]) => {
        const dayFin = computeFinancialsFromEntries(entries);
        return {
            date,
            grossSales: dayFin.grossSales,
            expenses: dayFin.totalExpenses,
            netProfit: dayFin.netProfit,
            entryCount: entries.length,
        };
    });

    return {
        businessId: business.id,
        businessName: business.businessName,
        month: targetMonth,
        financials,
        cashFlow,
        dailyBreakdown,
    };
}

/**
 * Summary report across a custom date range.
 */
export async function getSummaryReport(
    businessId: string,
    startDate?: string,
    endDate?: string
): Promise<SummaryReportResponse> {
    const cleanBizId = validateRequiredString(businessId, "businessId");
    const today = new Date().toISOString().slice(0, 10);

    const start = validateDate(startDate, "startDate") || "2000-01-01";
    const end = validateDate(endDate, "endDate") || today;

    const business = await getBusinessById(cleanBizId);
    if (!business) {
        throw new NotFoundError(`Business '${cleanBizId}'`);
    }

    const res = await query(
        `SELECT * FROM ledger_entries
         WHERE business_id = $1
         ORDER BY entry_date DESC;`,
        [cleanBizId]
    );

    const filtered = res.rows.filter((r: any) => {
        const d = String(r.entry_date || "").slice(0, 10);
        return d >= start && d <= end;
    });

    const financials = computeFinancialsFromEntries(filtered);
    const cashFlow = computeCashFlow(filtered);

    const uniqueDays = new Set(filtered.map((r: any) => String(r.entry_date || "").slice(0, 10))).size;
    const averageDailySales = uniqueDays > 0 ? Math.round((financials.grossSales / uniqueDays) * 100) / 100 : 0;

    return {
        businessId: business.id,
        businessName: business.businessName,
        period: {
            startDate: start,
            endDate: end,
        },
        financials,
        cashFlow,
        averageDailySales,
    };
}

