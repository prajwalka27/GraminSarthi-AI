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
import type { Lang, TranslationKey } from '@/lib/graminsarthi/i18n'
import {
  computeKpis,
  formatINR,
  getShopProfile,
  getAllShopProfiles,
  getRemediation,
  type Financials,
  type ShopProfileKey,
} from '@/lib/graminsarthi/data'
import { useGraminsarthiStore } from '@/hooks/use-graminsarthi-store'

type DashboardTab = 'LEDGER' | 'FEASIBILITY' | 'FINANCE_CALCULATOR'


export function Dashboard({
  lang,
  onLangChange,
  t,
  initialShop,
  onLogout,
}: {
  lang: Lang
  onLangChange: (l: Lang) => void
  t: (k: TranslationKey) => string
  initialShop: ShopProfileKey
  onLogout: () => void
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
    removeInventoryItem
  } = useGraminsarthiStore(initialShop, lang)

  const profile = getShopProfile(shopKey, lang)
  const remediationText = getRemediation(shopKey, lang)

  const [pulse, setPulse] = useState(0)
  const [activeTab, setActiveTab] = useState<DashboardTab>('LEDGER')

  const kpis = useMemo(() => computeKpis(financials), [financials])

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
              <p className="text-xs text-muted-foreground">{profile.name}</p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
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

            <LanguageSelect lang={lang} onChange={onLangChange} compact />

            <button
              onClick={onLogout}
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
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
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
                removeTransaction={removeTransaction}
                onRecalculate={() => setPulse((p) => p + 1)}
              />
            </div>
            <div className="flex flex-col gap-5">
              <KpiPanel
                key={pulse}
                t={t}
                kpis={kpis}
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
      </main>
    </div>
  )
}
