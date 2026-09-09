'use client'

import { BadgeCheck, Landmark } from 'lucide-react'
import { Card, CardHeader } from './primitives'
import type { Lang, TranslationKey } from '@/lib/graminsarthi/i18n'
import {
  matchedSchemes,
  type ShopProfileKey,
} from '@/lib/graminsarthi/data'

interface SchemeMatcherProps {
  t: (k: TranslationKey) => string
  shop: ShopProfileKey
  lang: Lang
}

export function SchemeMatcher({
  t,
  shop,
  lang,
}: SchemeMatcherProps) {
  const schemes = matchedSchemes(shop, lang)

  return (
    <Card>
      <CardHeader
        icon={<Landmark className="h-5 w-5" />}
        title={t('schemesTitle')}
        subtitle={t('schemesSubtitle')}
        accent="amber"
      />

      <ul className="space-y-2.5">
        {schemes.map((s) => (
          <li
            key={s.id}
            className="rounded-xl border border-border bg-secondary p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground text-pretty">
                {s.name}
              </h3>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {t('eligible')}
              </span>
            </div>
            <p className="mt-1 font-mono text-sm font-semibold text-amber-300">
              {s.range}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {s.note}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  )
}
