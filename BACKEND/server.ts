import 'dotenv/config'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'

const port = Number(process.env.PORT || 4000)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const entryTypes = ['SALE', 'PURCHASE', 'STOCK_COST', 'OVERHEAD', 'EXPENSE'] as const

type EntryType = (typeof entryTypes)[number]
type Json = Record<string, unknown>

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required')
}
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

function send(response: ServerResponse, status: number, body: Json) {
    response.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    })
    response.end(JSON.stringify(body))
}

async function body(request: IncomingMessage): Promise<Json> {
    let raw = ''
    for await (const chunk of request) raw += chunk
    return raw ? JSON.parse(raw) : {}
}

function phone(value: unknown): value is string {
    return typeof value === 'string' && /^\+?[1-9]\d{7,14}$/.test(value)
}

function uuid(value: unknown): value is string {
    return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function date(value: unknown): value is string {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}

function month(value: string | null): value is string {
    return value === null || /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
}

function nonNegativeNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function positiveNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function clientFor(request: IncomingMessage): SupabaseClient {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '')
    return createClient(supabaseUrl!, supabaseAnonKey!, token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : undefined)
}

async function userFor(request: IncomingMessage, supabase: SupabaseClient) {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '')
    if (!token) return null
    const { data } = await supabase.auth.getUser(token)
    return data.user || null
}

async function merchantId(supabase: SupabaseClient, userId: string) {
    const { data } = await supabase.from('merchants').select('id').eq('user_id', userId).single()
    return data?.id as string | undefined
}

async function requireAuth(request: IncomingMessage, response: ServerResponse, supabase: SupabaseClient) {
    const user = await userFor(request, supabase)
    if (!user) {
        send(response, 401, { success: false, error: 'Authentication required' })
        return null
    }
    return user
}

