import { getLiveWeather } from "../services/weather.js";
import { queryBusinessData, calculateMath, getRuralGuidance } from "../services/assistant-tools.js";
import { verifySessionToken, parseCookies } from "../services/session.js";
import { query } from "../database/neon.js";

export interface AssistantRequest {
    message: string;
    language?: 'en' | 'hi' | 'kn';
    conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
    businessId?: string;
}

export interface AssistantResponse {
    success: boolean;
    reply: string;
    toolUsed?: string;
    language: 'en' | 'hi' | 'kn';
    dataContext?: any;
}

/**
 * Handles POST /api/ai/assistant
 * Powers real voice and chat queries with live weather, Postgres business ledger analysis, and math.
 */
export async function handleAssistantQuery(
    body: any,
    cookieHeader?: string | null,
    authHeader?: string | null
): Promise<AssistantResponse> {
    const message = typeof body?.message === 'string' ? body.message.trim() : "";
    const language: 'en' | 'hi' | 'kn' = ['hi', 'kn', 'en'].includes(body?.language) ? body.language : 'en';

    if (!message) {
        const emptyReplies = {
            en: "I'm listening! You can ask me about your business ledger, the weather, math calculations, or sales advice.",
            hi: "मैं सुन रहा हूँ! आप मुझसे अपने बहीखाते, आज के मौसम, गणितीय गणना या दुकान की बिक्री के बारे में पूछ सकते हैं।",
            kn: "ನಾನು ಕೇಳುತ್ತಿದ್ದೇನೆ! ನಿಮ್ಮ ವ್ಯಾಪಾರದ ಲೆಡ್ಜರ್, ಇಂದಿನ ಹವಾಮಾನ, ಲೆಕ್ಕಾಚಾರಗಳು ಅಥವಾ ಮಾರಾಟದ ಸಲಹೆಯ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಬಹುದು."
        };
        return {
            success: true,
            reply: emptyReplies[language],
            language,
        };
    }

    // 1. Resolve authenticated merchant ID from cookie or Bearer token
    let merchantId = "";
    let token: string | null = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7).trim();
    } else if (cookieHeader) {
        const cookies = parseCookies(cookieHeader);
        token = cookies["graminsarthi_session"] || null;
    }

    if (token) {
        const payload = verifySessionToken(token);
        if (payload?.merchantId) {
            merchantId = payload.merchantId;
        } else if (payload?.userId) {
            try {
                const mRes = await query(
                    `SELECT id FROM merchants WHERE (user_id::text = $1::text) OR phone = $2 OR mobile = $2 LIMIT 1;`,
                    [String(payload.userId), payload.phone || ""]
                );
                if (mRes.rows.length > 0) {
                    merchantId = mRes.rows[0].id;
                }
            } catch {
                // ignore
            }
        }
    }

    if (!merchantId && body?.merchantId && typeof body.merchantId === 'string') {
        merchantId = body.merchantId;
    }

    // 2. Check for Gemini API key
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // 3. SEMANTIC INTENT DETECTION & TOOL DISPATCH
    const lower = message.toLowerCase();

    // TOOL A: Weather
    const isWeather = /(weather|temperature|forecast|rain|climate|मौसम|तापमान|बारिश|हवामान|ಮಳೆ|ತಾಪಮಾನ|ಹವಾಮಾನ)/i.test(lower);
    if (isWeather) {
        // Extract location name if provided e.g. "weather in Rampur" or "weather in Bengaluru"
        let loc = "Varanasi";
        const inMatch = lower.match(/(?:in|at|for|में|ನಲ್ಲಿ)\s+([a-zA-Z\u0900-\u097F\u0C80-\u0CFF\s]+)/i);
        if (inMatch && inMatch[1]) {
            loc = inMatch[1].replace(/[?.,!]/g, "").trim();
        }

        try {
            const weather = await getLiveWeather(loc, language);
            return {
                success: true,
                reply: weather.summary,
                toolUsed: "live_weather_service",
                dataContext: weather,
                language,
            };
        } catch {
            return {
                success: true,
                reply: language === 'hi'
                    ? "मौसम सेवा से संपर्क नहीं हो पाया। कृपया अपना इंटरनेट कनेक्शन जांचें।"
                    : language === 'kn'
                        ? "ಹವಾಮಾನ ಸೇವೆಯನ್ನು ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಂಟರ್ನೆಟ್ ಪರಿಶೀಲಿಸಿ."
                        : "Unable to retrieve live weather data at this moment. Please check your internet connection.",
                language,
            };
        }
    }

    // TOOL B: Math & Commercial Calculation
    const isMath = /(calculate|multipl|divide|times|plus|minus|gst\s*on|%\s*of|\b\d+\s*[×xX\*\+\-\/]\s*\d+)/i.test(lower);
    if (isMath) {
        const mathRes = calculateMath(message);
        if (mathRes) {
            let reply = "";
            if (language === 'hi') {
                reply = `${mathRes.expression} की गणना: ${mathRes.formatted} है।`;
            } else if (language === 'kn') {
                reply = `${mathRes.expression} ಲೆಕ್ಕಾಚಾರದ ಫಲಿತಾಂಶ: ${mathRes.formatted} ಆಗಿದೆ.`;
            } else {
                reply = `Calculation for ${mathRes.expression} = ${mathRes.formatted}.`;
            }
            return {
                success: true,
                reply,
                toolUsed: "math_calculator",
                dataContext: mathRes,
                language,
            };
        }
    }

    // TOOL B.5: Mentor Demo Query — Sales vs Increasing Expenses
    const isMentorSalesExpenseAdvice = /(sales.*(?:expense|expenses|cost).*(?:increas|high|rising|more|what should i do)|(?:expense|expenses|cost).*(?:increas|rising).*what should i do|बिक्री.*खर्च.*बढ़|खर्च.*बढ़.*क्या करूँ|ಮಾರಾಟ.*ಖರ್ಚು.*ಹೆಚ್ಚ|ಖರ್ಚು.*ಹೆಚ್ಚಾಗ.*ಏನು ಮಾಡಬೇಕು)/i.test(lower);
    if (isMentorSalesExpenseAdvice) {
        const advisorData = await queryBusinessData(merchantId, 'mentor_advisor', language);
        return {
            success: true,
            reply: advisorData.text,
            toolUsed: "postgresql_business_ledger",
            dataContext: advisorData.rawData,
            language,
        };
    }

    // TOOL B.6: Total Sales Query
    const isTotalSales = /(how much did i sell|total sales|monthly sales|sales this month|मेरी कुल बिक्री|कुल बिक्री कितनी|ಒಟ್ಟು ಮಾರಾಟ|ಮಾರಾಟ ಎಷ್ಟು)/i.test(lower);
    if (isTotalSales) {
        const salesData = await queryBusinessData(merchantId, 'total_sales', language);
        return {
            success: true,
            reply: salesData.text,
            toolUsed: "postgresql_business_ledger",
            dataContext: salesData.rawData,
            language,
        };
    }

    // TOOL C: Highest Expense (PostgreSQL Ledger Query)
    const isHighestExpense = /(highest\s+expense|biggest\s+expense|most\s+expensive|top\s+expense|सबसे\s+बड़ा\s+खर्च|अधिकतम\s+खर्च|ಗರಿಷ್ಠ\s+ಖರ್ಚು|ಹೆಚ್ಚಿನ\s+ವೆಚ್ಚ)/i.test(lower);
    if (isHighestExpense) {
        const expData = await queryBusinessData(merchantId, 'highest_expense', language);
        return {
            success: true,
            reply: expData.text,
            toolUsed: "postgresql_business_ledger",
            dataContext: expData.rawData,
            language,
        };
    }

    // TOOL D: Profit Decrease / Business Financial Analysis
    const isProfitAnalysis = /(profit\s+decrease|why\s+did\s+my\s+profit|loss\s+reason|margin\s+drop|मुनाफा\s+कम|लाभ\s+क्यों\s+घटा|घाटा\s+क्यों|ಲಾಭ\s+ಕಡಿಮೆ|ನಷ್ಟದ\s+ಕಾರಣ)/i.test(lower);
    if (isProfitAnalysis) {
        const profitData = await queryBusinessData(merchantId, 'profit_analysis', language);
        return {
            success: true,
            reply: profitData.text,
            toolUsed: "postgresql_business_ledger",
            dataContext: profitData.rawData,
            language,
        };
    }

    // TOOL E: Recent Transactions
    const isRecentTx = /(recent\s+transaction|latest\s+sales|हाल\s+के\s+लेन-देन|ಇತ್ತೀಚಿನ\s+ವಹಿವಾಟು)/i.test(lower);
    if (isRecentTx) {
        const txData = await queryBusinessData(merchantId, 'recent_transactions', language);
        return {
            success: true,
            reply: txData.text,
            toolUsed: "postgresql_business_ledger",
            dataContext: txData.rawData,
            language,
        };
    }

    // TOOL F: Active Problems / Issues
    const isProblems = /(problem|issue|machinery|breakdown|समस्या|मुद्दे|ಅಡಚಣೆ|ತೊಂದರೆ)/i.test(lower);
    if (isProblems && (lower.includes("my") || lower.includes("active") || lower.includes("meri") || lower.includes("nanna"))) {
        const probData = await queryBusinessData(merchantId, 'active_problems', language);
        return {
            success: true,
            reply: probData.text,
            toolUsed: "postgresql_problems_table",
            dataContext: probData.rawData,
            language,
        };
    }

    // TOOL G: GST Guidance
    const isGst = /\b(gst|tax|वस्तु\s+एवं\s+सेवा\s+कर|ಜಿಎಸ್‌ಟಿ)\b/i.test(lower);
    if (isGst) {
        const reply = getRuralGuidance('gst', language);
        return {
            success: true,
            reply,
            toolUsed: "rural_tax_guidance",
            language,
        };
    }

    // TOOL H: Shop Sales Growth
    const isSalesGrowth = /(increase\s+sales|grow\s+business|more\s+customers|बिक्री\s+बढ़ाएं|ग्राहकों\s+को\s+आकर्षित|ಮಾರಾಟ\s+ಹೆಚ್ಚಿಸುವುದು|ಹೆಚ್ಚು\s+ಗ್ರಾಹಕರು)/i.test(lower);
    if (isSalesGrowth) {
        const reply = getRuralGuidance('sales_increase', language);
        return {
            success: true,
            reply,
            toolUsed: "business_growth_advisory",
            language,
        };
    }

    // TOOL I: Unpaid Customer Credit (Khata Recovery)
    const isUnpaidCredit = /(customer\s+doesn't\s+pay|unpaid\s+credit|khata\s+pending|उधार\s+नहीं\s+दे\s+रहा|बाकी\s+पैसा|ಉದ್ರಿ\s+ಕೊಡದಿದ್ದರೆ|ಬಾಕಿ\s+ಹಣ)/i.test(lower);
    if (isUnpaidCredit) {
        const reply = getRuralGuidance('unpaid_credit', language);
        return {
            success: true,
            reply,
            toolUsed: "khata_credit_advisory",
            language,
        };
    }

    // TOOL J: Translation to Kannada or Hindi or English
    const isTranslate = /(translate|अनुवाद|ಅನುವಾದಿಸಿ)/i.test(lower);
    if (isTranslate) {
        if (lower.includes("kannada") || lower.includes("कन्नड़") || lower.includes("ಕನ್ನಡ")) {
            return {
                success: true,
                reply: "ನಮಸ್ಕಾರ, ಗ್ರಾಮಸಾರಥಿ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಸಹಾಯಕ ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು? (Namaskara, how can GraminSarthi AI assist you?)",
                toolUsed: "multilingual_translator",
                language: 'kn',
            };
        }
        if (lower.includes("hindi") || lower.includes("हिंदी") || lower.includes("हिन्दी")) {
            return {
                success: true,
                reply: "नमस्ते, ग्रामसारथी एआई सहायक आपकी किस प्रकार मदद कर सकता है? (Namaste, how can GraminSarthi AI help you?)",
                toolUsed: "multilingual_translator",
                language: 'hi',
            };
        }
    }

    // TOOL K: Customer Village Store Rates & Inventory Prices
    const isStoreRates = /(rate|price|cost|price of|rate of|how much|bhav|daam|kimat|kitna|ಬೆಲೆ|ದರ|ಭಾವ|ಭಾವನೆ|भाव|कीमत|दाम|ಎಷ್ಟು).*(rice|milk|atta|flour|oil|ghee|paneer|dal|sugar|jaggery|chai|tea|seeds|chawal|doodh|tel|kiran|akki|haalu|tuppa|hit|bele|ಅಕ್ಕಿ|ಹಾಲು|ಹಾಲಿನ|ತುಪ್ಪ|ಎಣ್ಣೆ|ಬೆಲ್ಲ|ಚಹಾ|ಹಿಟ್ಟು|ಪನೀರ್|ದಾಲ್|चावल|दूध|दही|घी|तेल|गुड़|चाय|आटा|दाल|पनीर)|(rice|milk|atta|flour|oil|ghee|paneer|dal|sugar|jaggery|chai|tea|seeds|chawal|doodh|tel|kiran|akki|haalu|tuppa|hit|bele|ಅಕ್ಕಿ|ಹಾಲು|ಹಾಲಿನ|ತುಪ್ಪ|ಎಣ್ಣೆ|ಬೆಲ್ಲ|ಚಹಾ|ಹಿಟ್ಟು|ಪನೀರ್|ದಾಲ್|चावल|दूध|दही|घी|तेल|गुड़|चाय|आटा|दाल|पनीर).*(rate|price|cost|how much|bhav|daam|kimat|kitna|ಬೆಲೆ|ದರ|ಭಾವ|ಭಾವನೆ|भाव|कीमत|ದाम|ಎಷ್ಟು|ಖರೀದಿ)/i.test(lower);
    if (isStoreRates) {
        const ratesReplies = {
            en: "Current Village Market Rates:\n• Sona Masoori Rice (Old Harvest): ₹56/kg (Sri Lakshmi Provisions)\n• Fresh Buffalo Milk: ₹34 / 500ml (₹68/L at Gopal Dairy Point)\n• Chakki Fresh Sharbati Atta: ₹42/kg\n• Desi Cow Ghee (Pure Bilona): ₹650/kg\n• Cold-Pressed Mustard Oil: ₹135/L\n• Fresh Milk Paneer: ₹110 / 250g\n• Organic Village Jaggery (Gur): ₹60/kg\n• Kadak Masala Chai Patti: ₹90 / 250g\nYou can order these items directly from the Customer Portal with doorstep village delivery!",
            hi: "गांव के बाजार में आज के ताजा भाव:\n• सोना मसूरी चावल: ₹56 प्रति किलो (श्री लक्ष्मी प्रोविजन्स)\n• ताजा भैंस का दूध: ₹34 प्रति 500ml (₹68/लीटर, गोपाल डेयरी)\n• चक्की ताजा शरबती आटा: ₹42 प्रति किलो\n• शुद्ध देसी गाय का घी: ₹650 प्रति किलो\n• कच्ची घानी सरसों का तेल: ₹135 प्रति लीटर\n• ताजा पनीर: ₹110 प्रति 250 ग्राम\n• जैविक देशी गुड़: ₹60 प्रति किलो\n• कड़क मसाला चाय पत्ती: ₹90 प्रति 250 ग्राम\nआप ग्राहक पोर्टल से सीधे ऑर्डर कर सकते हैं!",
            kn: "ನಮ್ಮ ಗ್ರಾಮದ ಮಾರುಕಟ್ಟೆಯ ಇಂದಿನ ತಾಜಾ ದರಗಳು:\n• ಸೋನಾ ಮಸೂರಿ ಅಕ್ಕಿ: ₹56 / ಕೆಜಿ (ಶ್ರೀ ಲಕ್ಷ್ಮಿ ಪ್ರಾವಿಷನ್ಸ್)\n• ತಾಜಾ ಎಮ್ಮೆ ಹಾಲು: ₹34 / 500ml (₹68/ಲೀಟರ್, ಗೋಪಾಲ್ ಡೈರಿ)\n• ಚಕ್ಕಿ ತಾಜಾ ಗೋಧಿ ಹಿಟ್ಟು: ₹42 / ಕೆಜಿ\n• ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ: ₹650 / ಕೆಜಿ\n• ಗಾಣದ ಸಾಸಿವೆ ಎಣ್ಣೆ: ₹135 / ಲೀಟರ್\n• ತಾಜಾ ಪನೀರ್: ₹110 / 250 ಗ್ರಾಂ\n• ಸಾವಯವ ಬೆಲ್ಲ: ₹60 / ಕೆಜಿ\n• ಕಡಕ್ ಮಸಾಲಾ ಚಹಾ ಪುಡಿ: ₹90 / 250 ಗ್ರಾಂ\nಗ್ರಾಹಕ ಪೋರ್ಟಲ್ ಮೂಲಕ ನೀವು ಮನೆ ಬಾಗಿಲಿಗೆ ನೇರವಾಗಿ ಆರ್ಡರ್ ಮಾಡಬಹುದು!"
        };
        return {
            success: true,
            reply: ratesReplies[language],
            toolUsed: "village_store_inventory",
            language,
        };
    }

    // TOOL L: Customer Khata Balance Check
    const isCustomerKhataCheck = /(check.*(?:my|pending)?.*khata|my.*(?:khata|due|balance)|pending.*khata|credit.*balance|baki.*(?:khata|paisa)|kitna.*baki|khata.*kitna|khate.*baki|ಖಾತೆ.*ಬಾಕಿ|ನನ್ನ.*ಖಾತೆ|ಬಾಕಿ.*ಖಾತೆ)/i.test(lower);
    if (isCustomerKhataCheck) {
        const khataReplies = {
            en: "To check your Khata credit balance:\n1. Click the 'Khata Credit' button on the Customer Portal navigation.\n2. You can view your real-time total due, individual shop ledgers, and credit limit.\n3. Tap 'Pay via UPI' to scan and settle payments instantly with zero interest. Regular repayments help you build a formal rural credit score!",
            hi: "अपना खाता बकाया देखने के लिए:\n1. ग्राहक पोर्टल पर 'खाता क्रेडिट' (Khata) बटन पर क्लिक करें।\n2. वहाँ आपकी कुल बकाया राशि, दुकानदारों का हिसाब और क्रेडिट सीमा दिखाई देगी।\n3. 'Pay via UPI' दबाकर आप तुरंत शून्य ब्याज पर भुगतान कर सकते हैं। समय पर भुगतान से आपका ग्रामीण क्रेडिट स्कोर मजबूत होता है!",
            kn: "ನಿಮ್ಮ ಖಾತೆ ಬಾಕಿ ವಿವರ ಪರಿಶೀಲಿಸಲು:\n1. ಗ್ರಾಹಕ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ 'ಖಾತೆ ಕ್ರೆಡಿಟ್' (Khata) ಬಟನ್ ಒತ್ತಿ.\n2. ನಿಮ್ಮ ಒಟ್ಟು ಬಾಕಿ ಮೊತ್ತ, ಅಂಗಡಿಯವರ ವಿವರ ಹಾಗೂ ಕ್ರೆಡಿಟ್ ಮಿತಿ ಲೈವ್ ಆಗಿ ಕಾಣಿಸುತ್ತದೆ.\n3. 'Pay via UPI' ಮೂಲಕ ಯಾವುದೇ ಬಡ್ಡಿಯಿಲ್ಲದೆ ತಕ್ಷಣವೇ ಬಾಕಿ ತೀರಿಸಬಹುದು. ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಪಾವತಿಸುವುದರಿಂದ ಮುದ್ರಾ ಸಾಲಕ್ಕೆ ಉತ್ತಮ ಕ್ರೆಡಿಟ್ ಸ್ಕೋರ್ ಸಿಗುತ್ತದೆ!"
        };
        return {
            success: true,
            reply: khataReplies[language],
            toolUsed: "khata_credit_advisory",
            language,
        };
    }

    // TOOL M: Store Opening Hours & Delivery
    const isStoreHours = /(store.*(?:open|hour|time)|shop.*(?:open|hour|time)|opening.*hour|closing.*time|timing|samay|दुकान.*समय|खुलने.*समय|ಅಂಗಡಿ.*ಸಮಯ|ತೆರೆಯುವ.*ಸಮಯ)/i.test(lower);
    if (isStoreHours) {
        const hoursReplies = {
            en: "Village partner stores operate daily from 6:30 AM to 9:30 PM. Fresh morning milk delivery starts at 6:00 AM from Gopal Dairy Point. Orders placed via GraminSarthi are fulfilled on the same day within 45 minutes!",
            hi: "गांव की पार्टनर दुकानें प्रतिदिन सुबह 6:30 बजे से रात 9:30 बजे तक खुली रहती हैं। गोपाल डेयरी से सुबह 6:00 बजे ताजा दूध उपलब्ध होता है। ग्रामीण सारथी पर किए गए ऑर्डर 45 मिनट के भीतर घर पहुंचाए जाते हैं!",
            kn: "ಗ್ರಾಮದ ಸಹಭಾಗಿ ಅಂಗಡಿಗಳು ಪ್ರತಿದಿನ ಬೆಳಗ್ಗೆ 6:30 ರಿಂದ ರಾತ್ರಿ 9:30 ರವರೆಗೆ ತೆರೆದಿರುತ್ತವೆ. ಗೋಪಾಲ್ ಡೈರಿಯಿಂದ ಬೆಳಗ್ಗೆ 6:00 ಗಂಟೆಗೆ ತಾಜಾ ಹಾಲು ಲಭ್ಯವಿರುತ್ತದೆ. ಗ್ರಾಮೀಣ ಸಾರಥಿ ಮೂಲಕ ನೀಡಿದ ಆರ್ಡರ್‌ಗಳನ್ನು 45 ನಿಮಿಷಗಳಲ್ಲಿ ತಲುಪಿಸಲಾಗುತ್ತದೆ!"
        };
        return {
            success: true,
            reply: hoursReplies[language],
            toolUsed: "village_store_inventory",
            language,
        };
    }

    // 4. If GEMINI_API_KEY is configured, call Gemini with grounded context
    if (geminiKey) {
        try {
            const systemPrompt = `You are GraminSarthi AI, an expert, encouraging, and friendly rural enterprise advisor in India.
You converse naturally in ${language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}.
Keep your responses practical, grounded in rural retail reality, and warm.`;

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
            const geminiRes = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: `${systemPrompt}\n\nCustomer question: ${message}` }] }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 600,
                    }
                }),
                signal: AbortSignal.timeout(8000),
            });

            if (geminiRes.ok) {
                const geminiData = await geminiRes.json();
                const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    return {
                        success: true,
                        reply: text.trim(),
                        toolUsed: "gemini_2_flash",
                        language,
                    };
                }
            }
        } catch (err) {
            console.warn("[Gemini API Warning]:", err instanceof Error ? err.message : err);
        }
    }

    // 5. Default intelligent general response in user's language
    const defaultReplies = {
        en: "I am your GraminSarthi AI assistant. You can speak or type to ask me: 'What is the weather today?', 'What was my highest expense?', 'Why did my profit decrease?', 'Calculate 25 × 480', or 'Explain GST in simple words.' How can I help your business today?",
        hi: "मैं आपका ग्रामसारथी एआई सहायक हूँ। आप मुझसे पूछ सकते हैं: 'आज का मौसम कैसा है?', 'मेरा सबसे बड़ा खर्च क्या था?', '25 × 480 की गणना करें', या 'दुकान की बिक्री कैसे बढ़ाएं?'। आज मैं आपके व्यवसाय की क्या मदद करूँ?",
        kn: "ನಾನು ನಿಮ್ಮ ಗ್ರಾಮಸಾರಥಿ ಎಐ ಸಹಾಯಕ. ನೀವು ನನ್ನನ್ನು ಕೇಳಬಹುದು: 'ಇಂದಿನ ಹವಾಮಾನ ಹೇಗಿದೆ?', 'ನನ್ನ ಗರಿಷ್ಠ ಖರ್ಚು ಯಾವುದು?', '25 × 480 ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ', ಅಥವಾ 'ಜಿಎಸ್‌ಟಿ ಎಂದರೇನು?'. ಇಂದು ನಾನು ನಿಮ್ಮ ವ್ಯಾಪಾರಕ್ಕೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?"
    };

    return {
        success: true,
        reply: defaultReplies[language],
        toolUsed: "graminsarthi_assistant_engine",
        language,
    };
}
