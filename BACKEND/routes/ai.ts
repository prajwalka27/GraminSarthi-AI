import { query } from "../database/neon.js";
import { getBusinessById } from "./business.js";
import { validateRequiredString, NotFoundError } from "../utils/validation.js";
import { computeFinancialsFromEntries, computeCashFlow } from "../utils/calculations.js";

export interface AIAnalysisResponse {
    businessId: string;
    businessName: string;
    healthScore: number; // 0 to 100
    summary: string;
    insights: string[];
    recommendations: string[];
    metrics: {
        totalGrossSales: number;
        purchaseCosts: number;
        totalExpenses: number;
        operatingMargin: number;
        cashFlowBalance: number;
        transactionCount: number;
    };
}

export async function analyzeBusinessAI(
    businessId: string,
    options: { focus?: string } = {}
): Promise<AIAnalysisResponse> {
    const cleanBizId = validateRequiredString(businessId, "businessId");

    const business = await getBusinessById(cleanBizId);
    if (!business) {
        throw new NotFoundError(`Business '${cleanBizId}'`);
    }

    const res = await query(
        `SELECT * FROM ledger_entries
         WHERE business_id = $1
         ORDER BY entry_date DESC, created_at DESC;`,
        [cleanBizId]
    );

    const entries = res.rows;
    const financials = computeFinancialsFromEntries(entries);
    const cashFlow = computeCashFlow(entries);

    const insights: string[] = [];
    const recommendations: string[] = [];
    let healthScore = 75;

    if (entries.length === 0) {
        return {
            businessId: business.id,
            businessName: business.businessName,
            healthScore: 50,
            summary: `No transaction records have been recorded yet for ${business.businessName}. Start by recording today's sales and purchases.`,
            insights: ["Ledger is currently empty. Record daily transactions to unlock financial insights."],
            recommendations: [
                "Record your daily morning and evening sales.",
                "Track wholesale procurement expenses to calculate your true gross profit."
            ],
            metrics: {
                totalGrossSales: 0,
                purchaseCosts: 0,
                totalExpenses: 0,
                operatingMargin: 0,
                cashFlowBalance: 0,
                transactionCount: 0,
            },
        };
    }

    // 1. Operating Margin Analysis
    if (financials.operatingMargin >= 30) {
        insights.push(`Strong operating margin of ${financials.operatingMargin}%. Your pricing structure is healthy.`);
        healthScore += 10;
    } else if (financials.operatingMargin >= 15) {
        insights.push(`Moderate operating margin of ${financials.operatingMargin}%. Business is profitable but sensitive to cost increases.`);
    } else if (financials.operatingMargin > 0) {
        insights.push(`Low operating margin of ${financials.operatingMargin}%. Fixed costs and wholesale prices are consuming most revenue.`);
        recommendations.push("Review product markups and negotiate volume discounts on major wholesale items.");
        healthScore -= 15;
    } else {
        insights.push(`Negative operating margin of ${financials.operatingMargin}%. Total expenses currently exceed gross sales.`);
        recommendations.push("Urgent review: Identify high overhead expenses or check if all daily sales are being recorded.");
        healthScore -= 25;
    }

    // 2. High Expense / Wholesale Ratio Analysis
    if (financials.grossSales > 0) {
        const purchaseRatio = (financials.purchaseCosts / financials.grossSales) * 100;
        if (purchaseRatio > 65) {
            insights.push(`Wholesale procurement accounts for ${Math.round(purchaseRatio)}% of sales, indicating tight wholesale-to-retail spreads.`);
            recommendations.push("Consider joining with nearby village merchants for collective bulk procurement to reduce wholesale costs.");
        }

        const overheadRatio = (financials.dailyOverhead / financials.grossSales) * 100;
        if (overheadRatio > 25) {
            insights.push(`Operating overhead (rent, power, labor, interest) represents ${Math.round(overheadRatio)}% of gross sales.`);
            recommendations.push("Audit monthly recurring utilities and interest payments to reduce daily overhead burden.");
        }
    }

    // 3. Category-Specific Overhead Checks
    if (financials.interest > 0) {
        insights.push(`Interest on informal loans/credit totals ₹${financials.interest.toLocaleString("en-IN")}.`);
        recommendations.push("Explore government-backed low-interest schemes like PM SVANidhi or Mudra Loan to refinance high-interest local debt.");
    }
    if (financials.power > 0 && financials.power > financials.grossSales * 0.1) {
        insights.push(`Electricity costs (₹${financials.power.toLocaleString("en-IN")}) are notably high relative to total sales.`);
        recommendations.push("Check refrigeration equipment efficiency or explore rural solar subsidy schemes for shop lighting.");
    }

    // 4. Cash Flow Health
    if (cashFlow.netCashFlow > 0) {
        insights.push(`Positive net cash flow of +₹${cashFlow.netCashFlow.toLocaleString("en-IN")} across recorded transactions.`);
    } else {
        insights.push(`Cash flow deficit: Outflows exceed cash collections by ₹${Math.abs(cashFlow.netCashFlow).toLocaleString("en-IN")}.`);
        recommendations.push("Accelerate customer credit/khata collection and prioritize cash settlements from frequent buyers.");
        healthScore -= 10;
    }

    // 5. Outlier Detection
    const amounts = entries.map((e: any) => Number(e.amount) || 0).filter((a: number) => a > 0);
    const avgAmount = amounts.reduce((a: number, b: number) => a + b, 0) / (amounts.length || 1);
    const outliers = entries.filter((e: any) => Number(e.amount) > avgAmount * 3);
    if (outliers.length > 0) {
        insights.push(`Detected ${outliers.length} unusually large transactions (above 3x average of ₹${Math.round(avgAmount)}).`);
    }

    // Clamp health score 10-100
    healthScore = Math.min(100, Math.max(10, healthScore));

    const summary = `${business.businessName} has recorded ${entries.length} transactions totaling ₹${financials.grossSales.toLocaleString("en-IN")} in gross sales with a net profit of ₹${financials.netProfit.toLocaleString("en-IN")} and an operating margin of ${financials.operatingMargin}%. Overall business health score is ${healthScore}/100.`;

    if (recommendations.length === 0) {
        recommendations.push("Maintain daily recordkeeping to continue receiving accurate margin and subsidy recommendations.");
        recommendations.push("Explore expanding into high-margin FMCG staples and seasonal demand items.");
    }

    return {
        businessId: business.id,
        businessName: business.businessName,
        healthScore,
        summary,
        insights,
        recommendations,
        metrics: {
            totalGrossSales: financials.grossSales,
            purchaseCosts: financials.purchaseCosts,
            totalExpenses: financials.totalExpenses,
            operatingMargin: financials.operatingMargin,
            cashFlowBalance: cashFlow.netCashFlow,
            transactionCount: entries.length,
        },
    };
}