async function handle(request: IncomingMessage, response: ServerResponse) {
    if (request.method === 'OPTIONS') return send(response, 204, {})
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
    const parts = url.pathname.split('/').filter(Boolean)
    const supabase = clientFor(request)

    if (request.method === 'GET' && url.pathname === '/') {
        return send(response, 200, { success: true, message: 'GraminSarthi AI Backend is running!' })
    }

    if (request.method === 'GET' && url.pathname === '/api/schemes') {
        return send(response, 200, {
            success: true,
            schemes: [
                { id: 'pm-mudra', name: 'PM Mudra Yojana', type: 'Business Loan', minAmount: 50000, maxAmount: 500000, description: 'Credit support for micro and small businesses.' },
                { id: 'pm-svanidhi', name: 'PM SVANidhi', type: 'Working Capital', minAmount: 10000, maxAmount: 50000, description: 'Working capital support for eligible street vendors.' },
            ],
        })
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/send-otp') {
        const input = await body(request)
        if (!phone(input.phone)) return send(response, 400, { success: false, error: 'Valid phone number is required' })
        const { error } = await supabase.auth.signInWithOtp({ phone: input.phone })
        if (error) return send(response, 400, { success: false, error: 'Unable to send OTP' })
        return send(response, 200, { success: true, message: 'OTP sent' })
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/verify-otp') {
        const input = await body(request)
        if (!phone(input.phone) || typeof input.otp !== 'string' || !/^\d{4,8}$/.test(input.otp)) return send(response, 400, { success: false, error: 'Valid phone number and OTP are required' })
        const result = await supabase.auth.verifyOtp({ phone: input.phone, token: input.otp, type: 'sms' })
        if (result.error || !result.data.user) return send(response, 401, { success: false, error: 'Invalid or expired OTP' })
        return send(response, 200, { success: true, user: { id: result.data.user.id }, session: result.data.session })
    }

    if (request.method === 'GET' && url.pathname === '/api/auth/session') {
        const user = await userFor(request, supabase)
        return send(response, 200, { success: true, user: user ? { id: user.id, phone: user.phone } : null })
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/logout') return send(response, 200, { success: true })

    const user = await requireAuth(request, response, supabase)
    if (!user) return

    if (request.method === 'POST' && url.pathname === '/api/auth/register') {
        const input = await body(request)
        if (typeof input.name !== 'string' || !input.name.trim()) return send(response, 400, { success: false, error: 'Name is required' })
        const { data, error } = await supabase.from('merchants').upsert({ user_id: user.id, name: input.name.trim(), mobile: user.phone, language: input.language || 'en' }, { onConflict: 'user_id' }).select().single()
        if (error) return send(response, 500, { success: false, error: 'Unable to create merchant profile' })
        if (typeof input.business_name === 'string' && input.business_name.trim()) await supabase.from('businesses').insert({ merchant_id: data.id, business_name: input.business_name.trim(), business_category: input.business_category || null, location: input.location || null })
        return send(response, 201, { success: true, data })
    }

    if (url.pathname === '/api/merchant' && request.method === 'GET') {
        const { data, error } = await supabase.from('merchants').select('*').eq('user_id', user.id).single()
        if (error) return send(response, 404, { success: false, error: 'Merchant profile not found' })
        return send(response, 200, { success: true, data })
    }

    if (url.pathname === '/api/merchant' && request.method === 'PUT') {
        const input = await body(request)
        const updates: Json = {}
        if (typeof input.name === 'string' && input.name.trim()) updates.name = input.name.trim()
        if (typeof input.language === 'string') updates.language = input.language
        if (!Object.keys(updates).length) return send(response, 400, { success: false, error: 'No valid fields to update' })
        const { data, error } = await supabase.from('merchants').update(updates).eq('user_id', user.id).select().single()
        if (error) return send(response, 500, { success: false, error: 'Unable to update merchant' })
        return send(response, 200, { success: true, data })
    }

    const merchant = await merchantId(supabase, user.id)
    if (!merchant) return send(response, 404, { success: false, error: 'Merchant profile not found' })

    if (request.method === 'POST' && url.pathname === '/api/finance/calculate-loan') {
        const input = await body(request)
        const marginCapital = input.marginCapital
        const interestRate = input.interestRate
        const years = input.years === undefined ? 1 : input.years
        if (!positiveNumber(marginCapital) || !nonNegativeNumber(interestRate) || !positiveNumber(years)) {
            return send(response, 400, { success: false, error: 'Valid margin capital, interest rate, and years are required' })
        }
        const projectCost = marginCapital / 0.1
        const loanAmount = projectCost * 0.9
        const quarters = years * 4
        const quarterlyRate = interestRate / 100 / 4
        const quarterlyEMI = quarterlyRate === 0
            ? loanAmount / quarters
            : (loanAmount * quarterlyRate) / (1 - Math.pow(1 + quarterlyRate, -quarters))
        return send(response, 200, {
            success: true,
            loanDetails: {
                marginCapital,
                totalProjectCost: Number(projectCost.toFixed(2)),
                maximumLoanAmount: Number(loanAmount.toFixed(2)),
                interestRate,
                repaymentPeriodYears: years,
                quarterlyEMI: Number(quarterlyEMI.toFixed(2)),
            },
        })
    }

    if (request.method === 'POST' && url.pathname === '/api/finance/feasibility') {
        const input = await body(request)
        const currentProfit = input.currentProfit
        const procurementReduction = input.procurementReduction
        const highMarginShift = input.highMarginShift
        if (typeof currentProfit !== 'number' || !Number.isFinite(currentProfit) || !nonNegativeNumber(procurementReduction) || !nonNegativeNumber(highMarginShift) || procurementReduction > 100 || highMarginShift > 100) {
            return send(response, 400, { success: false, error: 'Invalid feasibility values' })
        }
        const projectedProfit = currentProfit + Math.abs(currentProfit) * (procurementReduction / 100 + highMarginShift / 100)
        const growthPercentage = currentProfit ? ((projectedProfit - currentProfit) / Math.abs(currentProfit)) * 100 : 0
        return send(response, 200, {
            success: true,
            feasibility: { currentProfit, projectedProfit: Number(projectedProfit.toFixed(2)), growthPercentage: Number(growthPercentage.toFixed(2)) },
        })
    }

    if (request.method === 'POST' && url.pathname === '/api/advisory') {
        const input = await body(request)
        const businessType = typeof input.businessType === 'string' && input.businessType.trim() ? input.businessType.trim() : 'small business'
        return send(response, 200, {
            success: true,
            businessType,
            actions: [
                `Review high-cost purchases in your ${businessType}.`,
                'Compare prices with nearby wholesale suppliers.',
                'Increase shelf space for products with better margins.',
                'Create bundled offers for frequently purchased items.',
            ],
        })
    }

    if (parts[0] === 'api' && parts[1] === 'business') {
        if (parts.length === 2 && request.method === 'GET') {
            const { data, error } = await supabase.from('businesses').select('*').eq('merchant_id', merchant).order('created_at')
            if (error) return send(response, 500, { success: false, error: 'Unable to load businesses' })
            return send(response, 200, { success: true, data })
        }
        if (parts.length === 2 && request.method === 'POST') {
            const input = await body(request)
            if (typeof input.business_name !== 'string' || !input.business_name.trim()) return send(response, 400, { success: false, error: 'Business name is required' })
            const { data, error } = await supabase.from('businesses').insert({ merchant_id: merchant, business_name: input.business_name.trim(), business_category: input.business_category || null, location: input.location || null }).select().single()
            if (error) return send(response, 500, { success: false, error: 'Unable to create business' })
            return send(response, 201, { success: true, data })
        }
        if (parts.length === 3 && !uuid(parts[2])) return send(response, 400, { success: false, error: 'Invalid business ID' })
        if (parts.length === 3 && request.method === 'PUT') {
            const input = await body(request)
            const updates: Json = {}
            for (const field of ['business_name', 'business_category', 'location']) {
                if (input[field] !== undefined) updates[field] = input[field]
            }
            if (updates.business_name !== undefined && (typeof updates.business_name !== 'string' || !updates.business_name.trim())) return send(response, 400, { success: false, error: 'Invalid business name' })
            if (!Object.keys(updates).length) return send(response, 400, { success: false, error: 'No valid fields to update' })
            const { data, error } = await supabase.from('businesses').update(updates).eq('id', parts[2]).eq('merchant_id', merchant).select().single()
            if (error) return send(response, 404, { success: false, error: 'Business not found' })
            return send(response, 200, { success: true, data })
        }
        if (parts.length === 3 && request.method === 'DELETE') {
            const { error } = await supabase.from('businesses').delete().eq('id', parts[2]).eq('merchant_id', merchant)
            if (error) return send(response, 404, { success: false, error: 'Business not found' })
            return send(response, 200, { success: true })
        }
    }

    if (parts[1] === 'ledger' && parts.length === 2 && request.method === 'GET') {
        let query = supabase.from('ledger_entries').select('*').order('entry_date', { ascending: false })
        const businessId = url.searchParams.get('business_id')
        const monthValue = url.searchParams.get('month')
        if (!month(monthValue)) return send(response, 400, { success: false, error: 'Invalid month. Use YYYY-MM' })
        if (businessId) query = query.eq('business_id', businessId)
        if (url.searchParams.get('entry_type')) query = query.eq('entry_type', url.searchParams.get('entry_type'))
        if (url.searchParams.get('date')) query = query.eq('entry_date', url.searchParams.get('date'))
        if (monthValue) {
            const [year, monthNumber] = monthValue.split('-').map(Number)
            const nextMonth = monthNumber === 12 ? `${year + 1}-01-01` : `${year}-${String(monthNumber + 1).padStart(2, '0')}-01`
            query = query.gte('entry_date', `${monthValue}-01`).lt('entry_date', nextMonth)
        }
        const { data, error } = await query
        if (error) return send(response, 500, { success: false, error: 'Unable to load ledger' })
        return send(response, 200, { success: true, data })
    }

    if (parts[1] === 'ledger' && parts.length === 2 && request.method === 'POST') {
        const input = await body(request)
        if (!uuid(input.business_id) || !entryTypes.includes(input.entry_type as EntryType) || typeof input.amount !== 'number' || input.amount <= 0 || !date(input.entry_date) || typeof input.description !== 'string' || !input.description.trim()) return send(response, 400, { success: false, error: 'Invalid ledger entry' })
        const { data, error } = await supabase.from('ledger_entries').insert({ business_id: input.business_id, entry_type: input.entry_type, amount: input.amount, description: input.description.trim(), entry_date: input.entry_date }).select().single()
        if (error) return send(response, 400, { success: false, error: 'Business not found or entry rejected' })
        return send(response, 201, { success: true, data })
    }

    if (parts[1] === 'ledger' && parts[2] === 'calculate' && request.method === 'POST') {
        const input = await body(request)
        let query = supabase.from('ledger_entries').select('entry_type, amount')
        if (input.business_id !== undefined) {
            if (!uuid(input.business_id)) return send(response, 400, { success: false, error: 'Invalid business ID' })
            query = query.eq('business_id', input.business_id)
        }
        if (input.month !== undefined) {
            if (typeof input.month !== 'string' || !month(input.month)) return send(response, 400, { success: false, error: 'Invalid month. Use YYYY-MM' })
            const [year, monthNumber] = input.month.split('-').map(Number)
            const nextMonth = monthNumber === 12 ? `${year + 1}-01-01` : `${year}-${String(monthNumber + 1).padStart(2, '0')}-01`
            query = query.gte('entry_date', `${input.month}-01`).lt('entry_date', nextMonth)
        }
        const { data, error } = await query
        if (error) return send(response, 500, { success: false, error: 'Unable to calculate ledger' })
        const total = (type: EntryType) => (data || []).filter((entry) => entry.entry_type === type).reduce((sum, entry) => sum + Number(entry.amount), 0)
        const grossSales = total('SALE')
        const wholesalePurchases = total('PURCHASE')
        const stockCosts = total('STOCK_COST')
        const monthlyOverheads = total('OVERHEAD')
        const expenseLeak = total('EXPENSE')
        const grossProfit = grossSales - wholesalePurchases - stockCosts
        const netProfit = grossProfit - monthlyOverheads - expenseLeak
        return send(response, 200, { success: true, data: { grossSales, cashCollected: grossSales, wholesalePurchases, stockCosts, monthlyOverheads, grossProfit, netProfit, operatingMargin: grossSales ? (netProfit / grossSales) * 100 : 0, monthlyTakeHome: netProfit, expenseLeak } })
    }

    if (parts[1] === 'ledger' && parts.length === 3 && uuid(parts[2]) && (request.method === 'PUT' || request.method === 'DELETE')) {
        if (request.method === 'DELETE') {
            const { error } = await supabase.from('ledger_entries').delete().eq('id', parts[2])
            if (error) return send(response, 404, { success: false, error: 'Ledger entry not found' })
            return send(response, 200, { success: true })
        }
        const input = await body(request)
        const updates: Json = {}
        for (const field of ['entry_type', 'amount', 'description', 'entry_date']) {
            if (input[field] !== undefined) updates[field] = input[field]
        }
        if (updates.entry_type !== undefined && !entryTypes.includes(updates.entry_type as EntryType)) return send(response, 400, { success: false, error: 'Invalid entry type' })
        if (updates.amount !== undefined && (typeof updates.amount !== 'number' || !Number.isFinite(updates.amount) || updates.amount <= 0)) return send(response, 400, { success: false, error: 'Amount must be positive' })
        if (updates.entry_date !== undefined && !date(updates.entry_date)) return send(response, 400, { success: false, error: 'Invalid entry date' })
        if (updates.description !== undefined && (typeof updates.description !== 'string' || !updates.description.trim())) return send(response, 400, { success: false, error: 'Description is required' })
        if (!Object.keys(updates).length) return send(response, 400, { success: false, error: 'No valid fields to update' })
        const { data, error } = await supabase.from('ledger_entries').update(updates).eq('id', parts[2]).select().single()
        if (error) return send(response, 404, { success: false, error: 'Ledger entry not found' })
        return send(response, 200, { success: true, data })
    }

    return send(response, 404, { success: false, error: 'Route not found' })
}

createServer((request: IncomingMessage, response: ServerResponse) => {
    handle(request, response).catch(() => send(response, 500, { success: false, error: 'Internal server error' }))
}).listen(port, () => {
    console.log(`GraminSarthi backend listening on http://localhost:${port}`)
})
