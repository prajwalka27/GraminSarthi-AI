'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Milk, Sparkles, Store, UtensilsCrossed } from 'lucide-react'
import {
  BrandMark,
  Field,
  PrimaryButton,
  Select,
  TextInput,
} from './primitives'
import { LanguageSelect } from './language-select'
import type { Lang, TranslationKey } from '@/lib/graminsarthi/i18n'
import {
  getTradeCategories,
  type ShopProfileKey,
} from '@/lib/graminsarthi/data'

export function AuthScreen({
  lang,
  onLangChange,
  t,
  onBack,
  onEnter,
}: {
  lang: Lang
  onLangChange: (l: Lang) => void
  t: (k: TranslationKey) => string
  onBack: () => void
  onEnter: (shop: ShopProfileKey) => void
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [error, setError] = useState('')
  const [shopName, setShopName] = useState('')
  const tradeCategories = getTradeCategories(lang)
  const [category, setCategory] = useState(tradeCategories[0])

  const demos: { key: ShopProfileKey; label: TranslationKey; icon: typeof Store }[] =
    [
      { key: 'kirana', label: 'demoKirana', icon: Store },
      { key: 'dairy', label: 'demoDairy', icon: Milk },
      { key: 'tea', label: 'demoTea', icon: UtensilsCrossed },
    ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const handleSendOtp = () => {
    if (mobile.length !== 10) return
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    setGeneratedOtp(code)
    setOtpSent(true)
    setResendTimer(30)
    setError('')
    alert(`Demo OTP for +91 ${mobile}: ${code}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpSent) return
    if (otp === generatedOtp) {
      onEnter('kirana')
    } else {
      setError(t('otpIncorrect'))
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-20 h-80 w-80 rounded-full bg-sky-500/15 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-emerald-500/15 blur-[130px]"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('back')}
          </button>
          <LanguageSelect lang={lang} onChange={onLangChange} compact />
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col items-center text-center">
            <BrandMark className="h-14 w-14 text-lg" />
            <h1 className="mt-3 text-xl font-bold text-foreground">
              GraminSarthi AI
            </h1>
          </div>

          {/* toggle tabs */}
          <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-secondary p-1">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m)
                  setOtpSent(false)
                  setResendTimer(0)
                  setOtp('')
                  setError('')
                }}
                className={`min-h-11 rounded-lg text-sm font-semibold transition ${
                  mode === m
                    ? 'bg-gradient-to-r from-sky-600 to-teal-600 text-white shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? t('merchantLogin') : t('registerEnterprise')}
              </button>
            ))}
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <Field label={t('mobileNumber')} htmlFor="mobile">
              <div className="flex items-stretch overflow-hidden rounded-xl border border-input bg-secondary focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/30">
                <span className="flex min-h-12 items-center border-r border-input px-3 text-base font-medium text-muted-foreground">
                  +91
                </span>
                <input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  className="min-h-12 w-full bg-transparent px-4 text-base text-foreground placeholder:text-muted-foreground/60 outline-none"
                  disabled={otpSent && resendTimer > 0}
                />
              </div>
            </Field>

            {!otpSent ? (
              <PrimaryButton
                type="button"
                onClick={handleSendOtp}
                disabled={mobile.length !== 10}
              >
                {t('sendOtp')}
              </PrimaryButton>
            ) : (
              <>
                <Field label={t('otpLabel')} htmlFor="otp">
                  <div className="flex items-center gap-2">
                    <TextInput
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      placeholder="••••"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))
                        setError('')
                      }}
                      className="tracking-[0.5em] flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={resendTimer > 0}
                      className="min-h-12 whitespace-nowrap rounded-xl border border-input bg-secondary px-4 text-sm font-medium text-foreground transition hover:border-sky-500 disabled:opacity-50"
                    >
                      {resendTimer > 0 ? `${t('resendCountdown')} ${resendTimer}s` : t('resendOtp')}
                    </button>
                  </div>
                  {error && (
                    <p className="mt-1 text-xs font-medium text-rose-500">
                      {error}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('otpHint')}
                  </p>
                </Field>

                {mode === 'register' ? (
                  <>
                    <Field label={t('shopName')} htmlFor="shopName">
                      <TextInput
                        id="shopName"
                        placeholder="Sri Lakshmi Provisions"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                      />
                    </Field>
                    <Field label={t('tradeCategory')} htmlFor="category">
                      <Select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {tradeCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </>
                ) : null}

                <PrimaryButton type="submit" disabled={otp.length !== 4}>
                  {mode === 'login' ? t('loginSubmit') : t('registerSubmit')}
                </PrimaryButton>
              </>
            )}
          </form>

          {/* demo accounts */}
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              {t('quickDemo')}
            </div>
            <div className="space-y-2">
              {demos.map((d) => (
                <button
                  key={d.key}
                  onClick={() => onEnter(d.key)}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-border bg-secondary px-4 text-left text-sm font-medium text-foreground transition hover:border-emerald-500/50 hover:bg-emerald-500/5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                    <d.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>{t(d.label)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
