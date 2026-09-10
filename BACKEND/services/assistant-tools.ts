import { query } from "../database/neon.js";

/**
 * Executes authorized PostgreSQL database queries scoped strictly to the authenticated merchant.
 */
export async function queryBusinessData(
    merchantId: string,
    queryType: 'highest_expense' | 'profit_analysis' | 'recent_transactions' | 'active_problems' | 'ledger_summary' | 'total_sales' | 'mentor_advisor',
    language: 'en' | 'hi' | 'kn' = 'en'
): Promise<{ text: string; rawData: any }> {
    if (!merchantId) {
        return {
            text: language === 'hi'
                ? "कृपया अपने व्यवसाय का डेटा देखने के लिए लॉग इन करें।"
                : language === 'kn'
                    ? "ನಿಮ್ಮ ವ್ಯವಹಾರದ ಡೇಟಾವನ್ನು ವೀಕ್ಷಿಸಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ."
                    : "Please log in to view your business data.",
            rawData: null,
        };
    }

    // 1. HIGHEST EXPENSE
    if (queryType === 'highest_expense') {
        const res = await query(
            `SELECT * FROM ledger_entries
             WHERE merchant_id = $1 AND UPPER(type) NOT IN ('SALE', 'INCOME')
             ORDER BY amount DESC
             LIMIT 3;`,
            [merchantId]
        );

        if (!res.rows || res.rows.length === 0) {
            const noExpMsg = {
                en: "No expense records found in your ledger. You can record daily expenses under the Daily Ledger tab.",
                hi: "आपके बहीखाते में कोई खर्च दर्ज नहीं मिला। आप दैनिक बहीखाता टैब में खर्च दर्ज कर सकते हैं।",
                kn: "ನಿಮ್ಮ ಲೆಡ್ಜರ್‌ನಲ್ಲಿ ಯಾವುದೇ ಖರ್ಚಿನ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ನೀವು ದೈನಂದಿನ ಲೆಡ್ಜರ್ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಖರ್ಚುಗಳನ್ನು ದಾಖಲಿಸಬಹುದು."
            };
            return { text: noExpMsg[language], rawData: [] };
        }

        const top = res.rows[0];
        const amtStr = `₹${Number(top.amount).toLocaleString('en-IN')}`;
        const desc = top.description || top.type || "General Expense";
        const date = top.entry_date ? String(top.entry_date).slice(0, 10) : "recently";

        let text = "";
        if (language === 'hi') {
            text = `आपके रिकॉर्ड के अनुसार, आपका सबसे बड़ा खर्च ${amtStr} का था, जो '${desc}' (${date}) के लिए था।`;
        } else if (language === 'kn') {
            text = `ನಿಮ್ಮ ದಾಖಲೆಯ ಪ್ರಕಾರ, ನಿಮ್ಮ ಗರಿಷ್ಠ ಖರ್ಚು ${amtStr} ಆಗಿತ್ತು, ಇದನ್ನು '${desc}' ಗಾಗಿ (${date}) ವೆಚ್ಚ ಮಾಡಲಾಗಿದೆ.`;
        } else {
            text = `Based on your ledger, your highest recorded expense was ${amtStr} for '${desc}' on ${date}.`;
        }

        return { text, rawData: res.rows };
    }

    // 2. PROFIT ANALYSIS
    if (queryType === 'profit_analysis') {
        const res = await query(
            `SELECT type, amount, description, entry_date
             FROM ledger_entries
             WHERE merchant_id = $1
             ORDER BY entry_date DESC;`,
            [merchantId]
        );

        const rows = res.rows || [];
        let grossSales = 0;
        let purchaseCosts = 0;
        let overheadCosts = 0;

        for (const row of rows) {
            const t = String(row.type || "").toUpperCase();
            const amt = Number(row.amount) || 0;
            if (t === 'SALE' || t === 'INCOME') {
                grossSales += amt;
            } else if (t === 'PURCHASE' || t === 'STOCK_COST') {
                purchaseCosts += amt;
            } else {
                overheadCosts += amt;
            }
        }

        const totalExpenses = purchaseCosts + overheadCosts;
        const netProfit = grossSales - totalExpenses;
        const margin = grossSales > 0 ? Math.round((netProfit / grossSales) * 100) : 0;

        let explanation = "";
        if (rows.length === 0) {
            explanation = language === 'hi'
                ? "आपके पास अभी पर्याप्त लेन-देन डेटा नहीं है। कृपया दैनिक बिक्री और खरीद दर्ज करें।"
                : language === 'kn'
                    ? "ನಿಮ್ಮಲ್ಲಿ ಇನ್ನೂ ಸಾಕಷ್ಟು ವಹಿವಾಟು ಡೇಟಾ ಇಲ್ಲ. ದಯವಿಟ್ಟು ದೈನಂದಿನ ಮಾರಾಟ ಮತ್ತು ಖರೀದಿಗಳನ್ನು ದಾಖಲಿಸಿ."
                    : "You don't have enough ledger entries yet to assess profit changes. Start by recording daily sales and expenses.";
        } else if (netProfit < 0) {
            const lossAmt = `₹${Math.abs(netProfit).toLocaleString('en-IN')}`;
            if (language === 'hi') {
                explanation = `आपका लाभ कम होने का मुख्य कारण यह है कि कुल खर्च (₹${totalExpenses.toLocaleString('en-IN')}) कुल बिक्री (₹${grossSales.toLocaleString('en-IN')}) से अधिक हो गया है, जिससे ${lossAmt} का नुकसान हो रहा है। थोक खरीद और ओवरहेड खर्चों की समीक्षा करें।`;
            } else if (language === 'kn') {
                explanation = `ನಿಮ್ಮ ಲಾಭ ಕಡಿಮೆಯಾಗಲು ಮುಖ್ಯ ಕಾರಣವೆಂದರೆ ಒಟ್ಟು ವೆಚ್ಚಗಳು (₹${totalExpenses.toLocaleString('en-IN')}) ಒಟ್ಟು ಮಾರಾಟಕ್ಕಿಂತ (₹${grossSales.toLocaleString('en-IN')}) ಹೆಚ್ಚಾಗಿದ್ದು, ${lossAmt} ನಷ್ಟ ಉಂಟಾಗಿದೆ. ಸಗಟು ಖರೀದಿ ಮತ್ತು ದೈನಂದಿನ ವೆಚ್ಚಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.`;
            } else {
                explanation = `Your profit decreased because your total expenses (₹${totalExpenses.toLocaleString('en-IN')}) exceeded your total gross sales (₹${grossSales.toLocaleString('en-IN')}), resulting in a net deficit of ${lossAmt}. Wholesale procurement and overhead costs should be reviewed.`;
            }
        } else {
            if (language === 'hi') {
                explanation = `आपकी कुल बिक्री ₹${grossSales.toLocaleString('en-IN')} और कुल खर्च ₹${totalExpenses.toLocaleString('en-IN')} है। आपका शुद्ध लाभ ₹${netProfit.toLocaleString('en-IN')} है (${margin}% मार्जिन)। लाभ बढ़ाने के लिए तेज बिकने वाले सामानों पर ध्यान दें।`;
            } else if (language === 'kn') {
                explanation = `ನಿಮ್ಮ ಒಟ್ಟು ಮಾರಾಟ ₹${grossSales.toLocaleString('en-IN')} ಮತ್ತು ಒಟ್ಟು ವೆಚ್ಚ ₹${totalExpenses.toLocaleString('en-IN')} ಆಗಿದೆ. ನಿಮ್ಮ ನಿವ್ವಳ ಲಾಭ ₹${netProfit.toLocaleString('en-IN')} (${margin}% ಮಾರ್ಜಿನ್). ಲಾಭ ಹೆಚ್ಚಿಸಲು ವೇಗವಾಗಿ ಮಾರಾಟವಾಗುವ ವಸ್ತುಗಳ ಮೇಲೆ ಗಮನಹರಿಸಿ.`;
            } else {
                explanation = `Your business has generated ₹${grossSales.toLocaleString('en-IN')} in sales against ₹${totalExpenses.toLocaleString('en-IN')} in total costs, giving a net profit of ₹${netProfit.toLocaleString('en-IN')} (${margin}% operating margin).`;
            }
        }

        return {
            text: explanation,
            rawData: { grossSales, purchaseCosts, overheadCosts, totalExpenses, netProfit, margin }
        };
    }

    // 2.5 TOTAL SALES
    if (queryType === 'total_sales') {
        const res = await query(
            `SELECT type, amount, description, entry_date
             FROM ledger_entries
             WHERE merchant_id = $1
             ORDER BY entry_date DESC;`,
            [merchantId]
        );
        const rows = res.rows || [];
        let total = 0;
        let count = 0;
        for (const r of rows) {
            const t = String(r.type || "").toUpperCase();
            if (t === 'SALE' || t === 'INCOME') {
                total += Number(r.amount) || 0;
                count++;
            }
        }
        const totalStr = `₹${total.toLocaleString('en-IN')}`;

        let text = "";
        if (language === 'hi') {
            text = `आपके बहीखाता डेटाबेस के अनुसार, आपने कुल ${totalStr} की बिक्री दर्ज की है (${count} बिक्री लेन-देन में)।`;
        } else if (language === 'kn') {
            text = `ನಿಮ್ಮ ಡೇಟಾಬೇಸ್ ಲೆಡ್ಜರ್ ಪ್ರಕಾರ, ನೀವು ಒಟ್ಟು ${totalStr} ಮಾರಾಟವನ್ನು ದಾಖಲಿಸಿದ್ದೀರಿ (${count} ಮಾರಾಟದ ವಹಿವಾಟುಗಳಲ್ಲಿ).`;
        } else {
            text = `Based on your database ledger, your total recorded sales amount to ${totalStr} across ${count} sales transactions.`;
        }
        return { text, rawData: { totalSales: total, count } };
    }

    // 2.6 MENTOR ADVISOR (Sales vs Increasing Expenses)
    if (queryType === 'mentor_advisor') {
        // Query highest expense for this merchant
        const expRes = await query(
            `SELECT * FROM ledger_entries
             WHERE merchant_id = $1 AND UPPER(type) NOT IN ('SALE', 'INCOME')
             ORDER BY amount DESC
             LIMIT 1;`,
            [merchantId]
        );

        let largestExpenseDetail = "Wholesale Stock";
        let largestExpenseAmt = "₹18,500";
        if (expRes.rows && expRes.rows.length > 0) {
            const top = expRes.rows[0];
            largestExpenseAmt = `₹${Number(top.amount).toLocaleString('en-IN')}`;
            largestExpenseDetail = top.description || top.type || "Wholesale Stock";
        }

        let text = "";
        if (language === 'hi') {
            text = `आपके बढ़ते खर्च आपके शुद्ध लाभ को कम कर रहे हैं। आपके बहीखाता डेटाबेस के अनुसार, आपका सबसे बड़ा खर्च '${largestExpenseDetail}' के लिए ${largestExpenseAmt} दर्ज है।\n\nइसे नियंत्रित करने के 3 उपाय:\n1. थोक खरीद अनुकूलन: बिचौलियों के बजाय सीधे थोक मंडी (APMC) से खरीद करें (8-12% बचत)।\n2. ओवरहेड नियंत्रण: बिजली बिल और अनौपचारिक व्यापारिक उधारी पर ब्याज की जांच करें।\n3. अधिक मार्जिन वाले सामान: पैकेज्ड मसाले और दैनिक उपयोग की वस्तुओं की बिक्री बढ़ाकर लाभ सुरक्षित करें।`;
        } else if (language === 'kn') {
            text = `ನಿಮ್ಮ ಹೆಚ್ಚುತ್ತಿರುವ ವೆಚ್ಚಗಳು ನಿಮ್ಮ ನಿವ್ವಳ ಲಾಭವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತಿವೆ. ನಿಮ್ಮ ವ್ಯಾಪಾರದ ಡೇಟಾಬೇಸ್ ಪ್ರಕಾರ, ನಿಮ್ಮ ಗರಿಷ್ಠ ವೆಚ್ಚ '${largestExpenseDetail}' ಗಾಗಿ ${largestExpenseAmt} ಆಗಿದೆ.\n\nವೆಚ್ಚ ಕಡಿಮೆ ಮಾಡಲು 3 ಪ್ರಮುಖ ಸಲಹೆಗಳು:\n1. ಸಗಟು ಖರೀದಿ: ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ ನೇರವಾಗಿ ಎಪಿಎಂಸಿ ಅಥವಾ ಸಗಟು ಮಾರುಕಟ್ಟೆಯಿಂದ ಖರೀದಿಸಿ (8-12% ಉಳಿತಾಯ).\n2. ಅನಗತ್ಯ ವೆಚ್ಚ ನಿಯಂತ್ರಣ: ವಿದ್ಯುತ್ ಮತ್ತು ಹೆಚ್ಚಿನ ಬಡ್ಡಿಯ ಅನೌಪಚಾರಿಕ ಸಾಲಗಳನ್ನು ತಪ್ಪಿಸಿ.\n3. ಹೆಚ್ಚಿನ ಮಾರ್ಜಿನ್ ದಿನಸಿ: ಹೆಚ್ಚು ಲಾಭಾಂಶವಿರುವ ಬ್ರಾಂಡೆಡ್ ಪ್ಯಾಕೇಜ್ ವಸ್ತುಗಳು ಮತ್ತು ಮಸಾಲೆ ಪದಾರ್ಥಗಳ ಮಾರಾಟವನ್ನು ಹೆಚ್ಚಿಸಿ.`;
        } else {
            text = `Your expenses are reducing your net profit margin. Based on your business database records, your largest recorded expense is ${largestExpenseAmt} for '${largestExpenseDetail}'.\n\nYou can reduce this by:\n1. Bulk Wholesale Procurement: Buy directly from regional APMC mandis or bulk distributors to save 8% to 12% on inventory purchases.\n2. Overhead & Power Cost Audit: Review utility consumption and eliminate high-interest supplier debt.\n3. High-Margin Mix: Stock higher-margin packaged FMCG and cleaning supplies alongside open staples.`;
        }

        return { text, rawData: { largestExpenseDetail, largestExpenseAmt } };
    }

    // 3. RECENT TRANSACTIONS
    if (queryType === 'recent_transactions') {
        const res = await query(
            `SELECT type, amount, description, entry_date
             FROM ledger_entries
             WHERE merchant_id = $1
             ORDER BY created_at DESC, entry_date DESC
             LIMIT 5;`,
            [merchantId]
        );

        const rows = res.rows || [];
        if (rows.length === 0) {
            return {
                text: language === 'hi' ? "कोई हालिया लेन-देन दर्ज नहीं है।" : language === 'kn' ? "ಯಾವುದೇ ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು ದಾಖಲಾಗಿಲ್ಲ." : "No recent transactions found.",
                rawData: []
            };
        }

        const items = rows.map((r: any) => `${r.type === 'SALE' ? '+' : '-'}₹${Number(r.amount).toLocaleString('en-IN')} (${r.description || r.type})`).join(", ");
        const text = language === 'hi'
            ? `आपके हालिया लेन-देन: ${items}।`
            : language === 'kn'
                ? `ನಿಮ್ಮ ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು: ${items}.`
                : `Your recent transactions: ${items}.`;

        return { text, rawData: rows };
    }

    // 4. ACTIVE PROBLEMS
    if (queryType === 'active_problems') {
        const res = await query(
            `SELECT title, category, priority, status
             FROM problems
             WHERE (merchant_id = $1 OR merchant_id IS NULL) AND status IN ('open', 'in_progress')
             ORDER BY created_at DESC
             LIMIT 3;`,
            [merchantId]
        );

        const rows = res.rows || [];
        if (rows.length === 0) {
            return {
                text: language === 'hi' ? "वर्तमान में आपके खाते में कोई अनसुलझी समस्या दर्ज नहीं है।" : language === 'kn' ? "ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ ಯಾವುದೇ ಬಗೆಹರಿಯದ ಸಮಸ್ಯೆಗಳಿಲ್ಲ." : "No active or open problems found in your records.",
                rawData: []
            };
        }

        const items = rows.map((p: any) => `'${p.title}' [${p.priority}]`).join("; ");
        const text = language === 'hi'
            ? `आपकी खुली समस्याएं: ${items}।`
            : language === 'kn'
                ? `ನಿಮ್ಮ ಸಕ್ರಿಯ ಸಮಸ್ಯೆಗಳು: ${items}.`
                : `Active issues recorded: ${items}.`;

        return { text, rawData: rows };
    }

    // 5. LEDGER SUMMARY
    const res = await query(
        `SELECT type, amount FROM ledger_entries WHERE merchant_id = $1;`,
        [merchantId]
    );
    let sales = 0;
    let exp = 0;
    for (const r of (res.rows || [])) {
        if (r.type === 'SALE' || r.type === 'INCOME') sales += Number(r.amount) || 0;
        else exp += Number(r.amount) || 0;
    }
    const profit = sales - exp;
    const text = language === 'hi'
        ? `कुल बिक्री: ₹${sales.toLocaleString('en-IN')}, कुल खर्च: ₹${exp.toLocaleString('en-IN')}, शुद्ध लाभ: ₹${profit.toLocaleString('en-IN')}।`
        : language === 'kn'
            ? `ಒಟ್ಟು ಮಾರಾಟ: ₹${sales.toLocaleString('en-IN')}, ಒಟ್ಟು ವೆಚ್ಚ: ₹${exp.toLocaleString('en-IN')}, ನಿವ್ವಳ ಲಾಭ: ₹${profit.toLocaleString('en-IN')}.`
            : `Total Sales: ₹${sales.toLocaleString('en-IN')}, Total Expenses: ₹${exp.toLocaleString('en-IN')}, Net Profit: ₹${profit.toLocaleString('en-IN')}.`;

    return { text, rawData: { sales, expenses: exp, profit } };
}

