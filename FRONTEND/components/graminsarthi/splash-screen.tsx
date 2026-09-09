'use client'

import {
  ArrowRight,
  BarChart3,
  Landmark,
  Repeat,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react'
import { BrandMark, } from './primitives'
import { LanguageSelect } from './language-select'
import type { Lang, TranslationKey } from '@/lib/graminsarthi/i18n'

export function SplashScreen({
  lang,
  onLangChange,
  t,
  onLaunch,
  onCustomer,
}: {
  lang: Lang
  onLangChange: (l: Lang) => void
  t: (k: TranslationKey) => string
  onLaunch: () => void
  onCustomer?: () => void
}) {
  const chips = [
    { icon: BarChart3, label: t('chipLedger') },
    { icon: ShieldAlert, label: t('chipLeak') },
    { icon: Repeat, label: t('chipSwap') },
    { icon: SlidersHorizontal, label: t('chipWhatIf') },
    { icon: Landmark, label: t('chipMudra') },
  ]

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-12">
      {/* ambient glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-sky-500/20 blur-[120px]"
      />

      <div className="absolute right-5 top-5">
        <LanguageSelect lang={lang} onChange={onLangChange} compact />
      </div>

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">

        <BrandMark className="mt-8 h-20 w-20 text-2xl" />

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
            GraminSarthi AI
          </span>
        </h1>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
          {t('tagline')}
        </p>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          {chips.map((c) => (
            <li
              key={c.label}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm text-foreground/90"
            >
              <c.icon className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              {c.label}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <button
            onClick={onLaunch}
            className="group inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-600 px-5 text-base font-semibold text-white shadow-xl shadow-emerald-600/25 transition hover:from-emerald-400 hover:to-sky-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 active:scale-[0.99]"
          >
            <span>🏪 {t('launchCta')}</span>
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>

          {onCustomer && (
            <button
              onClick={onCustomer}
              className="group inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 text-base font-semibold text-emerald-300 transition hover:bg-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 active:scale-[0.99]"
            >
              <span>🛒 {lang === 'hi' ? 'गांव बाज़ार (Customer)' : 'Village Market'}</span>
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
