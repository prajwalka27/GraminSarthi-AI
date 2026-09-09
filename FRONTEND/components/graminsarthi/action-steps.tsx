'use client'

import { useState } from 'react'
import { Check, ListChecks } from 'lucide-react'
import { Card, CardHeader } from './primitives'
import type { TranslationKey } from '@/lib/graminsarthi/i18n'

export function ActionSteps({
  t,
  steps,
}: {
  t: (k: TranslationKey) => string
  steps: string[]
}) {
  const [done, setDone] = useState<Record<number, boolean>>({})

  return (
    <Card>
      <CardHeader
        icon={<ListChecks className="h-5 w-5" />}
        title={t('actionTitle')}
        subtitle={t('actionSubtitle')}
        accent="emerald"
      />

      <ol className="space-y-2.5">
        {steps.map((step, i) => {
          const checked = !!done[i]
          return (
            <li key={step}>
              <button
                onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
                aria-pressed={checked}
                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                  checked
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : 'border-border bg-secondary hover:border-emerald-500/30'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${
                    checked
                      ? 'border-emerald-400 bg-emerald-500 text-white'
                      : 'border-border bg-card text-muted-foreground'
                  }`}
                  aria-hidden="true"
                >
                  {checked ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span
                  className={`text-sm leading-relaxed text-pretty ${
                    checked
                      ? 'text-muted-foreground line-through'
                      : 'text-foreground'
                  }`}
                >
                  {step}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