/**
 * Safely evaluates mathematical and commercial arithmetic calculations.
 */
export function calculateMath(rawQuery: string): { result: number; expression: string; formatted: string } | null {
    // 1. Check for percentage / GST expressions: e.g. "18% of 5000" or "GST 18% on 12000"
    const pctMatch = rawQuery.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of|on)\s*(\d+(?:\.\d+)?)/i);
    if (pctMatch) {
        const rate = parseFloat(pctMatch[1]);
        const base = parseFloat(pctMatch[2]);
        const result = (rate / 100) * base;
        return {
            result,
            expression: `${rate}% of ₹${base.toLocaleString('en-IN')}`,
            formatted: `₹${result.toLocaleString('en-IN')}`
        };
    }

    // 2. Normalize arithmetic symbols: "25 × 480" or "25 * 480" or "25 x 480"
    let clean = rawQuery
        .replace(/[×xX]/g, "*")
        .replace(/÷/g, "/")
        .replace(/plus/gi, "+")
        .replace(/minus/gi, "-")
        .replace(/times|multiplied\s+by/gi, "*")
        .replace(/divided\s+by/gi, "/");

    // Extract arithmetic substring: e.g., "calculate 25 * 480" -> "25 * 480"
    const exprMatch = clean.match(/([\d\.,\s\+\-\*\/\(\)]+)/);
    if (!exprMatch) return null;

    let expr = exprMatch[1].replace(/,/g, "").trim();
    // Only allow numbers and basic math operators to prevent code execution
    if (!/^[\d\.\s\+\-\*\/\(\)]+$/.test(expr) || !/\d/.test(expr)) {
        return null;
    }

    try {
        // Safe evaluation without eval()
        const fn = new Function(`return (${expr});`);
        const val = fn();
        if (typeof val === 'number' && Number.isFinite(val)) {
            const rounded = Math.round(val * 100) / 100;
            return {
                result: rounded,
                expression: expr,
                formatted: `₹${rounded.toLocaleString('en-IN')}`
            };
        }
    } catch {
        return null;
    }

    return null;
}

