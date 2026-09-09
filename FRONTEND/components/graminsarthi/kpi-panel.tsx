'use client'

import { AlertTriangle, Percent, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { Card } from './primitives'
import type { TranslationKey } from '@/lib/graminsarthi/i18n'
import { formatINR, type Kpis } from '@/lib/graminsarthi/data'

export function KpiPanel({
  t,
  kpis,
  remediation,
}: {
  t: (k: TranslationKey) => string
  kpis: Kpis
  remediation: string
}) {
  const pnlPositive = kpis.netPnlToday >= 0
  const takeHomePositive = kpis.monthlyTakeHome >= 0

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
        <h2 className="text-base font-semibold text-foreground">
          {t('snapshotTitle')}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-secondary p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            {pnlPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />
            )}
            {t('netPnl')}
          </div>
          <div
            className={`mt-2 font-mono text-2xl font-bold ${
              pnlPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {pnlPositive ? '+' : ''}
            {formatINR(kpis.netPnlToday)}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-secondary p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Percent className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
            {t('operatingMargin')}
          </div>
          <div
            className={`mt-2 font-mono text-2xl font-bold ${
              kpis.operatingMargin >= 0 ? 'text-sky-300' : 'text-rose-400'
            }`}
          >
            {kpis.operatingMargin.toFixed(1)}%
          </div>
        </div>

        <div className="rounded-xl border border-border bg-secondary p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Wallet className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
            {t('monthlyTakeHome')}
          </div>
          <div
            className={`mt-2 font-mono text-2xl font-bold ${
              takeHomePositive ? 'text-amber-300' : 'text-rose-400'
            }`}
          >
            {formatINR(kpis.monthlyTakeHome)}
          </div>
        </div>
      </div>

      {kpis.leak ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="text-sm font-semibold text-rose-200">
                  {t('leakTitle')}
                </h3>
                <span className="font-mono text-sm font-bold text-rose-300">
                  -{formatINR(kpis.leakAmount)}
                  {t('perMonth')}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-rose-200/80">{t('leakDesc')}</p>
              <p className="mt-2 text-xs leading-relaxed text-rose-100/90">
                {remediation}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  )
}
