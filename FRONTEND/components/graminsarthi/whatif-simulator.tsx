'use client'

import { useMemo, useState } from 'react'
import { SlidersHorizontal, TrendingUp } from 'lucide-react'
import { Card, CardHeader } from './primitives'
import type { TranslationKey } from '@/lib/graminsarthi/i18n'
import { formatINR, projectWhatIf, type Financials } from '@/lib/graminsarthi/data'

function Slider({
  label,
  value,
  min,
  max,
  onChange,
  accent,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (n: number) => void
  accent: string
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className={`font-mono text-sm font-bold ${accent}`}>{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-emerald-500"
      />
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        <span>{min}%</span>
        <span>{max}%</span>
      </div>
    </div>
  )
}

export function WhatIfSimulator({
  t,
  financials,
}: {
  t: (k: TranslationKey) => string
  financials: Financials
}) {
  const [cut, setCut] = useState(10)
  const [shift, setShift] = useState(5)

  const projection = useMemo(
    () => projectWhatIf(financials, { cutProcurementPct: cut, shiftSpacePct: shift }),
    [financials, cut, shift],
  )

  const positive = projection.delta >= 0

  return (
    <Card>
      <CardHeader
        icon={<SlidersHorizontal className="h-5 w-5" />}
        title={t('whatIfTitle')}
        accent="sky"
      />

      <div className="space-y-5">
        <Slider
          label={t('sliderProcurement')}
          value={cut}
          min={0}
          max={30}
          onChange={setCut}
          accent="text-rose-300"
        />
        <Slider
          label={t('sliderShift')}
          value={shift}
          min={0}
          max={25}
          onChange={setShift}
          accent="text-emerald-300"
        />

        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-sky-500/10 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t('projectedProfit')}
              </p>
              <p className="mt-1 font-mono text-3xl font-bold text-emerald-300">
                {formatINR(projection.projectedTakeHome)}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-mono text-sm font-bold ${
                positive
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              {positive ? '+' : ''}
              {projection.delta.toFixed(1)}%
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {t('projectedGrowth')} · {t('projectedProfit')}:{' '}
            <span className="font-mono text-foreground">
              {formatINR(projection.base)}
            </span>{' '}
            →{' '}
            <span className="font-mono text-emerald-300">
              {formatINR(projection.projectedTakeHome)}
            </span>
          </p>
        </div>
      </div>
    </Card>
  )
}
