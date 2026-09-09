'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Milk, Sparkles, Store, UtensilsCrossed } from 'lucide-react'
import { BrandMark, Field, PrimaryButton, Select, TextInput } from './primitives'
import { LanguageSelect } from './language-select'
import type { Lang, TranslationKey } from '@/lib/graminsarthi/i18n'
import { apiRequest } from '@/lib/api'
import { getTradeCategories, type ShopProfileKey } from '@/lib/graminsarthi/data'

export function AuthScreen({ lang, onLangChange, t, onBack, onEnter, onSwitchToCustomer }: {
    lang: Lang
    onLangChange: (l: Lang) => void
    t: (k: TranslationKey) => string
    onBack: () => void
    onEnter: (shop: ShopProfileKey, merchantId: string) => void
    onSwitchToCustomer?: () => void
}) {
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [mobile, setMobile] = useState('')
    const [otp, setOtp] = useState('')
    const [otpSent, setOtpSent] = useState(false)
    const [resendTimer, setResendTimer] = useState(0)
    const [error, setError] = useState('')
    const [sentNotice, setSentNotice] = useState('')
    const [isSendingOtp, setIsSendingOtp] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [merchantName, setMerchantName] = useState('')
    const [shopName, setShopName] = useState('')
    const [village, setVillage] = useState('')
    const [district, setDistrict] = useState('')
    const [stateName, setStateName] = useState('')
    const [location, setLocation] = useState('')
    const [description, setDescription] = useState('')
    const tradeCategories = getTradeCategories(lang)
    const [category, setCategory] = useState(tradeCategories[0])

    const demos: {
        key: ShopProfileKey
        label: TranslationKey
        icon: typeof Store
        mobile: string
        name: string
        shop: string
        cat: string
    }[] = [
            { key: 'kirana', label: 'demoKirana', icon: Store, mobile: '+919876543210', name: 'Ramesh Kumar', shop: 'Ramesh Kirana Store', cat: 'Kirana / General Store' },
            { key: 'dairy', label: 'demoDairy', icon: Milk, mobile: '+919876543211', name: 'Gopal Yadav', shop: 'Gopal Dairy Booth', cat: 'Dairy Booth / Milk Point' },
            { key: 'tea', label: 'demoTea', icon: UtensilsCrossed, mobile: '+919876543212', name: 'Suresh Sharma', shop: 'Chai Point & Snacks', cat: 'Tea Stall / Snacks' },
        ]

    useEffect(() => {
        if (resendTimer <= 0) return
        const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000)
        return () => clearInterval(interval)
    }, [resendTimer])

    const handleSendOtp = async () => {
        if (mobile.length !== 10) {
            setError('Please enter a valid 10-digit mobile number')
            return
        }
        if (!['6', '7', '8', '9'].includes(mobile[0])) {
            setError('Indian mobile numbers must begin with 6, 7, 8, or 9')
            return
        }
        try {
            setError('')
            setSentNotice('')
            setIsSendingOtp(true)
            const res = await apiRequest<{ success: boolean; data: { phone: string; cooldownSeconds: number } }>(
                '/api/auth/send-otp',
                {
                    method: 'POST',
                    body: JSON.stringify({ phone: mobile }),
                }
            )
            setOtpSent(true)
            setResendTimer(res.data?.cooldownSeconds || 60)
            setSentNotice(`OTP sent to ${res.data?.phone || `+91 ${mobile}`}`)
            setOtp('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to send SMS OTP')
        } finally {
            setIsSendingOtp(false)
        }
    }

    const handleDemoClick = async (demo: typeof demos[0]) => {
        try {
            setError('')
            let merchantId = ''
            try {
                const existing = await apiRequest<{ success: boolean; data: { id: string } | null }>(
                    `/api/merchant?mobile=${encodeURIComponent(demo.mobile)}`
                )
                if (existing?.data?.id) {
                    merchantId = existing.data.id
                }
            } catch {
                // Ignore lookup error and create below
            }

            if (!merchantId) {
                const created = await apiRequest<{ success: boolean; data: { id: string } }>('/api/merchant', {
                    method: 'POST',
                    body: JSON.stringify({ name: demo.name, mobile: demo.mobile, language: lang }),
                })
                merchantId = created.data.id
            }

            const bizList = await apiRequest<{ success: boolean; data: Array<{ id: string }> }>(
                `/api/business?merchantId=${encodeURIComponent(merchantId)}`
            )
            let businessId = ''
            if (bizList.data && bizList.data.length > 0) {
                businessId = bizList.data[0].id
            } else {
                const createdBiz = await apiRequest<{ success: boolean; data: { id: string } }>('/api/business', {
                    method: 'POST',
                    body: JSON.stringify({
                        merchantId,
                        businessName: demo.shop,
                        businessCategory: demo.cat,
                    }),
                })
                businessId = createdBiz.data.id
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem('graminsarthi.merchantId', merchantId)
                sessionStorage.setItem('graminsarthi.merchantId', merchantId)
                localStorage.setItem('graminsarthi.businessId', businessId)
                sessionStorage.setItem('graminsarthi.businessId', businessId)
                localStorage.setItem('graminsarthi.mobile', demo.mobile)
                sessionStorage.setItem('graminsarthi.mobile', demo.mobile)
            }

            onEnter(demo.key, merchantId)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load demo account')
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!otpSent || otp.length < 4) return

        if (mode === 'register') {
            if (!merchantName.trim()) {
                setError('Merchant name is required')
                return
            }
            if (!shopName.trim()) {
                setError('Business name is required')
                return
            }
        }

        try {
            setError('')
            setIsSubmitting(true)
            const res = await apiRequest<{
                success: boolean
                data: {
                    token: string
                    merchant: { id: string; phone: string; ownerName?: string; businessName?: string }
                    business?: { id: string }
                }
            }>('/api/auth/verify-otp', {
                method: 'POST',
                body: JSON.stringify({
                    phone: mobile,
                    otp,
                    name: mode === 'register' ? merchantName.trim() : undefined,
                    shopName: mode === 'register' ? shopName.trim() : undefined,
                    category: mode === 'register' ? category : undefined,
                }),
            })

            const merchantId = res.data.merchant.id
            const businessId = res.data.business?.id

            if (typeof window !== 'undefined') {
                if (res.data.token) {
                    localStorage.setItem('graminsarthi.token', res.data.token)
                    sessionStorage.setItem('graminsarthi.token', res.data.token)
                }
                localStorage.setItem('graminsarthi.merchantId', merchantId)
                sessionStorage.setItem('graminsarthi.merchantId', merchantId)
                localStorage.setItem('graminsarthi.mobile', res.data.merchant.phone)
                sessionStorage.setItem('graminsarthi.mobile', res.data.merchant.phone)
                if (businessId) {
                    localStorage.setItem('graminsarthi.businessId', businessId)
                    sessionStorage.setItem('graminsarthi.businessId', businessId)
                }
            }

            onEnter('kirana', merchantId)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
            <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-20 h-80 w-80 rounded-full bg-sky-500/15 blur-[130px]" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-emerald-500/15 blur-[130px]" />
            <div className="relative z-10 w-full max-w-md">
                <div className="mb-5 flex items-center justify-between">
                    <button onClick={onBack} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition hover:text-foreground"><ArrowLeft className="h-4 w-4" aria-hidden="true" />{t('back')}</button>
                    <LanguageSelect lang={lang} onChange={onLangChange} compact />
                </div>
                <div className="rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-black/30">
                    <div className="flex flex-col items-center text-center"><BrandMark className="h-14 w-14 text-lg" /><h1 className="mt-3 text-xl font-bold text-foreground">GraminSarthi AI</h1></div>
                    <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-secondary p-1">
                        {(['login', 'register'] as const).map((value) => <button key={value} onClick={() => { setMode(value); setOtpSent(false); setResendTimer(0); setOtp(''); setError(''); setSentNotice('') }} className={`min-h-11 rounded-lg text-sm font-semibold transition ${mode === value ? 'bg-gradient-to-r from-sky-600 to-teal-600 text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}>{value === 'login' ? t('merchantLogin') : t('registerEnterprise')}</button>)}
                    </div>
                    <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                        <Field label={t('mobileNumber')} htmlFor="mobile"><div className="flex items-stretch overflow-hidden rounded-xl border border-input bg-secondary focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/30"><span className="flex min-h-12 items-center border-r border-input px-3 text-base font-medium text-muted-foreground">+91</span><input id="mobile" type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={10} placeholder="98765 43210" value={mobile} onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 10))} className="min-h-12 w-full bg-transparent px-4 text-base text-foreground placeholder:text-muted-foreground/60 outline-none" disabled={otpSent && resendTimer > 0} /></div></Field>
                        {!otpSent ? <PrimaryButton type="button" onClick={handleSendOtp} disabled={mobile.length !== 10 || isSendingOtp}>{isSendingOtp ? 'Sending SMS OTP...' : t('sendOtp')}</PrimaryButton> : <>
                            {sentNotice && (
                                <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-300">
                                    {sentNotice}
                                </div>
                            )}
                            <Field label={t('otpLabel')} htmlFor="otp"><div className="flex items-center gap-2"><TextInput id="otp" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="••••••" value={otp} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }} className="tracking-[0.5em] flex-1" /><button type="button" onClick={handleSendOtp} disabled={resendTimer > 0 || isSendingOtp} className="min-h-12 whitespace-nowrap rounded-xl border border-input bg-secondary px-4 text-sm font-medium text-foreground transition hover:border-sky-500 disabled:opacity-50">{resendTimer > 0 ? `${t('resendCountdown')} ${resendTimer}s` : (isSendingOtp ? 'Sending...' : t('resendOtp'))}</button></div>{error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}<p className="mt-1 text-xs text-muted-foreground">{t('otpHint')}</p></Field>
                            {mode === 'register' ? (
                                <div className="space-y-3 pt-1">
                                    <Field label="Merchant Name" htmlFor="merchantName">
                                        <TextInput id="merchantName" placeholder="e.g. Ramesh Kumar" value={merchantName} onChange={(event) => setMerchantName(event.target.value)} />
                                    </Field>
                                    <Field label={t('shopName')} htmlFor="shopName">
                                        <TextInput id="shopName" placeholder="e.g. Sri Lakshmi Provisions" value={shopName} onChange={(event) => setShopName(event.target.value)} />
                                    </Field>
                                    <Field label={t('tradeCategory')} htmlFor="category">
                                        <Select id="category" value={category} onChange={(event) => setCategory(event.target.value)}>
                                            {tradeCategories.map((item) => <option key={item} value={item}>{item}</option>)}
                                        </Select>
                                    </Field>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Field label="Village / Town" htmlFor="village">
                                            <TextInput id="village" placeholder="e.g. Rampur" value={village} onChange={(event) => setVillage(event.target.value)} />
                                        </Field>
                                        <Field label="District" htmlFor="district">
                                            <TextInput id="district" placeholder="e.g. Varanasi" value={district} onChange={(event) => setDistrict(event.target.value)} />
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Field label="State" htmlFor="state">
                                            <TextInput id="state" placeholder="e.g. Uttar Pradesh" value={stateName} onChange={(event) => setStateName(event.target.value)} />
                                        </Field>
                                        <Field label="Location / Landmark" htmlFor="location">
                                            <TextInput id="location" placeholder="e.g. Main Market" value={location} onChange={(event) => setLocation(event.target.value)} />
                                        </Field>
                                    </div>
                                    <Field label="Description (Optional)" htmlFor="description">
                                        <TextInput id="description" placeholder="Short description of business" value={description} onChange={(event) => setDescription(event.target.value)} />
                                    </Field>
                                </div>
                            ) : null}
                            <PrimaryButton type="submit" disabled={otp.length < 4 || isSubmitting}>{isSubmitting ? 'Verifying OTP...' : (mode === 'login' ? t('loginSubmit') : t('registerSubmit'))}</PrimaryButton>
                        </>}
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
                                    type="button"
                                    onClick={() => handleDemoClick(d)}
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

                    {onSwitchToCustomer && (
                        <div className="mt-5 border-t border-border/60 pt-4 text-center">
                            <button
                                type="button"
                                onClick={onSwitchToCustomer}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 transition hover:text-emerald-300"
                            >
                                <span>🛒 Looking for Village Market & Khata? Go to Customer Portal →</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
