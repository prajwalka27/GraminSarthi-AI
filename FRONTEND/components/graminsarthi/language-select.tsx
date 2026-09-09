'use client'

import { Globe } from 'lucide-react'
import { LANGUAGES, type Lang } from '@/lib/graminsarthi/i18n'

export function LanguageSelect({
  lang,
  onChange,
  compact = false,
}: {
  lang: Lang
  onChange: (l: Lang) => void
  compact?: boolean
}) {
  return (
    <div className="relative inline-flex items-center">
      <Globe
        className="pointer-events-none absolute left-3 h-4 w-4 text-sky-300"
        aria-hidden="true"
      />
      <select
        aria-label="Select language"
        value={lang}
        onChange={(e) => onChange(e.target.value as Lang)}
        className="min-h-10 appearance-none rounded-xl border border-input bg-secondary py-2 pl-9 pr-8 text-sm font-medium text-foreground outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {compact ? l.native : `${l.native} (${l.label})`}
          </option>
        ))}
      </select>
    </div>
  )
}
