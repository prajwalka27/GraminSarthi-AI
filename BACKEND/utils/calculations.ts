/**
 * Financial and cash flow calculations for GraminSarthi-AI
 */

export interface FinancialBreakdown {
    grossSales: number;
    cashCollected: number;
    purchaseCosts: number;
    rent: number;
    power: number;
    labor: number;
    interest: number;
    otherExpenses: number;
    totalExpenses: number;
    dailyOverhead: number;
    grossProfit: number;
    netProfit: number;
    operatingMargin: number;
    ledgerEntryCount: number;
    estimatedMonthlyTakeHome?: number;
}

export interface CashFlowBreakdown {
    cashInflow: number;
    cashOutflow: number;
    netCashFlow: number;
}

/**
 * Calculates operating margin safely without returning NaN or Infinity.
 * Operating Margin = (Net P&L / Gross Sales) * 100
 */
export function calculateOperatingMargin(netProfit: number, grossSales: number): number {
    if (!grossSales || grossSales <= 0 || !Number.isFinite(grossSales)) {
        return 0;
    }
    const margin = (netProfit / grossSales) * 100;
    return Number.isFinite(margin) ? Math.round(margin * 100) / 100 : 0;
}

/**
 * Computes complete financial metrics from a list of ledger items.
 */
export function computeFinancialsFromEntries(
    entries: Array<{ type: string; amount: number | string }>
): FinancialBreakdown {
    let grossSales = 0;
    let cashCollected = 0;
    let purchaseCosts = 0;
    let rent = 0;
    let power = 0;
    let labor = 0;
    let interest = 0;
    let otherExpenses = 0;

    for (const entry of entries) {
        const type = String(entry.type || "").toUpperCase().trim();
        const amt = Number(entry.amount) || 0;

        switch (type) {
            case "SALE":
            case "INCOME":
                grossSales += amt;
                break;
            case "CASH_COLLECTED":
                cashCollected += amt;
                break;
            case "PURCHASE":
            case "STOCK_COST":
                purchaseCosts += amt;
                break;
            case "RENT":
                rent += amt;
                break;
            case "POWER":
                power += amt;
                break;
            case "LABOR":
                labor += amt;
                break;
            case "INTEREST":
                interest += amt;
                break;
            case "OTHER_EXPENSE":
            case "EXPENSE":
            case "OVERHEAD":
            default:
                otherExpenses += amt;
                break;
        }
    }

    const dailyOverhead = rent + power + labor + interest + otherExpenses;
    const totalExpenses = purchaseCosts + dailyOverhead;
    const grossProfit = grossSales - purchaseCosts;
    const netProfit = grossProfit - dailyOverhead;
    const operatingMargin = calculateOperatingMargin(netProfit, grossSales);
    const estimatedMonthlyTakeHome = Math.max(0, netProfit * 26); // estimated 26 working days

    return {
        grossSales: Math.round(grossSales * 100) / 100,
        cashCollected: Math.round(cashCollected * 100) / 100,
        purchaseCosts: Math.round(purchaseCosts * 100) / 100,
        rent: Math.round(rent * 100) / 100,
        power: Math.round(power * 100) / 100,
        labor: Math.round(labor * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        otherExpenses: Math.round(otherExpenses * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        dailyOverhead: Math.round(dailyOverhead * 100) / 100,
        grossProfit: Math.round(grossProfit * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        operatingMargin,
        ledgerEntryCount: entries.length,
        estimatedMonthlyTakeHome: Math.round(estimatedMonthlyTakeHome * 100) / 100,
    };
}

/**
 * Cash flow calculation distinguishing cash collected vs credit sales.
 * Cash Inflow = Cash Collected (or Cash Sales if no separate collection specified)
 * Cash Outflow = Purchases + All Overhead Cash Expenses
 * Net Cash Flow = Cash Inflow - Cash Outflow
 */
export function computeCashFlow(
    entries: Array<{ type: string; amount: number | string }>
): CashFlowBreakdown {
    let inflow = 0;
    let outflow = 0;

    for (const entry of entries) {
        const type = String(entry.type || "").toUpperCase().trim();
        const amt = Number(entry.amount) || 0;

        if (type === "CASH_COLLECTED" || type === "SALE" || type === "INCOME") {
            inflow += amt;
        } else {
            outflow += amt;
        }
    }

    return {
        cashInflow: Math.round(inflow * 100) / 100,
        cashOutflow: Math.round(outflow * 100) / 100,
        netCashFlow: Math.round((inflow - outflow) * 100) / 100,
    };
}

