'use client'

import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react'
import { BrandMark, Field, PrimaryButton, Select, TextInput } from './primitives'
import { LanguageSelect } from './language-select'
import type { Lang, TranslationKey } from '@/lib/graminsarthi/i18n'
import { getTradeCategories, type ShopProfileKey } from '@/lib/graminsarthi/data'

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
  onEnter: (shop: ShopProfileKey, customName?: string, customCategory?: string, isAdmin?: boolean) => void
}) {
  const [role, setRole] = useState<'merchant' | 'admin'>('merchant')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [shopName, setShopName] = useState('')
  const tradeCategories = getTradeCategories(lang)
  const [category, setCategory] = useState(tradeCategories[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (role === 'admin') {
      onEnter('kirana', undefined, undefined, true)
    } else {
      if (mode === 'login') {
        onEnter('kirana')
      } else {
        // Register mode
        onEnter('kirana', shopName, category)
      }
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 bg-background">
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

        <div className="rounded-3xl border border-border bg-card p-8 shadow-2xl shadow-black/30">
          <div className="flex flex-col items-center text-center">
            <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
              <span>🌾</span> GraminSarthi-AI
            </h1>
            <h2 className="mt-4 text-2xl font-bold text-foreground">
              {t('welcome_back')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('login_subtitle')}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-secondary p-1">
            <button
              type="button"
              onClick={() => setRole('merchant')}
              className={`min-h-11 rounded-lg text-sm font-semibold transition ${
                role === 'merchant'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('merchant')}
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`min-h-11 rounded-lg text-sm font-semibold transition ${
                role === 'admin'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('admin')}
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' && role === 'merchant' ? (
              <>
                <Field label={t('shopName')} htmlFor="shopName">
                  <TextInput
                    id="shopName"
                    placeholder="e.g. Sri Lakshmi Provisions"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    required
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

            <Field label={t('email_or_phone')} htmlFor="identifier">
              <TextInput
                id="identifier"
                type="text"
                placeholder={t('enter_email_or_phone')}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </Field>

            <Field label={t('password')} htmlFor="password">
              <div className="relative">
                <TextInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('enter_password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {mode === 'login' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground cursor-pointer hover:text-foreground">
                  <input type="checkbox" className="rounded border-input bg-secondary text-emerald-500 focus:ring-emerald-500/30" />
                  {t('remember_me')}
                </label>
                <button type="button" className="text-emerald-400 hover:text-emerald-300 font-medium">
                  {t('forgot_password')}
                </button>
              </div>
            )}

            <PrimaryButton type="submit" className="w-full mt-2">
              {role === 'admin' ? t('login_as_admin') : (mode === 'login' ? t('login_btn') : t('sign_up'))}
            </PrimaryButton>
          </form>

          {role === 'merchant' && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {mode === 'login' ? (
                <>
                  {t('no_account')}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="font-medium text-emerald-400 hover:text-emerald-300 transition"
                  >
                    {t('sign_up')}
                  </button>
                </>
              ) : (
                <>
                  {t('already_have_account')}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-medium text-emerald-400 hover:text-emerald-300 transition"
                  >
                    {t('login_link')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
