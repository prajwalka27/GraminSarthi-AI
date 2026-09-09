'use client'

import { useMemo, useState } from 'react'
import { LogOut, Store } from 'lucide-react'
import { BrandMark } from './primitives'
import { LanguageSelect } from './language-select'
import { LedgerCard } from './ledger-card'
import { InventoryCard } from './inventory-card'
import { KpiPanel } from './kpi-panel'
import { WhatIfSimulator } from './whatif-simulator'
import { SchemeMatcher } from './scheme-matcher'
import { ActionSteps } from './action-steps'
import { FinanceCalculator } from './finance-calculator'
import { ProblemsCard } from './problems-card'
import type { Lang, TranslationKey } from '@/lib/graminsarthi/i18n'
import { computeKpis, formatINR, getShopProfile, getAllShopProfiles, getRemediation, TRADE_CATEGORIES, type ShopProfileKey } from '@/lib/graminsarthi/data'
import { useGraminsarthiStore } from '@/hooks/use-graminsarthi-store'
import { Field, Select, TextInput } from './primitives'

type DashboardTab = 'LEDGER' | 'FEASIBILITY' | 'FINANCE_CALCULATOR' | 'PROBLEMS'

export function Dashboard({ lang, onLangChange, t, initialShop, merchantId, onLogout, onSwitchToCustomer, onSwitchToHost }: {
  lang: Lang
  onLangChange: (l: Lang) => void
  t: (k: TranslationKey) => string
  initialShop: ShopProfileKey
  merchantId?: string
  onLogout: () => void
  onSwitchToCustomer?: () => void
  onSwitchToHost?: () => void
}) {
  const {
    shopKey,
    switchShop,
    tradeCategory,
    setTradeCategory,
    financials,
    setMonthlyInvestment,
    monthlyInvestment,
    transactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    inventoryItems,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
    businessId,
    businessName,
    businesses,
    selectBusiness,
    createBusiness,
    apiError
  } = useGraminsarthiStore(initialShop, lang, merchantId)

  const profile = getShopProfile(shopKey, lang)
  const remediationText = getRemediation(shopKey, lang)

  const [pulse, setPulse] = useState(0)
  const [activeTab, setActiveTab] = useState<DashboardTab>('LEDGER')
  const [showAddBiz, setShowAddBiz] = useState(false)
  const [bizName, setBizName] = useState('')
  const [bizCategory, setBizCategory] = useState(TRADE_CATEGORIES[0])
  const [bizVillage, setBizVillage] = useState('')
  const [bizDistrict, setBizDistrict] = useState('')
  const [bizState, setBizState] = useState('')
  const [bizLocation, setBizLocation] = useState('')
  const [bizDesc, setBizDesc] = useState('')
  const [bizSubmitting, setBizSubmitting] = useState(false)

  const kpis = useMemo(() => computeKpis(financials), [financials])

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bizName.trim()) return
    setBizSubmitting(true)
    const created = await createBusiness({
      businessName: bizName.trim(),
      businessCategory: bizCategory,
      village: bizVillage.trim() || undefined,
      district: bizDistrict.trim() || undefined,
      state: bizState.trim() || undefined,
      location: bizLocation.trim() || undefined,
      description: bizDesc.trim() || undefined,
    })
    setBizSubmitting(false)
    if (created) {
      setBizName('')
      setBizVillage('')
      setBizDistrict('')
      setBizState('')
      setBizLocation('')
      setBizDesc('')
      setShowAddBiz(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <BrandMark className="h-10 w-10 text-sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-foreground">
                  GraminSarthi AI
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {businesses.length > 0 ? (
                  <select
                    value={businessId || ''}
                    onChange={(e) => selectBusiness(e.target.value)}
                    aria-label="Select active business"
                    className="max-w-[200px] truncate rounded-lg border border-border bg-secondary/80 px-2 py-0.5 text-xs font-medium text-foreground outline-none transition focus:border-emerald-500"
                  >
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.businessName} ({b.businessCategory})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-muted-foreground">{businessName || 'No business found'}</p>
                )}
                <button
                  onClick={() => setShowAddBiz(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                >
                  + Business
                </button>
              </div>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Database Connected
            </div>

            <div className="relative inline-flex items-center">
              <Store
                className="pointer-events-none absolute left-3 h-4 w-4 text-emerald-300"
                aria-hidden="true"
              />
              <select
                aria-label={t('shopProfile')}
                value={shopKey}
                onChange={(e) => switchShop(e.target.value as ShopProfileKey)}
                className="min-h-10 max-w-[220px] appearance-none truncate rounded-xl border border-input bg-secondary py-2 pl-9 pr-8 text-sm font-medium text-foreground outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              >
                {getAllShopProfiles(lang).map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.emoji} {p.name}
                  </option>
                ))}
              </select>
            </div>

            {onSwitchToCustomer && (
              <button
                onClick={onSwitchToCustomer}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                title="Open Village Customer Market & Khata"
              >
                <span>🛒 Customer Market</span>
              </button>
            )}

            <LanguageSelect lang={lang} onChange={onLangChange} compact />

            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('graminsarthi.merchantId')
                  localStorage.removeItem('graminsarthi.businessId')
                  localStorage.removeItem('graminsarthi.mobile')
                  sessionStorage.removeItem('graminsarthi.merchantId')
                  sessionStorage.removeItem('graminsarthi.businessId')
                  sessionStorage.removeItem('graminsarthi.mobile')
                }
                onLogout()
              }}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition hover:border-rose-500/40 hover:text-rose-300"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          </div>
        </div>

        <div className="border-t border-border/50 bg-secondary/30">
          <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 sm:px-6 hide-scrollbar">
            <button
              onClick={() => setActiveTab('LEDGER')}
              className={`min-h-12 border-b-2 px-1 text-sm font-semibold transition ${activeTab === 'LEDGER'
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              {t('tabLedger')}
            </button>
            <button
              onClick={() => setActiveTab('FEASIBILITY')}
              className={`min-h-12 border-b-2 px-1 text-sm font-semibold transition ${activeTab === 'FEASIBILITY'
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              {t('tabFeasibility')}
            </button>
            <button
              onClick={() => setActiveTab('FINANCE_CALCULATOR')}
              className={`min-h-12 border-b-2 px-1 text-sm font-semibold transition ${activeTab === 'FINANCE_CALCULATOR'
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              {t('tabFinanceCalculator')}
            </button>
            <button
              onClick={() => setActiveTab('PROBLEMS')}
              className={`min-h-12 border-b-2 px-1 text-sm font-semibold transition ${activeTab === 'PROBLEMS'
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              ⚠️ {lang === 'hi' ? 'समस्याएं और मुद्दे' : 'Issues & Problems'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {apiError && (
          <p role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {apiError}
          </p>
        )}
        {activeTab === 'LEDGER' && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              <LedgerCard
                t={t}
                tradeCategory={tradeCategory}
                onTradeCategory={setTradeCategory}
                financials={financials}
                monthlyInvestment={monthlyInvestment}
                setMonthlyInvestment={setMonthlyInvestment}
                transactions={transactions}
                addTransaction={addTransaction}
                updateTransaction={updateTransaction}
                removeTransaction={removeTransaction}
                onRecalculate={() => setPulse((p) => p + 1)}
              />
            </div>
            <div className="flex flex-col gap-5">
              <KpiPanel
                key={pulse}
                t={t}
                kpis={kpis}
                financials={financials}
                remediation={`${remediationText} (${formatINR(kpis.leakAmount)}${t('perMonth')} at risk)`}
              />
              <InventoryCard
                key={shopKey}
                t={t}
                profile={profile}
                inventoryItems={inventoryItems}
                addInventoryItem={addInventoryItem}
                removeInventoryItem={removeInventoryItem}
              />
            </div>
          </div>
        )}

        {activeTab === 'FEASIBILITY' && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              <WhatIfSimulator t={t} financials={financials} />
              <ActionSteps key={shopKey} t={t} steps={profile.actionSteps} />
            </div>
            <div className="flex flex-col gap-5">
              <SchemeMatcher t={t} shop={shopKey} lang={lang} />
            </div>
          </div>
        )}

        {activeTab === 'FINANCE_CALCULATOR' && (
          <div className="mx-auto max-w-3xl">
            <FinanceCalculator t={t} />
          </div>
        )}

        {activeTab === 'PROBLEMS' && (
          <div className="mx-auto max-w-5xl">
            <ProblemsCard lang={lang} merchantId={merchantId} businessId={businessId || undefined} />
          </div>
        )}
      </main>

      {showAddBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl">
            <h3 className="text-base font-bold text-foreground mb-1">Add New Business</h3>
            <p className="text-xs text-muted-foreground mb-4">Register a new shop or enterprise under your merchant account.</p>
            <form onSubmit={handleCreateBusiness} className="space-y-3">
              <Field label="Business Name" htmlFor="biz-name">
                <TextInput id="biz-name" required placeholder="e.g. Ramesh Hardware Store" value={bizName} onChange={(e) => setBizName(e.target.value)} />
              </Field>
              <Field label="Category" htmlFor="biz-cat">
                <Select id="biz-cat" value={bizCategory} onChange={(e) => setBizCategory(e.target.value)}>
                  {TRADE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Village / Town" htmlFor="biz-village">
                  <TextInput id="biz-village" placeholder="e.g. Rampur" value={bizVillage} onChange={(e) => setBizVillage(e.target.value)} />
                </Field>
                <Field label="District" htmlFor="biz-district">
                  <TextInput id="biz-district" placeholder="e.g. Varanasi" value={bizDistrict} onChange={(e) => setBizDistrict(e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="State" htmlFor="biz-state">
                  <TextInput id="biz-state" placeholder="e.g. Uttar Pradesh" value={bizState} onChange={(e) => setBizState(e.target.value)} />
                </Field>
                <Field label="Location / Landmark" htmlFor="biz-loc">
                  <TextInput id="biz-loc" placeholder="e.g. Near Bus Stand" value={bizLocation} onChange={(e) => setBizLocation(e.target.value)} />
                </Field>
              </div>
              <Field label="Description (Optional)" htmlFor="biz-desc">
                <TextInput id="biz-desc" placeholder="Brief description of products/services" value={bizDesc} onChange={(e) => setBizDesc(e.target.value)} />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddBiz(false)} className="px-3 py-1.5 text-xs rounded-xl border border-border text-muted-foreground hover:bg-secondary">Cancel</button>
                <button type="submit" disabled={bizSubmitting || !bizName.trim()} className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition">
                  {bizSubmitting ? 'Creating...' : 'Create Business'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
