import { Lang } from './i18n'
import { SHOP_PROFILES_TRANSLATIONS, TRADE_CATEGORIES_TRANSLATIONS, SCHEMES_TRANSLATIONS, REMEDIATION_TRANSLATIONS } from './data-translations'

export type ShopProfileKey = 'kirana' | 'dairy' | 'tea' | 'tailor' | 'handicraft'


export type OpportunityDetail = {
  label: string
  gain: number // extra monthly rupees
  detail: string
}

export type ShopProfile = {
  key: ShopProfileKey
  name: string
  emoji: string
  tradeCategory: string
  dailySales: number
  dailyExpenses: number
  monthlyInvestment: number
  grossSales?: number
  purchaseCosts?: number
  totalExpenses?: number
  underperformingItems: string[]
  starProduct: string
  opportunities: OpportunityDetail[]
  actionSteps: string[]
}

export const SHOP_PROFILES = SHOP_PROFILES_TRANSLATIONS.en

export function getAllShopProfiles(lang: Lang): ShopProfile[] {
  return Object.values(SHOP_PROFILES_TRANSLATIONS[lang] || SHOP_PROFILES_TRANSLATIONS.en)
}

export function getShopProfile(key: ShopProfileKey, lang: Lang): ShopProfile {
  return SHOP_PROFILES_TRANSLATIONS[lang][key] || SHOP_PROFILES_TRANSLATIONS.en[key]
}

export function getRemediation(key: ShopProfileKey, lang: Lang): string {
  return REMEDIATION_TRANSLATIONS[lang]?.[key] || REMEDIATION_TRANSLATIONS.en[key]
}

export type Scheme = {
  id: string
  name: string
  range: string
  note: string
  appliesTo: (shop: ShopProfileKey) => boolean
}

export const SCHEMES: Scheme[] = [
  ...SCHEMES_TRANSLATIONS.en.map(s => ({
    ...s,
    appliesTo: (shop: ShopProfileKey) => s.id === 'nabard' ? shop === 'dairy' : true
  }))
]

export function matchedSchemes(shop: ShopProfileKey, lang: Lang) {
  const schemesForLang = SCHEMES_TRANSLATIONS[lang] || SCHEMES_TRANSLATIONS.en
  return schemesForLang
    .map(s => ({
      ...s,
      appliesTo: (shopKey: ShopProfileKey) => s.id === 'nabard' ? shopKey === 'dairy' : true
    }))
    .filter((s) => s.appliesTo(shop))
}

// ---- Financial model -------------------------------------------------------

export type Financials = {
  dailySales: number
  dailyExpenses: number
  monthlyInvestment: number
  grossSales?: number
  purchaseCosts?: number
  totalExpenses?: number
  grossProfit?: number
  netProfit?: number
  operatingMargin?: number
  ledgerEntryCount?: number
}

export type Kpis = {
  netPnlToday: number
  operatingMargin: number
  monthlyTakeHome: number
  monthlyRevenue: number
  monthlyCost: number
  leak: boolean
  leakAmount: number
}

export function computeKpis(f: Financials): Kpis {
  if (f.grossProfit !== undefined && f.netProfit !== undefined) {
    const grossSales = f.grossSales ?? f.dailySales
    const monthlyRevenue = grossSales * 30
    const monthlyCost = monthlyRevenue - f.netProfit
    return {
      netPnlToday: f.netProfit,
      operatingMargin: f.operatingMargin ?? 0,
      monthlyTakeHome: f.netProfit,
      monthlyRevenue,
      monthlyCost,
      leak: (f.totalExpenses ?? f.dailyExpenses) > grossSales && grossSales > 0,
      leakAmount: Math.max(0, (f.totalExpenses ?? f.dailyExpenses) - grossSales),
    }
  }

  const monthlyRevenue = f.dailySales * 30
  const monthlyDirectCost = f.dailyExpenses * 30
  const monthlyCost = monthlyDirectCost + f.monthlyInvestment
  const overheadPerDay = f.monthlyInvestment / 30

  const netPnlToday = f.dailySales - f.dailyExpenses - overheadPerDay
  const monthlyTakeHome = monthlyRevenue - monthlyCost
  const operatingMargin =
    monthlyRevenue > 0 ? (monthlyTakeHome / monthlyRevenue) * 100 : 0

  const leak = f.dailySales > 0 && f.dailyExpenses > 0.6 * f.dailySales
  const leakAmount = leak ? (f.dailyExpenses - 0.6 * f.dailySales) * 30 : 0

  return {
    netPnlToday,
    operatingMargin,
    monthlyTakeHome,
    monthlyRevenue,
    monthlyCost,
    leak,
    leakAmount,
  }
}

export type WhatIf = {
  cutProcurementPct: number // 0-30
  shiftSpacePct: number // 0-25
}

export function projectWhatIf(f: Financials, w: WhatIf) {
  const base = computeKpis(f)

  // Cutting procurement reduces daily direct cost.
  const savedMonthly = f.dailyExpenses * 30 * (w.cutProcurementPct / 100)
  // Shifting shelf space to star items lifts revenue at a strong margin.
  const upliftMonthly = f.dailySales * 30 * (w.shiftSpacePct / 100) * 0.8

  const projectedTakeHome = base.monthlyTakeHome + savedMonthly + upliftMonthly
  const delta =
    base.monthlyTakeHome !== 0
      ? ((projectedTakeHome - base.monthlyTakeHome) /
        Math.abs(base.monthlyTakeHome)) *
      100
      : 0

  return { base: base.monthlyTakeHome, projectedTakeHome, delta }
}

export function formatINR(n: number): string {
  const rounded = Math.round(n)
  const sign = rounded < 0 ? '-' : ''
  const abs = Math.abs(rounded)
  return `${sign}₹${abs.toLocaleString('en-IN')}`
}

export const TRADE_CATEGORIES = TRADE_CATEGORIES_TRANSLATIONS.en

export function getTradeCategories(lang: Lang): string[] {
  return TRADE_CATEGORIES_TRANSLATIONS[lang] || TRADE_CATEGORIES_TRANSLATIONS.en
}
