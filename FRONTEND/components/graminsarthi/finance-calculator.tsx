'use client'

import { useState } from 'react'
import { Landmark, IndianRupee, Calculator } from 'lucide-react'
import { Card, CardHeader, Field, PrimaryButton } from './primitives'
import type { TranslationKey } from '@/lib/graminsarthi/i18n'

export function FinanceCalculator({
  t,
}: {
  t: (k: TranslationKey) => string
}) {
  const [marginInput, setMarginInput] = useState<number>(10000)
  const [result, setResult] = useState<{
    projectCost: number
    loanAmount: number
    schemeName: TranslationKey
    interestRate: number
    repaymentYears: number
    moratoriumMonths: number
    emi: number
  } | null>(null)

  const handleCalculate = () => {
    if (!marginInput || marginInput <= 0) return

    const projectCost = marginInput / 0.10
    let loanAmount = projectCost * 0.90
    
    let schemeName: TranslationKey = 'schemeMicroFinance'
    let interestRate = 6.5
    let repaymentYears = 3
    let moratoriumMonths = 3
    let quarters = 11

    if (projectCost <= 140000) {
      schemeName = 'schemeMicroFinance'
      if (loanAmount > 125000) loanAmount = 125000
    } else {
      schemeName = 'schemeTermLoan'
      interestRate = 8.0
      repaymentYears = 7
      moratoriumMonths = 6
      quarters = 26
      if (loanAmount > 4500000) loanAmount = 4500000
    }

    const rq = (interestRate / 4) / 100
    const emi = (loanAmount * rq * Math.pow(1 + rq, quarters)) / (Math.pow(1 + rq, quarters) - 1)

    setResult({
      projectCost,
      loanAmount,
      schemeName,
      interestRate,
      repaymentYears,
      moratoriumMonths,
      emi
    })
  }

  const formatCurrency = (n: number) => {
    return `₹${Math.round(n).toLocaleString('en-IN')}`
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          icon={<Calculator className="h-5 w-5" />}
          title={t('financeTitle')}
          subtitle={t('financeSubtitle')}
          accent="teal"
        />

        <div className="space-y-4">
          <Field label={t('marginCapital')} htmlFor="margin-capital">
            <div className="flex items-stretch overflow-hidden rounded-xl border border-input bg-secondary focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/30">
              <span className="flex min-h-12 items-center border-r border-input px-3 font-mono text-base text-teal-300">
                ₹
              </span>
              <input
                id="margin-capital"
                type="number"
                inputMode="numeric"
                min={0}
                value={marginInput || ''}
                onChange={(e) => {
                  setMarginInput(Math.max(0, Number(e.target.value) || 0))
                  setResult(null)
                }}
                className="min-h-12 w-full bg-transparent px-3 font-mono text-base text-foreground outline-none"
              />
            </div>
          </Field>

          <PrimaryButton onClick={handleCalculate} className="from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-600/25">
            <Calculator className="h-4 w-4" aria-hidden="true" />
            {t('calculateEmi')}
          </PrimaryButton>
        </div>
      </Card>

      {result && (
        <Card>
          <CardHeader
            icon={<Landmark className="h-5 w-5" />}
            title={t('loanDetails')}
            subtitle={t(result.schemeName)}
            accent="sky"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-secondary p-4">
              <div className="text-xs font-medium text-muted-foreground">{t('projectCost')}</div>
              <div className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(result.projectCost)}</div>
            </div>
            
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
              <div className="text-xs font-medium text-sky-300/80">{t('loanAmount')}</div>
              <div className="mt-1 text-lg font-bold text-sky-300">{formatCurrency(result.loanAmount)}</div>
            </div>

            <div className="rounded-xl border border-border bg-secondary p-4">
              <div className="text-xs font-medium text-muted-foreground">{t('interestRate')}</div>
              <div className="mt-1 text-lg font-semibold text-foreground">{result.interestRate}%</div>
            </div>

            <div className="rounded-xl border border-border bg-secondary p-4">
              <div className="text-xs font-medium text-muted-foreground">{t('repaymentPeriod')}</div>
              <div className="mt-1 text-lg font-semibold text-foreground">{result.repaymentYears} {t('years')}</div>
            </div>

            <div className="rounded-xl border border-border bg-secondary p-4">
              <div className="text-xs font-medium text-muted-foreground">{t('moratoriumPeriod')}</div>
              <div className="mt-1 text-lg font-semibold text-foreground">{result.moratoriumMonths} {t('months')}</div>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="text-xs font-medium text-emerald-300/80">{t('emiQuarterly')}</div>
              <div className="mt-1 flex items-center gap-1.5 text-2xl font-bold text-emerald-300">
                <IndianRupee className="h-5 w-5" />
                {Math.round(result.emi).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
