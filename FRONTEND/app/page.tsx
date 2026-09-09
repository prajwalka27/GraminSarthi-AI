'use client'

import { useMemo, useState } from 'react'
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

  const t = useMemo(() => makeT(lang), [lang])

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
        onEnter={(selectedShop) => {
          setShop(selectedShop)
          setScreen('DASHBOARD')
        }}
      />
    )
  }

  return (
    <Dashboard
      key={shop}
      lang={lang}
      onLangChange={setLang}
      t={t}
      initialShop={shop}
      onLogout={() => setScreen('AUTH')}
    />
  )
}
