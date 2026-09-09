'use client'

import { useEffect, useMemo, useState } from 'react'
import { SplashScreen } from '@/components/graminsarthi/splash-screen'
import { AuthScreen } from '@/components/graminsarthi/auth-screen'
import { Dashboard } from '@/components/graminsarthi/dashboard'
import { makeT, type Lang } from '@/lib/graminsarthi/i18n'
import type { ShopProfileKey } from '@/lib/graminsarthi/data'

type Screen = 'SPLASH' | 'AUTH' | 'DASHBOARD'

export default function Page() {
  const [screen, setScreen] = useState<Screen>('SPLASH')
  const [lang, setLang] = useState<Lang>('en')
  const [shop, setShop] = useState<ShopProfileKey>('kirana')
  const [merchantId, setMerchantId] = useState<string | undefined>(undefined)

  const t = useMemo(() => makeT(lang), [lang])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMerchantId = localStorage.getItem('graminsarthi.merchantId') || sessionStorage.getItem('graminsarthi.merchantId')
      if (savedMerchantId) {
        setMerchantId(savedMerchantId)
      }
    }
  }, [])

  if (screen === 'SPLASH') {
    return (
      <SplashScreen
        lang={lang}
        onLangChange={setLang}
        t={t}
        onLaunch={() => setScreen('AUTH')}
      />
    )
  }

  if (screen === 'AUTH') {
    return (
      <AuthScreen
        lang={lang}
        onLangChange={setLang}
        t={t}
        onBack={() => setScreen('SPLASH')}
        onEnter={(selectedShop, mId) => {
          setShop(selectedShop)
          setMerchantId(mId)
          if (typeof window !== 'undefined') {
            localStorage.setItem('graminsarthi.merchantId', mId)
            sessionStorage.setItem('graminsarthi.merchantId', mId)
          }
          setScreen('DASHBOARD')
        }}
      />
    )
  }

  return (
    <Dashboard
      key={`${shop}-${merchantId}`}
      lang={lang}
      onLangChange={setLang}
      t={t}
      initialShop={shop}
      merchantId={merchantId}
      onLogout={() => {
        setMerchantId(undefined)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('graminsarthi.merchantId')
          localStorage.removeItem('graminsarthi.businessId')
          localStorage.removeItem('graminsarthi.mobile')
          sessionStorage.removeItem('graminsarthi.merchantId')
          sessionStorage.removeItem('graminsarthi.businessId')
          sessionStorage.removeItem('graminsarthi.mobile')
        }
        setScreen('AUTH')
      }}
    />
  )
}