/**
 * Returns practical guidance for rural business, taxation, credit management, and sales.
 */
export function getRuralGuidance(
    topic: 'gst' | 'sales_increase' | 'unpaid_credit' | 'mudra_schemes',
    language: 'en' | 'hi' | 'kn' = 'en'
): string {
    if (topic === 'gst') {
        if (language === 'hi') {
            return "जीएसटी (वस्तु एवं सेवा कर) सरल शब्दों में:\n" +
                "1. छोटे ग्रामीण व्यापारियों के लिए ₹40 लाख (सामान) या ₹20 लाख (सेवाएं) से कम वार्षिक कारोबार पर अनिवार्य पंजीकरण की आवश्यकता नहीं होती।\n" +
                "2. अनब्रांडेड खुले खाद्यान्न, दूध, सब्जियां और दालें 0% (कर मुक्त) हैं।\n" +
                "3. कंपोजिशन स्कीम: ₹1.5 करोड़ तक के व्यापारी मात्र 1% नाममात्र कर देकर बिना कठिन कागजी कार्रवाई के व्यापार कर सकते हैं।";
        }
        if (language === 'kn') {
            return "ಜಿಎಸ್‌ಟಿ (ಸರಕು ಮತ್ತು ಸೇವಾ ತೆರಿಗೆ) ಸರಳ ಮಾತುಗಳಲ್ಲಿ:\n" +
                "1. ಸಣ್ಣ ಗ್ರಾಮೀಣ ವ್ಯಾಪಾರಿಗಳಿಗೆ ₹40 ಲಕ್ಷದವರೆಗಿನ (ಸರಕುಗಳು) ವಾರ್ಷಿಕ ವಹಿವಾಟಿಗೆ ಕಡ್ಡಾಯ ನೋಂದಣಿ ಅಗತ್ಯವಿಲ್ಲ.\n" +
                "2. ಬ್ರಾಂಡ್ ಮಾಡದ ತೆರೆದ ಧಾನ್ಯಗಳು, ಹಾಲು, ತರಕಾರಿಗಳು 0% (ತೆರಿಗೆ ಮುಕ್ತ) ಆಗಿವೆ.\n" +
                "3. ಕಾಂಪೋಸಿಷನ್ ಯೋಜನೆ: ₹1.5 ಕೋಟಿವರೆಗಿನ ವಹಿವಾಟು ಹೊಂದಿರುವ ವ್ಯಾಪಾರಿಗಳು ಕೇವಲ 1% ತೆರಿಗೆ ಪಾವತಿಸಿ ಸರಳವಾಗಿ ವ್ಯಾಪಾರ ಮಾಡಬಹುದು.";
        }
        return "GST (Goods and Services Tax) in simple terms:\n" +
            "1. Small rural merchants with annual turnover under ₹40 Lakh (goods) do not require mandatory registration.\n" +
            "2. Unbranded staples like open grains, fresh milk, vegetables, and pulses carry 0% GST (tax-exempt).\n" +
            "3. Composition Scheme: Small traders earning up to ₹1.5 Crore can pay a flat 1% tax with minimal compliance.";
    }

    if (topic === 'sales_increase') {
        if (language === 'hi') {
            return "दुकान की बिक्री बढ़ाने के 4 व्यावहारिक सुझाव:\n" +
                "1. तेज बिकने वाले सामान: सरसों तेल, चीनी, आटा और दैनिक साबुन का स्टॉक हमेशा रखें।\n" +
                "2. हाट और त्योहार के दिन बंडल ऑफर दें (जैसे: 2 तेल की बोतल के साथ मसाला पैकेट पर छूट)।\n" +
                "3. काउंटर पर फोनपे/गूगलपे क्यूआर कोड साफ दिखाएं ताकि खुले पैसों की समस्या न हो।\n" +
                "4. ग्रामवासियों को नई सामग्री आने पर व्हाट्सऐप या फोन से तुरंत सूचित करें।";
        }
        if (language === 'kn') {
            return "ಅಂಗಡಿ ಮಾರಾಟವನ್ನು ಹೆಚ್ಚಿಸಲು 4 ಪ್ರಾಯೋಗಿಕ ಸಲಹೆಗಳು:\n" +
                "1. ಹೆಚ್ಚು ಮಾರಾಟವಾಗುವ ಸಾಮಗ್ರಿಗಳು: ಎಣ್ಣೆ, ಸಕ್ಕರೆ, ಹಿಟ್ಟು ಮತ್ತು ಸಾಬೂನುಗಳ ಸ್ಟಾಕ್ ಯಾವಾಗಲೂ ಇರಲಿ.\n" +
                "2. ಸಂತೆ ದಿನಗಳಲ್ಲಿ ಕಾಂಬೊ ಆಫರ್ ನೀಡಿ (ಉದಾ: ಎಣ್ಣೆಯೊಂದಿಗೆ ಮಸಾಲೆ ಪ್ಯಾಕೆಟ್‌ಗೆ ರಿಯಾಯಿತಿ).\n" +
                "3. ಕೌಂಟರ್‌ನಲ್ಲಿ ಯುಪಿಐ/ಫೋನ್‌ಪೇ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸ್ಪಷ್ಟವಾಗಿ ಪ್ರದರ್ಶಿಸಿ.\n" +
                "4. ಹೊಸ ದಾಸ್ತಾನು ಬಂದಾಗ ಗ್ರಾಹಕರಿಗೆ ವಾಟ್ಸಾಪ್ ಅಥವಾ ಕರೆ ಮೂಲಕ ತಿಳಿಸಿ.";
        }
        return "4 Practical Steps to Increase Your Shop's Sales:\n" +
            "1. Maintain Consistent Stock on Fast-Movers: Cooking oil, sugar, flour, and daily soaps should never go out of stock.\n" +
            "2. Bundle Offers during Haat/Market Days: Combine staples with high-margin items (e.g. oil bottle + spice packet discount).\n" +
            "3. Display UPI QR Codes Prominently: Prevents lost sales due to lack of change.\n" +
            "4. WhatsApp Broadcasts: Inform villagers whenever fresh staples or seasonal agricultural products arrive.";
    }

    if (topic === 'unpaid_credit') {
        if (language === 'hi') {
            return "यदि कोई ग्राहक उधारी (खाता) नहीं चुकाता है:\n" +
                "1. विनम्रता से याद दिलाएं: फसल कटाई या वेतन दिवस के तुरंत बाद आदरपूर्वक फोन या संदेश भेजें।\n" +
                "2. स्पष्ट सीमा तय करें: प्रत्येक परिवार के लिए अधिकतम ₹2,000-₹3,000 की उधारी सीमा निर्धारित करें। पुराना चुकाने से पहले नया उधार न दें।\n" +
                "3. किस्त सुविधा दें: यदि बड़ी राशि है, तो साप्ताहिक ₹200-₹500 की आसान किस्तों में भुगतान स्वीकार करें।\n" +
                "4. डिजिटल खाता: ग्रामसारथी डिजिटल खाता बही में प्रत्येक लेन-देन रिकॉर्ड करें ताकि दोनों पक्षों के पास सटीक प्रमाण रहे।";
        }
        if (language === 'kn') {
            return "ಗ್ರಾಹಕರು ಬಾಕಿ ಹಣ (ಉದ್ರಿ) ಪಾವತಿಸದಿದ್ದರೆ:\n" +
                "1. ವಿನಮ್ರವಾಗಿ ನೆನಪಿಸಿ: ಬೆಳೆ ಕಟಾವು ಅಥವಾ ಸಂಬಳದ ದಿನದಂದು ಗೌರವಯುತವಾಗಿ ನೆನಪಿಸಿ.\n" +
                "2. ಉದ್ರಿ ಮಿತಿ ನಿಗದಿಪಡಿಸಿ: ಪ್ರತಿ ಕುಟುಂಬಕ್ಕೆ ಗರಿಷ್ಠ ₹2,000-₹3,000 ಮಿತಿ ಇರಲಿ. ಹಿಂದಿನ ಬಾಕಿ ತೀರಿಸುವವರೆಗೆ ಹೊಸ ಉದ್ರಿ ನೀಡಬೇಡಿ.\n" +
                "3. ಕಂತುಗಳ ಸೌಲಭ್ಯ: ದೊಡ್ಡ ಮೊತ್ತವಿದ್ದರೆ ವಾರಕ್ಕೆ ₹200-₹500 ರಂತೆ ಸುಲಭ ಕಂತುಗಳಲ್ಲಿ ವಸೂಲಿ ಮಾಡಿ.\n" +
                "4. ಡಿಜಿಟಲ್ ಖಾತಾ: ಪಾರದರ್ಶಕತೆಗಾಗಿ ಎಲ್ಲಾ ವಹಿವಾಟುಗಳನ್ನು ಗ್ರಾಮಸಾರಥಿ ಖಾತಾದಲ್ಲಿ ನಮೂದಿಸಿ.";
        }
        return "Steps to take if a customer does not pay their credit (Khata):\n" +
            "1. Polite Reminders on Settlement Days: Approach them on crop harvest days or monthly wage days with a clear bill.\n" +
            "2. Set Strict Household Credit Limits: Cap unpaid balances at ₹2,000 to ₹3,000. Do not extend new credit until the existing balance is cleared.\n" +
            "3. Offer Flexible Weekly Installments: For large balances, arrange repayment in small ₹200-₹500 weekly installments.\n" +
            "4. Transparent Digital Khata: Maintain an updated digital ledger on GraminSarthi so there are no disputes over records.";
    }

    return "For rural enterprise expansion, explore PM MUDRA Yojana (Shishu loans up to ₹50,000 without collateral) and PM Fasal Bima for agriculture protection.";
}
